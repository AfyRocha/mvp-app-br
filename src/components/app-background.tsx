import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { colors } from '@/theme';

/**
 * Fundo do app: #F2F4F0 com manchas radiais suaves de verde e amarelo,
 * como no protótipo.
 */
export function AppBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.container}>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="blobVerde1" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.green} stopOpacity={0.1} />
            <Stop offset="70%" stopColor={colors.green} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="blobAmarelo" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.yellow} stopOpacity={0.14} />
            <Stop offset="70%" stopColor={colors.yellow} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="blobVerde2" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.green} stopOpacity={0.08} />
            <Stop offset="70%" stopColor={colors.green} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx="15%" cy="8%" rx="60%" ry="40%" fill="url(#blobVerde1)" />
        <Ellipse cx="90%" cy="45%" rx="50%" ry="35%" fill="url(#blobAmarelo)" />
        <Ellipse cx="20%" cy="90%" rx="55%" ry="40%" fill="url(#blobVerde2)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
