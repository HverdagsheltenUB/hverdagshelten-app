import { MapPin, Phone } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Knapp } from '../../components/Knapp';
import { Kort } from '../../components/Kort';
import { Skjerm } from '../../components/Skjerm';
import { Overskrift, Pille, Seksjon, Stjerner } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { useApp } from '../../lib/app-tilstand';
import { gaTilFane } from '../../lib/overgang';

export function Avtaler() {
  const { bestillinger, visToast } = useApp();

  return (
    <Skjerm>
      <Overskrift tittel="Dine avtaler" undertekst="Kommende og tidligere besøk." />

      <Seksjon tittel="Kommende" />

      <Kort>
        <Avtalehode tittel="Tur sammen med Emil" nar="Torsdag 29. okt · 14.00–15.00" pille="Bekreftet" />
        <View style={styles.knapper}>
          <Knapp liten variant="sekundar" ikon={Phone} tekst="Ring Emil" onPress={() => visToast('Ringer Emil …')} />
          <Knapp liten variant="sekundar" ikon={MapPin} tekst="Møtested" onPress={() => gaTilFane('/kart')} />
        </View>
      </Kort>

      {bestillinger.map((b) => (
        <Kort key={b.id}>
          <Avtalehode tittel={b.kategori} nar={`${b.dag} · ${b.tid}`} pille="Venter" />
        </Kort>
      ))}

      <Kort>
        <Avtalehode tittel="Handling med Sara" nar="Mandag 2. nov · 11.00–12.00" pille="Bekreftet" />
      </Kort>

      <Seksjon tittel="Tidligere" />

      <Kort>
        <View style={styles.hode}>
          <View style={styles.flex}>
            <Tekst variant="listetittel">Hyggelig besøk med Emil</Tekst>
            <Tekst variant="under">22. okt</Tekst>
          </View>
          <Stjerner />
        </View>
      </Kort>
    </Skjerm>
  );
}

function Avtalehode({ tittel, nar, pille }: { tittel: string; nar: string; pille: 'Bekreftet' | 'Venter' }) {
  return (
    <View style={styles.hode}>
      <View style={styles.flex}>
        <Tekst variant="listetittel">{tittel}</Tekst>
        <Tekst variant="under">{nar}</Tekst>
      </View>
      <Pille tekst={pille} variant={pille === 'Bekreftet' ? 'gronn' : 'fersken'} />
    </View>
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
  knapper: {
    flexDirection: 'row',
    gap: 10,
  },
});
