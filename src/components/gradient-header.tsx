import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Rect, RadialGradient, Stop } from 'react-native-svg';

import { colors, radius } from '@/theme';

/**
 * Cabeçalho com degradê radial verde e cantos inferiores arredondados (28px),
 * reproduzindo `radial-gradient(120% 140% at 85% -20%, #1E7F62, #14634B 45%, #0C3D2E)`.
 */
export function GradientHeader({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={styles.container}>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="headerGrad" cx="85%" cy="-20%" rx="120%" ry="140%">
            <Stop offset="0%" stopColor={colors.greenLight} />
            <Stop offset="45%" stopColor={colors.green} />
            <Stop offset="100%" stopColor={colors.greenDark} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#headerGrad)" />
      </Svg>
      <View style={style}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomLeftRadius: radius.header,
    borderBottomRightRadius: radius.header,
    overflow: 'hidden',
    backgroundColor: colors.green,
  },
});
