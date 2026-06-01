import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { FormInput } from '@/src/components/forms/FormInput';
import { Screen } from '@/src/components/layout/Screen';
import { Button } from '@/src/components/ui/Button';
import { StateView } from '@/src/components/ui/StateView';
import { useAuthStore } from '@/src/store/authStore';
import { useUserStore } from '@/src/store/userStore';
import { palette } from '@/src/theme/tokens';
import { ProfileForm, profileSchema } from '@/src/utils/validation';

export function EditProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { updateProfile, isMutating, error } = useUserStore();
  const { control, handleSubmit, formState } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username ?? '',
      bio: user?.bio ?? '',
    },
    mode: 'onChange',
  });

  if (!user) {
    return (
      <Screen>
        <StateView title="Sesión requerida" description="Inicia sesión para editar tu perfil." />
      </Screen>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    const updated = await updateProfile({ ...values});
    updateUser(updated);
    router.back();
  });

  return (
    <Screen>
      <View>
        <Text style={styles.title}>Editar perfil</Text>
        <Text style={styles.subtitle}>Actualiza tus datos.</Text>
      </View>

      <Controller
        control={control}
        name="username"
        render={({ field, fieldState }) => <FormInput label="Username" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />}
      />
      <Controller
        control={control}
        name="bio"
        render={({ field, fieldState }) => (
          <FormInput label="Bio" multiline value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} style={styles.textarea} />
        )}
      />

      {error ? <StateView title="No se ha podido guardar" description={error} /> : null}
      <Button title={isMutating ? 'Guardando...' : 'Guardar perfil'} disabled={!formState.isValid || isMutating} onPress={onSubmit} />
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
  textarea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
