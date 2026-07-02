import { Star } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

export function Stars({ nota, size = 13 }: { nota: number; size?: number }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(nota) ? colors.yellow : 'none'}
          color={i <= Math.round(nota) ? colors.yellow : colors.line}
          strokeWidth={1.5}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 1,
  },
});
