import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { TradingCardTile } from '@/src/components/cards/TradingCardTile';
import { FormInput } from '@/src/components/forms/FormInput';
import { SearchInput } from '@/src/components/forms/SearchInput';
import { Screen } from '@/src/components/layout/Screen';
import { SectionHeader } from '@/src/components/layout/SectionHeader';
import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { StateView } from '@/src/components/ui/StateView';
import { useAuthStore } from '@/src/store/authStore';
import { useCardsStore } from '@/src/store/cardsStore';
import { useListingsStore } from '@/src/store/listingsStore';
import { useUserStore } from '@/src/store/userStore';
import { palette } from '@/src/theme/tokens';
import { CardCondition, GradingCompany, TradingCard } from '@/src/types';
import { getCardTcg } from '@/src/utils/filters';
import { ListingForm, listingSchema } from '@/src/utils/validation';

const conditions: CardCondition[] = ['Mint', 'Near Mint', 'Excellent', 'Good', 'Played', 'Poor'];
const gradingCompanies: GradingCompany[] = ['raw', 'PSA', 'BGS', 'CGC', 'ACE', 'other'];

export function CreateListingScreen() {
  const { isAuthenticated } = useAuthStore();
  const {
    cards,
    filters,
    isLoading: isLoadingCards,
    error: cardsError,
    loadCards,
    loadMore,
    page,
    totalPages,
    setQuery,
    setFilters
  } = useCardsStore();
  const { createListing, isMutating, error } = useListingsStore();
  const { collection, isLoading: isLoadingCollection, error: collectionError, loadCollection } = useUserStore();
  const { control, handleSubmit, watch, setValue, formState, reset } = useForm<ListingForm>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      type: 'sell',
      cardId: '',
      tcg: 'pokemon',
      description: '',
      price: 10,
      condition: 'Near Mint',
      grading: { company: 'raw', grade: '', certificateNumber: '' },
      status: 'active',
    },
    mode: 'onChange',
  });

  const listingType = watch('type');
  const selectedCardId = watch('cardId');
  const condition = watch('condition');
  const gradingCompany = watch('grading.company');
  const ownedCards = collection.map((item) => item.card).filter((card): card is TradingCard => Boolean(card));
  const availableCards = (listingType === 'sell' && ownedCards.length > 0) ? ownedCards : cards;
  const selectedCard = availableCards.find((card) => card.id === selectedCardId);

  useEffect(() => {
    if (listingType === 'buy' || (listingType === 'sell' && ownedCards.length === 0)) {
      void loadCards();
    }
  }, [listingType, ownedCards.length, filters.query, filters.tcg, loadCards]);

  useEffect(() => {
    if (isAuthenticated && !collection.length) {
      void loadCollection();
    }
  }, [collection.length, isAuthenticated, loadCollection]);

  useEffect(() => {
    if (!selectedCardId) return;
    if (!availableCards.some((card) => card.id === selectedCardId)) {
      setValue('cardId', '', { shouldValidate: true });
    }
  }, [availableCards, selectedCardId, setValue]);

  const selectCard = (cardId: string) => {
    const card = availableCards.find((item) => item.id === cardId);
    if (!card) return;
    setValue('cardId', card.id, { shouldValidate: true });
    setValue('tcg', getCardTcg(card) ?? 'pokemon', { shouldValidate: true });
  };

  const setListingType = (type: 'sell' | 'buy') => {
    setValue('type', type, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }

    const numericPrice = typeof values.price === 'string'
      ? Number(values.price.replace(',', '.'))
      : (values.price ?? 0);

    await createListing({
      type: values.type,
      cardId: values.cardId,
      tcg: values.tcg,
      description: values.description,
      price: numericPrice,
      condition: values.condition,
      grading: values.grading,
      status: 'active',
    });
    reset();
    router.push('/(tabs)');
  });

  return (
    <Screen>
      <View>
        <Text style={styles.title}>Publicar anuncio</Text>
        <Text style={styles.subtitle}>Crea un anuncio de compra o venta de una carta.</Text>
      </View>

      <View style={styles.block}>
        <SectionHeader title="Tipo" />
        <View style={styles.chips}>
          <Chip label="Venta" active={listingType === 'sell'} onPress={() => setListingType('sell')} />
          <Chip label="Compra" active={listingType === 'buy'} onPress={() => setListingType('buy')} />
        </View>
      </View>

      <View style={styles.block}>
        <SectionHeader title="Carta" action={selectedCard?.name ?? 'Selecciona una'} />
        
        {(listingType === 'buy' || (listingType === 'sell' && ownedCards.length === 0)) ? (
          <View style={{ gap: 10, marginBottom: 6 }}>
            <SearchInput
              value={filters.query}
              onChangeText={setQuery}
              placeholder="Buscar carta por nombre..."
            />
            <View style={styles.chips}>
              <Chip
                label="Pokemon"
                active={filters.tcg === 'pokemon'}
                onPress={() => setFilters({ tcg: 'pokemon' })}
              />
              <Chip
                label="One Piece"
                active={filters.tcg === 'onepiece'}
                onPress={() => setFilters({ tcg: 'onepiece' })}
              />
            </View>
          </View>
        ) : null}

        {listingType === 'sell' && isLoadingCollection && !ownedCards.length ? <StateView title="Cargando colección" loading /> : null}
        {listingType === 'sell' && collectionError ? (
          <StateView title="No se puede cargar tu colección" description={collectionError} action="Reintentar" onAction={loadCollection} />
        ) : null}
        {listingType === 'buy' && isLoadingCards && !cards.length ? <StateView title="Cargando cartas" loading /> : null}
        {listingType === 'buy' && cardsError ? <StateView title="No se pueden cargar cartas" description={cardsError} action="Reintentar" onAction={loadCards} /> : null}
        {availableCards.length ? (
          <View style={styles.grid}>
            {availableCards.map((card) => (
              <TradingCardTile key={card.id} card={card} selected={selectedCard?.id === card.id} onPress={() => selectCard(card.id)} />
            ))}
          </View>
        ) : null}
        {listingType === 'buy' && page < totalPages ? <Button title="Siguiente página" variant="secondary" onPress={loadMore} /> : null}
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <FormInput
              label="Descripcion opcional"
              multiline
              placeholder="Estado, entrega, sleeves, condiciones..."
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              style={styles.textarea}
            />
          )}
        />
        <Controller
          control={control}
          name="price"
          render={({ field, fieldState }) => (
            <FormInput
              label="Precio EUR"
              keyboardType="decimal-pad"
              value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      </View>

      <View style={styles.block}>
        <SectionHeader title="Estado carta" />
        <View style={styles.chips}>
          {conditions.map((item) => (
            <Chip key={item} label={item} active={condition === item} onPress={() => setValue('condition', item, { shouldValidate: true })} />
          ))}
        </View>
      </View>

      <View style={styles.block}>
        <SectionHeader title="Grading" />
        <View style={styles.chips}>
          {gradingCompanies.map((company) => (
            <Chip
              key={company}
              label={company === 'raw' ? 'Raw' : company}
              active={gradingCompany === company}
              onPress={() => setValue('grading.company', company, { shouldValidate: true })}
            />
          ))}
        </View>
        {gradingCompany !== 'raw' ? (
          <View style={styles.form}>
            <Controller
              control={control}
              name="grading.grade"
              render={({ field }) => <FormInput label="Nota" placeholder="10" value={field.value} onChangeText={field.onChange} />}
            />
            <Controller
              control={control}
              name="grading.certificateNumber"
              render={({ field }) => <FormInput label="Certificado" placeholder="Opcional" value={field.value} onChangeText={field.onChange} />}
            />
          </View>
        ) : null}
      </View>

      {error ? <StateView title="No se ha podido publicar" description={error} /> : null}
      <Button title={isMutating ? 'Publicando...' : 'Publicar anuncio'} disabled={!formState.isValid || !selectedCard || isMutating} onPress={onSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: palette.ink,
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  block: {
    gap: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  form: {
    gap: 13,
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
