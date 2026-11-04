import { useLocalSearchParams } from 'expo-router';
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  Clock,
  House,
  ImageIcon,
  Repeat,
  UserRound,
} from 'lucide-react-native';
import { useMemo, useState, type ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Infoboks, LesOpp } from '../components/Ekstra';
import { Knapp } from '../components/Knapp';
import { Ikonboks, Kort, Skillelinje } from '../components/Kort';
import { Listevalg } from '../components/Listevalg';
import { Skjerm } from '../components/Skjerm';
import { Avkrysning, Tekstfelt } from '../components/Skjema';
import { Overskrift } from '../components/Smaabiter';
import { Tekst } from '../components/Tekst';
import { Chip, Chiprad } from '../components/Valg';
import { useApp } from '../lib/app-tilstand';
import { hentBilde } from '../lib/bilde';
import { bestillingsdager, dagnavn, dagnavnLangt, klokke, tidsrom, ukedag, varighetTekst } from '../lib/dato';
import { finnHjelper, finnKategori, kategorier, starttider, tittelFor, type Person } from '../lib/eksempeldata';
import { gaTilbake, settRetning } from '../lib/overgang';
import { farger, kroner, prisFor, regler } from '../lib/tema';

type Steg = 'hvem' | 'hva' | 'annet' | 'nar' | 'se';

const relasjoner = ['Mor', 'Far', 'Nabo', 'Venn', 'Annen'];

