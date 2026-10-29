import { CalendarDays, ChevronRight, MapPin, Plus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Knapp } from '../../components/Knapp';
import { Ikonboks, Kort, Skillelinje } from '../../components/Kort';
import { Skjerm } from '../../components/Skjerm';
import { Avatar, Lenkerad, Overskrift, Pille } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { useApp } from '../../lib/app-tilstand';
import { anne, motested } from '../../lib/eksempeldata';
import { gaFrem, gaTilFane } from '../../lib/overgang';
import { farger, ikonStrek } from '../../lib/tema';

export function Hjem() {
  const { bestillinger } = useApp();

  return (
    <Skjerm>
      <Overskrift tittel={`Hei, ${anne.fornavn}.`} undertekst="Her finner du hjelp i hverdagen." />

      <Kort>
        <Tekst variant="under" vekt={600}>
          Ditt neste besøk
        </Tekst>
        <View style={styles.rad}>
          <Ikonboks ikon={CalendarDays} />
          <View style={styles.flex}>
            <Tekst variant="stor">Torsdag 29. oktober</Tekst>
            <Tekst variant="stor">Kl. 14.00–15.00</Tekst>
          </View>
        </View>
        <View style={styles.rad}>
          <Avatar bokstav="E" />
          <View style={styles.flex}>
            <Tekst variant="brod" vekt={600}>
              Emil blir med deg på tur
            </Tekst>
            <Tekst variant="under">Avtalen er bekreftet</Tekst>
          </View>
        </View>
        <Skillelinje />
        <Lenkerad tekst="Se avtalen" onPress={() => gaTilFane('/avtaler')} />
      </Kort>

      {bestillinger.length > 0 && (
        <Kort>
          <Tekst variant="mellomtittel">Venter på svar</Tekst>
          {bestillinger.map((b) => (
            <View key={b.id} style={styles.bestilling}>
              <View style={styles.flex}>
                <Tekst variant="brod" vekt={600}>
                  {b.kategori}
                </Tekst>
                <Tekst variant="under">
                  {b.dag} · {b.tid}
                </Tekst>
              </View>
              <Pille tekst="Sendt" />
            </View>
          ))}
        </Kort>
      )}

      <Knapp ikon={Plus} tekst="Bestill hjelp" onPress={() => gaFrem('/bestill')} />

      <Kort myk onPress={() => gaTilFane('/kart')} accessibilityLabel="Se møtestedet på kart" style={styles.rad}>
        <Ikonboks ikon={MapPin} />
        <View style={styles.flex}>
          <Tekst variant="listetittel">Se møtestedet på kart</Tekst>
          <Tekst variant="under">{motested.navn} · eksempel</Tekst>
        </View>
        <ChevronRight size={22} color={farger.dempet} strokeWidth={ikonStrek} />
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
  bestilling: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
