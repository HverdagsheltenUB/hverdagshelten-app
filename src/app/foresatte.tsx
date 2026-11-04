import { StyleSheet, View } from 'react-native';

import { Infoboks } from '../components/Ekstra';
import { Kort, Skillelinje } from '../components/Kort';
import { Skjerm } from '../components/Skjerm';
import { Overskrift, Seksjon } from '../components/Smaabiter';
import { Tekst } from '../components/Tekst';
import { BryterRad, Chip, Chiprad } from '../components/Valg';
import { useApp } from '../lib/app-tilstand';
import { dagnavn, tidsrom } from '../lib/dato';
import { tittelFor } from '../lib/eksempeldata';
import { gaTilbake } from '../lib/overgang';
import { useMineOppdrag } from '../lib/utvalg';

export default function Foresatte() {
  const { data, endre } = useApp();
  const { kommende, fullfort } = useMineOppdrag();
  const { foresatt, grenser, varselTilForesatt, foresattGodkjent } = data.ungdom;
  const fornavn = foresatt.navn.split(' ')[0];
  const settGrense = (endring: Partial<typeof grenser>) =>
    endre((d) => ({ ...d, ungdom: { ...d.ungdom, grenser: { ...d.ungdom.grenser, ...endring } } }));

  return (
    <Skjerm tilbake={{ tekst: 'Til profilen', onPress: () => gaTilbake('/profil') }}>
      <Overskrift tittel="Foresatte" undertekst={`${foresatt.navn} · ${foresatt.telefon}`} />
      <Infoboks
        tekst={
          foresattGodkjent
            ? `${fornavn} har godkjent at du bruker Hverdagshelten, og kan se oppdragene dine.`
            : `Vi venter på at ${fornavn} godkjenner. Du kan ikke ta oppdrag før det.`
        }
      />

      <Kort>
        <BryterRad
          etikett={`${fornavn} får beskjed når du starter og avslutter et oppdrag`}
          pa={varselTilForesatt}
          onEndre={(pa) => endre((d) => ({ ...d, ungdom: { ...d.ungdom, varselTilForesatt: pa } }))}
        />
      </Kort>

      <Seksjon tittel="Grenser" />
      <Tekst variant="under">Foresatte setter grensene. I testversjonen kan du prøve dem her.</Tekst>
      <View style={styles.gruppe}>
        <Tekst variant="brodLiten" vekt={700}>
          Hvor langt unna?
        </Tekst>
        <Chiprad>
          {[1, 2, 3].map((km) => (
            <Chip
              key={km}
              tekst={`Inntil ${km} km`}
              valgt={grenser.maksKm === km}
              onPress={() => settGrense({ maksKm: km })}
            />
          ))}
        </Chiprad>
      </View>
      <View style={styles.gruppe}>
        <Tekst variant="brodLiten" vekt={700}>
          Ferdig senest
        </Tekst>
        <Chiprad>
          {[18, 19, 20].map((kl) => (
            <Chip
              key={kl}
              tekst={`Kl. ${kl}`}
              valgt={grenser.sistKl === kl}
              onPress={() => settGrense({ sistKl: kl })}
            />
          ))}
        </Chiprad>
      </View>

      <Seksjon tittel={`Dette ser ${fornavn}`} />
      <Kort>
        {[...kommende, ...fullfort].length === 0 && <Tekst variant="brod">Ingen oppdrag ennå.</Tekst>}
        {[...kommende, ...fullfort].map((o, i) => (
          <View key={o.id} style={styles.gruppe}>
            {i > 0 && <Skillelinje />}
            <Tekst variant="listetittel">
              {tittelFor(o)} hos {o.mottaker.fornavn}
            </Tekst>
            <Tekst variant="under">
              {dagnavn(o.dato)} · {tidsrom(o.start, o.varighet)} · {o.mottaker.omrade} ·{' '}
              {o.status === 'ferdig' ? 'fullført' : 'kommende'}
            </Tekst>
          </View>
        ))}
      </Kort>
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  gruppe: {
    gap: 8,
  },
});