// Ett spørsmål om gangen, så det aldri blir for mye på skjermen.
export default function Bestill() {
  const params = useLocalSearchParams<{ for?: string; kategori?: string; hjelper?: string }>();
  const forAnnen = params.for === 'annen';
  const { data, sendBestilling, visToast } = useApp();

  const dager = useMemo(() => bestillingsdager(7), []);
  const [steg, setSteg] = useState<Steg>(forAnnen ? 'hvem' : params.kategori ? 'nar' : 'hva');
  const [kategori, setKategori] = useState(params.kategori ?? '');
  const [annet, setAnnet] = useState('');
  const [dato, setDato] = useState(dager[0]);
  const [start, setStart] = useState(14);
  const [varighet, setVarighet] = useState(1);
  const [beskjed, setBeskjed] = useState('');
  const [handleliste, setHandleliste] = useState('');
  const [handlelisteBilde, setHandlelisteBilde] = useState<string>();
  const [gjenta, setGjenta] = useState(false);
  const [sender, setSender] = useState(false);

  // Hjelperen Anne hadde sist, så hun kan be om samme person igjen.
  const forrigeHjelper = useMemo(() => {
    const sist = data.oppdrag
      .filter((o) => o.bestiltAvMeg && o.hjelperId && o.status === 'ferdig')
      .sort((a, b) => b.dato.localeCompare(a.dato))[0];
    return finnHjelper(params.hjelper ?? sist?.hjelperId);
  }, [data.oppdrag, params.hjelper]);
  const [sammeHjelper, setSammeHjelper] = useState(Boolean(params.hjelper));

  // Den som skal få hjelp, når man bestiller for noen andre.
  const [annen, setAnnen] = useState({ navn: '', relasjon: '', adresse: '', omrade: '', telefon: '' });
  const [samtykke, setSamtykke] = useState(false);

  const stegListe: Steg[] = forAnnen ? ['hvem', 'hva', 'nar', 'se'] : ['hva', 'nar', 'se'];
  const nummer = stegListe.indexOf(steg === 'annet' ? 'hva' : steg) + 1;

  function gaTil(nytt: Steg) {
    const rekkefolge: Steg[] = ['hvem', 'hva', 'annet', 'nar', 'se'];
    settRetning(rekkefolge.indexOf(nytt) > rekkefolge.indexOf(steg) ? 'frem' : 'tilbake');
    setSteg(nytt);
  }

  const mottaker: Person = forAnnen
    ? {
        fornavn: annen.navn.trim().split(' ')[0] ?? '',
        navn: annen.navn.trim(),
        adresse: annen.adresse.trim(),
        omrade: annen.omrade.trim() || 'Oslo',
        telefon: annen.telefon.trim(),
      }
    : data.eldre;

  const pris = prisFor(varighet);
  const forSent = (s: number, v: number) => s + v > regler.senestFerdigKl;

  function send() {
    setSender(true);
    setTimeout(() => {
      sendBestilling({
        kategori,
        annet: kategori === 'Noe annet' ? annet.trim() : undefined,
        mottaker,
        bestiltFor: forAnnen ? { relasjon: annen.relasjon.toLowerCase(), samtykke } : undefined,
        dato,
        start,
        varighet,
        beskjed: beskjed.trim(),
        handleliste: handleliste.trim(),
        handlelisteBilde,
        tingAVite: forAnnen ? [] : data.eldre.tingAVite,
        gjentaUkentlig: gjenta,
        onsketHjelperId: sammeHjelper ? forrigeHjelper?.id : undefined,
      });
      setSender(false);
      settRetning('tilbake');
      gaTilbake('/');
      visToast('Bestillingen er sendt. Du får beskjed når en hjelper har sagt ja.');
    }, 700);
  }

  async function bilde(fraKamera: boolean) {
    const { uri, feil } = await hentBilde(fraKamera);
    if (feil) visToast(feil);
    if (uri) setHandlelisteBilde(uri);
  }

  const stegtekst = (
    <Tekst variant="under" vekt={700} farge={farger.lilla}>
      Steg {nummer} av {stegListe.length}
    </Tekst>
  );

  if (steg === 'hvem') {
    const klar = annen.navn.trim().length > 1 && annen.adresse.trim().length > 3 && annen.relasjon !== '' && samtykke;
    return (
      <Skjerm nokkel={steg} tilbake={{ tekst: 'Til forsiden', onPress: () => gaTilbake('/') }}>
        {stegtekst}
        <Overskrift tittel="Hvem skal få hjelp?" undertekst="For eksempel mor, far eller en nabo." />
        <Tekstfelt
          etikett="Navn"
          value={annen.navn}
          onChangeText={(navn) => setAnnen((a) => ({ ...a, navn }))}
          autoComplete="name"
        />
        <View style={styles.gruppe}>
          <Tekst variant="brodLiten" vekt={700}>
            Hvem er det for deg?
          </Tekst>
          <Chiprad>
            {relasjoner.map((r) => (
              <Chip
                key={r}
                tekst={r}
                valgt={annen.relasjon === r}
                onPress={() => setAnnen((a) => ({ ...a, relasjon: r }))}
              />
            ))}
          </Chiprad>
        </View>
        <Tekstfelt
          etikett="Adresse"
          hjelpetekst="Hjelperen ser bare området før avtalen er bekreftet."
          value={annen.adresse}
          onChangeText={(adresse) => setAnnen((a) => ({ ...a, adresse }))}
          autoComplete="street-address"
        />
        <Tekstfelt
          etikett="Område eller bydel"
          placeholder="For eksempel Kalbakken"
          value={annen.omrade}
          onChangeText={(omrade) => setAnnen((a) => ({ ...a, omrade }))}
        />
        <Tekstfelt
          etikett="Telefonnummer (valgfritt)"
          value={annen.telefon}
          onChangeText={(telefon) => setAnnen((a) => ({ ...a, telefon }))}
          keyboardType="phone-pad"
        />
        <Avkrysning
          tekst={`${mottaker.fornavn || 'Personen'} vet om bestillingen og har sagt ja til å få hjelp.`}
          valgt={samtykke}
          onEndre={setSamtykke}
        />
        <Knapp ikon={ArrowRight} ikonEtter tekst="Neste" deaktivert={!klar} onPress={() => gaTil('hva')} />
      </Skjerm>
    );
  }

  if (steg === 'hva') {
    return (
      <Skjerm
        nokkel={steg}
        tilbake={forAnnen ? { onPress: () => gaTil('hvem') } : { tekst: 'Til forsiden', onPress: () => gaTilbake('/') }}
      >
        {stegtekst}
        <Overskrift
          tittel="Hva trenger du hjelp med?"
          undertekst={forAnnen ? `Hjelp til ${mottaker.fornavn}` : undefined}
        />
        {kategorier.map((k) => (
          <Listevalg
            key={k.navn}
            ikon={k.ikon}
            tittel={k.navn}
            undertekst={k.beskrivelse}
            onPress={() => {
              setKategori(k.navn);
              gaTil(k.navn === 'Noe annet' ? 'annet' : 'nar');
            }}
          />
        ))}
      </Skjerm>
    );
  }

  if (steg === 'annet') {
    return (
      <Skjerm nokkel={steg} tilbake={{ onPress: () => gaTil('hva') }}>
        {stegtekst}
        <Overskrift tittel="Hva trenger du hjelp med?" undertekst="Skriv med egne ord." />
        <Tekstfelt
          etikett="Dette trenger jeg hjelp med"
          placeholder="For eksempel: bære ned julepynten fra loftet"
          hjelpetekst="Tips: Trykk på mikrofonen på tastaturet for å snakke i stedet for å skrive."
          flereLinjer
          value={annet}
          onChangeText={setAnnet}
        />
        <Infoboks tekst="Hjelperne skal ikke håndtere bankkort eller PIN, gi medisiner, kjøre bil eller gå på stige." />
        <Knapp
          ikon={ArrowRight}
          ikonEtter
          tekst="Neste"
          deaktivert={annet.trim().length < 3}
          onPress={() => gaTil('nar')}
        />
      </Skjerm>
    );
  }

  if (steg === 'nar') {
    return (
      <Skjerm nokkel={steg} tilbake={{ onPress: () => gaTil(kategori === 'Noe annet' ? 'annet' : 'hva') }}>
        {stegtekst}
        <Overskrift tittel="Når passer det?" undertekst={tittelFor({ kategori, annet })} />
        <View style={styles.gruppe}>
          <Tekst variant="mellomtittel">Dag</Tekst>
          <Chiprad>
            {dager.map((d) => (
              <Chip key={d} tekst={dagnavn(d)} valgt={dato === d} onPress={() => setDato(d)} />
            ))}
          </Chiprad>
        </View>
        <View style={styles.gruppe}>
          <Tekst variant="mellomtittel">Klokkeslett</Tekst>
          <Chiprad>
            {starttider
              .filter((s) => !forSent(s, varighet))
              .map((s) => (
                <Chip key={s} tekst={`Kl. ${klokke(s)}`} valgt={start === s} onPress={() => setStart(s)} />
              ))}
          </Chiprad>
        </View>
        <View style={styles.gruppe}>
          <Tekst variant="mellomtittel">Hvor lenge?</Tekst>
          <Chiprad>
            {regler.varigheter.map((v) => (
              <Chip
                key={v}
                tekst={varighetTekst(v)}
                valgt={varighet === v}
                onPress={() => {
                  setVarighet(v);
                  // Flytt starttiden tidligere hvis besøket ellers slutter etter kl. 20.
                  if (forSent(start, v)) setStart(starttider.filter((s) => !forSent(s, v)).pop() ?? starttider[0]);
                }}
              />
            ))}
          </Chiprad>
          <Tekst variant="under">
            {tidsrom(start, varighet)} · {kroner(pris.hjelp + pris.gebyr)}
          </Tekst>
        </View>
        <Knapp ikon={ArrowRight} ikonEtter tekst="Neste" onPress={() => gaTil('se')} style={styles.luft} />
      </Skjerm>
    );
  }

  const valgtKategori = finnKategori(kategori);
  const hvor = forAnnen ? `Hos ${mottaker.navn}, ${mottaker.adresse}` : `Hjemme hos deg, ${data.eldre.adresse}`;
  const opplesing = `${tittelFor({ kategori, annet })}. ${dagnavnLangt(dato)}, klokken ${klokke(start)} til ${klokke(
    start + varighet,
  )}. ${hvor}. Du betaler ${pris.sum} kroner etter besøket.`;

  return (
    <Skjerm nokkel={steg} tilbake={{ onPress: () => gaTil('nar') }}>
      {stegtekst}
      <Overskrift tittel="Ser dette riktig ut?" />
      <LesOpp tekst={opplesing} />

      <Kort>
        <Oppsummering ikon={<Ikonboks ikon={valgtKategori.ikon} />} tekst={tittelFor({ kategori, annet })} />
        <Oppsummering ikon={<Ikonboks ikon={CalendarDays} />} tekst={dagnavnLangt(dato)} />
        <Oppsummering
          ikon={<Ikonboks ikon={Clock} />}
          tekst={`Kl. ${tidsrom(start, varighet)} (${varighetTekst(varighet)})`}
        />
        <Oppsummering ikon={<Ikonboks ikon={House} />} tekst={hvor} />
      </Kort>

      <Kort>
        <Prisrad tekst={`Hjelp, ${varighetTekst(varighet)}`} belop={pris.hjelp} />
        <Prisrad tekst="Hverdagshelten-gebyr" belop={pris.gebyr} />
        <Skillelinje />
        <Prisrad tekst="Å betale" belop={pris.sum} fet />
        {kategori === 'Handling' && (
          <Tekst variant="under">Varene betaler du i tillegg. Hjelperen tar bilde av kvitteringen.</Tekst>
        )}
      </Kort>
      <Tekst variant="under">Du betaler med Vipps først når besøket er gjennomført.</Tekst>

      <Tekst variant="mellomtittel">Vil du legge til noe?</Tekst>
      {kategori === 'Handling' && (
        <Kort>
          <Tekstfelt
            etikett="Handleliste"
            placeholder="Melk, brød, epler …"
            flereLinjer
            value={handleliste}
            onChangeText={setHandleliste}
          />
          {handlelisteBilde ? (
            <View style={styles.gruppe}>
              <Image
                source={{ uri: handlelisteBilde }}
                style={styles.bilde}
                accessibilityLabel="Bilde av handlelisten"
              />
              <Knapp liten variant="sekundar" tekst="Fjern bildet" onPress={() => setHandlelisteBilde(undefined)} />
            </View>
          ) : (
            <View style={styles.knapper}>
              <Knapp liten variant="sekundar" ikon={Camera} tekst="Ta bilde" onPress={() => bilde(true)} />
              <Knapp liten variant="sekundar" ikon={ImageIcon} tekst="Velg bilde" onPress={() => bilde(false)} />
            </View>
          )}
        </Kort>
      )}
      <Tekstfelt
        etikett="Beskjed til hjelperen"
        placeholder="For eksempel: Ringeklokka virker ikke, bank på døra."
        hjelpetekst="Tips: Trykk på mikrofonen på tastaturet for å snakke i stedet for å skrive."
        flereLinjer
        value={beskjed}
        onChangeText={setBeskjed}
      />
      <Kort>
        <Avkrysning tekst="Gjenta hver uke på samme tid" valgt={gjenta} onEndre={setGjenta} />
        {forrigeHjelper && (
          <>
            <Skillelinje />
            <Avkrysning
              tekst={`Jeg vil gjerne ha ${forrigeHjelper.fornavn} igjen`}
              valgt={sammeHjelper}
              onEndre={setSammeHjelper}
            />
          </>
        )}
      </Kort>
      {!forAnnen && data.eldre.tingAVite.length > 0 && (
        <Infoboks ikon={UserRound} tekst={`Hjelperen får vite: ${data.eldre.tingAVite.join(', ').toLowerCase()}.`} />
      )}
      {gjenta && (
        <Infoboks
          ikon={Repeat}
          tekst={`Vi bestiller samme hjelp hver ${ukedag(dato)}. Du kan stoppe det når som helst.`}
        />
      )}

      <Knapp ikon={Check} tekst="Send bestilling" laster={sender} onPress={send} />
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
        {kroner(belop)}
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
  knapper: {
    flexDirection: 'row',
    gap: 10,
  },
  bilde: {
    width: '100%',
    height: 180,
    borderRadius: 14,
  },
});
