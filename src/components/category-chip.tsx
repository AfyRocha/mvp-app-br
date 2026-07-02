import { Pressable, StyleSheet, Text } from 'react-native';

import { CategoryIcon } from '@/components/category-icon';
import type { Category } from '@/lib/types';
import { colors, fonts, glass, radius } from '@/theme';

/** Chip de categoria (borda 1.5, vidro quando inativo, verde quando ativo). */
export function CategoryChip({
  categoria,
  ativa,
  onPress,
}: {
  categoria: Category;
  ativa: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, ativa ? styles.ativa : styles.inativa]}>
      <CategoryIcon icone={categoria.icone} size={14} color={ativa ? colors.white : colors.ink} />
      <Text style={[styles.texto, { color: ativa ? colors.white : colors.ink }]}>
        {categoria.nome}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.chip,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1.5,
  },
  ativa: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  inativa: {
    backgroundColor: glass.surface,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  texto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
});
