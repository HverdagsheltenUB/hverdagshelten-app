import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import {
  CircleCheck,
  Flag,
  HandHeart,
  MapPin,
  MessageCircle,
  Navigation,
  PenLine,
  SearchX,
  Trash2,
  Undo2,
} from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Tomtilstand } from '../../components/Annonse';
import { Annonsevisning } from '../../components/Annonsevisning';
import { useBekreft } from '../../components/Dialog';
import { Infoboks, Omradebilde, Stjernevelger } from '../../components/Ekstra';
import { Knapp } from '../../components/Knapp';
import { Kort } from '../../components/Kort';
import { Skjerm } from '../../components/Skjerm';
import { Tekstfelt } from '../../components/Skjema';
import { Avatar, Stjerner } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { useApp } from '../../lib/app-tilstand';
import {
  giTakk,
  kartlenke,
  oppdaterOppdrag,
  sendMelding,
  slettAnnonse,
  slippAnnonse,
  statustekst,
  takkJa,
  useAdresse,
  useAnnonse,
  type Annonse,
} from '../../lib/annonser';
import { fornavn, useKonto } from '../../lib/konto';
import { gaFrem, gaTilbake, settRetning } from '../../lib/overgang';
import { farger } from '../../lib/tema';

// Annonsesiden. Hva man ser, kommer an på om man eier annonsen, har tatt den, eller bare ser på.
export default function Annonseside() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { annonse, laster, feil, oppdater } = useAnnonse(id);
  const { session, profil } = useKonto();

  if (laster) {
    return (
      <Skjerm tilbake={{}}>
        <ActivityIndicator color={farger.lilla} size="large" style={styles.laster} />
      </Skjerm>
    );
  }
  if (!annonse) {
    return (
      <Skjerm tilbake={{}}>
        <Tomtilstand
          ikon={SearchX}
          tittel={feil ? 'Fikk ikke hentet annonsen' : 'Annonsen finnes ikke lenger'}
          tekst={feil ?? 'Den som la den ut, kan ha slettet den.'}
          knapp={{ tekst: 'Til forsiden', onPress: () => gaTilbake('/') }}
        />
      </Skjerm>
    );
  }

  const meg = session?.user.id;
  const min = annonse.bruker_id === meg;
  const hjelper = annonse.hjelper_id === meg && Boolean(meg);

  return (
    <Skjerm tilbake={{ onPress: () => gaTilbake('/') }} oppdater={oppdater}>
      <Annonsevisning
        a={{
          ...annonse,
          navn: annonse.profiler?.navn ?? '',
          bilde: annonse.profiler?.bilde,
          medlemSiden: annonse.profiler?.opprettet,
        }}
      />
      {min ? (
        <Eierpanel annonse={annonse} oppdater={oppdater} />
      ) : hjelper ? (
        <Hjelperpanel annonse={annonse} oppdater={oppdater} />
      ) : (
        <Besokerpanel annonse={annonse} oppdater={oppdater} kanTa={profil?.rolle !== 'eldre'} />
      )}
    </Skjerm>
  );
}

type Panel = { annonse: Annonse; oppdater: () => Promise<void> };

function aapneChat(a: Annonse) {
  gaFrem({ pathname: '/chat/[id]', params: { id: a.id } });
}

// Den som ser på en ledig annonse: områdekart og «Aksepter».
function Besokerpanel({ annonse, oppdater, kanTa }: Panel & { kanTa: boolean }) {
  const { visToast } = useApp();
  const bekreft = useBekreft();
  const [tar, setTar] = useState(false);
  const navn = fornavn(annonse.profiler?.navn) || 'den som la ut annonsen';

  return (
    <View style={styles.knapper}>
      {annonse.sted ? <Omradebilde omrade={annonse.sted} avstand="i nærheten" /> : null}
      {annonse.status === 'ledig' ? (
        kanTa ? (
          <>
            <Knapp
              ikon={HandHeart}
              tekst={annonse.type === 'hjelp' ? 'Takk ja' : 'Jeg vil ha den'}
              laster={tar}
              onPress={async () => {
                const ja = await bekreft({
                  tittel: annonse.type === 'hjelp' ? `Takke ja til «${annonse.tittel}»?` : 'Reservere denne?',
                  tekst: `Da får du adressen og kan skrive med ${navn}. Annonsen forsvinner fra forsiden for andre.`,
                  ja: annonse.type === 'hjelp' ? 'Ja, takk ja' : 'Ja, reserver',
                });
                if (!ja) return;
                setTar(true);
                const svar = await takkJa(annonse);
                setTar(false);
                if (svar.feil) {
                  visToast(svar.feil);
                  await oppdater();
                  return;
                }
                visToast('Du har takket ja! Nå kan dere skrive sammen.');
                await oppdater();
              }}
            />
            <Infoboks
              ikon={MapPin}
              tekst="Du ser bare området nå. Den fulle adressen og «Vis veien» kommer når du har akseptert."
            />
          </>
        ) : (
          <Infoboks tekst="Det er hjelperne i appen som kan akseptere annonser." />
        )
      ) : (
        <Infoboks tekst="Noen har allerede akseptert denne annonsen." />
      )}
      <Knapp
        variant="sekundar"
        ikon={Flag}
        tekst="Meld fra om annonsen"
        onPress={() => gaFrem({ pathname: '/melde-fra', params: { id: annonse.id, tittel: annonse.tittel } })}
      />
    </View>
  );
}

