import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Infoboks } from '../components/Ekstra';
import { Knapp } from '../components/Knapp';
import { Skjerm } from '../components/Skjerm';
import { Tekstfelt } from '../components/Skjema';
import { Overskrift } from '../components/Smaabiter';
import { Tekst } from '../components/Tekst';
import { Chip, Chiprad } from '../components/Valg';
import { useApp } from '../lib/app-tilstand';
import { tingAViteValg } from '../lib/eksempeldata';
import { gaTilbake } from '../lib/overgang';

export default function OmMeg() {
  const { data, endre, visToast } = useApp();
  const [skjema, setSkjema] = useState(data.eldre);
  const sett = (felt: 'navn' | 'adresse' | 'omrade' | 'telefon' | 'annetAVite') => (verdi: string) =>
    setSkjema((s) => ({ ...s, [felt]: verdi }));

  function bytt(ting: string) {
    setSkjema((s) => ({
      ...s,
      tingAVite: s.tingAVite.includes(ting) ? s.tingAVite.filter((t) => t !== ting) : [...s.tingAVite, ting],
    }));
  }

  return (
    <Skjerm tilbake={{ tekst: 'Til profilen', onPress: () => gaTilbake('/profil') }}>
      <Overskrift tittel="Om meg" />
      <Tekstfelt etikett="Navn" value={skjema.navn} onChangeText={sett('navn')} autoComplete="name" />
      <Tekstfelt
        etikett="Adresse"
        value={skjema.adresse}
        onChangeText={sett('adresse')}
        autoComplete="street-address"
      />
      <Tekstfelt etikett="Område eller bydel" value={skjema.omrade} onChangeText={sett('omrade')} />
      <Tekstfelt
        etikett="Telefonnummer"
        value={skjema.telefon}
        onChangeText={sett('telefon')}
        keyboardType="phone-pad"
      />

      <View style={styles.gruppe}>
        <Tekst variant="mellomtittel">Ting hjelperen bør vite</Tekst>
        <Tekst variant="under">Velg det som passer. Du bestemmer selv hva du vil dele.</Tekst>
        <Chiprad>
          {tingAViteValg.map((t) => (
            <Chip key={t} tekst={t} valgt={skjema.tingAVite.includes(t)} onPress={() => bytt(t)} />
          ))}
        </Chiprad>
      </View>
      <Tekstfelt
        etikett="Noe annet hjelperen bør vite (valgfritt)"
        placeholder="For eksempel: katten må ikke slippe ut"
        flereLinjer
        value={skjema.annetAVite}
        onChangeText={sett('annetAVite')}
      />
      <Infoboks tekst="Ikke skriv helseopplysninger eller medisiner her. Hjelperen ser dette bare når dere har en avtale." />

      <Knapp
        ikon={Check}
        tekst="Lagre"
        onPress={() => {
          const fornavn = skjema.navn.trim().split(' ')[0] || data.eldre.fornavn;
          endre((d) => ({ ...d, eldre: { ...skjema, fornavn } }));
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
