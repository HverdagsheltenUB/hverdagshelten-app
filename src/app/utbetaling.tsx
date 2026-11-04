import { StyleSheet, View } from 'react-native';

import { Infoboks } from '../components/Ekstra';
import { Kort, Skillelinje } from '../components/Kort';
import { Skjerm } from '../components/Skjerm';
import { Overskrift, Seksjon, Statboks, Statrad } from '../components/Smaabiter';
import { Tekst } from '../components/Tekst';
import { Chip, Chiprad } from '../components/Valg';
import { useApp } from '../lib/app-tilstand';
import { dagnavn } from '../lib/dato';
import { tittelFor, tjentForAppen, utbetalinger } from '../lib/eksempeldata';
import { gaTilbake } from '../lib/overgang';
import { useMineOppdrag } from '../lib/utvalg';
import { kroner, prisFor } from '../lib/tema';

export default function Utbetaling() {
  const { data, endre, tjentDenneManeden } = useApp();
  const { fullfort } = useMineOppdrag();
  const iAr = tjentForAppen + fullfort.reduce((s, o) => s + prisFor(o.varighet).hjelp, 0);

  return (
    <Skjerm tilbake={{ tekst: 'Til profilen', onPress: () => gaTilbake('/profil') }}>
      <Overskrift tittel="Utbetaling" undertekst="Pengene kommer den første i hver måned." />
      <Statrad>
        <Statboks etikett="Kommer neste gang" verdi={kroner(tjentDenneManeden)} />
        <Statboks etikett={`Tjent i ${new Date().getFullYear()}`} verdi={kroner(iAr)} />
      </Statrad>

      <View style={styles.gruppe}>
        <Tekst variant="mellomtittel">Hvor vil du ha pengene?</Tekst>
        <Chiprad>
          {(['Vipps', 'Konto'] as const).map((v) => (
            <Chip
              key={v}
              tekst={v === 'Konto' ? 'Bankkonto' : 'Vipps'}
              valgt={data.ungdom.utbetalingTil === v}
              onPress={() => endre((d) => ({ ...d, ungdom: { ...d.ungdom, utbetalingTil: v } }))}
            />
          ))}
        </Chiprad>
      </View>

      <Seksjon tittel="Fullførte oppdrag" />
      <Kort>
        {fullfort.length === 0 && <Tekst variant="brod">Ingen ennå.</Tekst>}
        {fullfort.map((o, i) => (
          <View key={o.id} style={styles.gruppe}>
            {i > 0 && <Skillelinje />}
            <View style={styles.rad}>
              <Tekst variant="brod" style={styles.flex}>
                {tittelFor(o)} hos {o.mottaker.fornavn} · {dagnavn(o.dato)}
              </Tekst>
              <Tekst variant="brod" vekt={700}>
                {kroner(prisFor(o.varighet).hjelp)}
              </Tekst>
            </View>
          </View>
        ))}
      </Kort>

      <Seksjon tittel="Tidligere utbetalinger" />
      <Kort>
        {utbetalinger.map((u, i) => (
          <View key={u.dato} style={styles.gruppe}>
            {i > 0 && <Skillelinje />}
            <View style={styles.rad}>
              <Tekst variant="brod" style={styles.flex}>
                {u.dato} · til {u.til}
              </Tekst>
              <Tekst variant="brod" vekt={700}>
                {kroner(u.belop)}
              </Tekst>
            </View>
          </View>
        ))}
      </Kort>

      <Seksjon tittel="Årsoversikt for skatt" />
      <Kort>
        <Tekst variant="brod">
          I år har du tjent {kroner(iAr)} gjennom Hverdagshelten. Vis gjerne denne oversikten til foresatte.
        </Tekst>
        <Tekst variant="under">
          Ungdom som tjener litt ved siden av skolen, slipper som regel skatt opp til et visst beløp. Spør en voksen
          hvis du er usikker. Vi sender en oversikt i januar.
        </Tekst>
      </Kort>
      <Infoboks tekst="Testversjon: utbetalingene er eksempler." />
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  gruppe: {
    gap: 10,
  },
  rad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
});
