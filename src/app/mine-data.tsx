import { router } from 'expo-router';
import { Download, Pencil, Trash2 } from 'lucide-react-native';
import { Share, StyleSheet, View } from 'react-native';

import { useBekreft } from '../components/Dialog';
import { Infoboks } from '../components/Ekstra';
import { Knapp } from '../components/Knapp';
import { Kort, Skillelinje } from '../components/Kort';
import { Skjerm } from '../components/Skjerm';
import { Overskrift } from '../components/Smaabiter';
import { Tekst } from '../components/Tekst';
import { useApp } from '../lib/app-tilstand';
import { megUngdom } from '../lib/eksempeldata';
import { gaFrem, gaTilbake, settRetning } from '../lib/overgang';

// Innsyn, retting og sletting, slik personvernreglene krever.
export default function MineData() {
  const { data, slettAlt } = useApp();
  const bekreft = useBekreft();
  const ungdom = data.rolle === 'ungdom';

  const rader: [string, string][] = ungdom
    ? [
        ['Navn', megUngdom.navn],
        ['Alder', `${data.ungdom.alder} år`],
        ['Bekreftet med BankID', data.ungdom.bankId ? 'Ja' : 'Nei'],
        ['Foresatt', `${data.ungdom.foresatt.navn}, ${data.ungdom.foresatt.telefon}`],
        ['Oppdrag', `${data.oppdrag.filter((o) => o.hjelperId === megUngdom.id).length} stk.`],
        ['Utbetaling til', data.ungdom.utbetalingTil],
      ]
    : [
        ['Navn', data.eldre.navn],
        ['Adresse', data.eldre.adresse],
        ['Telefon', data.eldre.telefon],
        ['Ting hjelperen bør vite', data.eldre.tingAVite.join(', ') || 'Ingenting'],
        ['Pårørende', data.parorende.map((p) => p.navn).join(', ') || 'Ingen'],
        ['Avtaler', `${data.oppdrag.filter((o) => o.bestiltAvMeg).length} stk.`],
      ];

  async function slett() {
    const ja = await bekreft({
      tittel: 'Slette kontoen din?',
      tekst:
        'Alle opplysningene dine blir slettet. Kvitteringer tar vi vare på så lenge regnskapsloven krever (fem år), men ingen andre ser dem.',
      ja: 'Ja, slett kontoen',
      farlig: true,
    });
    if (!ja) return;
    slettAlt();
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
      {!ungdom && (
        <Knapp variant="sekundar" ikon={Pencil} tekst="Rett opplysninger" onPress={() => gaFrem('/om-meg')} />
      )}
      <Infoboks tekst="Gamle avtaler slettes 12 måneder etter besøket. Adresse og telefonnummer skjules for hjelperen så snart besøket er ferdig." />
      <Knapp variant="rod" ikon={Trash2} tekst="Slett kontoen min" onPress={slett} />
      <Tekst variant="under">Lurer du på noe om personvern? Skriv til oss, så svarer vi innen 30 dager.</Tekst>
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  gruppe: {
    gap: 4,
  },
});
