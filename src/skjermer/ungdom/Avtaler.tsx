import { Check, Phone } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Knapp } from '../../components/Knapp';
import { Kort } from '../../components/Kort';
import { Skjerm } from '../../components/Skjerm';
import { Overskrift, Pille, Seksjon, Stjerner } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { useApp } from '../../lib/app-tilstand';
import { finnOppdrag } from '../../lib/eksempeldata';

// I ungdomsversjonen heter denne fanen «Oppdrag».
export function Avtaler() {
  const { tatteOppdrag, visToast } = useApp();

  return (
    <Skjerm>
      <Overskrift tittel="Mine oppdrag" undertekst="Det du har sagt ja til." />

      <Kort>
        <Oppdragshode tittel="Tur med Anne" detaljer="I dag · 14.00–15.00 · 150 kr" />
        <View style={styles.knapper}>
          <Knapp liten variant="sekundar" ikon={Phone} tekst="Ring Anne" onPress={() => visToast('Ringer Anne …')} />
          <Knapp
            liten
            variant="gronn"
            ikon={Check}
            tekst="Ferdig"
            onPress={() => visToast('Flott jobbet! Anne får beskjed om at turen er ferdig.')}
          />
        </View>
      </Kort>

      {tatteOppdrag.map((id) => {
        const o = finnOppdrag(id);
        if (!o) return null;
        return (
          <Kort key={id}>
            <Oppdragshode tittel={o.tittel} detaljer={`${o.nar} · ${o.belop} kr`} />
          </Kort>
        );
      })}

      <Seksjon tittel="Fullført" />

      <Kort>
        <View style={styles.hode}>
          <View style={styles.flex}>
            <Tekst variant="listetittel">Hyggelig besøk hos Anne</Tekst>
            <Tekst variant="under">22. okt · 150 kr</Tekst>
          </View>
          <Stjerner />
        </View>
      </Kort>
    </Skjerm>
  );
}

function Oppdragshode({ tittel, detaljer }: { tittel: string; detaljer: string }) {
  return (
    <View style={styles.hode}>
      <View style={styles.flex}>
        <Tekst variant="listetittel">{tittel}</Tekst>
        <Tekst variant="under">{detaljer}</Tekst>
      </View>
      <Pille tekst="Bekreftet" variant="gronn" />
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
