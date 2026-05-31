import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { FormInput } from '@/src/components/forms/FormInput';
import { Screen } from '@/src/components/layout/Screen';
import { Button } from '@/src/components/ui/Button';
import { palette } from '@/src/theme/tokens';
import { LoginForm, loginSchema } from '@/src/utils/validation';
import { useAuthStore } from '@/src/store/authStore';

export function LoginScreen() {
  const { login, demoLogin, isLoading, error } = useAuthStore();
  const { control, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'enzo@tradedeck.com', password: '1234' },
    mode: 'onChange',
  });

  const onSubmit = handleSubmit(async (values) => {
    await login(values);
    router.replace('/(tabs)');
  });

  const enterDemo = async () => {
    await demoLogin();
    router.replace('/(tabs)');
  };

  return (
    <Screen contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.logo}>TradeDeck</Text>
        <Text style={styles.subtitle}>Marketplace para cartas Pokemon y One Piece.</Text>
      </View>

      <View style={styles.form}>
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
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title={isLoading ? 'Entrando...' : 'Iniciar sesion'} disabled={!formState.isValid || isLoading} onPress={onSubmit} />
        <Button title="Entrar en modo demo" variant="secondary" onPress={enterDemo} />
      </View>

      <Link href="/(auth)/register" style={styles.link}>
        Crear una cuenta nueva
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  hero: {
    gap: 8,
  },
  logo: {
    color: palette.ink,
    fontSize: 40,
    fontWeight: '900',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  form: {
    gap: 14,
  },
  error: {
    color: palette.onePiece,
    fontWeight: '700',
  },
  link: {
    color: palette.pokemonBlue,
    fontWeight: '800',
    textAlign: 'center',
  },
});
