import { SearchX, Sparkles, WifiOff } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { Annonsekort, Sokefelt, Tomtilstand } from '../../components/Annonse';
import { Skjerm } from '../../components/Skjerm';
import { Overskrift, Pille, Seksjon } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { Chip } from '../../components/Valg';
import { annonsekategorier, useAnnonser, type Annonse } from '../../lib/annonser';
import { fornavn, useKonto } from '../../lib/konto';
import { gaFrem } from '../../lib/overgang';
import { farger } from '../../lib/tema';

type Typefilter = 'alle' | 'hjelp' | 'ting';

function passer(a: Annonse, sok: string) {
  if (!sok) return true;
  const ord = sok.toLowerCase().split(/\s+/).filter(Boolean);
  const tekst = `${a.tittel} ${a.beskrivelse} ${a.kategori} ${a.sted} ${a.profiler?.navn ?? ''}`.toLowerCase();
  return ord.every((o) => tekst.includes(o));
}

// Forsiden: alle annonser som brukerne har lagt ut, med søk og kategorier.
export default function Hjem() {
  const { profil } = useKonto();
  // Forsiden viser bare annonser som ingen har akseptert ennå.
  const { annonser, laster, feil, oppdater } = useAnnonser({ bareLedige: true });
  const [sok, setSok] = useState('');
  const [type, setType] = useState<Typefilter>('alle');
  const [kategori, setKategori] = useState<string | null>(null);
  const ungdom = profil?.rolle === 'ungdom';

  const kategorierITypen = annonsekategorier.filter((k) => type === 'alle' || k.type === type);
  const filtrert = useMemo(
    () =>
      annonser
        .filter((a) => type === 'alle' || a.type === type)
        .filter((a) => !kategori || a.kategori === kategori)
        .filter((a) => passer(a, sok.trim())),
    [annonser, type, kategori, sok],
  );
  const antallI = (k: string) => annonser.filter((a) => a.kategori === k).length;
  const filtrerer = Boolean(sok.trim() || kategori || type !== 'alle');
  const navn = fornavn(profil?.navn);

  return (
    <Skjerm oppdater={oppdater}>
      <Overskrift
        tittel={navn ? `Hei, ${navn}.` : 'Hei!'}
        undertekst={
          ungdom
            ? 'Se hvem som trenger hjelp i nabolaget, og aksepter et oppdrag.'
            : 'Her ser du hva naboene dine har lagt ut. Egne annonser finner du under «Mine annonser».'
        }
      />

      <Sokefelt verdi={sok} onEndre={setSok} />

      <View style={styles.filtre}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chiprad}>
          <Chip tekst="Alle" valgt={type === 'alle'} onPress={() => { setType('alle'); setKategori(null); }} />
          <Chip tekst="Trenger hjelp" valgt={type === 'hjelp'} onPress={() => { setType('hjelp'); setKategori(null); }} />
          <Chip tekst="Til salgs og gis bort" valgt={type === 'ting'} onPress={() => { setType('ting'); setKategori(null); }} />
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chiprad}>
          {kategorierITypen.map((k) => (
            <Chip
              key={k.navn}
              tekst={antallI(k.navn) > 0 ? `${k.navn} (${antallI(k.navn)})` : k.navn}
              valgt={kategori === k.navn}
              onPress={() => setKategori(kategori === k.navn ? null : k.navn)}
            />
          ))}
        </ScrollView>
      </View>

      <Seksjon
        tittel={filtrerer ? 'Treff' : 'Nyeste annonser'}
        hoyre={!laster && filtrert.length > 0 && <Pille tekst={`${filtrert.length} stk.`} variant="lilla" />}
      />

      {laster ? (
        <View style={styles.laster}>
          <ActivityIndicator color={farger.lilla} size="large" />
          <Tekst variant="under">Henter annonser …</Tekst>
        </View>
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
          tekst={
            ungdom
              ? 'Når noen i nabolaget trenger hjelp, dukker det opp her. Dra ned for å se etter nye.'
              : 'Når noen legger ut noe, dukker det opp her. Du legger ut egne annonser under «Mine annonser».'
          }
        />
      ) : filtrert.length === 0 ? (
        <Tomtilstand
          ikon={SearchX}
          tittel={sok.trim() ? `Ingen treff på «${sok.trim()}»` : `Ingen annonser i ${kategori ?? 'denne kategorien'} ennå`}
          tekst={
            sok.trim()
              ? 'Prøv et annet ord, eller se alle annonsene.'
              : 'Det er ingen ledige annonser her akkurat nå.'
          }
          knapp={{
            tekst: 'Vis alle annonser',
            onPress: () => {
              setSok('');
              setKategori(null);
              setType('alle');
            },
          }}
        />
      ) : (
        <View style={styles.liste}>
          {filtrert.map((a) => (
            <Annonsekort key={a.id} annonse={a} onPress={() => gaFrem({ pathname: '/annonse/[id]', params: { id: a.id } })} />
          ))}
        </View>
      )}
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  filtre: {
    gap: 10,
    marginHorizontal: -20,
  },
  chiprad: {
    gap: 10,
    paddingHorizontal: 20,
  },
  laster: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 32,
  },
  liste: {
    gap: 12,
  },
});
