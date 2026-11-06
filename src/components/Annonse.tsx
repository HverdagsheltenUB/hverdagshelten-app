import { CalendarClock, ExternalLink, HandHeart, MapPin, Search, X, type LucideIcon } from 'lucide-react-native';
import { createElement, useState, type ReactNode } from 'react';
import { Image, Linking, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ikonFor, klokkeslett, nartekst, omradelenke, pristekst, statustekst, tidtekst, dagtekst, type Annonse } from '../lib/annonser';
import { farger, ikonStrek, skrift } from '../lib/tema';
import { Knapp } from './Knapp';
import { Kort } from './Kort';
import { Avatar, Pille } from './Smaabiter';
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
        <View style={styles.piller}>
          <Pille
            tekst={annonse.type === 'hjelp' ? 'Trenger hjelp' : annonse.pris === 0 ? 'Gis bort' : 'Til salgs'}
            variant={annonse.type === 'hjelp' ? 'lilla' : 'fersken'}
          />
          {annonse.status !== 'ledig' && (
            <Pille tekst={statustekst[annonse.status]} variant={annonse.status === 'ferdig' ? 'lilla' : 'gronn'} />
          )}
        </View>
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

// Annonser to og to ved siden av hverandre, så man ser flere på en gang.
export function Annonsegrid({
  annonser,
  tar,
  onTakkJa,
  onApne,
}: {
  annonser: Annonse[];
  tar: string | null;
  onTakkJa: (a: Annonse) => void;
  onApne: (a: Annonse) => void;
}) {
  const [bredde, setBredde] = useState(0);
  const mellom = 12;
  const kolonner = bredde > 900 ? 4 : bredde > 620 ? 3 : 2;
  const kort = bredde ? Math.floor((bredde - mellom * (kolonner - 1)) / kolonner) : 0;
  return (
    <View style={styles.grid} onLayout={(e) => setBredde(e.nativeEvent.layout.width)}>
      {kort > 0 &&
        annonser.map((a) => (
          <Annonseflis
            key={a.id}
            annonse={a}
            bredde={kort}
            tar={tar === a.id}
            onTakkJa={() => onTakkJa(a)}
            onApne={() => onApne(a)}
          />
        ))}
    </View>
  );
}

// Et lite annonsekort til rutenettet: bilde, tittel, betaling, når, område og «Takk ja».
function Annonseflis({
  annonse,
  bredde,
  tar,
  onTakkJa,
  onApne,
}: {
  annonse: Annonse;
  bredde: number;
  tar: boolean;
  onTakkJa: () => void;
  onApne: () => void;
}) {
  const navn = annonse.profiler?.navn?.trim() || 'En bruker';
  const tid = annonse.tidspunkt ? new Date(annonse.tidspunkt) : null;
  const tidKort = tid ? `${dagtekst(tid).replace(/^./, (c) => c.toUpperCase())} ${klokkeslett(tid)}` : null;
  return (
    <View style={[styles.flis, { width: bredde }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${annonse.tittel}, ${pristekst(annonse)}, lagt ut av ${navn}. Åpne annonsen`}
        onPress={onApne}
        style={({ pressed }) => [styles.flisTopp, pressed && styles.trykket]}
      >
        <View style={styles.flisBilde}>
          {annonse.bilder[0] ? (
            <Image source={{ uri: annonse.bilder[0] }} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />
          ) : (
            createElement(ikonFor(annonse.kategori), { size: 34, color: farger.morkLilla, strokeWidth: ikonStrek })
          )}
          <View style={styles.flisPille}>
            <Pille tekst={annonse.type === 'hjelp' ? annonse.kategori : annonse.pris === 0 ? 'Gis bort' : 'Til salgs'} variant="lilla" />
          </View>
        </View>
        <View style={styles.flisTekst}>
          <Tekst variant="brodLiten" vekt={800} numberOfLines={2}>
            {annonse.tittel}
          </Tekst>
          <Tekst variant="underLiten" vekt={700} farge={farger.morkLilla} numberOfLines={1}>
            {pristekst(annonse)}
          </Tekst>
          {tidKort && (
            <View style={styles.sted}>
              <CalendarClock size={15} color={farger.dempet} strokeWidth={ikonStrek} />
              <Tekst variant="underLiten" numberOfLines={1} style={styles.flex}>
                {tidKort}
              </Tekst>
            </View>
          )}
          {annonse.sted.trim() ? (
            <View style={styles.sted}>
              <MapPin size={15} color={farger.dempet} strokeWidth={ikonStrek} />
              <Tekst variant="underLiten" numberOfLines={1} style={styles.flex}>
                {annonse.sted.trim()}
              </Tekst>
            </View>
          ) : null}
          <View style={styles.sted}>
            <Avatar bokstav={(navn[0] ?? '?').toUpperCase()} bilde={annonse.profiler?.bilde} storrelse={22} />
            <Tekst variant="underLiten" numberOfLines={1} style={styles.flex}>
              {navn}
            </Tekst>
          </View>
        </View>
      </Pressable>
      <View style={styles.flisBunn}>
        {annonse.sted.trim() ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Vis ${annonse.sted.trim()} på Google Maps`}
            onPress={() => Linking.openURL(omradelenke(annonse.sted)).catch(() => {})}
            hitSlop={8}
            style={({ pressed }) => [styles.sted, pressed && styles.trykket]}
          >
            <Tekst variant="underLiten" vekt={700} farge={farger.lilla} style={styles.understrek} numberOfLines={1}>
              Vis på Google Maps
            </Tekst>
          </Pressable>
        ) : null}
        <Knapp liten ikon={HandHeart} tekst="Takk ja" laster={tar} onPress={onTakkJa} style={styles.flisKnapp} />
      </View>
    </View>
  );
}

