import { StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/theme';

/** Logo da marca: wordmark "Achei" branco, Bricolage 800. */
export function Logo({ size = 22 }: { size?: number }) {
  return <Text style={[styles.logo, { fontSize: size }]}>Achei</Text>;
}

const styles = StyleSheet.create({
  logo: {
    fontFamily: fonts.displayHeavy,
    color: colors.white,
    letterSpacing: 0.3,
  },
});
