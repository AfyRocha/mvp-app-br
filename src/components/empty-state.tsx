import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

/** Estado vazio com convite para indicar/cadastrar prestador, como no protótipo. */
export function EmptyState({
  mensagem = 'Nenhum prestador ainda nessa busca.',
  convite = 'Conhece alguém? Convide para se cadastrar!',
}: {
  mensagem?: string;
  convite?: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.mensagem}>{mensagem}</Text>
      <Text style={styles.convite}>{convite}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  mensagem: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
  },
  convite: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.green,
    textAlign: 'center',
    marginTop: 4,
  },
});
