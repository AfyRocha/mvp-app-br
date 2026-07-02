import { BadgeCheck } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '@/theme';

/** Selo "Verificado" amarelo do protótipo. */
export function VerifiedBadge({ mini = false }: { mini?: boolean }) {
  return (
    <View style={[styles.badge, mini ? styles.badgeMini : styles.badgeNormal]}>
      <BadgeCheck size={mini ? 11 : 13} color={colors.ink} strokeWidth={2.4} />
      <Text style={[styles.texto, { fontSize: mini ? 10 : 11 }]}>Verificado</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.yellow,
    borderRadius: radius.chip,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
  },
  badgeMini: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  badgeNormal: {
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  texto: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
  },
});
