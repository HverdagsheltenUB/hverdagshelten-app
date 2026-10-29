import { Redirect, useLocalSearchParams } from 'expo-router';
import { Banknote, Check, Clock, MapPin, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Knapp } from '../../components/Knapp';
import { Ikonboks, Kort } from '../../components/Kort';
import { Skjerm } from '../../components/Skjerm';
import { Overskrift, Pille, Tilbakelenke } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { useApp } from '../../lib/app-tilstand';
import { finnOppdrag } from '../../lib/eksempeldata';
import { gaTilbake } from '../../lib/overgang';

export default function Oppdragsdetaljer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tatteOppdrag, taOppdrag, visToast } = useApp();
  const oppdrag = finnOppdrag(id);

  if (!oppdrag) return <Redirect href="/" />;
  const tatt = tatteOppdrag.includes(oppdrag.id);

  return (
    <Skjerm>
      <Tilbakelenke tekst="Tilbake" onPress={() => gaTilbake('/')} />
      <View style={styles.topp}>
        <Pille tekst={oppdrag.varighet} />
        <Overskrift tittel={oppdrag.tittel} undertekst={`${oppdrag.navn}, ${oppdrag.alder} år`} />
      </View>

      <Kort>
        <Detalj ikon={Clock} tekst={oppdrag.nar} />
        <Detalj ikon={MapPin} tekst={oppdrag.sted} under={`${oppdrag.avstand} unna deg`} />
        <Detalj
          ikon={Banknote}
          tekst={`Du får ${oppdrag.belop} kr`}
          under="Utbetales til kontoen din etter oppdraget"
        />
      </Kort>

      <Kort>
        <Tekst variant="under" vekt={600}>
          Beskjed fra {oppdrag.navn}
        </Tekst>
        <Tekst variant="brod">«{oppdrag.beskjed}»</Tekst>
      </Kort>

      {tatt ? (
        <Knapp variant="gronn" ikon={Check} tekst="Oppdraget er ditt" onPress={() => {}} />
      ) : (
        <Knapp
          tekst="Ta oppdraget"
          onPress={() => {
            taOppdrag(oppdrag.id);
            visToast('Oppdraget er ditt! Du finner det under Oppdrag.');
          }}
        />
      )}
    </Skjerm>
  );
}

function Detalj({ ikon, tekst, under }: { ikon: LucideIcon; tekst: string; under?: string }) {
  return (
    <View style={styles.rad}>
      <Ikonboks ikon={ikon} />
      <View style={styles.flex}>
        <Tekst variant="listetittel">{tekst}</Tekst>
        {under && <Tekst variant="under">{under}</Tekst>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topp: {
    gap: 10,
  },
  rad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flex: {
    flex: 1,
  },
});
