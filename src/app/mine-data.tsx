import { router } from 'expo-router';
import { Download, Pencil, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';

import { useBekreft } from '../components/Dialog';
import { Infoboks } from '../components/Ekstra';
import { Knapp } from '../components/Knapp';
import { Kort, Skillelinje } from '../components/Kort';
import { Skjerm } from '../components/Skjerm';
import { Overskrift } from '../components/Smaabiter';
import { Tekst } from '../components/Tekst';
import { useApp } from '../lib/app-tilstand';
import { useAnnonser } from '../lib/annonser';
import { useKonto } from '../lib/konto';
import { gaFrem, gaTilbake, settRetning } from '../lib/overgang';

// Innsyn, retting og sletting, slik personvernreglene krever.
export default function MineData() {
  const { nullstill, visToast } = useApp();
  const { profil, epost, session, slettKonto } = useKonto();
  const { annonser } = useAnnonser({ brukerId: session?.user.id ?? 'ingen' });
  const bekreft = useBekreft();
  const [sletter, setSletter] = useState(false);

  const rader: [string, string][] = [
    ['Navn', profil?.navn || '–'],
    ['E-post', epost ?? '–'],
    ['Område', profil?.omrade || '–'],
    ['Rolle', profil?.rolle === 'ungdom' ? 'Vil hjelpe' : 'Trenger hjelp'],
    ['Annonser', annonser.length === 0 ? 'Ingen' : annonser.map((a) => a.tittel).join(', ')],
  ];

  async function slett() {
    const ja = await bekreft({
      tittel: 'Slette kontoen din?',
      tekst: 'Kontoen, profilen, alle annonsene og bildene dine blir slettet for godt. Dette kan ikke angres.',
      ja: 'Ja, slett kontoen',
      farlig: true,
    });
    if (!ja) return;
    setSletter(true);
    const svar = await slettKonto();
    setSletter(false);
    if (svar.feil) {
      visToast(svar.feil);
      return;
    }
    nullstill();
    visToast('Kontoen din er slettet.');
    settRetning('rolle');
    router.replace('/oppstart');
  }

  return (
    <Skjerm tilbake={{ tekst: 'Til profilen', onPress: () => gaTilbake('/profil') }}>
      <Overskrift tittel="Mine opplysninger" undertekst="Dette har vi lagret om deg." />
      <Kort>
        {rader.map(([etikett, verdi], i) => (
          <View key={etikett} style={styles.gruppe}>
            {i > 0 && <Skillelinje />}
            <Tekst variant="under" vekt={600}>
              {etikett}
            </Tekst>
            <Tekst variant="brod">{verdi}</Tekst>
          </View>
        ))}
      </Kort>
      <Knapp
        variant="sekundar"
        ikon={Download}
        tekst="Få en kopi"
        onPress={() =>
          Share.share({
            message: `Mine opplysninger i Hverdagshelten\n\n${rader.map(([e, v]) => `${e}: ${v}`).join('\n')}`,
          }).catch(() => {})
        }
      />
      <Knapp variant="sekundar" ikon={Pencil} tekst="Rett opplysninger" onPress={() => gaFrem('/om-meg')} />
      <Infoboks tekst="Opplysningene lagres hos Supabase i EU. Passordet ditt er kryptert, og ingen i teamet kan se det." />
      <Knapp variant="rod" ikon={Trash2} tekst="Slett kontoen min" laster={sletter} onPress={slett} />
      <Tekst variant="under">Lurer du på noe om personvern? Skriv til oss, så svarer vi innen 30 dager.</Tekst>
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  gruppe: {
    gap: 4,
  },
});
