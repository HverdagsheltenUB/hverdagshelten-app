import { useLocalSearchParams } from 'expo-router';
import { Lock, SearchX } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Tomtilstand } from '../../../components/Annonse';
import { Skjerm } from '../../../components/Skjerm';
import { useAnnonse } from '../../../lib/annonser';
import { useKonto } from '../../../lib/konto';
import { gaTilbake } from '../../../lib/overgang';
import { farger } from '../../../lib/tema';
import { Annonseskjema } from '../../../skjermer/Annonseskjema';

export default function EndreAnnonse() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { annonse, laster } = useAnnonse(id);
  const { session } = useKonto();

  if (laster) {
    return (
      <Skjerm tilbake={{}}>
        <ActivityIndicator color={farger.lilla} size="large" style={styles.laster} />
      </Skjerm>
    );
  }
  if (!annonse) {
    return (
      <Skjerm tilbake={{}}>
        <Tomtilstand ikon={SearchX} tittel="Fant ikke annonsen" tekst="Den kan ha blitt slettet." />
      </Skjerm>
    );
  }
  if (annonse.bruker_id !== session?.user.id) {
    return (
      <Skjerm tilbake={{}}>
        <Tomtilstand
          ikon={Lock}
          tittel="Dette er ikke din annonse"
          tekst="Du kan bare endre annonser du har lagt ut selv."
          knapp={{ tekst: 'Gå tilbake', onPress: () => gaTilbake('/') }}
        />
      </Skjerm>
    );
  }
  return <Annonseskjema eksisterende={annonse} />;
}

const styles = StyleSheet.create({ laster: { paddingVertical: 48 } });
