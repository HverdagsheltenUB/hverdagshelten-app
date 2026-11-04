import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Knapp } from '../components/Knapp';
import { Skjerm } from '../components/Skjerm';
import { Overskrift } from '../components/Smaabiter';
import { Tekst } from '../components/Tekst';
import { Chip, Chiprad } from '../components/Valg';
import { useApp } from '../lib/app-tilstand';
import { gaTilbake } from '../lib/overgang';
import { regler } from '../lib/tema';

const tider = ['Ettermiddag', 'Tidlig kveld'];
const dager = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];

export default function Tilgjengelighet() {
  const { data, endre, visToast } = useApp();
  const [valgt, setValgt] = useState(data.ungdom.tilgjengelig);
  const bytt = (v: string) => setValgt((a) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]));

  return (
    <Skjerm tilbake={{ tekst: 'Til profilen', onPress: () => gaTilbake('/profil') }}>
      <Overskrift tittel="Når kan du hjelpe?" undertekst="Vi viser deg oppdrag som passer. Skolen kommer først." />
      <View style={styles.gruppe}>
        <Tekst variant="mellomtittel">Tid på dagen</Tekst>
        <Chiprad>
          {tider.map((t) => (
            <Chip key={t} tekst={t} valgt={valgt.includes(t)} onPress={() => bytt(t)} />
          ))}
        </Chiprad>
      </View>
      <View style={styles.gruppe}>
        <Tekst variant="mellomtittel">Dager</Tekst>
        <Chiprad>
          {dager.map((d) => (
            <Chip key={d} tekst={d} valgt={valgt.includes(d)} onPress={() => bytt(d)} />
          ))}
        </Chiprad>
      </View>
      <Tekst variant="under">Ingen oppdrag slutter senere enn kl. {regler.senestFerdigKl}.</Tekst>
      <Knapp
        ikon={Check}
        tekst="Lagre"
        onPress={() => {
          endre((d) => ({ ...d, ungdom: { ...d.ungdom, tilgjengelig: valgt } }));
          gaTilbake('/profil');
          visToast('Lagret.');
        }}
      />
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  gruppe: {
    gap: 10,
  },
});
