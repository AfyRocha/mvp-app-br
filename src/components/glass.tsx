import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { glass, radius } from '@/theme';

interface GlassProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
}

const blurMethod = Platform.OS === 'android' ? ('dimezisBlurView' as const) : undefined;

/**
 * Superfícies de vidro. O raio, a borda e o fundo ficam no PRÓPRIO BlurView
 * (uma camada só) — em vez de uma View externa com overflow:hidden recortando
 * o blur. No navegador, recortar um elemento desfocado por overflow arredondado
 * deixa os cantos serrilhados; arredondar o próprio elemento sai com antialiasing.
 */

/** Superfície de vidro clara (glass.claro do protótipo). */
export function GlassCard({ children, style, borderRadius = radius.card }: GlassProps) {
  return (
    <BlurView
      intensity={16}
      tint="light"
      experimentalBlurMethod={blurMethod}
      style={[styles.base, styles.claro, { borderRadius }, style]}
    >
      {children}
    </BlurView>
  );
}

/** Superfície de vidro sobre o degradê verde (glass.sobreVerde do protótipo). */
export function GlassOnGreen({ children, style, borderRadius = radius.chip }: GlassProps) {
  return (
    <BlurView
      intensity={14}
      tint="light"
      experimentalBlurMethod={blurMethod}
      style={[styles.base, styles.sobreVerde, { borderRadius }, style]}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  claro: {
    backgroundColor: glass.surface,
    borderColor: glass.border,
  },
  sobreVerde: {
    backgroundColor: glass.onGreen,
    borderColor: glass.onGreenBorder,
  },
});
