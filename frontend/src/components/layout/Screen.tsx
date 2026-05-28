import { PropsWithChildren } from 'react';
import { ScrollView, ScrollViewProps, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/src/theme/tokens';

interface ScreenProps extends PropsWithChildren, ScrollViewProps {
  scroll?: boolean;
}

export function Screen({ children, scroll = true, contentContainerStyle, ...props }: ScreenProps) {
  const content = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      {...props}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentContainerStyle]}>{children}</View>
  );

  return <SafeAreaView style={styles.safe}>{content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.surfaceSoft,
  },
  content: {
    padding: 18,
    gap: 18,
    paddingBottom: 110,
  },
});
