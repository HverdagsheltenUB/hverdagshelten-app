import { router } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CircleAlert,
  Eye,
  EyeOff,
  HandHeart,
  Heart,
  LogIn,
  MessageCircleHeart,
  ShieldCheck,
  UserCheck,
  UserPlus,
} from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

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
import { supabaseKlar } from '../lib/konfig';
import { kontaktEpost } from '../lib/kontaktinfo';
import { useKonto } from '../lib/konto';
import { gaFrem, settRetning } from '../lib/overgang';
import { farger, regler } from '../lib/tema';

type Steg = 'velkommen' | 'konto' | 'opprett' | 'logginn' | 'rolle' | 'vilkar' | 'omvisning';

const vippsOransje = '#FF5B24';

// Første gang appen åpnes: opprett bruker eller logg inn, godta vilkår og en kort omvisning.
export default function Oppstart() {
  const { data, endre } = useApp();
  const konto = useKonto();
  const [valgtSteg, setSteg] = useState<Steg>(() => {
    if (konto.session && konto.profil && !konto.profil.rolle) return 'rolle';
    if (konto.session) return 'vilkar';
    return 'velkommen';
  });
  const [historikk, setHistorikk] = useState<Steg[]>([]);
  const [laster, setLaster] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [godtatt, setGodtatt] = useState(false);
  const [omvisningSide, setOmvisningSide] = useState(0);
  const [navn, setNavn] = useState('');
  const [rolle, setRolle] = useState<Rolle | null>(null);
  const [epost, setEpost] = useState('');
  const [passord, setPassord] = useState('');
  const [visPassord, setVisPassord] = useState(false);

  // Hvis noen er innlogget men mangler rolle (f.eks. etter innlogging på ny telefon), spør om den.
  const manglerRolle = Boolean(konto.session && konto.profil && !konto.profil.rolle);
  const steg: Steg = manglerRolle ? 'rolle' : valgtSteg;

  function ga(nytt: Steg) {
    settRetning('frem');
    setFeil(null);
    setHistorikk((h) => [...h, steg]);
    setSteg(nytt);
  }

  function tilbake() {
    settRetning('tilbake');
    setFeil(null);
    const forrige = historikk[historikk.length - 1];
    setHistorikk((h) => h.slice(0, -1));
    if (forrige) setSteg(forrige);
  }

  function ferdig() {
    endre((d) => ({ ...d, omvisningSett: true }));
    settRetning('rolle');
    router.replace('/');
  }

  function etterInnlogging() {
    if (data.vilkarGodtatt) ferdig();
    else ga('vilkar');
  }

  const tilbakelenke = historikk.length > 0 ? { onPress: tilbake } : undefined;
  const epostOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost.trim());
  const passordOk = passord.length >= 6;

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
        <Knapp ikon={ArrowRight} ikonEtter tekst="Kom i gang" onPress={() => ga('konto')} />
      </Skjerm>
    );
  }

  if (steg === 'konto') {
    return (
      <Skjerm nokkel={steg} tilbake={tilbakelenke} hjelp={false}>
        <Overskrift tittel="Velkommen!" undertekst="Lag en bruker med e-post og passord, eller logg inn." />
        <Knapp ikon={UserPlus} tekst="Opprett bruker" onPress={() => ga('opprett')} />
        <Knapp variant="sekundar" ikon={LogIn} tekst="Logg inn" onPress={() => ga('logginn')} />
        <View style={styles.kommer}>
          <Tekst variant="under" vekt={700}>
            Kommer snart
          </Tekst>
          <Knapp tekst="Logg inn med Vipps" deaktivert style={{ backgroundColor: vippsOransje }} onPress={() => {}} />
          <Knapp tekst="Bekreft med BankID" variant="sekundar" deaktivert onPress={() => {}} />
          <Tekst variant="underLiten" style={styles.sentrert}>
            Vipps og BankID er ikke koblet til ennå. Bruk e-post og passord i testen.
          </Tekst>
        </View>
        {!supabaseKlar && (
          <Infoboks tekst="Appen er ikke koblet til databasen ennå, så du kan ikke opprette bruker. Si fra til teamet." />
        )}
      </Skjerm>
    );
  }

  if (steg === 'opprett') {
    const klar = navn.trim().length >= 2 && rolle && epostOk && passordOk;
    return (
      <Skjerm nokkel={steg} tilbake={tilbakelenke} hjelp={false}>
        <Overskrift tittel="Opprett bruker" undertekst="Det tar under ett minutt." />
        <Tekstfelt etikett="Navn" hjelpetekst="Vises på annonsene du legger ut." value={navn} onChangeText={setNavn} autoComplete="name" textContentType="name" maxLength={80} />
        <View style={styles.gruppe}>
          <Tekst variant="brodLiten" vekt={700}>
            Hva vil du gjøre?
          </Tekst>
          <Chiprad>
            <Chip tekst="Jeg trenger hjelp" valgt={rolle === 'eldre'} onPress={() => setRolle('eldre')} />
            <Chip tekst="Jeg vil hjelpe" valgt={rolle === 'ungdom'} onPress={() => setRolle('ungdom')} />
          </Chiprad>
        </View>
        <Tekstfelt
          etikett="E-post"
          value={epost}
          onChangeText={setEpost}
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Passordfelt verdi={passord} onEndre={setPassord} vis={visPassord} onVis={setVisPassord} ny />
        {feil && <Infoboks ikon={CircleAlert} tekst={feil} />}
        <Knapp
          tekst="Opprett bruker"
          laster={laster}
          deaktivert={!klar}
          onPress={async () => {
            if (!rolle) return;
            setLaster(true);
            setFeil(null);
            const svar = await konto.opprettBruker({ epost, passord, navn, rolle });
            setLaster(false);
            if (svar.feil) setFeil(svar.feil);
            else etterInnlogging();
          }}
        />
        <Lenke tekst="Har du allerede en bruker? Logg inn" onPress={() => { setSteg('logginn'); setFeil(null); }} />
      </Skjerm>
    );
  }

  if (steg === 'logginn') {
    return (
      <Skjerm nokkel={steg} tilbake={tilbakelenke} hjelp={false}>
        <Overskrift tittel="Logg inn" undertekst="Med e-posten og passordet du valgte." />
        <Tekstfelt
          etikett="E-post"
          value={epost}
          onChangeText={setEpost}
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Passordfelt verdi={passord} onEndre={setPassord} vis={visPassord} onVis={setVisPassord} />
        {feil && <Infoboks ikon={CircleAlert} tekst={feil} />}
        <Knapp
          ikon={LogIn}
          tekst="Logg inn"
          laster={laster}
          deaktivert={!epostOk || passord.length === 0}
          onPress={async () => {
            setLaster(true);
            setFeil(null);
            const svar = await konto.loggInn(epost, passord);
            setLaster(false);
            if (svar.feil) setFeil(svar.feil);
            else etterInnlogging();
          }}
        />
        <Lenke tekst="Ny her? Opprett bruker" onPress={() => { setSteg('opprett'); setFeil(null); }} />
        <Tekst variant="underLiten" style={styles.sentrert}>
          Glemt passordet? Skriv til {kontaktEpost}, så hjelper vi deg.
        </Tekst>
      </Skjerm>
    );
  }

  if (steg === 'rolle') {
    return (
      <Skjerm nokkel={steg} hjelp={false}>
        <Overskrift tittel="Hva vil du gjøre?" undertekst="Du kan bytte senere under Profil." />
        <View style={styles.knapper}>
          <Knapp
            ikon={Heart}
            tekst="Jeg trenger hjelp"
            laster={laster && rolle === 'eldre'}
            onPress={async () => {
              setRolle('eldre');
              setLaster(true);
              const svar = await konto.endreProfil({ rolle: 'eldre' });
              setLaster(false);
              if (svar.feil) setFeil(svar.feil);
              else etterInnlogging();
            }}
          />
          <Tekst variant="under" style={styles.sentrert}>
            For eldre, og for deg som ber om hjelp for mor, far eller en nabo.
          </Tekst>
          <Knapp
            ikon={HandHeart}
            tekst="Jeg vil hjelpe"
            laster={laster && rolle === 'ungdom'}
            onPress={async () => {
              setRolle('ungdom');
              setLaster(true);
              const svar = await konto.endreProfil({ rolle: 'ungdom' });
              setLaster(false);
              if (svar.feil) setFeil(svar.feil);
              else etterInnlogging();
            }}
          />
          <Tekst variant="under" style={styles.sentrert}>
            For ungdom fra {regler.minsteAlder} år som vil tjene litt penger.
          </Tekst>
          {feil && <Infoboks ikon={CircleAlert} tekst={feil} />}
        </View>
      </Skjerm>
    );
  }

  if (steg === 'vilkar') {
    return (
      <Skjerm nokkel={steg} tilbake={tilbakelenke} hjelp={false}>
        <Overskrift tittel="Før vi begynner" undertekst="Det viktigste fra vilkårene og personvernet, kort fortalt." />
        <Kort>
          <Punkt ikon={HandHeart} tekst="Hverdagshelten setter folk i nabolaget i kontakt med hverandre." />
          <Punkt
            ikon={ShieldCheck}
            tekst="Vi lagrer bare det vi trenger, i Europa, og selger aldri opplysningene dine."
          />
          <Punkt ikon={UserCheck} tekst="Andre ser navnet ditt og annonsene dine, aldri e-post, adresse eller telefon." />
          <Punkt ikon={Heart} tekst="Vær snill og ærlig. Annonser som bryter reglene, blir fjernet." />
        </Kort>
        <Listevalg
          tittel="Les brukervilkårene"
          undertekst="Hva vi har ansvar for, og regler for annonser"
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
            endre((d) => ({ ...d, vilkarGodtatt: true, innlogget: true }));
            if (data.omvisningSett) ferdig();
            else ga('omvisning');
          }}
        />
      </Skjerm>
    );
  }

  const ungdom = (konto.profil?.rolle ?? rolle) === 'ungdom';
  const sider =
    ungdom
      ? [
          {
            ikon: CalendarDays,
            tittel: 'Se hvem som trenger hjelp',
            tekst: 'På Hjem ser du annonsene fra folk i nabolaget. Trykk på en annonse for å lese mer.',
          },
          {
            ikon: BadgeCheck,
            tittel: 'Legg ut selv',
            tekst: 'Trykk «Legg ut annonse» hvis du vil selge eller gi bort noe.',
          },
          {
            ikon: MessageCircleHeart,
            tittel: 'Vi er her for deg',
            tekst: 'Trykk «Hjelp» øverst på skjermen hvis du lurer på noe.',
          },
        ]
      : [
          {
            ikon: Heart,
            tittel: 'Be om hjelp',
            tekst: 'Trykk «Legg ut annonse» og skriv hva du trenger hjelp med. Det tar et minutt.',
          },
          {
            ikon: CalendarDays,
            tittel: 'Se annonsene dine',
            tekst: 'Under «Mine annonser» kan du endre eller slette det du har lagt ut.',
          },
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

function Lenke({ tekst, onPress }: { tekst: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} hitSlop={8} style={styles.lenke}>
      <Tekst variant="brod" vekt={700} farge={farger.lilla} style={styles.understrek}>
        {tekst}
      </Tekst>
    </Pressable>
  );
}

