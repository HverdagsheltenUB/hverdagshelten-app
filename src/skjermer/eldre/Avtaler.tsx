import { Repeat } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Statuspille } from '../../components/Ekstra';
import { Knapp } from '../../components/Knapp';
import { Kort } from '../../components/Kort';
import { Skjerm } from '../../components/Skjerm';
import { Lenkerad, Overskrift, Seksjon, Stjerner } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { dagnavn, tidsrom } from '../../lib/dato';
import { finnHjelper, tittelFor, type Oppdrag } from '../../lib/eksempeldata';
import { gaFrem } from '../../lib/overgang';
import { useMineAvtaler } from '../../lib/utvalg';

function apne(o: Oppdrag) {
  gaFrem({ pathname: '/avtale/[id]', params: { id: o.id } });
}

export function Avtaler() {
  const { kommende, tidligere } = useMineAvtaler();

  return (
    <Skjerm>
      <Overskrift tittel="Dine avtaler" undertekst="Kommende og tidligere besøk." />

      <Seksjon tittel="Kommende" />
      {kommende.length === 0 && <Tekst variant="brod">Du har ingen kommende avtaler.</Tekst>}
      {kommende.map((o) => {
        const hjelper = finnHjelper(o.hjelperId);
        return (
          <Kort key={o.id} onPress={() => apne(o)} accessibilityLabel={`${tittelFor(o)}, ${dagnavn(o.dato)}`}>
            <View style={styles.hode}>
              <View style={styles.flex}>
                <Tekst variant="listetittel">
                  {tittelFor(o)}
                  {hjelper ? ` med ${hjelper.fornavn}` : ''}
                </Tekst>
                <Tekst variant="under">
                  {dagnavn(o.dato)} · {tidsrom(o.start, o.varighet)}
                </Tekst>
                {o.bestiltFor && <Tekst variant="under">For {o.mottaker.navn}</Tekst>}
                {o.status === 'sendt' && <Tekst variant="under">Venter på at en hjelper sier ja</Tekst>}
              </View>
              <Statuspille status={o.status} />
            </View>
            <Lenkerad tekst="Se avtalen" onPress={() => apne(o)} />
          </Kort>
        );
      })}

      <Seksjon tittel="Tidligere" />
      {tidligere.length === 0 && <Tekst variant="brod">Ingen tidligere besøk ennå.</Tekst>}
      {tidligere.map((o) => {
        const hjelper = finnHjelper(o.hjelperId);
        return (
          <Kort key={o.id} onPress={() => apne(o)} accessibilityLabel={`${tittelFor(o)}, ${dagnavn(o.dato)}`}>
            <View style={styles.hode}>
              <View style={styles.flex}>
                <Tekst variant="listetittel">
                  {tittelFor(o)}
                  {hjelper ? ` med ${hjelper.fornavn}` : ''}
                </Tekst>
                <Tekst variant="under">{dagnavn(o.dato)}</Tekst>
              </View>
              {o.status === 'avlyst' ? (
                <Statuspille status="avlyst" />
              ) : o.vurdering ? (
                <Stjerner antall={o.vurdering} />
              ) : (
                <Statuspille status={o.status} />
              )}
            </View>
            {o.status === 'ferdig' && (
              <Knapp
                liten
                variant="sekundar"
                ikon={Repeat}
                tekst="Bestill igjen"
                onPress={() =>
                  gaFrem({
                    pathname: '/bestill',
                    params: {
                      ...(o.kategori !== 'Noe annet' ? { kategori: o.kategori } : {}),
                      ...(o.hjelperId ? { hjelper: o.hjelperId } : {}),
                    },
                  })
                }
              />
            )}
          </Kort>
        );
      })}
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
