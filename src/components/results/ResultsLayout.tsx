import React, { PropsWithChildren, memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Footer } from '../../features/auth';

interface ResultsLayoutProps extends PropsWithChildren {
  topInset?: number;
  testID?: string;
}

function ResultsLayoutBase({ children, topInset = 0, testID }: ResultsLayoutProps) {
  const containerStyle = useMemo(() => [{ ...styles.container, paddingTop: topInset }], [topInset]);
  return (
    <LinearGradient colors={['#C8A8E9', '#B19CD9']} style={containerStyle as unknown as any} testID={testID ?? 'results-layout'}>
      <View style={styles.content} testID="results-layout-content">
        {children}
      </View>
      <Footer />
    </LinearGradient>
  );
}

export const ResultsLayout = memo(ResultsLayoutBase);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
