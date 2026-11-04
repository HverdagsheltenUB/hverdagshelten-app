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
import { tittelFor } from '../lib/eksempeldata';
import { gaTilbake } from '../lib/overgang';
import { useOppdrag } from '../lib/utvalg';

const grunner = ['Noe føltes ikke trygt', 'Hjelperen kom ikke', 'Noe ble ødelagt', 'Uhøflig oppførsel', 'Annet'];

export default function MeldeFra() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const o = useOppdrag(id);
  const { rapporter, visToast } = useApp();
  const [grunn, setGrunn] = useState('');
  const [tekst, setTekst] = useState('');
  const [sender, setSender] = useState(false);

  return (
    <Skjerm tilbake={{}}>
      <Overskrift
        tittel="Meld fra om noe"
        undertekst={o ? `Om: ${tittelFor(o)}` : 'Det er alltid riktig å si fra. Vi tar det på alvor.'}
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
        onPress={() => {
          setSender(true);
          setTimeout(() => {
            rapporter(`${grunn}${tekst.trim() ? `: ${tekst.trim()}` : ''}`, o?.id);
            setSender(false);
            gaTilbake('/');
            visToast('Takk for at du sa fra. Vi tar kontakt innen én arbeidsdag.');
          }, 600);
        }}
      />
      <Infoboks tekst="Det du skriver, ser bare teamet. Hjelperen eller den eldre får ikke vite hvem som har meldt fra." />
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  gruppe: {
    gap: 10,
  },
});
