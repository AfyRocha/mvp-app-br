import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Stars } from '@/components/stars';
import { VerifiedBadge } from '@/components/verified-badge';
import type { ProviderWithRating } from '@/lib/types';
import { colors, fonts, glass, radius } from '@/theme';

/** Card da lista de busca: avatar, nome, selo, categoria · cidade, estrelas. */
export function ProviderCard({
  provider,
  onPress,
}: {
  provider: ProviderWithRating;
  onPress: () => void;
}) {
  const nota = provider.nota_media ?? 0;

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Avatar nome={provider.nome_negocio} cor={provider.cor} />
      <View style={styles.info}>
        <View style={styles.linhaNome}>
          <Text style={styles.nome} numberOfLines={1}>
            {provider.nome_negocio}
          </Text>
          {provider.verificado && <VerifiedBadge mini />}
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {provider.categoria_nome} · {provider.cidade_principal}
        </Text>
        <View style={styles.linhaNota}>
          <Stars nota={nota} />
          <Text style={styles.notaTexto}>
            {provider.total_avaliacoes > 0
              ? `${nota.toFixed(1)} (${provider.total_avaliacoes})`
              : 'Sem avaliações ainda'}
          </Text>
        </View>
      </View>
      <ChevronRight size={18} color={colors.gray} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: glass.surface,
    borderWidth: 1,
    borderColor: glass.border,
    borderRadius: radius.card,
    padding: 14,
    marginBottom: 10,
    shadowColor: colors.ink,
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  linhaNome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  nome: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
    flexShrink: 1,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.gray,
    marginVertical: 3,
  },
  linhaNota: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notaTexto: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray,
  },
});
