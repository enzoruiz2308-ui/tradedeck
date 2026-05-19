import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/src/theme/tokens';

interface SectionHeaderProps {
  title: string;
  action?: string;
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? <Text style={styles.action}>{action}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  action: {
    color: palette.pokemonBlue,
    fontSize: 13,
    fontWeight: '700',
  },
});
