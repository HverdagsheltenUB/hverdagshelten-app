import { router } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  HandHeart,
  Heart,
  MessageCircleHeart,
  ShieldCheck,
  UserCheck,
} from 'lucide-react-native';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Infoboks } from '../components/Ekstra';
import { Knapp } from '../components/Knapp';
import { Ikonboks, Kort } from '../components/Kort';
import { Listevalg } from '../components/Listevalg';
import { Skjerm } from '../components/Skjerm';
import { Avkrysning, Tekstfelt } from '../components/Skjema';
import { Overskrift } from '../components/Smaabiter';
import { Tekst } from '../components/Tekst';
import { Chip, Chiprad } from '../components/Valg';
import { useApp, type Rolle } from '../lib/app-tilstand';
import { gaFrem, settRetning } from '../lib/overgang';
import { farger, regler } from '../lib/tema';

type Steg = 'velkommen' | 'rolle' | 'vipps' | 'alder' | 'bankid' | 'foresatt' | 'vilkar' | 'omvisning';

const vippsOransje = '#FF5B24';

// Første gang appen åpnes: velg rolle, logg inn, godta vilkår og en kort omvisning.
export default function Oppstart() {
  const { data, endre, visToast } = useApp();
  const [steg, setSteg] = useState<Steg>(() => {
    if (data.innlogget && data.rolle) return 'vilkar';
    return 'velkommen';
  });
  const [historikk, setHistorikk] = useState<Steg[]>([]);
  const [laster, setLaster] = useState(false);
  const [godtatt, setGodtatt] = useState(false);
  const [omvisningSide, setOmvisningSide] = useState(0);
  const [foresatt, setForesatt] = useState(data.ungdom.foresatt);
  const rolle = data.rolle;

  function ga(nytt: Steg) {
    settRetning('frem');
    setHistorikk((h) => [...h, steg]);
    setSteg(nytt);
  }

  function tilbake() {
    settRetning('tilbake');
    const forrige = historikk[historikk.length - 1];
    setHistorikk((h) => h.slice(0, -1));
    if (forrige) setSteg(forrige);
  }

  // Liten pause, så det kjennes som en ekte innlogging. Byttes ut med Vipps Login og BankID senere.
  function vent(ms: number, ferdig: () => void) {
    setLaster(true);
    setTimeout(() => {
      setLaster(false);
      ferdig();
    }, ms);
  }

  function velgRolle(r: Rolle) {
    endre((d) => ({ ...d, rolle: r }));
    ga('vipps');
  }

  function ferdig() {
    endre((d) => ({ ...d, omvisningSett: true }));
    settRetning('rolle');
    router.replace('/');
  }

  const tilbakelenke = historikk.length > 0 ? { onPress: tilbake } : undefined;

  if (steg === 'velkommen') {
    return (
      <Skjerm nokkel={steg} hjelp={false}>
        <View style={styles.logoRamme}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            accessibilityLabel="Hverdagshelten-logoen: to hender som holder hverandre, med et hjerte over"
          />
        </View>
        <View style={styles.midtstilt}>
          <Tekst variant="tittel" accessibilityRole="header" style={styles.sentrert}>
            Hverdagshelten
          </Tekst>
          <Tekst variant="stor" farge={farger.lilla} style={styles.sentrert}>
            En hjelpende hånd.
          </Tekst>
        </View>
        <Tekst variant="brod" style={styles.sentrert}>
          Ungdom i nabolaget hjelper eldre med handling, hagearbeid, turer og en hyggelig prat.
        </Tekst>
        <Knapp ikon={ArrowRight} ikonEtter tekst="Kom i gang" onPress={() => ga('rolle')} />
      </Skjerm>
    );
  }

  if (steg === 'rolle') {
    return (
      <Skjerm nokkel={steg} tilbake={tilbakelenke} hjelp={false}>
        <Overskrift tittel="Hva vil du gjøre?" undertekst="Du kan bytte senere." />
        <View style={styles.knapper}>
          <Knapp ikon={Heart} tekst="Jeg trenger hjelp" onPress={() => velgRolle('eldre')} />
          <Tekst variant="under" style={styles.sentrert}>
            For eldre, og for deg som bestiller for mor, far eller en nabo.
          </Tekst>
          <Knapp ikon={HandHeart} tekst="Jeg vil hjelpe" onPress={() => velgRolle('ungdom')} />
          <Tekst variant="under" style={styles.sentrert}>
            For ungdom fra {regler.minsteAlder} år som vil tjene litt penger.
          </Tekst>
        </View>
      </Skjerm>
    );
  }

  if (steg === 'vipps') {
    return (
      <Skjerm nokkel={steg} tilbake={tilbakelenke} hjelp={false}>
        <Overskrift
          tittel="Logg inn med Vipps"
          undertekst="Da slipper du å huske et nytt passord, og vi vet hvem du er."
        />
        <Kort>
          <Punkt ikon={ShieldCheck} tekst="Vi får bare navn, telefonnummer og adresse fra Vipps." />
          <Punkt ikon={UserCheck} tekst="Vi ber aldri om fødselsnummer eller passord." />
        </Kort>
        <Knapp
          tekst="Logg inn med Vipps"
          laster={laster}
          style={{ backgroundColor: vippsOransje }}
          onPress={() =>
            vent(1200, () => {
              endre((d) => ({ ...d, innlogget: true }));
              ga(rolle === 'ungdom' ? 'alder' : 'vilkar');
            })
          }
        />
        <Infoboks tekst="Dette er en testversjon. Innloggingen er ikke ekte ennå, så ingen opplysninger sendes til Vipps." />
      </Skjerm>
    );
  }

  if (steg === 'alder') {
    const alder = data.ungdom.alder;
    const forUng = alder < regler.minsteAlder;
    return (
      <Skjerm nokkel={steg} tilbake={tilbakelenke} hjelp={false}>
        <Overskrift
          tittel="Hvor gammel er du?"
          undertekst={`Du må være minst ${regler.minsteAlder} år for å hjelpe.`}
        />
        <Chiprad>
          {[12, 13, 14, 15, 16, 17, 18, 19].map((a) => (
            <Chip
              key={a}
              tekst={a === 19 ? '19 eller eldre' : `${a} år`}
              valgt={alder === a}
              onPress={() => endre((d) => ({ ...d, ungdom: { ...d.ungdom, alder: a } }))}
            />
          ))}
        </Chiprad>
        {forUng ? (
          <Infoboks
            tekst={`Så kjekt at du vil hjelpe! Du kan bli hverdagshelt fra du er ${regler.minsteAlder} år. Spør gjerne en voksen om å hjelpe naboen sammen med deg så lenge.`}
          />
        ) : (
          <Knapp ikon={ArrowRight} ikonEtter tekst="Neste" onPress={() => ga('bankid')} />
        )}
      </Skjerm>
    );
  }

  if (steg === 'bankid') {
    return (
      <Skjerm nokkel={steg} tilbake={tilbakelenke} hjelp={false}>
        <Overskrift
          tittel="Bekreft hvem du er"
          undertekst="Alle hjelpere bekrefter seg med BankID, så de eldre kan være trygge."
        />
        <Kort>
          <Punkt ikon={BadgeCheck} tekst="Du får merket «Sjekket av Hverdagshelten» når teamet har godkjent deg." />
        </Kort>
        <Knapp
          tekst={data.ungdom.bankId ? 'Bekreftet med BankID' : 'Bekreft med BankID'}
          variant={data.ungdom.bankId ? 'gronn' : 'hoved'}
          laster={laster}
          onPress={() =>
            vent(1200, () => {
              endre((d) => ({ ...d, ungdom: { ...d.ungdom, bankId: true } }));
              ga(data.ungdom.alder < 18 ? 'foresatt' : 'vilkar');
            })
          }
        />
        <Infoboks tekst="Testversjon: BankID er ikke koblet til ennå." />
      </Skjerm>
    );
  }

  if (steg === 'foresatt') {
    const klar = foresatt.navn.trim().length > 1 && foresatt.telefon.replace(/\D/g, '').length >= 8;
    return (
      <Skjerm nokkel={steg} tilbake={tilbakelenke} hjelp={false}>
        <Overskrift
          tittel="Foresatt må godkjenne"
          undertekst="Du er under 18, så en foresatt må si ja før du kan ta oppdrag."
        />
        <Tekstfelt
          etikett="Navn på foresatt"
          value={foresatt.navn}
          onChangeText={(navn) => setForesatt((f) => ({ ...f, navn }))}
          autoComplete="name"
        />
        <Tekstfelt
          etikett="Mobilnummeret til foresatt"
          value={foresatt.telefon}
          onChangeText={(telefon) => setForesatt((f) => ({ ...f, telefon }))}
          keyboardType="phone-pad"
          hjelpetekst="Vi sender en SMS med lenke, så de kan godkjenne med BankID."
        />
        <Knapp
          tekst="Send til foresatt"
          laster={laster}
          deaktivert={!klar}
          onPress={() =>
            vent(1500, () => {
              endre((d) => ({ ...d, ungdom: { ...d.ungdom, foresatt, foresattGodkjent: true } }));
              visToast(`${foresatt.navn.split(' ')[0]} har godkjent. Du kan ta oppdrag!`);
              ga('vilkar');
            })
          }
        />
        <Infoboks tekst="Testversjon: ingen SMS sendes. Godkjenningen skjer automatisk." />
      </Skjerm>
    );
  }

  if (steg === 'vilkar') {
    return (
      <Skjerm nokkel={steg} tilbake={tilbakelenke} hjelp={false}>
        <Overskrift tittel="Før vi begynner" undertekst="Det viktigste fra vilkårene og personvernet, kort fortalt." />
        <Kort>
          <Punkt ikon={HandHeart} tekst="Hverdagshelten setter folk i kontakt. Hjelperne er ungdom fra nabolaget." />
          <Punkt
            ikon={ShieldCheck}
            tekst="Vi lagrer bare det vi trenger, i Europa, og selger aldri opplysningene dine."
          />
          <Punkt ikon={UserCheck} tekst="Adresse og telefonnummer vises bare til den som har en avtalt jobb." />
          <Punkt ikon={Heart} tekst="All betaling skjer i appen. Ingen kontanter." />
        </Kort>
        <Listevalg
          tittel="Les brukervilkårene"
          undertekst="Hva vi har ansvar for, avlysning og klage"
          onPress={() => gaFrem({ pathname: '/info/[side]', params: { side: 'vilkar' } })}
        />
        <Listevalg
          tittel="Les personvernerklæringen"
          undertekst="Hva vi lagrer, hvorfor og hvor lenge"
          onPress={() => gaFrem({ pathname: '/info/[side]', params: { side: 'personvern' } })}
        />
        <Avkrysning
          tekst="Jeg har lest og godtar vilkårene og personvernerklæringen."
          valgt={godtatt}
          onEndre={setGodtatt}
        />
        <Knapp
          tekst="Godta og fortsett"
          deaktivert={!godtatt}
          onPress={() => {
            endre((d) => ({ ...d, vilkarGodtatt: true }));
            if (data.omvisningSett) ferdig();
            else ga('omvisning');
          }}
        />
      </Skjerm>
    );
  }

  const sider =
    rolle === 'ungdom'
      ? [
          {
            ikon: CalendarDays,
            tittel: 'Finn et oppdrag',
            tekst: 'På Hjem ser du ledige oppdrag nær deg. Du ser bare området, ikke adressen.',
          },
          {
            ikon: BadgeCheck,
            tittel: 'Ta oppdraget',
            tekst: 'Når oppdraget er ditt, ser du adressen og kan trykke «Vis veien».',
          },
          {
            ikon: MessageCircleHeart,
            tittel: 'Vi er her for deg',
            tekst: 'Trykk «Hjelp» øverst på skjermen hvis du lurer på noe.',
          },
        ]
      : [
          { ikon: Heart, tittel: 'Bestill hjelp', tekst: 'Trykk «Bestill hjelp» på forsiden. Det tar tre enkle steg.' },
          { ikon: CalendarDays, tittel: 'Se avtalene dine', tekst: 'Under «Avtaler» ser du hvem som kommer, og når.' },
          {
            ikon: MessageCircleHeart,
            tittel: 'Vi er her for deg',
            tekst: 'Trykk «Hjelp» øverst på skjermen, så får du snakke med oss.',
          },
        ];
  const side = sider[omvisningSide];
  const siste = omvisningSide === sider.length - 1;

  return (
    <Skjerm nokkel={`omvisning-${omvisningSide}`} hjelp={false}>
      <Tekst variant="under" vekt={700} farge={farger.lilla}>
        {omvisningSide + 1} av {sider.length}
      </Tekst>
      <View style={styles.omvisning}>
        <View style={styles.storIkon}>
          <side.ikon size={56} color={farger.morkLilla} strokeWidth={1.6} />
        </View>
        <Tekst variant="tittel" style={styles.sentrert}>
          {side.tittel}
        </Tekst>
        <Tekst variant="stor" vekt={400} style={styles.sentrert}>
          {side.tekst}
        </Tekst>
      </View>
      <Knapp
        ikon={ArrowRight}
        ikonEtter
        tekst={siste ? 'Start' : 'Neste'}
        onPress={() => {
          if (siste) ferdig();
          else {
            settRetning('frem');
            setOmvisningSide((s) => s + 1);
          }
        }}
      />
      {!siste && <Knapp variant="sekundar" tekst="Hopp over" onPress={ferdig} />}
    </Skjerm>
  );
}

function Punkt({ ikon, tekst }: { ikon: typeof Heart; tekst: string }) {
  return (
    <View style={styles.punkt}>
      <Ikonboks ikon={ikon} />
      <Tekst variant="brod" style={styles.flex}>
        {tekst}
      </Tekst>
    </View>
  );
}

const styles = StyleSheet.create({
  logoRamme: {
    alignItems: 'center',
    marginTop: 24,
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 36,
  },
  midtstilt: {
    alignItems: 'center',
    gap: 4,
  },
  sentrert: {
    textAlign: 'center',
  },
  knapper: {
    gap: 10,
    marginTop: 8,
  },
  punkt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flex: {
    flex: 1,
  },
  omvisning: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 24,
  },
  storIkon: {
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: farger.fersken,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
