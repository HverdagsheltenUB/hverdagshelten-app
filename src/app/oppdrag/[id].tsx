import { Redirect, useLocalSearchParams } from 'expo-router';
import {
  Banknote,
  Camera,
  Check,
  Clock,
  Flag,
  Footprints,
  Lock,
  MapPin,
  Navigation,
  Phone,
  ShoppingBasket,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { useBekreft } from '../../components/Dialog';
import { Infoboks, Nodknapp, Omradebilde } from '../../components/Ekstra';
import { Knapp } from '../../components/Knapp';
import { Ikonboks, Kort, Skillelinje } from '../../components/Kort';
import { Listevalg } from '../../components/Listevalg';
import { Skjerm } from '../../components/Skjerm';
import { Tekstfelt } from '../../components/Skjema';
import { Overskrift, Pille, Stjerner } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { useApp } from '../../lib/app-tilstand';
import { hentBilde } from '../../lib/bilde';
import { dagnavn, tidsrom, timerTil, varighetTekst } from '../../lib/dato';
import { avstandTekst, megUngdom, tittelFor } from '../../lib/eksempeldata';
import { gaFrem, gaTilbake } from '../../lib/overgang';
import { useOppdrag } from '../../lib/utvalg';
import { kroner, prisFor, regler } from '../../lib/tema';
import { ring, visVeien } from '../../lib/veibeskrivelse';

// Et oppdrag sett fra ungdommen.
export default function Oppdragsdetaljer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const oppdrag = useOppdrag(id);
  const { data, taOppdrag, endreOppdrag, visToast } = useApp();
  const bekreft = useBekreft();
  const [ferdigSteg, setFerdigSteg] = useState(false);
  const [utlegg, setUtlegg] = useState('');
  const [kvittering, setKvittering] = useState<string>();

  if (!oppdrag) return <Redirect href="/" />;
  const o = oppdrag;
  const mitt = o.hjelperId === megUngdom.id;
  const ledig = o.status === 'sendt' && !o.hjelperId;
  const aktivtMitt = mitt && o.status === 'bekreftet';
  const belop = prisFor(o.varighet).hjelp;
  const foresatt = data.ungdom.foresatt.navn.split(' ')[0];
  const varsleForesatt = data.ungdom.alder < 18 && data.ungdom.varselTilForesatt;
  const kanAvlyse = timerTil(o.dato, o.start) >= regler.avlysFristTimer;

  async function ta() {
    if (!data.ungdom.quizBestatt) {
      visToast('Ta den korte quizen først, så er du klar.');
      gaFrem('/quiz');
      return;
    }
    const ja = await bekreft({
      tittel: 'Ta oppdraget?',
      tekst: `${tittelFor(o)} hos ${o.mottaker.fornavn}, ${dagnavn(o.dato).toLowerCase()} kl. ${tidsrom(o.start, o.varighet)}.`,
      ja: 'Ja, jeg tar det',
    });
    if (!ja) return;
    taOppdrag(o.id);
    visToast(`Oppdraget er ditt! ${o.mottaker.fornavn} har fått beskjed.`);
  }

  async function avlys() {
    const ja = await bekreft({
      tittel: 'Er du sikker på at du vil avlyse?',
      tekst: `${o.mottaker.fornavn} får beskjed, og oppdraget blir ledig for andre.`,
      ja: 'Ja, avlys',
      farlig: true,
    });
    if (!ja) return;
    endreOppdrag(o.id, { status: 'sendt', hjelperId: undefined, paVei: false });
    gaTilbake('/avtaler');
    visToast('Oppdraget er avlyst.');
  }

  function ferdig() {
    const kr = Math.round(Number(utlegg.replace(',', '.').replace(/[^\d.]/g, '')) || 0);
    endreOppdrag(o.id, { status: 'ferdig', paVei: false, utlegg: kr || undefined, kvitteringBilde: kvittering });
    setFerdigSteg(false);
    const parorende = o.bestiltAvMeg && data.parorende.some((p) => p.faarBeskjed);
    visToast(
      `Flott jobbet! ${o.mottaker.fornavn}${parorende ? ' og pårørende' : ''}${varsleForesatt ? ` og ${foresatt}` : ''} har fått beskjed.`,
    );
  }

  async function bilde() {
    const { uri, feil } = await hentBilde(true);
    if (feil) visToast(feil);
    if (uri) setKvittering(uri);
  }

  return (
    <Skjerm tilbake={{}}>
      <View style={styles.topp}>
        <View style={styles.piller}>
          <Pille tekst={varighetTekst(o.varighet)} />
          {aktivtMitt && <Pille tekst="Ditt oppdrag" variant="gronn" />}
          {mitt && o.status === 'ferdig' && <Pille tekst="Fullført" variant="lilla" />}
        </View>
        <Overskrift
          tittel={tittelFor(o)}
          undertekst={`${o.mottaker.fornavn}${o.mottaker.alder ? `, ${o.mottaker.alder} år` : ''}`}
        />
      </View>

      {!mitt && !ledig && <Infoboks tekst="Dette oppdraget er ikke ledig lenger." />}

      {aktivtMitt ? (
        <Kort>
          <Detalj ikon={MapPin} tekst={o.mottaker.adresse} under={o.mottaker.omrade} />
          <Knapp
            ikon={Navigation}
            tekst="Vis veien"
            onPress={async () => {
              if (!(await visVeien(o.mottaker.adresse)))
                visToast('Vi fikk ikke åpnet kartet. Sjekk internett og prøv igjen.');
            }}
          />
          {o.mottaker.telefon !== '' && (
            <Knapp
              variant="sekundar"
              ikon={Phone}
              tekst={`Ring ${o.mottaker.fornavn}`}
              onPress={async () => {
                if (!(await ring(o.mottaker.telefon)))
                  visToast(`Vi fikk ikke ringt. Nummeret er ${o.mottaker.telefon}.`);
              }}
            />
          )}
        </Kort>
      ) : (
        ledig && <Omradebilde omrade={o.mottaker.omrade} avstand={avstandTekst(o.avstandKm)} />
      )}

      <Kort>
        <Detalj ikon={Clock} tekst={`${dagnavn(o.dato)} kl. ${tidsrom(o.start, o.varighet)}`} />
        {!aktivtMitt && (
          <Detalj ikon={MapPin} tekst={o.mottaker.omrade} under={`${avstandTekst(o.avstandKm)} unna deg`} />
        )}
        <Detalj ikon={Banknote} tekst={`Du får ${kroner(belop)}`} under="Utbetales til deg den første i neste måned" />
      </Kort>

      {ledig && (
        <Infoboks
          ikon={Lock}
          tekst="Du ser den fulle adressen og telefonnummeret når oppdraget er ditt. Det skjules igjen når oppdraget er ferdig."
        />
      )}
      {mitt && o.status === 'ferdig' && (
        <Infoboks ikon={Lock} tekst="Adressen og telefonnummeret er skjult nå som oppdraget er ferdig." />
      )}

      {(o.beskjed !== '' || o.tingAVite.length > 0 || o.handleliste !== '') && (
        <Kort>
          {o.beskjed !== '' && (
            <View style={styles.gruppe}>
              <Tekst variant="under" vekt={600}>
                Beskjed fra {o.mottaker.fornavn}
              </Tekst>
              <Tekst variant="brod">«{o.beskjed}»</Tekst>
            </View>
          )}
          {o.tingAVite.length > 0 && <Detalj ikon={UserRound} tekst="Greit å vite" under={o.tingAVite.join(', ')} />}
          {o.handleliste !== '' && (mitt || ledig) && (
            <Detalj ikon={ShoppingBasket} tekst="Handleliste" under={o.handleliste} />
          )}
          {o.handlelisteBilde && aktivtMitt && (
            <Image
              source={{ uri: o.handlelisteBilde }}
              style={styles.bilde}
              accessibilityLabel="Bilde av handlelisten"
            />
          )}
        </Kort>
      )}

      {ledig && <Knapp tekst="Ta oppdraget" onPress={ta} />}

      {aktivtMitt && !ferdigSteg && (
        <View style={styles.knapper}>
          {o.paVei ? (
            <Pille tekst={`${o.mottaker.fornavn} vet at du er på vei`} variant="gronn" />
          ) : (
            <Knapp
              variant="sekundar"
              ikon={Footprints}
              tekst="Jeg er på vei"
              onPress={() => {
                endreOppdrag(o.id, { paVei: true });
                visToast(`${o.mottaker.fornavn}${varsleForesatt ? ` og ${foresatt}` : ''} har fått beskjed.`);
              }}
            />
          )}
          <Knapp
            variant="gronn"
            ikon={Check}
            tekst="Oppdraget er ferdig"
            onPress={async () => {
              if (o.kategori === 'Handling') {
                setFerdigSteg(true);
                return;
              }
              const ja = await bekreft({ tittel: 'Er oppdraget ferdig?', ja: 'Ja, ferdig' });
              if (ja) ferdig();
            }}
          />
        </View>
      )}

      {aktivtMitt && ferdigSteg && (
        <Kort>
          <Tekst variant="mellomtittel">Hva kostet varene?</Tekst>
          <Tekstfelt
            etikett="Beløp på kvitteringen (kr)"
            keyboardType="numeric"
            value={utlegg}
            onChangeText={setUtlegg}
          />
          {kvittering ? (
            <Image source={{ uri: kvittering }} style={styles.bilde} accessibilityLabel="Bilde av kvitteringen" />
          ) : (
            <Knapp variant="sekundar" ikon={Camera} tekst="Ta bilde av kvitteringen" onPress={bilde} />
          )}
          <Tekst variant="under">{o.mottaker.fornavn} betaler deg tilbake for varene sammen med oppdraget.</Tekst>
          <Knapp variant="gronn" ikon={Check} tekst="Fullfør oppdraget" onPress={ferdig} />
        </Kort>
      )}

      {mitt && o.status === 'ferdig' && o.vurdering && (
        <Kort>
          <Tekst variant="under" vekt={600}>
            Vurdering fra {o.mottaker.fornavn}
          </Tekst>
          <Stjerner antall={o.vurdering} />
          {o.takk && <Tekst variant="brod">«{o.takk}»</Tekst>}
        </Kort>
      )}

      {aktivtMitt && (
        <>
          <Skillelinje />
          {kanAvlyse ? (
            <Knapp variant="sekundar" ikon={X} tekst="Avlys oppdraget" onPress={avlys} />
          ) : (
            <Infoboks
              tekst={`Det er mindre enn ${regler.avlysFristTimer} timer til oppdraget. Kan du ikke komme, må du ringe eller skrive til teamet, så vi finner en annen.`}
            />
          )}
          <Listevalg
            ikon={Flag}
            tittel="Meld fra om noe"
            undertekst="Hvis noe ikke føltes riktig"
            onPress={() => gaFrem({ pathname: '/melde-fra', params: { id: o.id } })}
          />
          <Nodknapp />
        </>
      )}
    </Skjerm>
  );
}

function Detalj({ ikon, tekst, under }: { ikon: LucideIcon; tekst: string; under?: string }) {
  return (
    <View style={styles.rad}>
      <Ikonboks ikon={ikon} />
      <View style={styles.flex}>
        <Tekst variant="listetittel">{tekst}</Tekst>
        {under && <Tekst variant="under">{under}</Tekst>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topp: {
    gap: 10,
  },
  piller: {
    flexDirection: 'row',
    gap: 8,
  },
  rad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flex: {
    flex: 1,
  },
  gruppe: {
    gap: 4,
  },
  knapper: {
    gap: 10,
  },
  bilde: {
    width: '100%',
    height: 180,
    borderRadius: 14,
  },
});
