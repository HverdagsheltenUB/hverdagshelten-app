import { router } from 'expo-router';
import {
  BookOpen,
  Database,
  FileText,
  GraduationCap,
  Lock,
  LogOut,
  Megaphone,
  MessageCircleHeart,
  Pencil,
  ShieldCheck,
} from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useBekreft } from '../../components/Dialog';
import { Knapp } from '../../components/Knapp';
import { Kort } from '../../components/Kort';
import { Listevalg } from '../../components/Listevalg';
import { Skjerm } from '../../components/Skjerm';
import { Avatar, Pille, Seksjon } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { BryterRad } from '../../components/Valg';
import { useApp } from '../../lib/app-tilstand';
import { kontaktEpost } from '../../lib/kontaktinfo';
import { useKonto } from '../../lib/konto';
import { gaFrem, gaTilFane, settRetning } from '../../lib/overgang';

const info = (side: string) => () => gaFrem({ pathname: '/info/[side]', params: { side } });

export default function Profil() {
  const { data, settStorreTekst, nullstill } = useApp();
  const { profil, epost, loggUt } = useKonto();
  const bekreft = useBekreft();
  const ungdom = profil?.rolle === 'ungdom';
  const navn = profil?.navn?.trim() || 'Uten navn';

  return (
    <Skjerm>
      <View style={styles.topp}>
        <Avatar bokstav={navn[0]?.toUpperCase() ?? '?'} storrelse={72} />
        <Tekst variant="tittel" style={styles.midtstilt}>
          {navn}
        </Tekst>
        <Tekst variant="under">{epost}</Tekst>
        <Pille tekst={ungdom ? 'Vil hjelpe' : 'Trenger hjelp'} variant="lilla" />
      </View>

      <Listevalg
        ikon={Pencil}
        tittel="Om meg"
        undertekst={profil?.omrade ? `Navn og område · ${profil.omrade}` : 'Navn, område og rolle'}
        onPress={() => gaFrem('/om-meg')}
      />
      <Listevalg
        ikon={Megaphone}
        tittel="Mine annonser"
        undertekst="Se, endre og slett det du har lagt ut"
        onPress={() => gaTilFane('/mine')}
      />

      <Kort>
        <BryterRad etikett="Større tekst" pa={data.storreTekst} onEndre={settStorreTekst} />
      </Kort>

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
});
