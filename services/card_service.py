import os
import re
from html import unescape
from urllib.parse import quote
from urllib.parse import urlencode

import requests

from dtos.api_dtos import card_to_dto, paginated_response


RARITIES = ["Common", "Uncommon", "Rare", "Super Rare", "Secret Rare"]
REQUEST_TIMEOUT = 4
POKEMON_TIMEOUT = 5
OPTCG_BASE_URL = "https://www.optcgapi.com"
OPTCG_SETS_URL = f"{OPTCG_BASE_URL}/analytics/sets/"
OPTCG_DETAIL_API_URL = f"{OPTCG_BASE_URL}/api/sets/card"
OPTCG_SOURCE_PAGE_SIZE = 32


class CardService:
    pokemon_url = "https://api.pokemontcg.io/v2/cards"

    def list_cards(self, params):
        page = max(int(params.get("page", 1)), 1)
        limit = min(max(int(params.get("limit", 20)), 1), 100)
        tcg = params.get("tcg")

        if tcg == "pokemon":
            cards, total = self._safe_source("pokemon", params, page, limit)
        elif tcg == "onepiece":
            cards, total = self._safe_source("onepiece", params, page, limit)
        else:
            cards, total = self._safe_source("onepiece", params, page, limit)

        cards = self._apply_local_filters(cards, params)
        cards = self._sort(cards, params.get("sortBy"), params.get("sortOrder", "asc"))
        return paginated_response([card_to_dto(card) for card in cards], page, limit, total)

    def search_cards(self, params):
        return self.list_cards(params)

    def get_card(self, card_id, tcg=None):
        if tcg in (None, "pokemon"):
            card = self._fetch_pokemon_card(card_id)
            if card:
                return card_to_dto(card)
        if tcg in (None, "onepiece"):
            card = self._fetch_onepiece_card(card_id)
            if card:
                return card_to_dto(card)
        return None

    def ensure_cached(self, card_id, tcg):
        return self.get_card(card_id, tcg)

    def _safe_source(self, tcg, params, page, limit):
        try:
            if tcg == "pokemon":
                return self._fetch_pokemon_cards(params, page, limit)
            return self._fetch_onepiece_cards(params, page, limit)
        except requests.RequestException:
            if tcg == "pokemon":
                raise
            return [], 0

    def _fetch_pokemon_cards(self, params, page, limit):
        return self._fetch_pokemon_cards_with_fallback_pages(params, page, limit)

    def _fetch_pokemon_cards_with_fallback_pages(self, params, page, limit):
        candidate_pages = [page, page + 1, max(page - 1, 1)]
        seen = set()
        last_error = None
        for candidate_page in candidate_pages:
            if candidate_page in seen:
                continue
            seen.add(candidate_page)
            try:
                return self._fetch_pokemon_cards_page(params, candidate_page, limit)
            except requests.RequestException as error:
                last_error = error
        if last_error:
            raise last_error
        return [], 0

    def _fetch_pokemon_cards_page(self, params, page, limit):
        headers = {}
        api_key = os.getenv("POKEMON_TCG_API_KEY")
        if api_key:
            headers["X-Api-Key"] = api_key

        query = self._build_pokemon_query(params)
        request_params = {
            "page": page,
            "pageSize": limit,
            "select": "id,name,set,rarity,images,tcgplayer",
        }
        if query:
            request_params["q"] = query
        order_by = self._pokemon_order_by_for_listing(params.get("sortBy"), params.get("sortOrder"))
        if order_by:
            request_params["orderBy"] = order_by

        response = requests.get(self.pokemon_url, params=request_params, headers=headers, timeout=POKEMON_TIMEOUT)
        response.raise_for_status()
        payload = response.json()
        cards = [self._normalize_pokemon_card(item) for item in payload.get("data", [])]
        return cards, payload.get("totalCount", len(cards))

    def _fetch_pokemon_card(self, card_id):
        headers = {}
        api_key = os.getenv("POKEMON_TCG_API_KEY")
        if api_key:
            headers["X-Api-Key"] = api_key
        try:
            response = requests.get(f"{self.pokemon_url}/{quote(str(card_id))}", headers=headers, timeout=POKEMON_TIMEOUT)
            response.raise_for_status()
        except requests.RequestException:
            return None
        return self._normalize_pokemon_card(response.json().get("data", {}))

    def _fetch_onepiece_cards(self, params, page, limit):
        cards, total = self._fetch_optcg_listing_window(params, page, limit)
        cards = self._apply_local_filters(cards, params)
        cards = self._sort(cards, params.get("sortBy"), params.get("sortOrder", "asc"))
        
        result_window = cards[:limit]
        
        # Fetch prices for the cards in the current window in parallel
        from concurrent.futures import ThreadPoolExecutor
        
        def fetch_price(card):
            try:
                detail = self._fetch_onepiece_card(card["id"])
                if detail and detail.get("marketPrice"):
                    card["marketPrice"] = detail["marketPrice"]
            except Exception:
                pass
            return card
            
        with ThreadPoolExecutor(max_workers=10) as executor:
            result_window = list(executor.map(fetch_price, result_window))
            
        return result_window, total

    def _fetch_onepiece_card(self, card_id):
        requested_id = str(card_id)
        api_id = requested_id.split("_", 1)[0]
        response = requests.get(f"{OPTCG_DETAIL_API_URL}/{quote(api_id)}/", timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, list) or not payload:
            return None

        normalized_id = requested_id.lower()
        selected = next(
            (
                item for item in payload
                if str(item.get("card_set_id") or "").lower() == normalized_id
                or str(item.get("card_image_id") or "").lower() == normalized_id
            ),
            payload[0],
        )
        return self._normalize_optcg_detail(selected)

    def _build_pokemon_query(self, params):
        query_parts = []
        search = (params.get("query") or "").strip()
        set_name = (params.get("set") or "").strip()
        if search:
            query_parts.append(f'name:"{search}"')
        if set_name:
            query_parts.append(f'set.name:"{set_name}"')
        return " ".join(query_parts)

    def _pokemon_order_by(self, sort_by, sort_order):
        mapping = {"name": "name", "set": "set.name"}
        field = mapping.get(sort_by)
        if not field:
            return None
        return f"-{field}" if sort_order == "desc" else field

    def _pokemon_order_by_for_listing(self, sort_by, sort_order):
        # Pokemon TCG API frequently times out on global name sorting.
        if sort_by in (None, "name", "price"):
            return None
        return self._pokemon_order_by(sort_by, sort_order)

    def _normalize_pokemon_card(self, item):
        return {
            "id": item.get("id"),
            "tcg": "pokemon",
            "name": item.get("name") or "Carta Pokemon",
            "set": (item.get("set") or {}).get("name") or "Sin set",
            "rarity": self._normalize_rarity(item.get("rarity")),
            "image": (item.get("images") or {}).get("large") or (item.get("images") or {}).get("small") or "",
            "marketPrice": self._pokemon_price(item),
            "payload": item,
        }

    def _normalize_onepiece_card(self, item):
        return {
            "id": item.get("id"),
            "tcg": "onepiece",
            "name": self._clean_text(item.get("name")) or "Carta One Piece",
            "set": self._clean_text(item.get("set")) or "Sin set",
            "rarity": self._normalize_rarity(item.get("rarity")),
            "image": self._absolute_optcg_url(item.get("image")),
            "marketPrice": float(item.get("marketPrice") or 0),
            "payload": item,
        }

    def _normalize_optcg_detail(self, item):
        return self._normalize_onepiece_card(
            {
                "id": item.get("card_image_id") or item.get("card_set_id"),
                "name": item.get("card_name"),
                "set": item.get("set_name"),
                "rarity": item.get("rarity"),
                "image": item.get("card_image"),
                "marketPrice": item.get("market_price") or 0,
                "payload": item,
            }
        )

    def _normalize_rarity(self, rarity):
        value = (rarity or "").lower()
        if "secret" in value or "sec" == value:
            return "Secret Rare"
        if "super" in value or value == "sr":
            return "Super Rare"
        if "uncommon" in value or value in ("u", "uc"):
            return "Uncommon"
        if "common" in value or value == "c":
            return "Common"
        return "Rare"

    def _pokemon_price(self, item):
        prices = ((item.get("tcgplayer") or {}).get("prices") or {}).values()
        for price in prices:
            for key in ("market", "mid", "low"):
                if price.get(key) is not None:
                    return float(price[key])
        return 0

    def _apply_local_filters(self, cards, params):
        search = (params.get("query") or "").strip().lower()
        set_name = (params.get("set") or "").strip().lower()
        rarity = params.get("rarity")
        min_price = params.get("minPrice")
        max_price = params.get("maxPrice")
        if search:
            cards = [
                card for card in cards
                if search in card["name"].lower()
                or search in card["set"].lower()
                or search in card["rarity"].lower()
            ]
        if set_name:
            cards = [card for card in cards if set_name in card["set"].lower()]
        if rarity and rarity != "all":
            cards = [card for card in cards if card["rarity"] == rarity]
        if min_price is not None:
            cards = [card for card in cards if card.get("marketPrice", 0) >= float(min_price)]
        if max_price is not None:
            cards = [card for card in cards if card.get("marketPrice", 0) <= float(max_price)]
        return cards

    def _sort(self, cards, sort_by, sort_order):
        reverse = sort_order == "desc"
        if sort_by == "price":
            return sorted(cards, key=lambda card: card.get("marketPrice", 0), reverse=reverse)
        if sort_by == "rarity":
            return sorted(cards, key=lambda card: RARITIES.index(card["rarity"]), reverse=reverse)
        if sort_by == "set":
            return sorted(cards, key=lambda card: card["set"], reverse=reverse)
        return sorted(cards, key=lambda card: card["name"], reverse=reverse)

    def _clean_text(self, value):
        return " ".join(str(value or "").split())

    def _clean_image_url(self, value):
        return str(value or "").split("?", 1)[0]

    def _fetch_optcg_listing_window(self, params, page, limit):
        offset = (page - 1) * limit
        start_source_page = (offset // OPTCG_SOURCE_PAGE_SIZE) + 1
        end_offset = offset + limit
        end_source_page = max(start_source_page, ((end_offset - 1) // OPTCG_SOURCE_PAGE_SIZE) + 1)

        cards = []
        total = 0
        for source_page in range(start_source_page, end_source_page + 1):
            html = self._fetch_optcg_listing_html(params, source_page)
            parsed_cards = self._parse_optcg_listing(html)
            if source_page == start_source_page:
                total = self._estimate_optcg_total(html, len(parsed_cards), params)
            cards.extend(parsed_cards)

        start_in_window = offset % OPTCG_SOURCE_PAGE_SIZE
        window = cards[start_in_window:start_in_window + limit]
        requested_rarity = params.get("rarity")
        if requested_rarity and requested_rarity != "all":
            for card in window:
                card["rarity"] = requested_rarity
        return [self._normalize_onepiece_card(card) for card in window], total

    def _fetch_optcg_listing_html(self, params, source_page):
        query = self._build_optcg_query(params, source_page)
        url = f"{OPTCG_SETS_URL}?{urlencode(query)}" if query else OPTCG_SETS_URL
        response = requests.get(url, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        return response.text

    def _build_optcg_query(self, params, source_page):
        query = {}
        search = (params.get("query") or "").strip()
        set_name = (params.get("set") or "").strip()
        rarity = params.get("rarity")
        if search:
            query["cardName"] = search
        if set_name:
            query["setName"] = set_name
        if rarity and rarity != "all":
            mapped = self._optcg_rarity_code(rarity)
            if mapped:
                query["cardRarity"] = mapped
        if source_page > 1:
            query["page"] = source_page
        return query

    def _parse_optcg_listing(self, html):
        cards = []
        blocks = re.findall(r'<div class="col-md-3 d-flex">(.*?)</div>\s*</div>\s*</div>\s*</div>', html, re.S)
        for block in blocks:
            image_match = re.search(r'<img\s+src="([^"]+)"', block)
            name_match = re.search(r'<h4 class="card-title">\s*(.*?)\s*</h4>', block, re.S)
            text_matches = re.findall(r'<p class="card-text">\s*(.*?)\s*</p>', block, re.S)
            detail_match = re.search(r'<a\s+href="([^"]+)"\s+class="btn btn-secondary btn-sm">Details</a>', block)
            if not image_match or not name_match or len(text_matches) < 2:
                continue
            image = self._absolute_optcg_url(image_match.group(1))
            cards.append(
                {
                    "id": self._optcg_image_id(image) or self._clean_text(text_matches[0]),
                    "name": self._clean_text(unescape(name_match.group(1))),
                    "set": self._clean_text(unescape(text_matches[1])),
                    "rarity": "Rare",
                    "image": image,
                    "marketPrice": 0,
                    "detailUrl": detail_match.group(1) if detail_match else None,
                }
            )
        return cards

    def _estimate_optcg_total(self, html, current_count, params):
        page_numbers = [int(value) for value in re.findall(r'\?page=(\d+)', html)]
        max_source_page = max(page_numbers) if page_numbers else 1
        if max_source_page <= 1:
            return current_count
        return max_source_page * OPTCG_SOURCE_PAGE_SIZE

    def _absolute_optcg_url(self, value):
        url = self._clean_image_url(value)
        if not url:
            return ""
        if url.startswith("http"):
            return url
        return f"{OPTCG_BASE_URL}{url}"

    def _optcg_image_id(self, image_url):
        filename = image_url.rsplit("/", 1)[-1].split("?", 1)[0]
        if not filename.lower().endswith(".jpg"):
            return None
        return filename[:-4]

    def _optcg_rarity_code(self, rarity):
        return {
            "Common": "C",
            "Uncommon": "UC",
            "Rare": "R",
            "Super Rare": "SR",
            "Secret Rare": "SEC",
        }.get(rarity)
