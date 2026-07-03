import { StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/theme';

/** Logo da marca: "ACHEI" branco + "!" amarelo, Bricolage 800. */
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <Text style={[styles.logo, { fontSize: size }]}>
      ACHEI<Text style={styles.amarelo}>!</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  logo: {
    fontFamily: fonts.displayHeavy,
    color: colors.white,
    letterSpacing: 0.5,
  },
  amarelo: {
    color: colors.yellow,
  },
});
