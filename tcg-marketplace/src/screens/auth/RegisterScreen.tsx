import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FormInput } from '@/src/components/forms/FormInput';
import { Screen } from '@/src/components/layout/Screen';
import { Button } from '@/src/components/ui/Button';
import { useAuthStore } from '@/src/store/authStore';
import { palette } from '@/src/theme/tokens';
import { RegisterForm, registerSchema } from '@/src/utils/validation';

export function RegisterScreen() {
  const { register, isLoading, error } = useAuthStore();
  const { control, handleSubmit, formState } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '', terms: false },
    mode: 'onChange',
  });

  const onSubmit = handleSubmit(async ({ confirmPassword, terms, ...values }) => {
    void confirmPassword;
    void terms;
    await register(values);
    router.replace('/(tabs)');
  });

  return (
    <Screen contentContainerStyle={styles.screen}>
      <View>
        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>Publica anuncios, guarda favoritos y gestiona tu coleccion.</Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="username"
          render={({ field, fieldState }) => (
            <FormInput label="Username" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <FormInput
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <FormInput label="Contrasena" password value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <FormInput
              label="Confirmar contrasena"
              password
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="terms"
          render={({ field, fieldState }) => (
            <View style={styles.termsBlock}>
              <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: field.value }} onPress={() => field.onChange(!field.value)} style={styles.terms}>
                <View style={[styles.checkbox, field.value && styles.checked]} />
                <Text style={styles.termsText}>Acepto los terminos y buenas practicas de trading.</Text>
              </Pressable>
              {fieldState.error ? <Text style={styles.error}>{fieldState.error.message}</Text> : null}
            </View>
          )}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title={isLoading ? 'Creando...' : 'Registrarme'} disabled={!formState.isValid || isLoading} onPress={onSubmit} />
      </View>

      <Link href="/(auth)/login" style={styles.link}>
        Ya tengo cuenta
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    color: palette.ink,
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
  },
  form: {
    gap: 13,
  },
  termsBlock: {
    gap: 6,
  },
  terms: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  checkbox: {
    borderColor: palette.border,
    borderRadius: 6,
    borderWidth: 2,
    height: 22,
    width: 22,
  },
  checked: {
    backgroundColor: palette.ink,
    borderColor: palette.ink,
  },
  termsText: {
    color: palette.ink,
    flex: 1,
    lineHeight: 20,
  },
  error: {
    color: palette.onePiece,
    fontSize: 12,
    fontWeight: '700',
  },
  link: {
    color: palette.pokemonBlue,
    fontWeight: '800',
    textAlign: 'center',
  },
});
