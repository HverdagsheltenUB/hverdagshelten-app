import { Footprints } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Ikonboks, Kort, Skillelinje } from '../../components/Kort';
import { Listevalg } from '../../components/Listevalg';
import { Skjerm } from '../../components/Skjerm';
import { Lenkerad, Overskrift, Pille, Seksjon, Statboks, Statrad } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { useApp } from '../../lib/app-tilstand';
import { emil } from '../../lib/eksempeldata';
import { useLedigeOppdrag } from '../../lib/ledige-oppdrag';
import { gaFrem, gaTilFane } from '../../lib/overgang';

export function Hjem() {
  const { tjentIOktober } = useApp();
  const ledige = useLedigeOppdrag();

  return (
    <Skjerm>
      <Overskrift tittel={`Hei, ${emil.fornavn}.`} undertekst="Klar for å gjøre noen glade i dag?" />

      <Kort>
        <Tekst variant="under" vekt={600}>
          Ditt neste oppdrag
        </Tekst>
        <View style={styles.rad}>
          <Ikonboks ikon={Footprints} />
          <View style={styles.flex}>
            <Tekst variant="stor">Tur med Anne</Tekst>
            <Tekst variant="under">I dag kl. 14.00–15.00</Tekst>
          </View>
        </View>
        <Skillelinje />
        <Lenkerad tekst="Se møtestedet" onPress={() => gaTilFane('/kart')} />
      </Kort>

      <Statrad>
        <Statboks etikett="Tjent i oktober" verdi={`${tjentIOktober} kr`} />
        <Statboks etikett="Vurdering" verdi={emil.vurdering} stjerne />
      </Statrad>

      <Seksjon
        tittel="Ledige oppdrag nær deg"
        hoyre={ledige.length > 0 && <Pille tekst={`${ledige.length} nye`} variant="lilla" />}
      />

      {ledige.length === 0 && <Tekst variant="under">Ingen ledige oppdrag akkurat nå.</Tekst>}
      {ledige.map((o) => (
        <Listevalg
          key={o.id}
          ikon={o.ikon}
          tittel={o.tittel}
          undertekst={`${o.nar} · ${o.sted}`}
          hoyre={`${o.belop} kr`}
          onPress={() => gaFrem({ pathname: '/oppdrag/[id]', params: { id: o.id } })}
        />
      ))}
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
});
