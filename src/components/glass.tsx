import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { glass, radius } from '@/theme';

interface GlassProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
}

const blurMethod = Platform.OS === 'android' ? ('dimezisBlurView' as const) : undefined;

/** Superfície de vidro clara (glass.claro do protótipo). */
export function GlassCard({ children, style, borderRadius = radius.card }: GlassProps) {
  return (
    <View style={[styles.clipper, { borderRadius }, styles.claroBorder]}>
      <BlurView
        intensity={16}
        tint="light"
        experimentalBlurMethod={blurMethod}
        style={[styles.claro, style]}
      >
        {children}
      </BlurView>
    </View>
  );
}

/** Superfície de vidro sobre o degradê verde (glass.sobreVerde do protótipo). */
export function GlassOnGreen({ children, style, borderRadius = radius.chip }: GlassProps) {
  return (
    <View style={[styles.clipper, { borderRadius }, styles.sobreVerdeBorder]}>
      <BlurView
        intensity={14}
        tint="light"
        experimentalBlurMethod={blurMethod}
        style={[styles.sobreVerde, style]}
      >
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  clipper: {
    overflow: 'hidden',
  },
  claroBorder: {
    borderWidth: 1,
    borderColor: glass.border,
  },
  claro: {
    backgroundColor: glass.surface,
  },
  sobreVerdeBorder: {
    borderWidth: 1,
    borderColor: glass.onGreenBorder,
  },
  sobreVerde: {
    backgroundColor: glass.onGreen,
  },
});
