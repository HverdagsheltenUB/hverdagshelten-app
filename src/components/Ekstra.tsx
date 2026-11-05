import * as Linking from 'expo-linking';
import * as Speech from 'expo-speech';
import { BadgeCheck, Info, Phone, Star, Volume2, VolumeX, type LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { farger, ikonStrek } from '../lib/tema';
import { useBekreft } from './Dialog';
import { Knapp } from './Knapp';
import { Tekst } from './Tekst';

// «Sjekket av Hverdagshelten» på hjelpere som er godkjent.
export function SjekketMerke() {
  return (
    <View style={styles.merke} accessibilityLabel="Sjekket av Hverdagshelten">
      <BadgeCheck size={18} color={farger.gronn} strokeWidth={2} />
      <Tekst variant="underLiten" vekt={700} farge={farger.gronn}>
        Sjekket av Hverdagshelten
      </Tekst>
    </View>
  );
}

// Stjerner man kan trykke på. Hver stjerne er stor nok til å treffe.
export function Stjernevelger({ verdi, onEndre }: { verdi: number; onEndre: (n: number) => void }) {
  return (
    <View style={styles.stjerner} accessibilityRole="adjustable" accessibilityLabel={`${verdi} av 5 stjerner`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          accessibilityRole="button"
          accessibilityLabel={`${n} ${n === 1 ? 'stjerne' : 'stjerner'}`}
          onPress={() => onEndre(n)}
          hitSlop={4}
          style={styles.stjerne}
        >
          <Star
            size={36}
            color={farger.stjerne}
            fill={n <= verdi ? farger.stjerne : 'transparent'}
            strokeWidth={ikonStrek}
          />
        </Pressable>
      ))}
    </View>
  );
}

// Tydelig nødknapp. Spør først, så ingen ringer 113 ved et uhell.
export function Nodknapp() {
  const bekreft = useBekreft();
  return (
    <Knapp
      variant="rod"
      ikon={Phone}
      tekst="Ring 113 ved nødsituasjon"
      hint="Ringer medisinsk nødtelefon etter at du har bekreftet"
      onPress={async () => {
        const ja = await bekreft({
          tittel: 'Ringe 113?',
          tekst: 'Ring 113 hvis noen er skadet eller blir akutt syk. Etterpå ringer du oss, så hjelper vi deg videre.',
          ja: 'Ja, ring 113',
          farlig: true,
        });
        if (ja) Linking.openURL('tel:113').catch(() => {});
      }}
    />
  );
}

// Leser teksten høyt med telefonens norske stemme.
export function LesOpp({ tekst }: { tekst: string }) {
  const [leser, setLeser] = useState(false);
  useEffect(() => () => void Speech.stop(), []);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={leser ? 'Stopp opplesing' : 'Les opp teksten'}
      onPress={() => {
        if (leser) {
          Speech.stop();
          setLeser(false);
          return;
        }
        setLeser(true);
        Speech.speak(tekst, {
          language: 'nb-NO',
          rate: 0.9,
          onDone: () => setLeser(false),
          onStopped: () => setLeser(false),
          onError: () => setLeser(false),
        });
      }}
      style={({ pressed }) => [styles.lesOpp, pressed && { opacity: 0.8 }]}
    >
      {leser ? (
        <VolumeX size={20} color={farger.morkLilla} strokeWidth={ikonStrek} />
      ) : (
        <Volume2 size={20} color={farger.morkLilla} strokeWidth={ikonStrek} />
      )}
      <Tekst variant="brodLiten" vekt={700} farge={farger.morkLilla}>
        {leser ? 'Stopp' : 'Les opp'}
      </Tekst>
    </Pressable>
  );
}

// Et lite, stillestående bilde som viser omtrent hvor oppdraget er, uten gater eller adresse.
export function Omradebilde({ omrade, avstand }: { omrade: string; avstand: string }) {
  return (
    <View style={styles.omrade} accessibilityLabel={`Omtrent i området ${omrade}, ${avstand} unna`}>
      <Svg width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid slice">
        <Rect x={0} y={0} width={300} height={120} fill="#F3EADF" />
        <Path d="M0,96 C60,84 110,108 170,100 C220,94 260,110 300,104 L300,120 L0,120 Z" fill="#DCEAE8" />
        <Path d="M30,10 C60,40 50,70 90,90" stroke="#E7DCCF" strokeWidth={10} fill="none" strokeLinecap="round" />
        <Path d="M210,0 C200,30 230,60 220,100" stroke="#E7DCCF" strokeWidth={10} fill="none" strokeLinecap="round" />
        <Circle
          cx={150}
          cy={58}
          r={44}
          fill="rgba(77,59,92,0.16)"
          stroke={farger.lilla}
          strokeWidth={2}
          strokeDasharray="6 5"
        />
        <Circle cx={150} cy={58} r={6} fill={farger.lilla} />
      </Svg>
      <View style={styles.omradeTekst}>
        <Tekst variant="brodLiten" vekt={700} farge={farger.morkLilla}>
          {omrade}
        </Tekst>
      </View>
    </View>
  );
}

// Rolig informasjonsboks, f.eks. om personvern.
export function Infoboks({ tekst, ikon: Ikon = Info }: { tekst: string; ikon?: LucideIcon }) {
  return (
    <View style={styles.info}>
      <Ikon size={22} color={farger.lilla} strokeWidth={ikonStrek} />
      <Tekst variant="brodLiten" style={styles.flex}>
        {tekst}
      </Tekst>
    </View>
  );
}

const styles = StyleSheet.create({
  merke: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stjerner: {
    flexDirection: 'row',
    gap: 4,
  },
  stjerne: {
    padding: 4,
  },
  lesOpp: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: farger.lysLilla,
    borderRadius: 999,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  omrade: {
    height: 120,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: farger.linje,
  },
  omradeTekst: {
    position: 'absolute',
    left: 12,
    top: 10,
    backgroundColor: 'rgba(255,253,250,0.92)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  info: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: farger.lysLilla,
    borderRadius: 16,
    padding: 14,
  },
  flex: {
    flex: 1,
  },
});
