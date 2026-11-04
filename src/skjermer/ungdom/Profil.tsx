import {
  BookOpen,
  Clock,
  Database,
  FileText,
  GraduationCap,
  Lock,
  MessageCircleHeart,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { SjekketMerke } from '../../components/Ekstra';
import { Knapp } from '../../components/Knapp';
import { Kort, Skillelinje } from '../../components/Kort';
import { Listevalg } from '../../components/Listevalg';
import { Rollebryter } from '../../components/Rollebryter';
import { Skjerm } from '../../components/Skjerm';
import { Avatar, Pille, Seksjon, Statboks, Statrad } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { BryterRad, Chip, Chiprad } from '../../components/Valg';
import { useApp } from '../../lib/app-tilstand';
import { kategorier, megUngdom } from '../../lib/eksempeldata';
import { gaFrem } from '../../lib/overgang';
import { useMineOppdrag } from '../../lib/utvalg';

const info = (side: string) => () => gaFrem({ pathname: '/info/[side]', params: { side } });
const hjelpeomrader = kategorier.filter((k) => k.navn !== 'Noe annet').map((k) => k.navn);

export function Profil() {
  const { data, endre, settStorreTekst } = useApp();
  const { ungdom } = data;
  const { fullfort } = useMineOppdrag();
  const settUngdom = (endring: Partial<typeof ungdom>) => endre((d) => ({ ...d, ungdom: { ...d.ungdom, ...endring } }));

  return (
    <Skjerm>
      <View style={styles.topp}>
        <Avatar bokstav={megUngdom.fornavn[0]} storrelse={72} />
        <Tekst variant="tittel">{megUngdom.navn}</Tekst>
        <Tekst variant="under">
          {ungdom.alder} år · {megUngdom.omrade}
        </Tekst>
        <SjekketMerke />
        <View style={styles.piller}>
          <Pille
            tekst={ungdom.bankId ? '✓ Bekreftet med BankID' : 'BankID mangler'}
            variant={ungdom.bankId ? 'gronn' : 'fersken'}
          />
          {ungdom.alder < 18 && (
            <Pille
              tekst={ungdom.foresattGodkjent ? '✓ Foresatt har godkjent' : 'Venter på foresatt'}
              variant={ungdom.foresattGodkjent ? 'gronn' : 'fersken'}
            />
          )}
          {ungdom.quizBestatt && <Pille tekst="✓ Quiz bestått" variant="gronn" />}
        </View>
      </View>

      <Statrad>
        <Statboks etikett="Oppdrag utført" verdi={String(megUngdom.tidligereUtfort + fullfort.length)} />
        <Statboks etikett="Vurdering" verdi={megUngdom.vurdering} stjerne />
      </Statrad>

      <Kort>
        <Tekst variant="mellomtittel">Dette liker jeg å hjelpe med</Tekst>
        <Chiprad>
          {hjelpeomrader.map((navn) => (
            <Chip
              key={navn}
              tekst={navn}
              valgt={ungdom.likerAHjelpeMed.includes(navn)}
              onPress={() =>
                settUngdom({
                  likerAHjelpeMed: ungdom.likerAHjelpeMed.includes(navn)
                    ? ungdom.likerAHjelpeMed.filter((n) => n !== navn)
                    : [...ungdom.likerAHjelpeMed, navn],
                })
              }
            />
          ))}
        </Chiprad>
      </Kort>

      <Kort>
        <BryterRad
          etikett="Varsel om nye oppdrag"
          pa={data.varsler.nyeOppdrag}
          onEndre={(pa) => endre((d) => ({ ...d, varsler: { ...d.varsler, nyeOppdrag: pa } }))}
        />
        <Skillelinje />
        <BryterRad etikett="Større tekst" pa={data.storreTekst} onEndre={settStorreTekst} />
      </Kort>

      <Seksjon tittel="Penger og tid" />
      <Listevalg
        ikon={Wallet}
        tittel="Utbetaling"
        undertekst={`Til ${ungdom.utbetalingTil} · historikk og årsoversikt`}
        onPress={() => gaFrem('/utbetaling')}
      />
      <Listevalg
        ikon={Clock}
        tittel="Når kan jeg hjelpe?"
        undertekst={ungdom.tilgjengelig.join(', ') || 'Ikke valgt'}
        onPress={() => gaFrem('/tilgjengelighet')}
      />
      {ungdom.alder < 18 && (
        <Listevalg
          ikon={Users}
          tittel="Foresatte"
          undertekst={`${ungdom.foresatt.navn} · grenser og varsler`}
          onPress={() => gaFrem('/foresatte')}
        />
      )}

      <Seksjon tittel="Opplæring og trygghet" />
      <Listevalg
        ikon={BookOpen}
        tittel="Retningslinjer"
        undertekst="Slik er du en god hverdagshelt"
        onPress={info('retningslinjer')}
      />
      <Listevalg
        ikon={GraduationCap}
        tittel="Quiz"
        undertekst={ungdom.quizBestatt ? 'Bestått. Ta den gjerne igjen.' : 'Må tas før første oppdrag'}
        onPress={() => gaFrem('/quiz')}
      />
      <Listevalg
        ikon={ShieldCheck}
        tittel="Trygghet"
        undertekst="Slik sjekker vi hjelperne"
        onPress={info('trygghet')}
      />
      <Listevalg ikon={Lock} tittel="Personvern" undertekst="Hva vi lagrer, og hvorfor" onPress={info('personvern')} />
      <Listevalg
        ikon={FileText}
        tittel="Brukervilkår"
        undertekst="Regler for ungdom, avlysning og klage"
        onPress={info('vilkar')}
      />
      <Listevalg
        ikon={Database}
        tittel="Mine opplysninger"
        undertekst="Se eller slett kontoen"
        onPress={() => gaFrem('/mine-data')}
      />

      <Knapp variant="sekundar" ikon={MessageCircleHeart} tekst="Kontakt oss" onPress={() => gaFrem('/kontakt')} />

      <Rollebryter />
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  topp: {
    alignItems: 'center',
    gap: 4,
  },
  piller: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
});
