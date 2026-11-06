import { createElement, useState } from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import {
  ikonFor,
  leveringstekst,
  nartekst,
  pristekst,
  statustekst,
  type Annonsestatus,
  type Annonsetype,
  type Levering,
} from '../lib/annonser';
import { farger, ikonStrek } from '../lib/tema';
import { Omradelinje, Tidlinje } from './Annonse';
import { Kort, Skillelinje } from './Kort';
import { Avatar, Pille } from './Smaabiter';
import { Tekst } from './Tekst';

export type Visning = {
  type: Annonsetype;
  tittel: string;
  kategori: string;
  beskrivelse: string;
  pris: number | null;
  tilstand: string | null;
  storrelse: string | null;
  sted: string;
  levering: Levering | null;
  bilder: string[];
  opprettet?: string;
  navn: string;
  bilde?: string | null;
  medlemSiden?: string;
  status?: Annonsestatus;
  tidspunkt?: string | null;
};

const mndNavn = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];

// Slik ser en annonse ut for alle. Brukes både på annonsesiden og i forhåndsvisningen.
export function Annonsevisning({ a }: { a: Visning }) {
  const { width } = useWindowDimensions();
  const bredde = Math.min(width, 700) - 40;
  const [side, setSide] = useState(0);
  const detaljer: [string, string][] = [
    ['Kategori', a.kategori],
    ...(a.tilstand ? [['Tilstand', a.tilstand] as [string, string]] : []),
    ...(a.storrelse ? [['Størrelse', a.storrelse] as [string, string]] : []),
    ...(a.levering ? [['Levering', leveringstekst[a.levering]] as [string, string]] : []),
  ];
  const siden = a.medlemSiden ? new Date(a.medlemSiden) : null;

  return (
    <View style={styles.liste}>
      {a.bilder.length > 0 ? (
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => setSide(Math.round(e.nativeEvent.contentOffset.x / bredde))}
            scrollEventThrottle={32}
            style={[styles.bilder, { width: bredde, height: bredde * 0.8 }]}
          >
            {a.bilder.map((uri, i) => (
              <Image
                key={uri}
                source={{ uri }}
                style={{ width: bredde, height: bredde * 0.8 }}
                resizeMode="cover"
                accessibilityLabel={`Bilde ${i + 1} av ${a.bilder.length}`}
              />
            ))}
          </ScrollView>
          {a.bilder.length > 1 && (
            <View style={styles.prikker} accessibilityLabel={`Bilde ${side + 1} av ${a.bilder.length}`}>
              {a.bilder.map((uri, i) => (
                <View key={uri} style={[styles.prikk, i === side && styles.prikkAktiv]} />
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.utenBilde, { height: bredde * 0.45 }]}>
          {createElement(ikonFor(a.kategori), { size: 64, color: farger.morkLilla, strokeWidth: ikonStrek })}
        </View>
      )}

      <View style={styles.topp}>
        <View style={styles.piller}>
          <Pille
            tekst={a.type === 'hjelp' ? 'Trenger hjelp' : a.pris === 0 ? 'Gis bort' : 'Til salgs'}
            variant={a.type === 'hjelp' ? 'lilla' : 'fersken'}
          />
          {a.status && a.status !== 'ledig' && (
            <Pille tekst={statustekst[a.status]} variant={a.status === 'ferdig' ? 'lilla' : 'gronn'} />
          )}
        </View>
        <Tekst variant="tittel" accessibilityRole="header">
          {a.tittel || 'Tittel mangler'}
        </Tekst>
        <Tekst variant="stor" farge={farger.morkLilla}>
          {pristekst(a)}
        </Tekst>
        <Tidlinje tidspunkt={a.tidspunkt} />
        <Omradelinje sted={a.sted} />
      </View>

      {a.beskrivelse ? (
        <Tekst variant="brod" style={styles.beskrivelse}>
          {a.beskrivelse}
        </Tekst>
      ) : null}

      <Kort>
        {detaljer.map(([etikett, verdi], i) => (
          <View key={etikett} style={styles.detalj}>
            {i > 0 && <Skillelinje />}
            <View style={styles.detaljrad}>
              <Tekst variant="under" vekt={600}>
                {etikett}
              </Tekst>
              <Tekst variant="brod" vekt={600} style={styles.hoyre}>
                {verdi}
              </Tekst>
            </View>
          </View>
        ))}
      </Kort>

      <Kort myk style={styles.person}>
        <Avatar bokstav={(a.navn.trim()[0] ?? '?').toUpperCase()} storrelse={52} bilde={a.bilde} />
        <View style={styles.flex}>
          <Tekst variant="under" vekt={600}>
            Lagt ut av
          </Tekst>
          <Tekst variant="listetittel" vekt={700}>
            {a.navn.trim() || 'En bruker'}
          </Tekst>
          <Tekst variant="underLiten">
            {a.opprettet ? `Publisert ${nartekst(a.opprettet)}` : 'Ikke publisert ennå'}
            {siden ? ` · Med siden ${mndNavn[siden.getMonth()]} ${siden.getFullYear()}` : ''}
          </Tekst>
        </View>
      </Kort>
    </View>
  );
}

const styles = StyleSheet.create({
  liste: { gap: 16 },
  bilder: { borderRadius: 18, overflow: 'hidden', backgroundColor: farger.fersken },
  prikker: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  prikk: { width: 8, height: 8, borderRadius: 4, backgroundColor: farger.linje },
  prikkAktiv: { backgroundColor: farger.lilla, width: 20 },
  utenBilde: {
    borderRadius: 18,
    backgroundColor: farger.fersken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topp: { gap: 6 },
  piller: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  beskrivelse: { lineHeight: 26 },
  detalj: { gap: 12 },
  detaljrad: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  hoyre: { flexShrink: 1, textAlign: 'right' },
  person: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  flex: { flex: 1, gap: 2 },
});
