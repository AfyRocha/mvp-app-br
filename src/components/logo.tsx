import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, fonts } from '@/theme';

/**
 * Logo da marca ACHEI: símbolo (o "A" em pin com lupa) + wordmark "Achei".
 * O símbolo é um SVG recriado da identidade; a lupa é preenchida com o verde
 * do cabeçalho (o logo é sempre exibido sobre o degradê verde).
 */
export function Logo({ size = 22 }: { size?: number }) {
  const w = Math.round(size * 1.16);
  const h = Math.round(size * 1.34);
  return (
    <View style={styles.row}>
      <Svg width={w} height={h} viewBox="0 0 100 112">
        {/* "A" em pin, com o vão (counter) recortado */}
        <Path
          fill={colors.white}
          fillRule="evenodd"
          d="M50 6 L86 98 L67 98 L50 58 L33 98 L14 98 Z M50 30 L58 52 L42 52 Z"
        />
        {/* lente da lupa (verde do cabeçalho preenche o miolo) */}
        <Circle cx="50" cy="80" r="14.5" stroke={colors.white} strokeWidth="5.5" fill={colors.green} />
        {/* cabo */}
        <Path d="M60 90 L78 108" stroke={colors.white} strokeWidth="5.5" strokeLinecap="round" />
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
