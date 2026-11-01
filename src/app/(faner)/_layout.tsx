import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { Fanemeny } from '../../components/Fanemeny';
import { useApp } from '../../lib/app-tilstand';
import { farger } from '../../lib/tema';

export default function FaneLayout() {
  const { rolle } = useApp();
  if (!rolle) return <Redirect href="/velg-rolle" />;

  return (
    <Tabs
      tabBar={(props) => <Fanemeny {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: farger.krem } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="avtaler" />
      <Tabs.Screen name="kart" />
      <Tabs.Screen name="profil" />
    </Tabs>
  );
}
