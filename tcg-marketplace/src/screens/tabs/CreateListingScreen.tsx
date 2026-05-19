import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { TradingCardTile } from '@/src/components/cards/TradingCardTile';
import { FormInput } from '@/src/components/forms/FormInput';
import { Screen } from '@/src/components/layout/Screen';
import { SectionHeader } from '@/src/components/layout/SectionHeader';
import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { StateView } from '@/src/components/ui/StateView';
import { useAuthStore } from '@/src/store/authStore';
import { useCardsStore } from '@/src/store/cardsStore';
import { useListingsStore } from '@/src/store/listingsStore';
import { palette } from '@/src/theme/tokens';
import { CardCondition } from '@/src/types';
import { ListingForm, listingSchema } from '@/src/utils/validation';

const conditions: CardCondition[] = ['Mint', 'Near Mint', 'Excellent', 'Good', 'Played', 'Poor'];

export function CreateListingScreen() {
  const { user, demoLogin } = useAuthStore();
  const { cards } = useCardsStore();
  const { createListing } = useListingsStore();
  const { control, handleSubmit, watch, setValue, formState, reset } = useForm<ListingForm>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      type: 'sell',
      cardId: cards[0]?.id ?? '',
      title: '',
      description: '',
      price: 10,
      condition: 'Near Mint',
    },
    mode: 'onChange',
  });

  const selectedCard = cards.find((card) => card.id === watch('cardId')) ?? cards[0];
  const listingType = watch('type');
  const condition = watch('condition');

  const onSubmit = handleSubmit(async (values) => {
    const seller = user ?? (await demoLogin(), useAuthStore.getState().user);
    if (!seller || !selectedCard) return;
    await createListing(values, selectedCard, seller);
    reset();
    router.push('/(tabs)');
  });

  if (!selectedCard) {
    return (
      <Screen>
        <StateView title="Catalogo vacio" description="No hay cartas disponibles para publicar anuncios." />
      </Screen>
    );
  }

  return (
    <Screen>
      <View>
        <Text style={styles.title}>Publicar anuncio</Text>
        <Text style={styles.subtitle}>Crea un anuncio de venta o busqueda con preview inmediata.</Text>
      </View>

      <View style={styles.block}>
        <SectionHeader title="Tipo" />
        <View style={styles.chips}>
          <Chip label="Venta" active={listingType === 'sell'} onPress={() => setValue('type', 'sell', { shouldValidate: true })} />
          <Chip label="Compra" active={listingType === 'buy'} onPress={() => setValue('type', 'buy', { shouldValidate: true })} />
        </View>
      </View>

      <View style={styles.block}>
        <SectionHeader title="Carta" action={selectedCard.name} />
        <View style={styles.grid}>
          {cards.slice(0, 6).map((card) => (
            <TradingCardTile
              key={card.id}
              card={card}
              selected={selectedCard.id === card.id}
              onPress={() => setValue('cardId', card.id, { shouldValidate: true })}
            />
          ))}
        </View>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <FormInput label="Titulo" placeholder="Charizard ex Near Mint" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <FormInput
              label="Descripcion"
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
              keyboardType="numeric"
              value={String(field.value)}
              onChangeText={(value) => field.onChange(Number(value.replace(',', '.')) || 0)}
              error={fieldState.error?.message}
            />
          )}
        />
      </View>

      <View style={styles.block}>
        <SectionHeader title="Estado" />
        <View style={styles.chips}>
          {conditions.map((item) => (
            <Chip key={item} label={item} active={condition === item} onPress={() => setValue('condition', item, { shouldValidate: true })} />
          ))}
        </View>
      </View>

      <View style={styles.preview}>
        <Text style={styles.previewTitle}>Preview</Text>
        <Text style={styles.previewText}>
          {listingType === 'sell' ? 'Vendes' : 'Buscas'} {selectedCard.name} en estado {condition}. La imagen principal usara la carta seleccionada hasta integrar upload real.
        </Text>
      </View>

      <Button title="Publicar anuncio" disabled={!formState.isValid} onPress={onSubmit} />
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
  preview: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  previewTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  previewText: {
    color: palette.muted,
    lineHeight: 20,
  },
});
