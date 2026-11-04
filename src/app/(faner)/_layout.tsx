import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { Fanemeny } from '../../components/Fanemeny';
import { useApp } from '../../lib/app-tilstand';
import { farger } from '../../lib/tema';

export default function FaneLayout() {
  const { data } = useApp();
  if (!data.rolle || !data.innlogget || !data.vilkarGodtatt) return <Redirect href="/oppstart" />;

  // Ingen kart-fane: «Vis veien» åpner Google Maps i stedet (bestemt 4. november).
  return (
    <Tabs
      tabBar={(props) => <Fanemeny {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: farger.krem } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="avtaler" />
      <Tabs.Screen name="profil" />
    </Tabs>
  );
}
