import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';

import type { Kartpunkt } from '../lib/eksempeldata';
import { farger } from '../lib/tema';
import { Tekst } from './Tekst';
import { Trykkbar } from './Trykkbar';

// Et stilisert kart over Oslo sentrum. react-native-maps virker ikke på web,
// så vi tegner et enkelt kart selv inntil vi trenger et ekte.

export type Kartnal = {
  id: string;
  punkt: Kartpunkt;
  etikett: string;
  nummer?: number;
  onPress?: () => void;
};

const kartfarger = {
  land: '#F3EADF',
  vann: '#CFE2E8',
  park: '#DCEAD6',
  gate: '#FFFFFF',
  navn: '#9A8E9F',
};

const omrader = [
  { navn: 'Sagene', x: 60, y: 6 },
  { navn: 'Frogner', x: 6, y: 54 },
  { navn: 'St. Hanshaugen', x: 28, y: 10 },
  { navn: 'Grünerløkka', x: 74, y: 40 },
  { navn: 'Sentrum', x: 62, y: 70 },
  { navn: 'Oslofjorden', x: 8, y: 88 },
];

export function Kart({ naler, hoyde = 280 }: { naler: Kartnal[]; hoyde?: number }) {
  return (
    <View style={[styles.ramme, { height: hoyde }]} accessibilityLabel="Eksempelkart over Oslo sentrum">
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Rect x={0} y={0} width={100} height={100} fill={kartfarger.land} />
        <Path d="M0,76 C14,70 26,80 38,86 C50,92 62,86 74,94 L80,100 L0,100 Z" fill={kartfarger.vann} />
        <Path
          d="M62,0 C58,14 66,24 63,36 C60,48 68,58 66,72 C65,80 70,88 74,94"
          stroke={kartfarger.vann}
          strokeWidth={5}
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        <Ellipse cx={34} cy={58} rx={8} ry={6} fill={kartfarger.park} />
        <Ellipse cx={46} cy={30} rx={6} ry={5} fill={kartfarger.park} />
        <Ellipse cx={10} cy={36} rx={9} ry={8} fill={kartfarger.park} />
        {[
          'M0,52 L100,46',
          'M0,22 L100,30',
          'M24,0 L36,100',
          'M48,0 L50,100',
          'M84,0 L88,100',
          'M44,62 L80,66',
          'M8,96 L96,6',
        ].map((d) => (
          <Path key={d} d={d} stroke={kartfarger.gate} strokeWidth={6} vectorEffect="non-scaling-stroke" />
        ))}
      </Svg>

      {omrader.map((o) => (
        <Tekst
          key={o.navn}
          variant="pille"
          vekt={600}
          farge={kartfarger.navn}
          style={[styles.omrade, { left: `${o.x}%`, top: `${o.y}%` }]}
        >
          {o.navn}
        </Tekst>
      ))}

      {naler.map((n) => (
        <Nal key={n.id} {...n} />
      ))}
    </View>
  );
}

function Nal({ punkt, etikett, nummer, onPress }: Kartnal) {
  const innhold = (
    <>
      <View style={[styles.hode, nummer !== undefined && styles.hodeNummer]}>
        {nummer !== undefined ? (
          <Tekst variant="brodLiten" vekt={800} farge={farger.morkLilla}>
            {nummer}
          </Tekst>
        ) : (
          <View style={styles.prikk} />
        )}
      </View>
      <View style={[styles.spiss, nummer !== undefined && styles.spissNummer]} />
    </>
  );

  const plassering = [styles.nal, { left: `${punkt.x}%` as const, top: `${punkt.y}%` as const }];
  if (!onPress) {
    return (
      <View style={plassering} accessibilityLabel={etikett}>
        {innhold}
      </View>
    );
  }
  return (
    <Trykkbar style={plassering} onPress={onPress} accessibilityLabel={etikett} hitSlop={8}>
      {innhold}
    </Trykkbar>
  );
}

const nalBredde = 34;

const styles = StyleSheet.create({
  ramme: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: farger.linje,
    overflow: 'hidden',
    backgroundColor: kartfarger.land,
  },
  omrade: {
    position: 'absolute',
  },
  nal: {
    position: 'absolute',
    width: nalBredde,
    marginLeft: -nalBredde / 2,
    marginTop: -nalBredde - 8,
    alignItems: 'center',
  },
  hode: {
    width: nalBredde,
    height: nalBredde,
    borderRadius: 999,
    backgroundColor: farger.lilla,
    borderWidth: 3,
    borderColor: farger.hvit,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hodeNummer: {
    backgroundColor: farger.fersken,
    borderColor: farger.lilla,
  },
  prikk: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: farger.hvit,
  },
  spiss: {
    width: 12,
    height: 12,
    marginTop: -8,
    backgroundColor: farger.lilla,
    transform: [{ rotate: '45deg' }],
    zIndex: -1,
  },
  spissNummer: {
    backgroundColor: farger.lilla,
  },
});
