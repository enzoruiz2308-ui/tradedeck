from flask import Blueprint, jsonify, request
import requests

from services.card_service import CardService

cards_bp = Blueprint("cards_api", __name__)
service = CardService()


@cards_bp.route("/cards", methods=["GET"])
def list_cards():
    try:
        return jsonify(service.list_cards(request.args)), 200
    except requests.RequestException:
        return jsonify({"error": "La API externa de Pokemon no ha respondido. Reintenta en unos segundos."}), 502


@cards_bp.route("/cards/search", methods=["GET"])
def search_cards():
    try:
        return jsonify(service.search_cards(request.args)), 200
    except requests.RequestException:
        return jsonify({"error": "La API externa de Pokemon no ha respondido. Reintenta en unos segundos."}), 502


@cards_bp.route("/cards/<path:card_id>", methods=["GET"])
def get_card(card_id):
    card = service.get_card(card_id, request.args.get("tcg"))
    if not card:
        return jsonify({"error": "Carta no encontrada"}), 404
    return jsonify(card), 200
