import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useApp } from '../lib/app-tilstand';
import { farger, tekstnivaer } from '../lib/tema';
import { Kort } from './Kort';
import { Tekst } from './Tekst';

const trinn = tekstnivaer.length;
const knott = 30;

// Glider med fem trinn for tekststørrelsen. Midten er vanlig størrelse.
// Man kan dra, eller trykke rett på et trinn.
export function Tekstglider() {
  const { tekstniva, settTekstniva } = useApp();
  const [bredde, setBredde] = useState(0);
  const indeks = tekstniva + 2;
  const valgt = tekstnivaer[indeks] ?? tekstnivaer[2];

  // Avstanden mellom trinnene, målt fra midten av første til midten av siste knott.
  const spenn = Math.max(0, bredde - knott);
  const tilNiva = (x: number) => {
    if (!spenn) return tekstniva;
    const i = Math.round(((x - knott / 2) / spenn) * (trinn - 1));
    return Math.max(0, Math.min(trinn - 1, i)) - 2;
  };

  const velgFra = (x: number) => {
    const ny = tilNiva(x);
    if (ny !== tekstniva) settTekstniva(ny);
  };

  return (
    <Kort style={styles.kort}>
      <View style={styles.topp}>
        <Tekst variant="listetittel" vekt={700}>
          Tekststørrelse
        </Tekst>
        <Tekst variant="brodLiten" vekt={700} farge={farger.lilla}>
          {valgt.navn}
        </Tekst>
      </View>

      <View style={styles.rad}>
        <Tekst vekt={800} farge={farger.dempet} style={styles.litenA} accessibilityElementsHidden importantForAccessibility="no">
          A
        </Tekst>
        <View
          style={styles.glider}
          onLayout={(e) => setBredde(e.nativeEvent.layout.width)}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Tekststørrelse"
          accessibilityValue={{ min: 1, max: trinn, now: indeks + 1, text: valgt.navn }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => {
            if (e.nativeEvent.actionName === 'increment') settTekstniva(Math.min(2, tekstniva + 1));
            if (e.nativeEvent.actionName === 'decrement') settTekstniva(Math.max(-2, tekstniva - 1));
          }}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          onResponderGrant={(e) => velgFra(e.nativeEvent.locationX)}
          onResponderMove={(e) => velgFra(e.nativeEvent.locationX)}
        >
          <View pointerEvents="none" style={[styles.spor, { left: knott / 2, right: knott / 2 }]} />
          <View
            pointerEvents="none"
            style={[styles.sporFylt, { left: knott / 2, width: (spenn * indeks) / (trinn - 1) }]}
          />
          {tekstnivaer.map((t, i) => (
            <View
              key={t.niva}
              pointerEvents="none"
              style={[styles.trinn, { left: (spenn * i) / (trinn - 1) + knott / 2 - 6 }]}
            >
              <View style={[styles.prikk, i <= indeks && styles.prikkFylt, t.niva === 0 && styles.midten]} />
            </View>
          ))}
          <View pointerEvents="none" style={[styles.knott, { left: (spenn * indeks) / (trinn - 1) }]} />
        </View>
        <Tekst vekt={800} farge={farger.dempet} style={styles.storA} accessibilityElementsHidden importantForAccessibility="no">
          A
        </Tekst>
      </View>

      <Tekst variant="under">Dra eller trykk. Midten er vanlig størrelse.</Tekst>
    </Kort>
  );
}

const styles = StyleSheet.create({
  kort: { gap: 14, padding: 18 },
  topp: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rad: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  // Bokstavene på hver side følger ikke innstillingen, så de alltid viser forskjellen.
  litenA: { fontSize: 15, lineHeight: 20 },
  storA: { fontSize: 26, lineHeight: 32 },
  glider: { flex: 1, height: 44, justifyContent: 'center' },
  spor: { position: 'absolute', height: 6, borderRadius: 3, backgroundColor: farger.linje },
  sporFylt: { position: 'absolute', height: 6, borderRadius: 3, backgroundColor: farger.lilla },
  trinn: { position: 'absolute', width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  prikk: { width: 10, height: 10, borderRadius: 5, backgroundColor: farger.linje },
  prikkFylt: { backgroundColor: farger.lilla },
  midten: { width: 12, height: 12, borderRadius: 6 },
  knott: {
    position: 'absolute',
    width: knott,
    height: knott,
    borderRadius: knott / 2,
    backgroundColor: farger.hvit,
    borderWidth: 3,
    borderColor: farger.lilla,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
