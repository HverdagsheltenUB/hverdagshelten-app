import { useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Infoboks, Nodknapp } from '../components/Ekstra';
import { Knapp } from '../components/Knapp';
import { Skjerm } from '../components/Skjerm';
import { Tekstfelt } from '../components/Skjema';
import { Overskrift } from '../components/Smaabiter';
import { Tekst } from '../components/Tekst';
import { Chip, Chiprad } from '../components/Valg';
import { useApp } from '../lib/app-tilstand';
import { useKonto } from '../lib/konto';
import { feiltekst, supabase } from '../lib/supabase';
import { gaTilbake } from '../lib/overgang';

const grunner = ['Noe føltes ikke trygt', 'Falsk eller villedende annonse', 'Upassende innhold', 'Uhøflig oppførsel', 'Annet'];

export default function MeldeFra() {
  const { id, tittel } = useLocalSearchParams<{ id?: string; tittel?: string }>();
  const { visToast } = useApp();
  const { session } = useKonto();
  const [grunn, setGrunn] = useState('');
  const [tekst, setTekst] = useState('');
  const [sender, setSender] = useState(false);

  return (
    <Skjerm tilbake={{}}>
      <Overskrift
        tittel="Meld fra om noe"
        undertekst={tittel ? `Om annonsen «${tittel}»` : 'Det er alltid riktig å si fra. Vi tar det på alvor.'}
      />
      <Nodknapp />
      <View style={styles.gruppe}>
        <Tekst variant="mellomtittel">Hva gjelder det?</Tekst>
        <Chiprad>
          {grunner.map((g) => (
            <Chip key={g} tekst={g} valgt={grunn === g} onPress={() => setGrunn(g)} />
          ))}
        </Chiprad>
      </View>
      <Tekstfelt etikett="Fortell kort hva som skjedde" flereLinjer value={tekst} onChangeText={setTekst} />
      <Knapp
        ikon={Send}
        tekst="Send til teamet"
        laster={sender}
        deaktivert={!grunn}
        onPress={async () => {
          if (!session) return;
          setSender(true);
          const { error } = await supabase
            .from('rapporter')
            .insert({ grunn, tekst: tekst.trim(), annonse_id: id ?? null });
          setSender(false);
          if (error) {
            visToast(feiltekst(error));
            return;
          }
          gaTilbake('/');
          visToast('Takk for at du sa fra. Vi tar kontakt innen én arbeidsdag.');
        }}
      />
      <Infoboks tekst="Det du skriver, ser bare teamet. Den du melder fra om, får ikke vite hvem som har meldt fra." />
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  gruppe: {
    gap: 10,
  },
});
