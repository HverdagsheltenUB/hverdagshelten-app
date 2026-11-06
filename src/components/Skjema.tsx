import { Check } from 'lucide-react-native';
import { useRef, useState, type ComponentRef } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { farger, skrift } from '../lib/tema';
import { useRullTilFelt } from './Skjerm';
import { Tekst, useTekststorrelse } from './Tekst';

type TekstfeltProps = Omit<TextInputProps, 'style'> & {
  etikett: string;
  hjelpetekst?: string;
  flereLinjer?: boolean;
};

// Stort, tydelig skrivefelt med etikett over. Følger «Større tekst».
export function Tekstfelt({ etikett, hjelpetekst, flereLinjer = false, ...rest }: TekstfeltProps) {
  const fontSize = useTekststorrelse('brod');
  const [fokus, setFokus] = useState(false);
  const feltRef = useRef<ComponentRef<typeof View>>(null);
  const rullTilFelt = useRullTilFelt();

  return (
    <View style={styles.felt} ref={feltRef} collapsable={false}>
      <Tekst variant="brodLiten" vekt={700}>
        {etikett}
      </Tekst>
      {hjelpetekst && <Tekst variant="underLiten">{hjelpetekst}</Tekst>}
      <TextInput
        accessibilityLabel={etikett}
        placeholderTextColor={farger.dempet}
        multiline={flereLinjer}
        textAlignVertical={flereLinjer ? 'top' : 'center'}
        // Lengre tekster får god plass, og feltet vokser opp til en grense før det ruller selv.
        scrollEnabled={flereLinjer}
        {...rest}
        onFocus={(e) => {
          setFokus(true);
          rullTilFelt(feltRef.current);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFokus(false);
          rest.onBlur?.(e);
        }}
        style={[
          styles.input,
          { fontSize, fontFamily: skrift[400] },
          flereLinjer && styles.flereLinjer,
          fokus && styles.fokus,
          // Nettleseren tegner sin egen svarte ramme. Vi viser fokus med lilla kant i stedet.
          Platform.OS === 'web' && styles.utenRamme,
        ]}
      />
    </View>
  );
}

type AvkrysningProps = {
  tekst: string;
  valgt: boolean;
  onEndre: (valgt: boolean) => void;
};

// Avkrysningsboks med stor trykkflate, f.eks. «Jeg godtar vilkårene».
export function Avkrysning({ tekst, valgt, onEndre }: AvkrysningProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: valgt }}
      accessibilityLabel={tekst}
      onPress={() => onEndre(!valgt)}
      style={styles.avkrysning}
    >
      <View style={[styles.boks, valgt && styles.boksValgt]}>
        {valgt && <Check size={20} color={farger.hvit} strokeWidth={3} />}
      </View>
      <Tekst variant="brod" style={styles.flex}>
        {tekst}
      </Tekst>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  felt: {
    gap: 6,
  },
  input: {
    minHeight: 56,
    // Samme kanttykkelse med og uten fokus, så teksten ikke hopper når man trykker i feltet.
    borderWidth: 2,
    borderColor: farger.linje,
    borderRadius: 14,
    backgroundColor: farger.hvit,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: farger.tekst,
  },
  flereLinjer: {
    minHeight: 150,
    maxHeight: 280,
    lineHeight: 24,
  },
  fokus: {
    borderColor: farger.lilla,
  },
  utenRamme: {
    outlineWidth: 0,
  },
  avkrysning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 48,
  },
  boks: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: farger.lilla,
    backgroundColor: farger.hvit,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boksValgt: {
    backgroundColor: farger.lilla,
  },
  flex: {
    flex: 1,
  },
});
