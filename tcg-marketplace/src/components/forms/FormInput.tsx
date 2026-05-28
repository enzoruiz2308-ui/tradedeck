import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { palette } from '@/src/theme/tokens';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  password?: boolean;
}

export function FormInput({ label, error, password, style, ...props }: FormInputProps) {
  const [hidden, setHidden] = useState(Boolean(password));

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputShell, error && styles.inputError]}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor="#94a3b8"
          secureTextEntry={hidden}
          style={[styles.input, style]}
          {...props}
        />
        {password ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Mostrar contrasena" onPress={() => setHidden((value) => !value)}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={palette.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 7,
  },
  label: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 50,
    paddingHorizontal: 14,
  },
  input: {
    color: palette.ink,
    flex: 1,
    fontSize: 15,
  },
  inputError: {
    borderColor: palette.onePiece,
  },
  error: {
    color: palette.onePiece,
    fontSize: 12,
  },
});
