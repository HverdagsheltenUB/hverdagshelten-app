import { Redirect, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Knapp } from '../../components/Knapp';
import { Skjerm } from '../../components/Skjerm';
import { Overskrift } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { Chip, Chiprad } from '../../components/Valg';
import { useApp } from '../../lib/app-tilstand';
import { bestillingsdager, dagnavn, dagnavnLangt, klokke, tidsrom } from '../../lib/dato';
import { finnHjelper, starttider, tittelFor } from '../../lib/eksempeldata';
import { gaTilbake } from '../../lib/overgang';
import { useOppdrag } from '../../lib/utvalg';
import { regler } from '../../lib/tema';

export default function Flytt() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const o = useOppdrag(id);
  const { endreOppdrag, visToast } = useApp();
  const dager = useMemo(() => bestillingsdager(10), []);
  const [dato, setDato] = useState(o?.dato ?? dager[0]);
  const [start, setStart] = useState(o?.start ?? 14);

  if (!o) return <Redirect href="/avtaler" />;
  const hjelper = finnHjelper(o.hjelperId);
  const uendret = dato === o.dato && start === o.start;

  return (
    <Skjerm tilbake={{ onPress: () => gaTilbake('/avtaler') }}>
      <Overskrift
        tittel="Flytt avtalen"
        undertekst={`${tittelFor(o)} · nå ${dagnavn(o.dato).toLowerCase()} kl. ${klokke(o.start)}`}
      />
      <View style={styles.gruppe}>
        <Tekst variant="mellomtittel">Ny dag</Tekst>
        <Chiprad>
          {dager.map((d) => (
            <Chip key={d} tekst={dagnavn(d)} valgt={dato === d} onPress={() => setDato(d)} />
          ))}
        </Chiprad>
      </View>
      <View style={styles.gruppe}>
        <Tekst variant="mellomtittel">Nytt klokkeslett</Tekst>
        <Chiprad>
          {starttider
            .filter((s) => s + o.varighet <= regler.senestFerdigKl)
            .map((s) => (
              <Chip key={s} tekst={`Kl. ${klokke(s)}`} valgt={start === s} onPress={() => setStart(s)} />
            ))}
        </Chiprad>
      </View>
      <Tekst variant="brod" vekt={600}>
        Ny tid: {dagnavnLangt(dato)}, kl. {tidsrom(start, o.varighet)}
      </Tekst>
      <Knapp
        ikon={Check}
        tekst="Flytt avtalen"
        deaktivert={uendret}
        onPress={() => {
          endreOppdrag(o.id, { dato, start, paVei: false });
          gaTilbake('/avtaler');
          visToast(hjelper ? `Avtalen er flyttet. ${hjelper.fornavn} har fått beskjed.` : 'Avtalen er flyttet.');
        }}
      />
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  gruppe: {
    gap: 10,
  },
});
