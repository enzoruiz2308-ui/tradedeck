import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/src/components/ui/Button';
import { palette } from '@/src/theme/tokens';

interface StateViewProps {
  title: string;
  description?: string;
  action?: string;
  loading?: boolean;
  onAction?: () => void;
}

export function StateView({ title, description, action, loading, onAction }: StateViewProps) {
  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator color={palette.pokemonBlue} /> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {action && onAction ? <Button title={action} variant="ghost" onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 24,
  },
  title: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    color: palette.muted,
    lineHeight: 20,
    textAlign: 'center',
  },
});
