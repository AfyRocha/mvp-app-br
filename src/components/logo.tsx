import { StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/theme';

/** Logo da marca: "tem" branco + "brasileiro" amarelo, Bricolage 800. */
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <Text style={[styles.logo, { fontSize: size }]}>
      tem<Text style={styles.amarelo}>brasileiro</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  logo: {
    fontFamily: fonts.displayHeavy,
    color: colors.white,
  },
  amarelo: {
    color: colors.yellow,
  },
});
