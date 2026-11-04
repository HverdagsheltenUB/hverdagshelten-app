import { GraduationCap } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Ikonboks, Kort, Skillelinje } from '../../components/Kort';
import { Listevalg } from '../../components/Listevalg';
import { Skjerm } from '../../components/Skjerm';
import { Lenkerad, Overskrift, Pille, Seksjon, Statboks, Statrad } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { Chip, Chiprad } from '../../components/Valg';
import { useApp } from '../../lib/app-tilstand';
import { dagnavn, klokke, manedsnavn, tidsrom } from '../../lib/dato';
import { avstandTekst, finnKategori, megUngdom, tittelFor, type Oppdrag } from '../../lib/eksempeldata';
import { gaFrem } from '../../lib/overgang';
import { useLedigeOppdrag, useMineOppdrag } from '../../lib/utvalg';
import { kroner, prisFor } from '../../lib/tema';

type Typefilter = 'alle' | 'liker' | string;
type Dagfilter = 'alle' | 'snart' | 'helg';

function erHelg(iso: string) {
  const [a, m, d] = iso.split('-').map(Number);
  const dag = new Date(a, m - 1, d).getDay();
  return dag === 0 || dag === 6;
}

function apne(o: Oppdrag) {
  gaFrem({ pathname: '/oppdrag/[id]', params: { id: o.id } });
}

export function Hjem() {
  const { data, tjentDenneManeden } = useApp();
  const ledige = useLedigeOppdrag();
  const { kommende } = useMineOppdrag();
  const neste = kommende[0];
  const [type, setType] = useState<Typefilter>('alle');
  const [dag, setDag] = useState<Dagfilter>('alle');

  const filtrert = ledige
    .filter((o) =>
      type === 'alle'
        ? true
        : type === 'liker'
          ? data.ungdom.likerAHjelpeMed.includes(o.kategori)
          : o.kategori === type,
    )
    .filter((o) =>
      dag === 'alle' ? true : dag === 'helg' ? erHelg(o.dato) : ['I dag', 'I morgen'].includes(dagnavn(o.dato)),
    );
  const typerIListen = [...new Set(ledige.map((o) => o.kategori))];

  return (
    <Skjerm>
      <Overskrift tittel={`Hei, ${megUngdom.fornavn}.`} undertekst="Klar for å gjøre noen glade i dag?" />

      {!data.ungdom.quizBestatt && (
        <Kort myk onPress={() => gaFrem('/quiz')} accessibilityLabel="Ta quizen før første oppdrag" style={styles.rad}>
          <Ikonboks ikon={GraduationCap} />
          <View style={styles.flex}>
            <Tekst variant="listetittel">Før ditt første oppdrag</Tekst>
            <Tekst variant="under">Les retningslinjene og ta en kort quiz. Det tar to minutter.</Tekst>
          </View>
        </Kort>
      )}

      {neste ? (
        <Kort onPress={() => apne(neste)} accessibilityLabel="Ditt neste oppdrag">
          <Tekst variant="under" vekt={600}>
            Ditt neste oppdrag
          </Tekst>
          <View style={styles.rad}>
            <Ikonboks ikon={finnKategori(neste.kategori).ikon} />
            <View style={styles.flex}>
              <Tekst variant="stor">
                {tittelFor(neste)} hos {neste.mottaker.fornavn}
              </Tekst>
              <Tekst variant="under">
                {dagnavn(neste.dato)} kl. {tidsrom(neste.start, neste.varighet)}
              </Tekst>
            </View>
          </View>
          <Skillelinje />
          <Lenkerad tekst="Se oppdraget og veien dit" onPress={() => apne(neste)} />
        </Kort>
      ) : (
        <Kort>
          <Tekst variant="mellomtittel">Ingen oppdrag ennå</Tekst>
          <Tekst variant="brod">Velg et ledig oppdrag under, så dukker det opp her.</Tekst>
        </Kort>
      )}

      <Statrad>
        <Statboks etikett={`Tjent i ${manedsnavn()}`} verdi={kroner(tjentDenneManeden)} />
        <Statboks etikett="Vurdering" verdi={megUngdom.vurdering} stjerne />
      </Statrad>

      <Seksjon
        tittel="Ledige oppdrag nær deg"
        hoyre={filtrert.length > 0 && <Pille tekst={`${filtrert.length} ledige`} variant="lilla" />}
      />

      <Chiprad>
        <Chip tekst="Alle" valgt={type === 'alle'} onPress={() => setType('alle')} />
        <Chip tekst="Det jeg liker" valgt={type === 'liker'} onPress={() => setType('liker')} />
        {typerIListen.map((k) => (
          <Chip key={k} tekst={k} valgt={type === k} onPress={() => setType(k)} />
        ))}
      </Chiprad>
      <Chiprad>
        <Chip tekst="Alle dager" valgt={dag === 'alle'} onPress={() => setDag('alle')} />
        <Chip tekst="I dag og i morgen" valgt={dag === 'snart'} onPress={() => setDag('snart')} />
        <Chip tekst="Helg" valgt={dag === 'helg'} onPress={() => setDag('helg')} />
      </Chiprad>

      {filtrert.length === 0 && <Tekst variant="brod">Ingen ledige oppdrag som passer akkurat nå.</Tekst>}
      {filtrert.map((o) => (
        <Listevalg
          key={o.id}
          ikon={finnKategori(o.kategori).ikon}
          tittel={tittelFor(o)}
          undertekst={`${dagnavn(o.dato)} kl. ${klokke(o.start)} · ${o.mottaker.omrade} · ${avstandTekst(o.avstandKm)}`}
          hoyre={kroner(prisFor(o.varighet).hjelp)}
          onPress={() => apne(o)}
        />
      ))}
      <Tekst variant="underLiten">
        Viser oppdrag innen {String(data.ungdom.grenser.maksKm).replace('.', ',')} km som er ferdige før kl.{' '}
        {data.ungdom.grenser.sistKl}, slik foresatte har satt.
      </Tekst>
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  rad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flex: {
    flex: 1,
  },
});
