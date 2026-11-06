import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { Fanemeny } from '../../components/Fanemeny';
import { useApp } from '../../lib/app-tilstand';
import { useKonto } from '../../lib/konto';
import { farger } from '../../lib/tema';

export default function FaneLayout() {
  const { data } = useApp();
  const { session, profil } = useKonto();
  if (!session || !data.vilkarGodtatt || (profil && !profil.rolle)) return <Redirect href="/oppstart" />;

  return (
    <Tabs
      tabBar={(props) => <Fanemeny {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: farger.krem } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="annonser" />
      <Tabs.Screen name="mine" />
      <Tabs.Screen name="profil" />
    </Tabs>
  );
}
