import { router } from 'expo-router';
import { HandHeart, Heart } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Knapp } from '../components/Knapp';
import { Skjerm } from '../components/Skjerm';
import { Overskrift } from '../components/Smaabiter';
import { useApp, type Rolle } from '../lib/app-tilstand';
import { settRetning } from '../lib/overgang';

export default function VelgRolle() {
  const { velgRolle } = useApp();

  function velg(rolle: Rolle) {
    settRetning('rolle');
    velgRolle(rolle);
    router.replace('/');
  }

  return (
    <Skjerm>
      <Overskrift tittel="Velkommen til Hverdagshelten" undertekst="Hva vil du gjøre?" />
      <View style={styles.knapper}>
        <Knapp ikon={Heart} tekst="Jeg trenger hjelp" onPress={() => velg('eldre')} />
        <Knapp ikon={HandHeart} tekst="Jeg vil hjelpe" onPress={() => velg('ungdom')} />
      </View>
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  knapper: {
    gap: 16,
    marginTop: 24,
  },
});