export function Sokefelt({ verdi, onEndre }: { verdi: string; onEndre: (t: string) => void }) {
  const fontSize = useTekststorrelse('brod');
  return (
    <View style={styles.sok}>
      <View style={styles.fast}>
        <Search size={22} color={farger.dempet} strokeWidth={ikonStrek} />
      </View>
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

// «Område: Kalsrud · Vis på Google Maps». Bruker bare området, aldri den private adressen.
export function Omradelinje({ sted }: { sted: string }) {
  if (!sted.trim()) return null;
  return (
    <View style={styles.omrade}>
      <View style={styles.sted}>
        <MapPin size={18} color={farger.dempet} strokeWidth={ikonStrek} />
        <Tekst variant="under">
          Område: <Tekst variant="under" vekt={700} farge={farger.tekst}>{sted.trim()}</Tekst>
        </Tekst>
      </View>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Vis ${sted.trim()} på Google Maps`}
        onPress={() => Linking.openURL(omradelenke(sted)).catch(() => {})}
        hitSlop={10}
        style={({ pressed }) => [styles.sted, pressed && styles.trykket]}
      >
        <Tekst variant="under" vekt={700} farge={farger.lilla} style={styles.understrek}>
          Vis på Google Maps
        </Tekst>
        <ExternalLink size={15} color={farger.lilla} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

// «Når: I morgen kl. 14:00»
export function Tidlinje({ tidspunkt }: { tidspunkt: string | null | undefined }) {
  if (!tidspunkt) return null;
  return (
    <View style={styles.sted}>
      <CalendarClock size={18} color={farger.dempet} strokeWidth={ikonStrek} />
      <Tekst variant="under">
        Når: <Tekst variant="under" vekt={700} farge={farger.tekst}>{tidtekst(tidspunkt)}</Tekst>
      </Tekst>
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
  piller: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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
  fast: { flexShrink: 0 },
  sokInput: {
    flex: 1,
    minWidth: 0,
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  flis: {
    backgroundColor: farger.kort,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: farger.linje,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  flisTopp: { gap: 0 },
  flisBilde: {
    height: 110,
    backgroundColor: farger.fersken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flisPille: { position: 'absolute', left: 8, top: 8, right: 8 },
  flisTekst: { padding: 10, paddingBottom: 6, gap: 4 },
  flisBunn: { paddingHorizontal: 10, paddingBottom: 10, gap: 8 },
  flisKnapp: { flex: 0, minHeight: 46 },
  flex: { flex: 1 },
  omrade: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 4,
  },
  understrek: {
    textDecorationLine: 'underline',
  },
  trykket: {
    opacity: 0.6,
  },
});