function Passordfelt({
  verdi,
  onEndre,
  vis,
  onVis,
  ny = false,
}: {
  verdi: string;
  onEndre: (t: string) => void;
  vis: boolean;
  onVis: (v: boolean) => void;
  ny?: boolean;
}) {
  return (
    <View style={styles.gruppe}>
      <Tekstfelt
        etikett="Passord"
        hjelpetekst={ny ? 'Minst 6 tegn.' : undefined}
        value={verdi}
        onChangeText={onEndre}
        secureTextEntry={!vis}
        autoComplete={ny ? 'new-password' : 'current-password'}
        textContentType={ny ? 'newPassword' : 'password'}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={vis ? 'Skjul passordet' : 'Vis passordet'}
        onPress={() => onVis(!vis)}
        hitSlop={8}
        style={styles.visPassord}
      >
        {vis ? <EyeOff size={20} color={farger.lilla} /> : <Eye size={20} color={farger.lilla} />}
        <Tekst variant="brodLiten" vekt={700} farge={farger.lilla}>
          {vis ? 'Skjul passordet' : 'Vis passordet'}
        </Tekst>
      </Pressable>
    </View>
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
  gruppe: {
    gap: 10,
  },
  kommer: {
    gap: 10,
    marginTop: 12,
    opacity: 0.9,
  },
  lenke: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  understrek: {
    textDecorationLine: 'underline',
  },
  visPassord: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    minHeight: 40,
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
