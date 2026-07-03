import type { BottomTabBarProps } from 'expo-router/tabs';
import { BlurView } from 'expo-blur';
import { House, Megaphone, UserRound } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, glass } from '@/theme';

const TAB_META: Record<string, { label: string; Icon: typeof House }> = {
  index: { label: 'Início', Icon: House },
  anunciar: { label: 'Anunciar', Icon: Megaphone },
  perfil: { label: 'Perfil', Icon: UserRound },
};

const blurMethod = Platform.OS === 'android' ? ('dimezisBlurView' as const) : undefined;

/** Navegação inferior — barra de vidro flutuante, fiel ao protótipo. */
export function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View style={styles.clipper}>
        <BlurView intensity={36} tint="light" experimentalBlurMethod={blurMethod} style={styles.bar}>
          {state.routes.map((route, index) => {
            const meta = TAB_META[route.name];
            if (!meta) return null;
            const ativa = state.index === index;
            const { Icon } = meta;

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={ativa ? { selected: true } : {}}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!ativa && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
                style={[styles.tab, ativa && styles.tabAtiva]}
              >
                <Icon
                  size={21}
                  color={ativa ? colors.green : colors.gray}
                  strokeWidth={ativa ? 2.4 : 1.9}
                />
                <Text style={[styles.label, ativa && styles.labelAtiva]}>{meta.label}</Text>
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  clipper: {
    width: '100%',
    maxWidth: 448,
    borderRadius: 24,
    shadowColor: colors.ink,
    shadowOpacity: 0.14,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  bar: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: glass.navBar,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    borderRadius: 18,
    paddingVertical: 8,
  },
  tabAtiva: {
    backgroundColor: 'rgba(20,99,75,0.10)',
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11.5,
    color: colors.gray,
  },
  labelAtiva: {
    fontFamily: fonts.bodyBold,
    color: colors.green,
  },
});
