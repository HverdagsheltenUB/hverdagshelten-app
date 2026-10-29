import { ArrowRight, CalendarDays, Check, House } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Knapp } from '../components/Knapp';
import { Ikonboks, Kort, Skillelinje } from '../components/Kort';
import { Listevalg } from '../components/Listevalg';
import { Skjerm } from '../components/Skjerm';
import { Overskrift, Tilbakelenke } from '../components/Smaabiter';
import { Tekst } from '../components/Tekst';
import { Chip, Chiprad } from '../components/Valg';
import { useApp } from '../lib/app-tilstand';
import { anne, dager, finnKategori, kategorier, tider } from '../lib/eksempeldata';
import { gaTilbake, settRetning } from '../lib/overgang';
import { farger, priser } from '../lib/tema';

type Steg = 1 | 2 | 3;

// Ett spørsmål om gangen, så det aldri blir for mye på skjermen.
export default function Bestill() {
  const { sendBestilling, visToast } = useApp();
  const [steg, setSteg] = useState<Steg>(1);
  const [kategori, setKategori] = useState('');
  const [dag, setDag] = useState(dager[0]);
  const [tid, setTid] = useState(tider[0]);

  function gaTilSteg(nytt: Steg) {
    settRetning(nytt > steg ? 'frem' : 'tilbake');
    setSteg(nytt);
  }

  function send() {
    sendBestilling({ kategori, dag, tid });
    gaTilbake('/');
    visToast('Bestillingen er sendt. Du får beskjed når en hjelper har sagt ja.');
  }

  const stegtekst = (
    <Tekst variant="under" vekt={700} farge={farger.lilla}>
      Steg {steg} av 3
    </Tekst>
  );

  if (steg === 1) {
    return (
      <Skjerm nokkel="1">
        <Tilbakelenke tekst="Til forsiden" onPress={() => gaTilbake('/')} />
        {stegtekst}
        <Overskrift tittel="Hva trenger du hjelp med?" />
        {kategorier.map((k) => (
          <Listevalg
            key={k.navn}
            ikon={k.ikon}
            tittel={k.navn}
            undertekst={k.beskrivelse}
            onPress={() => {
              setKategori(k.navn);
              gaTilSteg(2);
            }}
          />
        ))}
      </Skjerm>
    );
  }

  if (steg === 2) {
    return (
      <Skjerm nokkel="2">
        <Tilbakelenke tekst="Tilbake" onPress={() => gaTilSteg(1)} />
        {stegtekst}
        <Overskrift tittel="Når passer det?" undertekst={kategori} />
        <View style={styles.gruppe}>
          <Tekst variant="mellomtittel">Dag</Tekst>
          <Chiprad>
            {dager.map((d) => (
              <Chip key={d} tekst={d} valgt={dag === d} onPress={() => setDag(d)} />
            ))}
          </Chiprad>
        </View>
        <View style={styles.gruppe}>
          <Tekst variant="mellomtittel">Tid</Tekst>
          <Chiprad>
            {tider.map((t) => (
              <Chip key={t} tekst={t} valgt={tid === t} onPress={() => setTid(t)} />
            ))}
          </Chiprad>
        </View>
        <Knapp ikon={ArrowRight} ikonEtter tekst="Neste" onPress={() => gaTilSteg(3)} style={styles.luft} />
      </Skjerm>
    );
  }

  const valgtKategori = finnKategori(kategori);

  return (
    <Skjerm nokkel="3">
      <Tilbakelenke tekst="Tilbake" onPress={() => gaTilSteg(2)} />
      {stegtekst}
      <Overskrift tittel="Ser dette riktig ut?" />

      <Kort>
        <Oppsummering ikon={<Ikonboks ikon={CalendarDays} />} tekst={`${dag}, kl. ${tid}`} />
        <Oppsummering ikon={<Ikonboks ikon={valgtKategori.ikon} />} tekst={valgtKategori.navn} />
        <Oppsummering ikon={<Ikonboks ikon={House} />} tekst={`Hjemme hos deg, ${anne.adresse}`} />
      </Kort>

      <Kort>
        <Prisrad tekst="Hjelp, 1 time" belop={priser.timepris} />
        <Prisrad tekst="Hverdagshelten-gebyr" belop={priser.gebyr} />
        <Skillelinje />
        <Prisrad tekst="Å betale" belop={priser.timepris + priser.gebyr} fet />
      </Kort>

      <Tekst variant="under">Du betaler først når besøket er gjennomført.</Tekst>

      <Knapp ikon={Check} tekst="Send bestilling" onPress={send} />
    </Skjerm>
  );
}

function Oppsummering({ ikon, tekst }: { ikon: ReactNode; tekst: string }) {
  return (
    <View style={styles.rad}>
      {ikon}
      <Tekst variant="brod" vekt={600} style={styles.flex}>
        {tekst}
      </Tekst>
    </View>
  );
}

function Prisrad({ tekst, belop, fet = false }: { tekst: string; belop: number; fet?: boolean }) {
  return (
    <View style={styles.prisrad}>
      <Tekst variant="brod" vekt={fet ? 800 : 400}>
        {tekst}
      </Tekst>
      <Tekst variant="brod" vekt={fet ? 800 : 600}>
        {belop} kr
      </Tekst>
    </View>
  );
}

const styles = StyleSheet.create({
  gruppe: {
    gap: 10,
  },
  luft: {
    marginTop: 8,
  },
  rad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flex: {
    flex: 1,
  },
  prisrad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
