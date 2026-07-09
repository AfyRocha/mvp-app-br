import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, fonts } from '@/theme';

/**
 * Logo da marca ACHEI: símbolo (o "A" em pin com lupa) + wordmark "Achei".
 * O símbolo é um SVG recriado da identidade; a lupa é preenchida com o verde
 * do cabeçalho (o logo é sempre exibido sobre o degradê verde).
 */
export function Logo({ size = 22 }: { size?: number }) {
  const mark = Math.round(size * 1.3);
  return (
    <View style={styles.row}>
      <Svg width={mark} height={mark} viewBox="0 0 100 100">
        <Path
          fill={colors.white}
          fillRule="evenodd"
          d="M50 6 L84 84 L61 84 L50 56 L39 84 L16 84 Z M50 30 L58 50 L42 50 Z"
        />
        <Circle cx="55" cy="70" r="15" stroke={colors.white} strokeWidth="7" fill={colors.green} />
        <Path d="M66 81 L80 96" stroke={colors.white} strokeWidth="9" strokeLinecap="round" />
      </Svg>
      <Text style={[styles.logo, { fontSize: size }]}>Achei</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  logo: {
    fontFamily: fonts.displayHeavy,
    color: colors.white,
    letterSpacing: 0.3,
  },
});