// Hjelperen som har tatt annonsen: adresse, Vis veien, chat og status.
function Hjelperpanel({ annonse, oppdater }: Panel) {
  const { visToast } = useApp();
  const bekreft = useBekreft();
  const adresse = useAdresse(annonse.id, annonse.status, annonse.hjelper_id);
  const [jobber, setJobber] = useState<string | null>(null);
  const navn = fornavn(annonse.profiler?.navn) || 'personen';
  const ferdig = annonse.status === 'ferdig';

  async function status(ny: 'pa_vei' | 'ferdig', melding: string, takk: string) {
    setJobber(ny);
    const svar = await oppdaterOppdrag(annonse.id, ny);
    if (!svar.feil) await sendMelding(annonse.id, melding);
    setJobber(null);
    visToast(svar.feil ?? takk);
    await oppdater();
  }

  return (
    <View style={styles.knapper}>
      <Kort style={styles.statuskort}>
        <Tekst variant="under" vekt={600}>
          {ferdig ? 'Oppdraget er ferdig' : 'Du har akseptert denne'}
        </Tekst>
        {!ferdig && (
          <>
            <View style={styles.rad}>
              <MapPin size={22} color={farger.lilla} />
              <Tekst variant="listetittel" vekt={700} style={styles.flex}>
                {adresse?.adresse?.trim() || annonse.sted || 'Adressen er ikke lagt inn. Spør i chatten.'}
              </Tekst>
            </View>
            <Knapp
              ikon={Navigation}
              tekst="Vis veien i Google Maps"
              onPress={() => Linking.openURL(kartlenke(adresse, annonse.sted)).catch(() => {})}
            />
          </>
        )}
        {ferdig && annonse.vurdering ? (
          <View style={styles.takk}>
            <Stjerner antall={annonse.vurdering} />
            {annonse.takk ? <Tekst variant="brod">«{annonse.takk}»</Tekst> : null}
          </View>
        ) : null}
      </Kort>
      <Knapp variant="sekundar" ikon={MessageCircle} tekst={`Skriv med ${navn}`} onPress={() => aapneChat(annonse)} />
      {annonse.status === 'akseptert' && (
        <Knapp
          variant="gronn"
          ikon={Navigation}
          tekst="Jeg er på vei"
          laster={jobber === 'pa_vei'}
          onPress={() => status('pa_vei', 'Jeg er på vei nå! 🚶', `${navn} får beskjed om at du er på vei.`)}
        />
      )}
      {(annonse.status === 'akseptert' || annonse.status === 'pa_vei') && (
        <>
          <Knapp
            ikon={CircleCheck}
            tekst={annonse.type === 'hjelp' ? 'Oppdraget er ferdig' : 'Den er hentet'}
            laster={jobber === 'ferdig'}
            onPress={async () => {
              const ja = await bekreft({
                tittel: 'Er alt ferdig?',
                tekst: 'Da skjules adressen igjen, og annonsen flyttes til «Ferdige».',
                ja: 'Ja, det er ferdig',
              });
              if (ja) await status('ferdig', 'Da er det ferdig. Takk for i dag! 😊', 'Så bra! Takk for at du hjalp.');
            }}
          />
          <Knapp
            variant="sekundar"
            ikon={Undo2}
            tekst="Jeg kan ikke likevel"
            onPress={async () => {
              const ja = await bekreft({
                tittel: 'Slippe oppdraget?',
                tekst: `Annonsen blir ledig igjen, så andre kan ta den. Skriv gjerne til ${navn} først.`,
                ja: 'Ja, slipp oppdraget',
                farlig: true,
              });
              if (!ja) return;
              await sendMelding(annonse.id, 'Beklager, jeg kan ikke likevel. Annonsen er ledig igjen.');
              const svar = await slippAnnonse(annonse.id);
              visToast(svar.feil ?? 'Annonsen er ledig igjen.');
              if (!svar.feil) gaTilbake('/');
            }}
          />
        </>
      )}
    </View>
  );
}

