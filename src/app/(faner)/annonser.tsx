import { Redirect } from 'expo-router';
import { SearchX, Sparkles, WifiOff } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { Sokefelt, Tilbudskort, Tomtilstand } from '../../components/Annonse';
import { Skjerm } from '../../components/Skjerm';
import { Overskrift, Pille, Seksjon } from '../../components/Smaabiter';
import { useTakkJa } from '../../components/TakkJa';
import { Tekst } from '../../components/Tekst';
import { Chip } from '../../components/Valg';
import { annonsekategorier, useAnnonser, type Annonse } from '../../lib/annonser';
import { useKonto } from '../../lib/konto';
import { gaFrem } from '../../lib/overgang';
import { farger } from '../../lib/tema';

const stedNokkel = (s: string) => s.trim().toLowerCase();

function passer(a: Annonse, sok: string) {
  if (!sok) return true;
  const ord = sok.toLowerCase().split(/\s+/).filter(Boolean);
  const tekst = `${a.tittel} ${a.beskrivelse} ${a.kategori} ${a.sted} ${a.profiler?.navn ?? ''}`.toLowerCase();
  return ord.every((o) => tekst.includes(o));
}

// «Annonser»: alle ledige annonser for hjelperne, med søk og filter på sted og arbeid.
export default function Annonser() {
  const { profil } = useKonto();
  if (profil && profil.rolle !== 'ungdom') return <Redirect href="/" />;
  return <Annonseliste />;
}

function Annonseliste() {
  const { annonser, laster, feil, oppdater } = useAnnonser({ bareLedige: true });
  const { tar, sierJa } = useTakkJa(oppdater);
  const [sok, setSok] = useState('');
  const [sted, setSted] = useState<string | null>(null);
  const [arbeid, setArbeid] = useState<string | null>(null);

  // Stedene som finnes i annonsene, de vanligste først.
  const steder = useMemo(() => {
    const m = new Map<string, { navn: string; antall: number }>();
    for (const a of annonser) {
      if (!a.sted.trim()) continue;
      const n = stedNokkel(a.sted);
      const f = m.get(n);
      if (f) f.antall++;
      else m.set(n, { navn: a.sted.trim(), antall: 1 });
    }
    return [...m.entries()].sort((x, y) => y[1].antall - x[1].antall || x[1].navn.localeCompare(y[1].navn, 'nb'));
  }, [annonser]);

  // Typer arbeid som finnes i annonsene, i fast rekkefølge.
  const arbeidstyper = useMemo(
    () =>
      annonsekategorier
        .map((k) => ({ navn: k.navn, antall: annonser.filter((a) => a.kategori === k.navn).length }))
        .filter((k) => k.antall > 0),
    [annonser],
  );

  const treff = useMemo(
    () =>
      annonser
        .filter((a) => !sted || stedNokkel(a.sted) === sted)
        .filter((a) => !arbeid || a.kategori === arbeid)
        .filter((a) => passer(a, sok.trim())),
    [annonser, sted, arbeid, sok],
  );
  const filtrerer = Boolean(sok.trim() || sted || arbeid);
  const nullstill = () => {
    setSok('');
    setSted(null);
    setArbeid(null);
  };

  return (
    <Skjerm oppdater={oppdater}>
      <Overskrift tittel="Annonser" undertekst="Finn noen du kan hjelpe. Søk, eller velg sted og type arbeid." />
      <Sokefelt verdi={sok} onEndre={setSok} />

      <View style={styles.filter}>
        <Tekst variant="brodLiten" vekt={700}>
          Sted
        </Tekst>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chiprad} style={styles.rulle}>
          <Chip tekst="Alle steder" valgt={!sted} onPress={() => setSted(null)} />
          {steder.map(([n, s]) => (
            <Chip key={n} tekst={`${s.navn} (${s.antall})`} valgt={sted === n} onPress={() => setSted(sted === n ? null : n)} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.filter}>
        <Tekst variant="brodLiten" vekt={700}>
          Arbeid
        </Tekst>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chiprad} style={styles.rulle}>
          <Chip tekst="Alt" valgt={!arbeid} onPress={() => setArbeid(null)} />
          {arbeidstyper.map((k) => (
            <Chip
              key={k.navn}
              tekst={`${k.navn} (${k.antall})`}
              valgt={arbeid === k.navn}
              onPress={() => setArbeid(arbeid === k.navn ? null : k.navn)}
            />
          ))}
        </ScrollView>
      </View>

      <Seksjon
        tittel={filtrerer ? 'Treff' : 'Alle ledige annonser'}
        hoyre={!laster && treff.length > 0 && <Pille tekst={`${treff.length} stk.`} variant="lilla" />}
      />

      {laster ? (
        <ActivityIndicator color={farger.lilla} size="large" style={styles.laster} />
      ) : feil && annonser.length === 0 ? (
        <Tomtilstand
          ikon={WifiOff}
          tittel="Fikk ikke hentet annonsene"
          tekst={feil}
          knapp={{ tekst: 'Prøv igjen', onPress: () => void oppdater() }}
        />
      ) : annonser.length === 0 ? (
        <Tomtilstand
          ikon={Sparkles}
          tittel="Ingen ledige annonser akkurat nå"
          tekst="Når noen i nabolaget trenger hjelp, dukker det opp her. Dra ned for å se etter nye."
        />
      ) : treff.length === 0 ? (
        <Tomtilstand
          ikon={SearchX}
          tittel={sok.trim() ? `Ingen treff på «${sok.trim()}»` : 'Ingen annonser med disse valgene'}
          tekst="Prøv et annet ord, et annet sted eller en annen type arbeid."
          knapp={{ tekst: 'Vis alle annonser', onPress: nullstill }}
        />
      ) : (
        <View style={styles.liste}>
          {treff.map((a) => (
            <Tilbudskort
              key={a.id}
              annonse={a}
              tar={tar === a.id}
              onTakkJa={() => sierJa(a)}
              onApne={() => gaFrem({ pathname: '/annonse/[id]', params: { id: a.id } })}
            />
          ))}
        </View>
      )}
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  filter: { gap: 8 },
  rulle: { marginHorizontal: -20 },
  chiprad: { gap: 10, paddingHorizontal: 20 },
  liste: { gap: 12 },
  laster: { paddingVertical: 32 },
});
