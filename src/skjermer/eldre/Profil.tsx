import {
  CreditCard,
  Database,
  FileText,
  Lock,
  MessageCircleHeart,
  Pencil,
  ShieldCheck,
  Users,
} from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Knapp } from '../../components/Knapp';
import { Kort, Skillelinje } from '../../components/Kort';
import { Listevalg } from '../../components/Listevalg';
import { Rollebryter } from '../../components/Rollebryter';
import { Skjerm } from '../../components/Skjerm';
import { Avatar, Seksjon } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { BryterRad } from '../../components/Valg';
import { useApp, type Data } from '../../lib/app-tilstand';
import { kontaktEpost } from '../../lib/eksempeldata';
import { gaFrem } from '../../lib/overgang';

const info = (side: string) => () => gaFrem({ pathname: '/info/[side]', params: { side } });

export function Profil() {
  const { data, endre, settStorreTekst } = useApp();
  const { eldre, varsler, parorende } = data;
  const settVarsel = (n: keyof Data['varsler']) => (pa: boolean) =>
    endre((d) => ({ ...d, varsler: { ...d.varsler, [n]: pa } }));

  return (
    <Skjerm>
      <View style={styles.topp}>
        <Avatar bokstav={eldre.fornavn[0] ?? 'A'} storrelse={72} />
        <Tekst variant="tittel">{eldre.navn}</Tekst>
        <Tekst variant="under">{eldre.adresse}</Tekst>
      </View>

      <Listevalg
        ikon={Pencil}
        tittel="Om meg"
        undertekst={
          eldre.tingAVite.length > 0
            ? `Hjelperen får vite: ${eldre.tingAVite.join(', ').toLowerCase()}`
            : 'Navn, adresse og ting hjelperen bør vite'
        }
        onPress={() => gaFrem('/om-meg')}
      />

      <Kort>
        <BryterRad etikett="Større tekst" pa={data.storreTekst} onEndre={settStorreTekst} />
      </Kort>

      <Seksjon tittel="Varsler" />
      <Kort>
        <BryterRad
          etikett="Påminnelse dagen før og en time før"
          pa={varsler.paminnelse}
          onEndre={settVarsel('paminnelse')}
        />
        <Skillelinje />
        <BryterRad
          etikett="Beskjed når en hjelper har sagt ja"
          pa={varsler.bekreftelse}
          onEndre={settVarsel('bekreftelse')}
        />
        <Skillelinje />
        <BryterRad etikett="Også på SMS" pa={varsler.sms} onEndre={settVarsel('sms')} />
      </Kort>

      <Kort>
        <Tekst variant="under" vekt={600}>
          Pårørende som får beskjed
        </Tekst>
        {parorende.length === 0 && <Tekst variant="brod">Ingen lagt til ennå.</Tekst>}
        {parorende.map((p) => (
          <View key={p.id}>
            <Tekst variant="listetittel">
              {p.navn} ({p.relasjon})
            </Tekst>
            <Tekst variant="under">
              {p.telefon}
              {p.faarBeskjed ? ' · får beskjed om avtaler' : ''}
            </Tekst>
          </View>
        ))}
        <Knapp liten variant="sekundar" ikon={Users} tekst="Endre pårørende" onPress={() => gaFrem('/parorende')} />
      </Kort>

      <Seksjon tittel="Trygghet og betaling" />
      <Listevalg
        ikon={CreditCard}
        tittel="Betaling"
        undertekst="Vipps · du betaler etter besøket"
        onPress={info('betaling')}
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
        undertekst="Ansvar, avlysning og klage"
        onPress={info('vilkar')}
      />
      <Listevalg
        ikon={Database}
        tittel="Mine opplysninger"
        undertekst="Se, rett eller slett kontoen"
        onPress={() => gaFrem('/mine-data')}
      />

      <View style={styles.kontakt}>
        <Knapp ikon={MessageCircleHeart} tekst="Kontakt oss" onPress={() => gaFrem('/kontakt')} />
        <Tekst variant="under" style={styles.midtstilt}>
          Skriv til oss i appen, eller send e-post til {kontaktEpost}.
        </Tekst>
      </View>

      <Rollebryter />
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  topp: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  kontakt: {
    gap: 10,
    marginTop: 4,
  },
  midtstilt: {
    textAlign: 'center',
  },
});