// Den som la ut annonsen: hvem som har tatt den, chat, takk, endre og slett.
function Eierpanel({ annonse, oppdater }: Panel) {
  const { visToast } = useApp();
  const bekreft = useBekreft();
  const [sletter, setSletter] = useState(false);
  const [stjerner, setStjerner] = useState(5);
  const [takk, setTakk] = useState('');
  const [sender, setSender] = useState(false);
  const hjelper = annonse.hjelper;
  const hjelpernavn = fornavn(hjelper?.navn) || 'Hjelperen';

  return (
    <View style={styles.knapper}>
      {annonse.status === 'ledig' ? (
        <Infoboks tekst="Dette er din annonse. Alle i appen kan se den, og du får beskjed i chatten når noen aksepterer." />
      ) : (
        <Kort style={styles.statuskort}>
          <Tekst variant="under" vekt={600}>
            {statustekst[annonse.status]}
          </Tekst>
          <View style={styles.rad}>
            <Avatar bokstav={(hjelper?.navn?.[0] ?? '?').toUpperCase()} bilde={hjelper?.bilde} storrelse={52} />
            <Tekst variant="listetittel" vekt={700} style={styles.flex}>
              {annonse.status === 'pa_vei'
                ? `${hjelpernavn} er på vei!`
                : annonse.status === 'ferdig'
                  ? `${hjelpernavn} hjalp deg`
                  : `${hjelpernavn} har akseptert`}
            </Tekst>
          </View>
          <Knapp variant="sekundar" ikon={MessageCircle} tekst={`Skriv med ${hjelpernavn}`} onPress={() => aapneChat(annonse)} />
        </Kort>
      )}

      {annonse.status === 'ferdig' &&
        (annonse.vurdering ? (
          <Kort>
            <Tekst variant="under" vekt={600}>
              Din takk
            </Tekst>
            <Stjerner antall={annonse.vurdering} />
            {annonse.takk ? <Tekst variant="brod">«{annonse.takk}»</Tekst> : null}
          </Kort>
        ) : (
          <Kort>
            <Tekst variant="mellomtittel">Gi {hjelpernavn} en takk</Tekst>
            <Stjernevelger verdi={stjerner} onEndre={setStjerner} />
            <Tekstfelt etikett="Noen ord (valgfritt)" value={takk} onChangeText={setTakk} maxLength={500} />
            <Knapp
              tekst="Send takk"
              laster={sender}
              onPress={async () => {
                setSender(true);
                const svar = await giTakk(annonse.id, stjerner, takk);
                setSender(false);
                visToast(svar.feil ?? 'Takk! Det setter hjelperen pris på.');
                await oppdater();
              }}
            />
          </Kort>
        ))}

      {annonse.status !== 'ferdig' && (
        <Knapp
          variant={annonse.status === 'ledig' ? 'hoved' : 'sekundar'}
          ikon={PenLine}
          tekst="Endre annonsen"
          onPress={() => gaFrem({ pathname: '/annonse/endre/[id]', params: { id: annonse.id } })}
        />
      )}
      {(annonse.status === 'akseptert' || annonse.status === 'pa_vei') && (
        <Knapp
          variant="sekundar"
          ikon={Undo2}
          tekst="Gjør annonsen ledig igjen"
          onPress={async () => {
            const ja = await bekreft({
              tittel: 'Gjøre annonsen ledig igjen?',
              tekst: `${hjelpernavn} mister oppdraget, og andre kan ta det.`,
              ja: 'Ja, gjør den ledig',
              farlig: true,
            });
            if (!ja) return;
            await sendMelding(annonse.id, 'Jeg har gjort annonsen ledig igjen. Takk likevel!');
            const svar = await slippAnnonse(annonse.id);
            visToast(svar.feil ?? 'Annonsen er ledig igjen.');
            await oppdater();
          }}
        />
      )}
      <Knapp
        variant="sekundar"
        ikon={Trash2}
        tekst="Slett annonsen"
        laster={sletter}
        onPress={async () => {
          const ja = await bekreft({
            tittel: 'Slette annonsen?',
            tekst: `«${annonse.tittel}» blir borte for alle, også chatten. Dette kan ikke angres.`,
            ja: 'Ja, slett annonsen',
            farlig: true,
          });
          if (!ja) return;
          setSletter(true);
          const svar = await slettAnnonse(annonse);
          setSletter(false);
          if (svar.feil) {
            visToast(svar.feil);
            return;
          }
          visToast('Annonsen er slettet.');
          settRetning('tilbake');
          router.replace('/mine');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  laster: { paddingVertical: 48 },
  knapper: { gap: 12 },
  statuskort: { gap: 14 },
  rad: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  takk: { gap: 6 },
});
