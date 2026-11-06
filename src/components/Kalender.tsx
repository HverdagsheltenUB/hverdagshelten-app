import { ChevronRight } from 'lucide-react-native';
import { createElement } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { datonokkel, ikonFor, klokkeslett, maaneder, ukedagerKort, type Annonse } from '../lib/annonser';
import { farger, ikonStrek } from '../lib/tema';
import { Kort } from './Kort';
import { Tekst } from './Tekst';

type DagstripeProps = {
  dager: Date[];
  valgt: string | null;
  onVelg: (dato: string) => void;
  // Antall aktiviteter per dag («2026-11-07»), vises som prikker.
  antall?: Record<string, number>;
  etikett?: (d: Date, i: number) => string | null;
};

// En rad med dager man kan bla i og trykke på. Brukes i kalenderen og når man velger dag.
export function Dagstripe({ dager, valgt, onVelg, antall, etikett }: DagstripeProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.stripe}
      style={styles.stripeRamme}
      keyboardShouldPersistTaps="handled"
    >
      {dager.map((d, i) => {
        const n = datonokkel(d);
        const er = valgt === n;
        const tall = antall?.[n] ?? 0;
        const over = etikett?.(d, i) ?? ukedagerKort[d.getDay()];
        return (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityState={{ selected: er }}
            accessibilityLabel={`${over} ${d.getDate()}. ${maaneder[d.getMonth()]}${tall ? `, ${tall} avtale${tall === 1 ? '' : 'r'}` : ''}`}
            onPress={() => onVelg(n)}
            style={({ pressed }) => [styles.dag, er && styles.dagValgt, pressed && styles.trykket]}
          >
            <Tekst variant="liten" vekt={700} farge={er ? farger.hvit : farger.dempet}>
              {over}
            </Tekst>
            <Tekst variant="stor" vekt={800} farge={er ? farger.hvit : farger.tekst}>
              {d.getDate()}
            </Tekst>
            <View style={styles.prikker}>
              {Array.from({ length: Math.min(tall, 3) }, (_, k) => (
                <View key={k} style={[styles.prikk, er && styles.prikkValgt]} />
              ))}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// Én avtale i oversikten: klokkeslett, hva, og en kort linje under.
export function Aktivitet({ annonse, undertekst, onPress }: { annonse: Annonse; undertekst: string; onPress: () => void }) {
  const tid = annonse.tidspunkt ? klokkeslett(new Date(annonse.tidspunkt)) : '';
  return (
    <Kort onPress={onPress} accessibilityLabel={`Klokka ${tid}: ${annonse.tittel}. ${undertekst}`} style={styles.aktivitet}>
      <View style={styles.klokke}>
        <Tekst variant="listetittel" vekt={800} farge={farger.morkLilla}>
          {tid}
        </Tekst>
      </View>
      <View style={styles.ikon}>
        {createElement(ikonFor(annonse.kategori), { size: 22, color: farger.morkLilla, strokeWidth: ikonStrek })}
      </View>
      <View style={styles.tekster}>
        <Tekst variant="listetittel" vekt={700} numberOfLines={2}>
          {annonse.tittel}
        </Tekst>
        <Tekst variant="underLiten" numberOfLines={2}>
          {undertekst}
        </Tekst>
      </View>
      <ChevronRight size={22} color={farger.dempet} strokeWidth={ikonStrek} />
    </Kort>
  );
}

const styles = StyleSheet.create({
  stripeRamme: { marginHorizontal: -20 },
  stripe: { gap: 8, paddingHorizontal: 20 },
  dag: {
    width: 62,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: farger.linje,
    backgroundColor: farger.kort,
    alignItems: 'center',
    gap: 2,
  },
  dagValgt: { backgroundColor: farger.lilla, borderColor: farger.lilla },
  trykket: { opacity: 0.8 },
  prikker: { flexDirection: 'row', gap: 3, height: 6, marginTop: 2 },
  prikk: { width: 6, height: 6, borderRadius: 3, backgroundColor: farger.lilla },
  prikkValgt: { backgroundColor: farger.fersken },
  aktivitet: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  klokke: { minWidth: 54 },
  ikon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: farger.fersken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tekster: { flex: 1, gap: 2 },
});
