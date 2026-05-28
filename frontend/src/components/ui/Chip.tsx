import { Pressable, StyleSheet, Text } from 'react-native';

import { palette } from '@/src/theme/tokens';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function Chip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.chip, active && styles.active]}>
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  active: {
    backgroundColor: palette.ink,
    borderColor: palette.ink,
  },
  label: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  activeLabel: {
    color: '#ffffff',
  },
});
