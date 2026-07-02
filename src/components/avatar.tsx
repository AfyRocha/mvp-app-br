import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/theme';

/** Paleta de cores de avatar para prestadores sem cor definida. */
const CORES_FALLBACK = ['#2E7D5B', '#8A5A2B', '#3D4E8A', '#9C3D62', '#54428A'];

export function corDoAvatar(nome: string, cor?: string | null): string {
  if (cor) return cor;
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = (hash * 31 + nome.charCodeAt(i)) | 0;
  return CORES_FALLBACK[Math.abs(hash) % CORES_FALLBACK.length];
}

export function iniciaisDe(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const segunda = partes.length > 1 ? partes[1][0] : '';
  return (primeira + segunda).toUpperCase();
}

/** Avatar com iniciais sobre degradê da cor do prestador, como no protótipo. */
export function Avatar({
  nome,
  cor,
  size = 52,
}: {
  nome: string;
  cor?: string | null;
  size?: number;
}) {
  const base = corDoAvatar(nome, cor);

  return (
    <LinearGradient
      colors={[base, `${base}CC`]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: Math.round(size * 0.36) },
      ]}
    >
      <Text style={[styles.iniciais, { fontSize: Math.round(size * 0.36) }]}>
        {iniciaisDe(nome)}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iniciais: {
    fontFamily: fonts.displayHeavy,
    color: colors.white,
  },
});
