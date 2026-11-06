import { BookOpen, Check, PartyPopper, X } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Infoboks } from '../components/Ekstra';
import { Knapp } from '../components/Knapp';
import { Kort } from '../components/Kort';
import { Skjerm } from '../components/Skjerm';
import { Overskrift } from '../components/Smaabiter';
import { Tekst } from '../components/Tekst';
import { useApp } from '../lib/app-tilstand';
import { gaFrem, gaTilbake, settRetning } from '../lib/overgang';
import { farger, ikonStrek } from '../lib/tema';

const sporsmal = [
  {
    sporsmal: 'Den eldre ber deg ta ut penger med bankkortet og gir deg PIN-koden. Hva gjør du?',
    valg: ['Gjør det, når hun spør så pent', 'Sier hyggelig nei, og forklarer at det ikke er lov'],
    riktig: 1,
    forklaring: 'Hjelpere skal aldri håndtere bankkort eller PIN-kode. Det beskytter både deg og den eldre.',
  },
  {
    sporsmal: 'Du blir forsinket til et oppdrag. Hva gjør du?',
    valg: ['Ringer og sier fra med en gang', 'Kommer når jeg kommer'],
    riktig: 0,
    forklaring: 'Mange gleder seg til besøket og blir urolige når ingen kommer. Si alltid fra.',
  },
  {
    sporsmal: 'Den eldre faller og slår seg kraftig. Hva gjør du først?',
    valg: ['Ringer teamet', 'Ringer 113'],
    riktig: 1,
    forklaring: 'Ring 113 først ved skade eller akutt sykdom. Ring teamet og en foresatt etterpå.',
  },
  {
    sporsmal: 'Du skal hjelpe med plenen, men gressklipperen virker farlig og ødelagt. Hva gjør du?',
    valg: ['Prøver likevel', 'Lar være, og sier fra til den eldre og teamet'],
    riktig: 1,
    forklaring: 'Du skal ikke bruke farlig verktøy. Det er alltid greit å si nei når noe virker utrygt.',
  },
];

export default function Quiz() {
  const { data, endre, visToast } = useApp();
  const [nummer, setNummer] = useState(0);
  const [svar, setSvar] = useState<number | null>(null);
  const ferdig = nummer >= sporsmal.length;

  if (ferdig) {
    return (
      <Skjerm nokkel="ferdig" tilbake={{ onPress: () => gaTilbake('/') }}>
        <View style={styles.midt}>
          <PartyPopper size={64} color={farger.lilla} strokeWidth={1.6} />
          <Overskrift tittel="Du er klar!" />
          <Tekst variant="brod" style={styles.sentrert}>
            Du kan nå ta oppdrag. Husk at du alltid kan trykke «Hjelp» hvis du lurer på noe.
          </Tekst>
        </View>
        <Knapp tekst="Fortsett" onPress={() => gaTilbake('/')} />
      </Skjerm>
    );
  }

  const q = sporsmal[nummer];
  const besvart = svar !== null;
  const riktig = svar === q.riktig;

  return (
    <Skjerm nokkel={String(nummer)} tilbake={{ onPress: () => gaTilbake('/') }}>
      <Tekst variant="under" vekt={700} farge={farger.lilla}>
        Spørsmål {nummer + 1} av {sporsmal.length}
      </Tekst>
      {nummer === 0 && !data.quizBestatt && (
        <Knapp
          liten
          variant="sekundar"
          ikon={BookOpen}
          tekst="Les retningslinjene først"
          onPress={() => gaFrem({ pathname: '/info/[side]', params: { side: 'retningslinjer' } })}
        />
      )}
      <Overskrift tittel={q.sporsmal} />
      {q.valg.map((v, i) => {
        const valgt = svar === i;
        const visRiktig = besvart && i === q.riktig;
        return (
          <Kort
            key={v}
            onPress={besvart ? undefined : () => setSvar(i)}
            accessibilityLabel={v}
            style={[styles.valg, visRiktig && styles.riktig, valgt && !visRiktig && styles.feil]}
          >
            <Tekst variant="listetittel" style={styles.flex}>
              {v}
            </Tekst>
            {visRiktig && <Check size={24} color={farger.gronn} strokeWidth={ikonStrek} />}
            {valgt && !visRiktig && <X size={24} color={farger.rod} strokeWidth={ikonStrek} />}
          </Kort>
        );
      })}
      {besvart && <Infoboks tekst={`${riktig ? 'Riktig! ' : 'Ikke helt. '}${q.forklaring}`} />}
      {besvart && (
        <Knapp
          tekst={riktig ? (nummer === sporsmal.length - 1 ? 'Fullfør' : 'Neste spørsmål') : 'Prøv igjen'}
          onPress={() => {
            settRetning('frem');
            if (!riktig) {
              setSvar(null);
              return;
            }
            setSvar(null);
            if (nummer === sporsmal.length - 1) {
              endre((d) => ({ ...d, quizBestatt: true }));
              visToast('Quizen er bestått!');
            }
            setNummer((n) => n + 1);
          }}
        />
      )}
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  midt: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 24,
  },
  sentrert: {
    textAlign: 'center',
  },
  valg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
  },
  riktig: {
    borderColor: farger.gronn,
    backgroundColor: farger.gronnLys,
  },
  feil: {
    borderColor: farger.rod,
    backgroundColor: farger.rodLys,
  },
  flex: {
    flex: 1,
  },
});
