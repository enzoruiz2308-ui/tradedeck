import { Pressable, PressableProps, StyleSheet, Text, ViewStyle } from 'react-native';

import { palette } from '@/src/theme/tokens';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  style?: ViewStyle;
}

export function Button({ title, variant = 'primary', disabled, style, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      {...props}>
      <Text 
        style={[
          styles.label, 
          variant !== 'primary' && styles.darkLabel, 
          variant === 'danger' && styles.dangerLabel
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12, 
  },
  primary: {
    backgroundColor: palette.ink,
  },
  secondary: {
    backgroundColor: palette.pokemon,
  },
  ghost: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderWidth: 1,
  },
  danger: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  label: {
    color: '#ffffff',
    fontSize: 18,         
    fontWeight: '800',
    textAlign: 'center',  
    flexShrink: 1,        
  },
  darkLabel: {
    color: palette.ink,
  },
  dangerLabel: {
    color: palette.onePiece,
  }
});