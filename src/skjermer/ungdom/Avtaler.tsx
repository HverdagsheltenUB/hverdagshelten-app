import { StyleSheet, View } from 'react-native';

import { Kort } from '../../components/Kort';
import { Skjerm } from '../../components/Skjerm';
import { Lenkerad, Overskrift, Pille, Seksjon, Stjerner } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { dagnavn, tidsrom } from '../../lib/dato';
import { tittelFor, type Oppdrag } from '../../lib/eksempeldata';
import { gaFrem } from '../../lib/overgang';
import { useMineOppdrag } from '../../lib/utvalg';
import { kroner, prisFor } from '../../lib/tema';

function apne(o: Oppdrag) {
  gaFrem({ pathname: '/oppdrag/[id]', params: { id: o.id } });
}

// I ungdomsversjonen heter denne fanen «Oppdrag».
export function Avtaler() {
  const { kommende, fullfort } = useMineOppdrag();

  return (
    <Skjerm>
      <Overskrift tittel="Mine oppdrag" undertekst="Det du har sagt ja til." />

      <Seksjon tittel="Kommende" />
      {kommende.length === 0 && <Tekst variant="brod">Du har ingen kommende oppdrag. Finn et på Hjem.</Tekst>}
      {kommende.map((o) => (
        <Kort key={o.id} onPress={() => apne(o)} accessibilityLabel={`${tittelFor(o)} hos ${o.mottaker.fornavn}`}>
          <View style={styles.hode}>
            <View style={styles.flex}>
              <Tekst variant="listetittel">
                {tittelFor(o)} hos {o.mottaker.fornavn}
              </Tekst>
              <Tekst variant="under">
                {dagnavn(o.dato)} · {tidsrom(o.start, o.varighet)} · {kroner(prisFor(o.varighet).hjelp)}
              </Tekst>
            </View>
            <Pille tekst={o.paVei ? 'På vei' : 'Bekreftet'} variant="gronn" />
          </View>
          <Lenkerad tekst="Se adresse og vis veien" onPress={() => apne(o)} />
        </Kort>
      ))}

      <Seksjon tittel="Fullført" />
      {fullfort.length === 0 && <Tekst variant="brod">Ingen fullførte oppdrag ennå.</Tekst>}
      {fullfort.map((o) => (
        <Kort
          key={o.id}
          onPress={() => apne(o)}
          accessibilityLabel={`${tittelFor(o)} hos ${o.mottaker.fornavn}, fullført`}
        >
          <View style={styles.hode}>
            <View style={styles.flex}>
              <Tekst variant="listetittel">
                {tittelFor(o)} hos {o.mottaker.fornavn}
              </Tekst>
              <Tekst variant="under">
                {dagnavn(o.dato)} · {kroner(prisFor(o.varighet).hjelp)}
              </Tekst>
            </View>
            {o.vurdering ? <Stjerner antall={o.vurdering} /> : <Pille tekst="Ferdig" variant="lilla" />}
          </View>
        </Kort>
      ))}
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  hode: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
});
