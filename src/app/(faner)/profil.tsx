import { router } from 'expo-router';
import {
  BookOpen,
  Camera,
  Database,
  FileText,
  GraduationCap,
  Lock,
  LogOut,
  MessageCircleHeart,
  Pencil,
  ShieldCheck,
} from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useBekreft } from '../../components/Dialog';
import { Knapp } from '../../components/Knapp';
import { Listevalg } from '../../components/Listevalg';
import { Skjerm } from '../../components/Skjerm';
import { Avatar, Pille, Seksjon, Statboks, Statrad } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { Tekstglider } from '../../components/Tekstglider';
import { useApp } from '../../lib/app-tilstand';
import { useAnnonser } from '../../lib/annonser';
import { hentFlereBilder } from '../../lib/bilde';
import { kontaktEpost } from '../../lib/kontaktinfo';
import { useKonto } from '../../lib/konto';
import { gaFrem, settRetning } from '../../lib/overgang';
import { farger } from '../../lib/tema';

const info = (side: string) => () => gaFrem({ pathname: '/info/[side]', params: { side } });

export default function Profil() {
  const { data, nullstill } = useApp();
  const { profil, epost, loggUt, byttProfilbilde, session } = useKonto();
  const { visToast } = useApp();
  const bekreft = useBekreft();
  const [lasterBilde, setLasterBilde] = useState(false);
  const { annonser: oppdrag } = useAnnonser({ hjelperId: session?.user.id ?? 'ingen' });
  const fullfort = oppdrag.filter((a) => a.status === 'ferdig');
  const stjerner = fullfort.filter((a) => a.vurdering);
  const snitt = stjerner.length
    ? (stjerner.reduce((s, a) => s + (a.vurdering ?? 0), 0) / stjerner.length).toFixed(1).replace('.', ',')
    : null;

  async function byttBilde() {
    const { uris, feil } = await hentFlereBilder(1);
    if (feil) visToast(feil);
    if (!uris[0]) return;
    setLasterBilde(true);
    const svar = await byttProfilbilde(uris[0]);
    setLasterBilde(false);
    visToast(svar.feil ?? 'Profilbildet er lagret.');
  }
  const ungdom = profil?.rolle === 'ungdom';
  const navn = profil?.navn?.trim() || 'Uten navn';

  return (
    <Skjerm>
      <View style={styles.topp}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={profil?.bilde ? 'Bytt profilbilde' : 'Legg til profilbilde'}
          onPress={byttBilde}
          style={styles.bildeknapp}
        >
          <Avatar bokstav={navn[0]?.toUpperCase() ?? '?'} storrelse={96} bilde={profil?.bilde} />
          <View style={styles.kamera}>
            {lasterBilde ? <ActivityIndicator color={farger.hvit} size="small" /> : <Camera size={18} color={farger.hvit} />}
          </View>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={byttBilde} hitSlop={8}>
          <Tekst variant="brodLiten" vekt={700} farge={farger.lilla}>
            {profil?.bilde ? 'Bytt profilbilde' : 'Legg til profilbilde'}
          </Tekst>
        </Pressable>
        <Tekst variant="tittel" style={styles.midtstilt}>
          {navn}
        </Tekst>
        <Tekst variant="under">{epost}</Tekst>
        <View>
          <Pille tekst={ungdom ? 'Vil hjelpe' : 'Trenger hjelp'} variant="lilla" />
        </View>
      </View>

      <Listevalg
        ikon={Pencil}
        tittel="Om meg"
        undertekst={profil?.omrade ? `Navn og område · ${profil.omrade}` : 'Navn, område og rolle'}
        onPress={() => gaFrem('/om-meg')}
      />
      {ungdom && (
        <Statrad>
          <Statboks etikett="Oppdrag fullført" verdi={String(fullfort.length)} />
          <Statboks etikett="Vurdering" verdi={snitt ?? '–'} stjerne={Boolean(snitt)} />
        </Statrad>
      )}

      <Tekstglider />

      {ungdom && (
        <>
          <Seksjon tittel="For hjelpere" />
          <Listevalg
            ikon={BookOpen}
            tittel="Retningslinjer"
            undertekst="Slik er du en god hverdagshelt"
            onPress={info('retningslinjer')}
          />
          <Listevalg
            ikon={GraduationCap}
            tittel={data.quizBestatt ? 'Quiz bestått ✓' : 'Ta quizen'}
            undertekst="Fem korte spørsmål før første oppdrag"
            onPress={() => gaFrem('/quiz')}
          />
        </>
      )}

      <Seksjon tittel="Trygghet og personvern" />
      <Listevalg ikon={ShieldCheck} tittel="Trygghet" undertekst="Slik jobber vi med trygghet" onPress={info('trygghet')} />
      <Listevalg ikon={Lock} tittel="Personvern" undertekst="Hva vi lagrer, og hvorfor" onPress={info('personvern')} />
      <Listevalg ikon={FileText} tittel="Brukervilkår" undertekst="Ansvar og regler" onPress={info('vilkar')} />
      <Listevalg
        ikon={Database}
        tittel="Mine opplysninger"
        undertekst="Se det vi har lagret, eller slett kontoen"
        onPress={() => gaFrem('/mine-data')}
      />

      <View style={styles.kontakt}>
        <Knapp ikon={MessageCircleHeart} tekst="Kontakt oss" onPress={() => gaFrem('/kontakt')} />
        <Tekst variant="under" style={styles.midtstilt}>
          Skriv til oss i appen, eller send e-post til {kontaktEpost}.
        </Tekst>
      </View>

      <Knapp
        variant="sekundar"
        ikon={LogOut}
        tekst="Logg ut"
        onPress={async () => {
          const ja = await bekreft({
            tittel: 'Logge ut?',
            tekst: 'Annonsene dine blir liggende. Du logger inn igjen med e-post og passord.',
            ja: 'Ja, logg ut',
          });
          if (!ja) return;
          await loggUt();
          nullstill();
          settRetning('rolle');
          router.replace('/oppstart');
        }}
      />
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  topp: { alignItems: 'center', gap: 6, marginBottom: 4 },
  kontakt: { gap: 10, marginTop: 4 },
  midtstilt: { textAlign: 'center' },
  bildeknapp: { position: 'relative' },
  kamera: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: farger.lilla,
    borderWidth: 2,
    borderColor: farger.krem,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
