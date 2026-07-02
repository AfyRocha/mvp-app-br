import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

export default function AnunciarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anunciar — em construção</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
  },
});
