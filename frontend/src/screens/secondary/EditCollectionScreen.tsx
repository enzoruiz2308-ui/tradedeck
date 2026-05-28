import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { FormInput } from '@/src/components/forms/FormInput';
import { Screen } from '@/src/components/layout/Screen';
import { SectionHeader } from '@/src/components/layout/SectionHeader';
import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { StateView } from '@/src/components/ui/StateView';
import { useUserStore } from '@/src/store/userStore';
import { palette } from '@/src/theme/tokens';
import { CardCondition, GradingCompany } from '@/src/types';
import { CollectionItemForm, collectionItemSchema } from '@/src/utils/validation';

const conditions: CardCondition[] = ['Mint', 'Near Mint', 'Excellent', 'Good', 'Played', 'Poor'];
const gradingCompanies: GradingCompany[] = ['raw', 'PSA', 'BGS', 'CGC', 'ACE', 'other'];

export function EditCollectionScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { collection, isLoading, isMutating, error, loadCollection, updateCollectionItem } = useUserStore();
  const item = collection.find((collectionItem) => collectionItem.id === id);
  const { control, handleSubmit, watch, setValue, reset, formState } = useForm<CollectionItemForm>({
    resolver: zodResolver(collectionItemSchema),
    defaultValues: {
      quantity: item?.quantity ?? 1,
      condition: item?.condition ?? 'Near Mint',
      grading: item?.grading ?? { company: 'raw', grade: '', certificateNumber: '' },
      notes: item?.notes ?? '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!collection.length) {
      void loadCollection();
    }
  }, [collection.length, loadCollection]);

  useEffect(() => {
    if (item) {
      reset({
        quantity: item.quantity,
        condition: item.condition,
        grading: item.grading,
        notes: item.notes ?? '',
      });
    }
  }, [item, reset]);

  if (!id) {
    return (
      <Screen>
        <View>
          <Text style={styles.title}>Editar coleccion</Text>
          <Text style={styles.subtitle}>Selecciona un item para modificar cantidad, estado, grading o notas.</Text>
        </View>
        {isLoading ? <StateView title="Cargando coleccion" loading /> : null}
        {error ? <StateView title="No se ha podido cargar" description={error} action="Reintentar" onAction={loadCollection} /> : null}
        {collection.map((collectionItem) => (
          <View key={collectionItem.id} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{collectionItem.card?.name ?? collectionItem.cardId}</Text>
              <Text style={styles.rowMeta}>
                x{collectionItem.quantity} · {collectionItem.condition} · {collectionItem.grading.company}
              </Text>
            </View>
            <Button title="Editar" variant="ghost" onPress={() => router.replace(`/edit-collection?id=${collectionItem.id}`)} />
          </View>
        ))}
      </Screen>
    );
  }

  if (!item) {
    return (
      <Screen>
        <StateView title="Item no encontrado" description="Carga tu coleccion antes de editar este item." action="Cargar coleccion" onAction={loadCollection} />
      </Screen>
    );
  }

  const condition = watch('condition');
  const gradingCompany = watch('grading.company');
  const onSubmit = handleSubmit(async (values) => {
    await updateCollectionItem(item.id, values);
    router.back();
  });

  return (
    <Screen>
      <View>
        <Text style={styles.title}>{item.card?.name ?? item.cardId}</Text>
        <Text style={styles.subtitle}>Edita los datos persistidos en /me/collection/{item.id}.</Text>
      </View>

      <Controller
        control={control}
        name="quantity"
        render={({ field, fieldState }) => (
          <FormInput
            label="Cantidad"
            keyboardType="numeric"
            value={String(field.value)}
            onChangeText={(value) => field.onChange(Number(value) || 1)}
            error={fieldState.error?.message}
          />
        )}
      />

      <View style={styles.block}>
        <SectionHeader title="Estado" />
        <View style={styles.chips}>
          {conditions.map((itemCondition) => (
            <Chip
              key={itemCondition}
              label={itemCondition}
              active={condition === itemCondition}
              onPress={() => setValue('condition', itemCondition, { shouldValidate: true })}
            />
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
      </View>

      {gradingCompany !== 'raw' ? (
        <>
          <Controller control={control} name="grading.grade" render={({ field }) => <FormInput label="Nota" value={field.value} onChangeText={field.onChange} />} />
          <Controller
            control={control}
            name="grading.certificateNumber"
            render={({ field }) => <FormInput label="Certificado" value={field.value} onChangeText={field.onChange} />}
          />
        </>
      ) : null}

      <Controller
        control={control}
        name="notes"
        render={({ field, fieldState }) => (
          <FormInput label="Notas" multiline value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} style={styles.textarea} />
        )}
      />

      {error ? <StateView title="No se ha podido guardar" description={error} /> : null}
      <Button title={isMutating ? 'Guardando...' : 'Guardar cambios'} disabled={!formState.isValid || isMutating} onPress={onSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: palette.ink,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  row: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 12,
  },
  rowText: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    color: palette.ink,
    fontWeight: '900',
  },
  rowMeta: {
    color: palette.muted,
    fontSize: 12,
  },
  block: {
    gap: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
