import { Check, HandHeart, Heart } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Infoboks } from '../components/Ekstra';
import { Knapp } from '../components/Knapp';
import { Skjerm } from '../components/Skjerm';
import { Tekstfelt } from '../components/Skjema';
import { Overskrift } from '../components/Smaabiter';
import { Tekst } from '../components/Tekst';
import { Chip, Chiprad } from '../components/Valg';
import { useApp, type Rolle } from '../lib/app-tilstand';
import { useKonto } from '../lib/konto';
import { gaTilbake } from '../lib/overgang';

// Endre navn, område og rolle. Lagres i kontoen, så det følger med til andre telefoner.
export default function OmMeg() {
  const { visToast } = useApp();
  const { profil, endreProfil } = useKonto();
  const [navn, setNavn] = useState(profil?.navn ?? '');
  const [omrade, setOmrade] = useState(profil?.omrade ?? '');
  const [rolle, setRolle] = useState<Rolle | null>(profil?.rolle ?? null);
  const [lagrer, setLagrer] = useState(false);
  const klar = navn.trim().length >= 2;

  return (
    <Skjerm tilbake={{ tekst: 'Til profilen', onPress: () => gaTilbake('/profil') }}>
      <Overskrift tittel="Om meg" undertekst="Navnet ditt vises på annonsene du legger ut." />
      <Tekstfelt etikett="Navn" value={navn} onChangeText={setNavn} autoComplete="name" maxLength={80} />
      <Tekstfelt
        etikett="Område eller bydel"
        hjelpetekst="Brukes som forslag til «Sted» når du legger ut en annonse."
        value={omrade}
        onChangeText={setOmrade}
        maxLength={80}
      />
      <View style={styles.gruppe}>
        <Tekst variant="brodLiten" vekt={700}>
          Jeg bruker appen fordi …
        </Tekst>
        <Chiprad>
          <Chip tekst="Jeg trenger hjelp" valgt={rolle === 'eldre'} onPress={() => setRolle('eldre')} />
          <Chip tekst="Jeg vil hjelpe" valgt={rolle === 'ungdom'} onPress={() => setRolle('ungdom')} />
        </Chiprad>
      </View>
      <Knapp
        ikon={Check}
        tekst="Lagre"
        deaktivert={!klar}
        laster={lagrer}
        onPress={async () => {
          setLagrer(true);
          const svar = await endreProfil({ navn: navn.trim(), omrade: omrade.trim(), rolle: rolle ?? undefined });
          setLagrer(false);
          if (svar.feil) {
            visToast(svar.feil);
            return;
          }
          visToast('Lagret.');
          gaTilbake('/profil');
        }}
      />
      <Infoboks
        ikon={rolle === 'ungdom' ? HandHeart : Heart}
        tekst="Vi viser aldri adressen eller telefonnummeret ditt i appen. Skriv bare området på annonsene."
      />
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  gruppe: { gap: 10 },
});
