import { Redirect, useLocalSearchParams } from 'expo-router';
import { CircleCheck } from 'lucide-react-native';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Infoboks } from '../../components/Ekstra';
import { Knapp } from '../../components/Knapp';
import { Kort, Skillelinje } from '../../components/Kort';
import { Skjerm } from '../../components/Skjerm';
import { Overskrift } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { Chip, Chiprad } from '../../components/Valg';
import { useApp } from '../../lib/app-tilstand';
import { dagnavnLangt, varighetTekst } from '../../lib/dato';
import { finnHjelper, tittelFor } from '../../lib/eksempeldata';
import { gaTilbake } from '../../lib/overgang';
import { useOppdrag } from '../../lib/utvalg';
import { farger, kroner, prisFor } from '../../lib/tema';

const vippsOransje = '#FF5B24';

// Betaling med Vipps etter besøket, og kvitteringen etterpå.
export default function Betal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const o = useOppdrag(id);
  const { data, endreOppdrag, visToast } = useApp();
  const [betaler, setBetaler] = useState(data.eldre.fornavn);
  const [laster, setLaster] = useState(false);

  if (!o) return <Redirect href="/avtaler" />;
  const hjelper = finnHjelper(o.hjelperId);
  const pris = prisFor(o.varighet, o.utlegg ?? 0);
  const betalere = [data.eldre.fornavn, ...data.parorende.map((p) => p.navn.split(' ')[0])];

  const linjer = (
    <Kort>
      <Linje tekst={`Hjelp, ${varighetTekst(o.varighet)}`} belop={pris.hjelp} />
      {pris.utlegg > 0 && <Linje tekst="Varer (utlegg)" belop={pris.utlegg} />}
      <Linje tekst="Hverdagshelten-gebyr" belop={pris.gebyr} />
      <Skillelinje />
      <Linje tekst={o.betalt ? 'Betalt' : 'Å betale'} belop={pris.sum} fet />
    </Kort>
  );

  const kvitteringBilde = o.kvitteringBilde && (
    <Kort>
      <Tekst variant="under" vekt={600}>
        Kvittering fra butikken
      </Tekst>
      <Image
        source={{ uri: o.kvitteringBilde }}
        style={styles.bilde}
        accessibilityLabel="Bilde av kvitteringen fra butikken"
      />
    </Kort>
  );

  if (o.betalt) {
    return (
      <Skjerm tilbake={{ onPress: () => gaTilbake('/avtaler') }}>
        <View style={styles.midt}>
          <CircleCheck size={56} color={farger.gronn} strokeWidth={1.6} />
          <Overskrift tittel="Kvittering" />
        </View>
        <Kort>
          <Tekst variant="listetittel">{tittelFor(o)}</Tekst>
          <Tekst variant="under">
            {dagnavnLangt(o.dato)}
            {hjelper ? ` · ${hjelper.navn}` : ''}
          </Tekst>
          <Tekst variant="under">Kvitteringsnummer {kvitteringsnummer(o.id)}</Tekst>
          {o.betaltAv && <Tekst variant="under">Betalt av {o.betaltAv} med Vipps</Tekst>}
        </Kort>
        {linjer}
        {kvitteringBilde}
        <Infoboks tekst="Kvitteringen ligger her i appen, og sendes også på e-post når appen er ferdig." />
      </Skjerm>
    );
  }

  return (
    <Skjerm tilbake={{ onPress: () => gaTilbake('/avtaler') }}>
      <Overskrift
        tittel="Betal for besøket"
        undertekst={`${tittelFor(o)}${hjelper ? ` med ${hjelper.fornavn}` : ''}`}
      />
      {linjer}
      {kvitteringBilde}
      {betalere.length > 1 && (
        <View style={styles.gruppe}>
          <Tekst variant="mellomtittel">Hvem betaler?</Tekst>
          <Chiprad>
            {betalere.map((b) => (
              <Chip
                key={b}
                tekst={b === data.eldre.fornavn ? 'Jeg betaler' : b}
                valgt={betaler === b}
                onPress={() => setBetaler(b)}
              />
            ))}
          </Chiprad>
          {betaler !== data.eldre.fornavn && (
            <Tekst variant="under">{betaler} får en betalingsforespørsel i Vipps.</Tekst>
          )}
        </View>
      )}
      <Knapp
        tekst={`Betal ${kroner(pris.sum)} med Vipps`}
        laster={laster}
        style={{ backgroundColor: vippsOransje }}
        onPress={() => {
          setLaster(true);
          setTimeout(() => {
            setLaster(false);
            endreOppdrag(o.id, { betalt: true, betaltAv: betaler });
            visToast('Takk! Betalingen er gjennomført.');
          }, 1300);
        }}
      />
      <Infoboks tekst="Testversjon: ingen penger trekkes. All betaling skjer i appen, aldri med kontanter." />
    </Skjerm>
  );
}

// Et fast nummer laget av avtalens id, f.eks. «HH-48213».
function kvitteringsnummer(id: string) {
  let sum = 0;
  for (const tegn of id) sum = (sum * 31 + tegn.charCodeAt(0)) % 100000;
  return `HH-${String(sum).padStart(5, '0')}`;
}

function Linje({ tekst, belop, fet = false }: { tekst: string; belop: number; fet?: boolean }) {
  return (
    <View style={styles.linje}>
      <Tekst variant="brod" vekt={fet ? 800 : 400}>
        {tekst}
      </Tekst>
      <Tekst variant="brod" vekt={fet ? 800 : 600}>
        {kroner(belop)}
      </Tekst>
    </View>
  );
}

const styles = StyleSheet.create({
  midt: {
    alignItems: 'center',
    gap: 8,
  },
  linje: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gruppe: {
    gap: 10,
  },
  bilde: {
    width: '100%',
    height: 200,
    borderRadius: 14,
  },
});
