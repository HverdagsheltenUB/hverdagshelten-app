import { Redirect, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Infoboks, LesOpp } from '../../components/Ekstra';
import { Kort } from '../../components/Kort';
import { Skjerm } from '../../components/Skjerm';
import { Overskrift } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { infosider } from '../../lib/tekster';
import { farger } from '../../lib/tema';

export default function Infoside() {
  const { side } = useLocalSearchParams<{ side: string }>();
  const innhold = infosider[side ?? ''];
  if (!innhold) return <Redirect href="/" />;

  const opplesing = [
    innhold.tittel,
    innhold.ingress,
    ...innhold.seksjoner.flatMap((s) => [s.tittel, ...(s.avsnitt ?? []), ...(s.punkter ?? [])]),
  ].join('. ');

  return (
    <Skjerm tilbake={{}}>
      <Overskrift tittel={innhold.tittel} undertekst={innhold.ingress} />
      <LesOpp tekst={opplesing} />
      {innhold.seksjoner.map((s) => (
        <Kort key={s.tittel}>
          <Tekst variant="mellomtittel" accessibilityRole="header">
            {s.tittel}
          </Tekst>
          {s.avsnitt?.map((a) => (
            <Tekst key={a} variant="brod">
              {a}
            </Tekst>
          ))}
          {s.punkter?.map((p) => (
            <View key={p} style={styles.punkt}>
              <View style={styles.prikk} />
              <Tekst variant="brod" style={styles.flex}>
                {p}
              </Tekst>
            </View>
          ))}
        </Kort>
      ))}
      {innhold.utkast && (
        <Infoboks tekst="Utkast: denne teksten skal leses av en voksen med juridisk kunnskap før appen åpnes for ekte brukere." />
      )}
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  punkt: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  prikk: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: farger.lilla,
    marginTop: 9,
  },
  flex: {
    flex: 1,
  },
});
