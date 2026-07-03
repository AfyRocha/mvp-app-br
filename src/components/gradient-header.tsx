import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, radius } from '@/theme';

/**
 * Cabeçalho com degradê verde e cantos inferiores arredondados (28px).
 * Usa expo-linear-gradient (não SVG) para renderizar liso em todas as
 * plataformas — na web vira um linear-gradient CSS, sem emendas.
 * O brilho parte do topo-direita (verde-claro) para o canto inferior
 * esquerdo (verde-escuro), reproduzindo o glow radial do protótipo.
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
      <LinearGradient
        colors={[colors.greenLight, colors.green, colors.greenDark]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.85, y: 0 }}
        end={{ x: 0.15, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
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
