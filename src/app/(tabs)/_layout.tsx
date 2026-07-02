import { Tabs } from 'expo-router';

import { GlassTabBar } from '@/components/glass-tab-bar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Buscar' }} />
      <Tabs.Screen name="anunciar" options={{ title: 'Anunciar' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
