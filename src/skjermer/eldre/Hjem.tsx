import { CalendarDays, CreditCard, MessageCircleHeart, Plus, Users } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { SjekketMerke } from '../../components/Ekstra';
import { Knapp } from '../../components/Knapp';
import { Ikonboks, Kort, Skillelinje } from '../../components/Kort';
import { Listevalg } from '../../components/Listevalg';
import { Skjerm } from '../../components/Skjerm';
import { Avatar, Lenkerad, Overskrift, Pille } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { useApp } from '../../lib/app-tilstand';
import { dagnavn, dagnavnLangt, tidsrom } from '../../lib/dato';
import { finnHjelper, kontaktperson, tittelFor } from '../../lib/eksempeldata';
import { gaFrem } from '../../lib/overgang';
import { useMineAvtaler } from '../../lib/utvalg';

export function Hjem() {
  const { data } = useApp();
  const { kommende, tidligere } = useMineAvtaler();
  const neste = kommende.find((o) => o.status === 'bekreftet');
  const venter = kommende.filter((o) => o.status === 'sendt');
  const aBetale = tidligere.filter((o) => o.status === 'ferdig' && !o.betalt);
  const hjelper = finnHjelper(neste?.hjelperId);

  return (
    <Skjerm>
      <Overskrift tittel={`Hei, ${data.eldre.fornavn}.`} undertekst="Her finner du hjelp i hverdagen." />

      {aBetale.map((o) => (
        <Listevalg
          key={o.id}
          ikon={CreditCard}
          tittel="Betal for besøket"
          undertekst={`${tittelFor(o)} med ${finnHjelper(o.hjelperId)?.fornavn ?? 'hjelperen'}`}
          onPress={() => gaFrem({ pathname: '/betal/[id]', params: { id: o.id } })}
        />
      ))}

      {neste && hjelper ? (
        <Kort
          onPress={() => gaFrem({ pathname: '/avtale/[id]', params: { id: neste.id } })}
          accessibilityLabel="Ditt neste besøk"
        >
          <View style={styles.rad}>
            <Tekst variant="under" vekt={600} style={styles.flex}>
              Ditt neste besøk
            </Tekst>
            {neste.paVei && <Pille tekst={`${hjelper.fornavn} er på vei`} variant="gronn" />}
          </View>
          <View style={styles.rad}>
            <Ikonboks ikon={CalendarDays} />
            <View style={styles.flex}>
              <Tekst variant="stor">{dagnavnLangt(neste.dato)}</Tekst>
              <Tekst variant="stor">Kl. {tidsrom(neste.start, neste.varighet)}</Tekst>
            </View>
          </View>
          <View style={styles.rad}>
            <Avatar bokstav={hjelper.fornavn[0]} />
            <View style={styles.flex}>
              <Tekst variant="brod" vekt={600}>
                {hjelper.fornavn} kommer · {tittelFor(neste).toLowerCase()}
              </Tekst>
              <SjekketMerke />
            </View>
          </View>
          <Skillelinje />
          <Lenkerad tekst="Se avtalen" onPress={() => gaFrem({ pathname: '/avtale/[id]', params: { id: neste.id } })} />
        </Kort>
      ) : (
        <Kort>
          <Tekst variant="mellomtittel">Ingen avtaler ennå</Tekst>
          <Tekst variant="brod">Når en hjelper har sagt ja, ser du det her.</Tekst>
        </Kort>
      )}

      {venter.length > 0 && (
        <Kort>
          <Tekst variant="mellomtittel">Venter på svar</Tekst>
          {venter.map((o) => (
            <View key={o.id} style={styles.rad}>
              <View style={styles.flex}>
                <Tekst variant="brod" vekt={600}>
                  {tittelFor(o)}
                  {o.bestiltFor ? ` for ${o.mottaker.fornavn}` : ''}
                </Tekst>
                <Tekst variant="under">
                  {dagnavn(o.dato)} · {tidsrom(o.start, o.varighet)}
                </Tekst>
              </View>
              <Pille tekst="Sendt" />
            </View>
          ))}
        </Kort>
      )}

      <View style={styles.knapper}>
        <Knapp ikon={Plus} tekst="Bestill hjelp" onPress={() => gaFrem('/bestill')} />
        <Knapp
          variant="sekundar"
          ikon={Users}
          tekst="Bestill for noen andre"
          hint="For eksempel for mor, far eller en nabo"
          onPress={() => gaFrem({ pathname: '/bestill', params: { for: 'annen' } })}
        />
      </View>

      <Kort
        myk
        onPress={() => gaFrem('/kontakt')}
        accessibilityLabel={`Skriv til ${kontaktperson.fornavn}`}
        style={styles.rad}
      >
        <Ikonboks ikon={MessageCircleHeart} />
        <View style={styles.flex}>
          <Tekst variant="listetittel">Lurer du på noe?</Tekst>
          <Tekst variant="under">
            Skriv til {kontaktperson.fornavn} i teamet. {kontaktperson.apent}.
          </Tekst>
        </View>
      </Kort>
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  rad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flex: {
    flex: 1,
  },
  knapper: {
    gap: 12,
  },
});
