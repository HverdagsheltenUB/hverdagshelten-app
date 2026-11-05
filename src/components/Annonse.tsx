import { MapPin, Search, X, type LucideIcon } from 'lucide-react-native';
import { createElement, type ReactNode } from 'react';
import { Image, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ikonFor, nartekst, pristekst, type Annonse } from '../lib/annonser';
import { farger, ikonStrek, skrift } from '../lib/tema';
import { Knapp } from './Knapp';
import { Kort } from './Kort';
import { Pille } from './Smaabiter';
import { Tekst, useTekststorrelse } from './Tekst';

// Ryddig, vennlig beskjed når det ikke finnes noe å vise ennå.
export function Tomtilstand({
  ikon: Ikon,
  tittel,
  tekst,
  knapp,
}: {
  ikon: LucideIcon;
  tittel: string;
  tekst: string;
  knapp?: { tekst: string; ikon?: LucideIcon; onPress: () => void };
}) {
  return (
    <View style={styles.tom} accessibilityRole="summary">
      <View style={styles.tomIkon}>
        <Ikon size={40} color={farger.morkLilla} strokeWidth={1.6} />
      </View>
      <Tekst variant="mellomtittel" style={styles.sentrert}>
        {tittel}
      </Tekst>
      <Tekst variant="brod" farge={farger.dempet} style={styles.sentrert}>
        {tekst}
      </Tekst>
      {knapp && <Knapp tekst={knapp.tekst} ikon={knapp.ikon} onPress={knapp.onPress} style={styles.tomKnapp} />}
    </View>
  );
}

// Bildet i en annonse, eller kategoriens ikon hvis det ikke er bilde.
export function Annonsebilde({ annonse, storrelse }: { annonse: Pick<Annonse, 'bilder' | 'kategori'>; storrelse: number }) {
  const forste = annonse.bilder[0];
  return (
    <View style={[styles.bilde, { width: storrelse, height: storrelse }]}>
      {forste ? (
        <Image source={{ uri: forste }} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />
      ) : (
        createElement(ikonFor(annonse.kategori), {
          size: storrelse * 0.4,
          color: farger.morkLilla,
          strokeWidth: ikonStrek,
        })
      )}
    </View>
  );
}

// Én annonse i en liste.
export function Annonsekort({ annonse, onPress, hoyre }: { annonse: Annonse; onPress: () => void; hoyre?: ReactNode }) {
  const navn = annonse.profiler?.navn?.trim() || 'En bruker';
  return (
    <Kort
      onPress={onPress}
      accessibilityLabel={`${annonse.tittel}, ${pristekst(annonse)}, lagt ut av ${navn}`}
      style={styles.kort}
    >
      <Annonsebilde annonse={annonse} storrelse={92} />
      <View style={styles.tekster}>
        <Pille tekst={annonse.type === 'hjelp' ? 'Trenger hjelp' : annonse.pris === 0 ? 'Gis bort' : 'Til salgs'} variant={annonse.type === 'hjelp' ? 'lilla' : 'fersken'} />
        <Tekst variant="listetittel" vekt={700} numberOfLines={2}>
          {annonse.tittel}
        </Tekst>
        <Tekst variant="brodLiten" vekt={700} farge={farger.morkLilla}>
          {pristekst(annonse)}
        </Tekst>
        <Tekst variant="underLiten" numberOfLines={1}>
          {annonse.sted ? `${annonse.sted} · ` : ''}
          {navn} · {nartekst(annonse.opprettet)}
        </Tekst>
      </View>
      {hoyre}
    </Kort>
  );
}

export function Sokefelt({ verdi, onEndre }: { verdi: string; onEndre: (t: string) => void }) {
  const fontSize = useTekststorrelse('brod');
  return (
    <View style={styles.sok}>
      <Search size={22} color={farger.dempet} strokeWidth={ikonStrek} />
      <TextInput
        value={verdi}
        onChangeText={onEndre}
        placeholder="Søk i annonser"
        placeholderTextColor={farger.dempet}
        accessibilityLabel="Søk i annonser"
        returnKeyType="search"
        autoCorrect={false}
        style={[styles.sokInput, { fontSize, fontFamily: skrift[400] }, Platform.OS === 'web' && styles.utenRamme]}
      />
      {verdi.length > 0 && (
        <Pressable accessibilityRole="button" accessibilityLabel="Tøm søket" onPress={() => onEndre('')} hitSlop={10}>
          <X size={22} color={farger.dempet} strokeWidth={ikonStrek} />
        </Pressable>
      )}
    </View>
  );
}

export function Stedlinje({ sted }: { sted: string }) {
  return (
    <View style={styles.sted}>
      <MapPin size={18} color={farger.dempet} strokeWidth={ikonStrek} />
      <Tekst variant="under">{sted}</Tekst>
    </View>
  );
}

const styles = StyleSheet.create({
  tom: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 28,
    paddingHorizontal: 12,
  },
  tomIkon: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: farger.fersken,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tomKnapp: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
  sentrert: {
    textAlign: 'center',
  },
  bilde: {
    borderRadius: 14,
    backgroundColor: farger.fersken,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  kort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
  },
  tekster: {
    flex: 1,
    gap: 3,
  },
  sok: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: farger.linje,
    borderRadius: 999,
    backgroundColor: farger.hvit,
    paddingHorizontal: 18,
  },
  sokInput: {
    flex: 1,
    color: farger.tekst,
    paddingVertical: 12,
  },
  utenRamme: {
    outlineWidth: 0,
  },
  sted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
