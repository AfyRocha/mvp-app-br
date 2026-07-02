import type { BottomTabBarProps } from 'expo-router/tabs';
import { BlurView } from 'expo-blur';
import { Megaphone, Search, UserRound } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, glass, radius, shadows } from '@/theme';

const TAB_META: Record<string, { label: string; Icon: typeof Search }> = {
  index: { label: 'Buscar', Icon: Search },
  anunciar: { label: 'Anunciar', Icon: Megaphone },
  perfil: { label: 'Perfil', Icon: UserRound },
};

/** Navegação inferior flutuante em vidro, como no protótipo. */
export function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <BlurView intensity={glass.blur * 2} tint="light" style={styles.bar}>
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;
          const focused = state.index === index;
          const { Icon } = meta;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={[styles.tab, focused && styles.tabActive]}
            >
              <Icon
                size={20}
                color={focused ? colors.white : colors.gray}
                strokeWidth={focused ? 2.4 : 2}
              />
              <Text style={[styles.label, focused && styles.labelActive]}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    gap: 6,
    padding: 8,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: Platform.OS === 'android' ? glass.surfaceStrong : glass.surface,
    overflow: 'hidden',
    ...shadows.floating,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: radius.chip,
  },
  tabActive: {
    backgroundColor: colors.green,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.gray,
  },
  labelActive: {
    color: colors.white,
  },
});
