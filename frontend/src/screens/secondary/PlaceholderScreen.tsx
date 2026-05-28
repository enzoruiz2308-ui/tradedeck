import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/src/components/layout/Screen';
import { Button } from '@/src/components/ui/Button';
import { palette } from '@/src/theme/tokens';

interface PlaceholderScreenProps {
  title: string;
  description: string;
}

export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  return (
    <Screen contentContainerStyle={styles.screen}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Button title="Volver" variant="ghost" onPress={() => router.back()} />
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
    fontSize: 30,
    fontWeight: '900',
  },
  description: {
    color: palette.muted,
    fontSize: 16,
    lineHeight: 23,
  },
});
