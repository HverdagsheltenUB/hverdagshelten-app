import * as Linking from 'expo-linking';
import { Redirect, useLocalSearchParams } from 'expo-router';
import {
  CalendarClock,
  CalendarDays,
  Clock,
  CreditCard,
  Flag,
  House,
  Phone,
  Receipt,
  Repeat,
  ShoppingBasket,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { useBekreft } from '../../components/Dialog';
import { Infoboks, LesOpp, Nodknapp, SjekketMerke, Statuspille, Stjernevelger } from '../../components/Ekstra';
import { Knapp } from '../../components/Knapp';
import { Ikonboks, Kort, Skillelinje } from '../../components/Kort';
import { Listevalg } from '../../components/Listevalg';
import { Skjerm } from '../../components/Skjerm';
import { Tekstfelt } from '../../components/Skjema';
import { Avatar, Overskrift, Pille, Stjerner } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { useApp } from '../../lib/app-tilstand';
import { dagnavnLangt, klokke, tidsrom, timerTil, varighetTekst } from '../../lib/dato';
import { finnHjelper, tittelFor } from '../../lib/eksempeldata';
import { gaFrem, gaTilbake } from '../../lib/overgang';
import { useOppdrag } from '../../lib/utvalg';
import { kroner, prisFor, regler } from '../../lib/tema';

// En avtale sett fra den som får hjelp.
export default function Avtale() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const avtale = useOppdrag(id);
  const { endreOppdrag, visToast, data } = useApp();
  const bekreft = useBekreft();
  const [stjerner, setStjerner] = useState(0);
  const [takk, setTakk] = useState('');

  if (!avtale) return <Redirect href="/avtaler" />;
  const o = avtale;
  const hjelper = finnHjelper(o.hjelperId);
  const aktiv = o.status === 'sendt' || o.status === 'bekreftet';
  const pris = prisFor(o.varighet, o.utlegg ?? 0);
  const sent = timerTil(o.dato, o.start) < regler.avlysFristTimer;

  async function avlys() {
    const ja = await bekreft({
      tittel: 'Er du sikker på at du vil avlyse?',
      tekst: hjelper
        ? `${hjelper.fornavn} får beskjed med en gang.${sent ? ' Det er mindre enn ett døgn til besøket, så si gjerne fra til oss også.' : ''}`
        : 'Bestillingen blir slettet.',
      ja: 'Ja, avlys',
      farlig: true,
    });
    if (!ja) return;
    endreOppdrag(o.id, { status: 'avlyst', paVei: false });
    gaTilbake('/avtaler');
    visToast('Avtalen er avlyst.');
  }

  const parorendeMedBeskjed = data.parorende.filter((p) => p.faarBeskjed);
  const opplesing = `${tittelFor(o)}. ${dagnavnLangt(o.dato)}, klokken ${klokke(o.start)} til ${klokke(
    o.start + o.varighet,
  )}.${hjelper ? ` ${hjelper.fornavn} kommer.` : ' Vi leter etter en hjelper.'}`;

  return (
    <Skjerm tilbake={{ onPress: () => gaTilbake('/avtaler') }}>
      <View style={styles.topp}>
        <Statuspille status={o.status} />
        <Overskrift
          tittel={tittelFor(o)}
          undertekst={o.bestiltFor ? `For ${o.mottaker.navn} (${o.bestiltFor.relasjon})` : undefined}
        />
      </View>
      <LesOpp tekst={opplesing} />

      <Kort>
        <Detalj ikon={CalendarDays} tekst={dagnavnLangt(o.dato)} />
        <Detalj ikon={Clock} tekst={`Kl. ${tidsrom(o.start, o.varighet)}`} under={varighetTekst(o.varighet)} />
        <Detalj ikon={House} tekst={o.mottaker.adresse} />
        {o.gjentaUkentlig && <Detalj ikon={Repeat} tekst="Gjentas hver uke" />}
      </Kort>

      {hjelper ? (
        <Kort>
          <Tekst variant="under" vekt={600}>
            {o.status === 'ferdig' ? 'Hjelperen din' : 'Dette er hjelperen din'}
          </Tekst>
          <View style={styles.rad}>
            <Avatar bokstav={hjelper.fornavn[0]} storrelse={60} />
            <View style={styles.flex}>
              <Tekst variant="stor">{hjelper.navn}</Tekst>
              <Tekst variant="under">
                {hjelper.alder} år · {hjelper.omrade} · ★ {hjelper.vurdering}
              </Tekst>
              <SjekketMerke />
            </View>
          </View>
          {o.paVei && o.status === 'bekreftet' && (
            <Pille tekst={`${hjelper.fornavn} er på vei til deg`} variant="gronn" />
          )}
          {o.status === 'bekreftet' && (
            <Knapp
              variant="sekundar"
              ikon={Phone}
              tekst={`Ring ${hjelper.fornavn}`}
              onPress={() =>
                Linking.openURL(`tel:${hjelper.telefon.replace(/\s/g, '')}`).catch(() =>
                  visToast(`Vi fikk ikke ringt. Nummeret er ${hjelper.telefon}.`),
                )
              }
            />
          )}
        </Kort>
      ) : (
        o.status === 'sendt' && (
          <Infoboks tekst="Vi leter etter en hjelper i nærheten. Du får beskjed så snart noen har sagt ja." />
        )
      )}

      {(o.beskjed || o.handleliste || o.handlelisteBilde) && (
        <Kort>
          {o.beskjed !== '' && (
            <View style={styles.gruppe}>
              <Tekst variant="under" vekt={600}>
                Beskjed til hjelperen
              </Tekst>
              <Tekst variant="brod">«{o.beskjed}»</Tekst>
            </View>
          )}
          {o.handleliste !== '' && <Detalj ikon={ShoppingBasket} tekst="Handleliste" under={o.handleliste} />}
          {o.handlelisteBilde && (
            <Image
              source={{ uri: o.handlelisteBilde }}
              style={styles.bilde}
              accessibilityLabel="Bilde av handlelisten"
            />
          )}
        </Kort>
      )}

      {aktiv && parorendeMedBeskjed.length > 0 && (
        <Infoboks
          tekst={`${parorendeMedBeskjed.map((p) => p.navn.split(' ')[0]).join(' og ')} får beskjed om denne avtalen.`}
        />
      )}

      {aktiv && (
        <View style={styles.knapper}>
          <Knapp
            variant="sekundar"
            ikon={CalendarClock}
            tekst="Flytt til en annen tid"
            onPress={() => gaFrem({ pathname: '/flytt/[id]', params: { id: o.id } })}
          />
          <Knapp variant="sekundar" ikon={X} tekst="Avlys avtalen" onPress={avlys} />
          <Tekst variant="under">
            Avlys gjerne senest {regler.avlysFristTimer} timer før, så hjelperen rekker å planlegge.
          </Tekst>
        </View>
      )}

      {o.status === 'ferdig' && !o.betalt && (
        <Kort>
          <Tekst variant="mellomtittel">Betal for besøket</Tekst>
          <Tekst variant="brod">Å betale: {kroner(pris.sum)}</Tekst>
          <Knapp
            ikon={CreditCard}
            tekst="Betal med Vipps"
            onPress={() => gaFrem({ pathname: '/betal/[id]', params: { id: o.id } })}
          />
        </Kort>
      )}

      {o.status === 'ferdig' && o.betalt && (
        <Listevalg
          ikon={Receipt}
          tittel="Se kvitteringen"
          undertekst={`Betalt ${kroner(pris.sum)}${o.betaltAv && o.betaltAv !== data.eldre.fornavn ? ` av ${o.betaltAv}` : ''}`}
          onPress={() => gaFrem({ pathname: '/betal/[id]', params: { id: o.id } })}
        />
      )}

      {o.status === 'ferdig' && hjelper && (
        <Kort>
          {o.vurdering ? (
            <>
              <Tekst variant="mellomtittel">Din vurdering</Tekst>
              <Stjerner antall={o.vurdering} />
              {o.takk && <Tekst variant="brod">«{o.takk}»</Tekst>}
            </>
          ) : (
            <>
              <Tekst variant="mellomtittel">Hvordan gikk besøket?</Tekst>
              <Stjernevelger verdi={stjerner} onEndre={setStjerner} />
              <Tekstfelt
                etikett={`En kort takk til ${hjelper.fornavn} (valgfritt)`}
                value={takk}
                onChangeText={setTakk}
                flereLinjer
              />
              <Knapp
                tekst="Send vurdering"
                deaktivert={stjerner === 0}
                onPress={() => {
                  endreOppdrag(o.id, { vurdering: stjerner, takk: takk.trim() || undefined });
                  visToast(`Takk! ${hjelper.fornavn} blir glad for å høre det.`);
                }}
              />
            </>
          )}
        </Kort>
      )}

      <Skillelinje />
      <Listevalg
        ikon={Flag}
        tittel="Meld fra om noe"
        undertekst="Hvis noe ikke føltes riktig"
        onPress={() => gaFrem({ pathname: '/melde-fra', params: { id: o.id } })}
      />
      {o.status === 'bekreftet' && <Nodknapp />}
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
  rad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flex: {
    flex: 1,
    gap: 2,
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
