import { Redirect } from 'expo-router';
import { SearchX, SlidersHorizontal, Sparkles, WifiOff, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Annonsegrid, Sokefelt, Tomtilstand } from '../../components/Annonse';
import { Knapp } from '../../components/Knapp';
import { Kort } from '../../components/Kort';
import { Skjerm } from '../../components/Skjerm';
import { Overskrift, Pille, Seksjon } from '../../components/Smaabiter';
import { useTakkJa } from '../../components/TakkJa';
import { Tekst } from '../../components/Tekst';
import { Chip, Chiprad } from '../../components/Valg';
import { annonsekategorier, useAnnonser, type Annonse } from '../../lib/annonser';
import { useKonto } from '../../lib/konto';
import { gaFrem } from '../../lib/overgang';
import { farger, ikonStrek } from '../../lib/tema';

type Betaling = 'alle' | 'minst100' | 'minst150' | 'minst200' | 'avtale';
const betalingsvalg: { verdi: Betaling; tekst: string }[] = [
  { verdi: 'alle', tekst: 'Alle' },
  { verdi: 'minst100', tekst: 'Minst 100 kr' },
  { verdi: 'minst150', tekst: 'Minst 150 kr' },
  { verdi: 'minst200', tekst: 'Minst 200 kr' },
  { verdi: 'avtale', tekst: 'Etter avtale' },
];
const minstePris: Partial<Record<Betaling, number>> = { minst100: 100, minst150: 150, minst200: 200 };

function passerBetaling(a: Annonse, b: Betaling) {
  if (b === 'alle') return true;
  if (b === 'avtale') return a.pris === null;
  // Betaling per time gjelder hjelp-annonser.
  return a.type === 'hjelp' && a.pris !== null && a.pris >= (minstePris[b] ?? 0);
}

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
  const [betaling, setBetaling] = useState<Betaling>('alle');
  const [apen, setApen] = useState(false);

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
        .filter((a) => passerBetaling(a, betaling))
        .filter((a) => passer(a, sok.trim())),
    [annonser, sted, arbeid, betaling, sok],
  );

  const valgte = [
    sted ? steder.find(([n]) => n === sted)?.[1].navn ?? sted : null,
    arbeid,
    betaling !== 'alle' ? `${betalingsvalg.find((b) => b.verdi === betaling)?.tekst}${betaling === 'avtale' ? '' : ' per time'}` : null,
  ].filter((v): v is string => Boolean(v));
  const filtrerer = Boolean(sok.trim() || valgte.length);
  const nullstillFilter = () => {
    setSted(null);
    setArbeid(null);
    setBetaling('alle');
  };
  const nullstill = () => {
    setSok('');
    nullstillFilter();
  };

  return (
    <Skjerm oppdater={oppdater}>
      <Overskrift tittel="Annonser" undertekst="Finn noen du kan hjelpe. Søk, eller åpne filteret." />
      <View style={styles.sokerad}>
        <View style={styles.flex}>
          <Sokefelt verdi={sok} onEndre={setSok} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={apen ? 'Lukk filteret' : 'Åpne filteret'}
          accessibilityState={{ expanded: apen }}
          onPress={() => setApen(!apen)}
          style={({ pressed }) => [styles.filterknapp, (apen || valgte.length > 0) && styles.filterknappAktiv, pressed && styles.trykket]}
        >
          <SlidersHorizontal size={22} color={apen || valgte.length > 0 ? farger.hvit : farger.morkLilla} strokeWidth={ikonStrek} />
          <Tekst variant="brodLiten" vekt={700} farge={apen || valgte.length > 0 ? farger.hvit : farger.morkLilla}>
            Filter{valgte.length ? ` (${valgte.length})` : ''}
          </Tekst>
        </Pressable>
      </View>

      {apen ? (
        <Kort style={styles.filterboks}>
          <View style={styles.gruppe}>
            <Tekst variant="brodLiten" vekt={700}>
              Sted
            </Tekst>
            <Chiprad>
              <Chip tekst="Alle steder" valgt={!sted} onPress={() => setSted(null)} />
              {steder.map(([n, st]) => (
                <Chip key={n} tekst={`${st.navn} (${st.antall})`} valgt={sted === n} onPress={() => setSted(sted === n ? null : n)} />
              ))}
            </Chiprad>
          </View>
          <View style={styles.gruppe}>
            <Tekst variant="brodLiten" vekt={700}>
              Arbeid
            </Tekst>
            <Chiprad>
              <Chip tekst="Alt" valgt={!arbeid} onPress={() => setArbeid(null)} />
              {arbeidstyper.map((k) => (
                <Chip
                  key={k.navn}
                  tekst={`${k.navn} (${k.antall})`}
                  valgt={arbeid === k.navn}
                  onPress={() => setArbeid(arbeid === k.navn ? null : k.navn)}
                />
              ))}
            </Chiprad>
          </View>
          <View style={styles.gruppe}>
            <Tekst variant="brodLiten" vekt={700}>
              Betaling per time
            </Tekst>
            <Chiprad>
              {betalingsvalg.map((b) => (
                <Chip key={b.verdi} tekst={b.tekst} valgt={betaling === b.verdi} onPress={() => setBetaling(b.verdi)} />
              ))}
            </Chiprad>
          </View>
          <View style={styles.knapper}>
            <Knapp liten variant="sekundar" tekst="Nullstill" deaktivert={!valgte.length} onPress={nullstillFilter} />
            <Knapp liten tekst={`Vis ${treff.length} annonse${treff.length === 1 ? '' : 'r'}`} onPress={() => setApen(false)} />
          </View>
        </Kort>
      ) : valgte.length > 0 ? (
        <View style={styles.valgte}>
          <Tekst variant="underLiten" style={styles.flex} numberOfLines={2}>
            Filter: <Tekst variant="underLiten" vekt={700} farge={farger.tekst}>{valgte.join(' · ')}</Tekst>
          </Tekst>
          <Pressable accessibilityRole="button" accessibilityLabel="Fjern filteret" onPress={nullstillFilter} hitSlop={10} style={styles.fjern}>
            <X size={16} color={farger.lilla} strokeWidth={2.4} />
            <Tekst variant="underLiten" vekt={700} farge={farger.lilla}>
              Fjern
            </Tekst>
          </Pressable>
        </View>
      ) : null}

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
          tekst="Prøv et annet ord, eller endre filteret."
          knapp={{ tekst: 'Vis alle annonser', onPress: nullstill }}
        />
      ) : (
        <Annonsegrid
          annonser={treff}
          tar={tar}
          onTakkJa={sierJa}
          onApne={(a) => gaFrem({ pathname: '/annonse/[id]', params: { id: a.id } })}
        />
      )}
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sokerad: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  filterknapp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: farger.linje,
    backgroundColor: farger.hvit,
  },
  filterknappAktiv: { backgroundColor: farger.lilla, borderColor: farger.lilla },
  trykket: { opacity: 0.8 },
  filterboks: { gap: 18, padding: 16 },
  gruppe: { gap: 8 },
  knapper: { flexDirection: 'row', gap: 10 },
  valgte: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fjern: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  laster: { paddingVertical: 32 },
});
