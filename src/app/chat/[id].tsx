import { useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Kort } from '../../components/Kort';
import { Skjerm } from '../../components/Skjerm';
import { Tekstfelt } from '../../components/Skjema';
import { Avatar } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { useApp } from '../../lib/app-tilstand';
import { nartekst, statustekst, useAnnonse, useMeldinger } from '../../lib/annonser';
import { useKonto } from '../../lib/konto';
import { gaFrem, gaTilbake } from '../../lib/overgang';
import { farger, ikonStrek } from '../../lib/tema';

// Chat mellom den som la ut annonsen og den som har akseptert den.
export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { annonse } = useAnnonse(id);
  const { meldinger, laster, send } = useMeldinger(id);
  const { session } = useKonto();
  const { visToast } = useApp();
  const [tekst, setTekst] = useState('');
  const [sender, setSender] = useState(false);
  const meg = session?.user.id;
  const erEier = annonse?.bruker_id === meg;
  const den = erEier ? annonse?.hjelper : annonse?.profiler;
  const navn = den?.navn?.trim() || 'Den andre';

  async function sendNa() {
    const t = tekst.trim();
    if (!t || sender) return;
    setSender(true);
    setTekst('');
    const svar = await send(t);
    setSender(false);
    if (svar.feil) {
      setTekst(t);
      visToast(svar.feil);
    }
  }

  return (
    <Skjerm
      tilbake={{ onPress: () => gaTilbake('/') }}
      hjelp={false}
      holdNederst
      bunn={
        <View style={styles.skriv}>
          <View style={styles.flex}>
            <Tekstfelt
              etikett={`Skriv til ${navn.split(' ')[0]}`}
              value={tekst}
              onChangeText={setTekst}
              placeholder="Skriv en melding"
              returnKeyType="send"
              onSubmitEditing={sendNa}
              maxLength={2000}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send meldingen"
            onPress={sendNa}
            disabled={!tekst.trim() || sender}
            style={({ pressed }) => [styles.send, (!tekst.trim() || sender) && styles.av, pressed && { opacity: 0.85 }]}
          >
            <Send size={24} color={farger.hvit} strokeWidth={ikonStrek} />
          </Pressable>
        </View>
      }
    >
      <Kort
        myk
        style={styles.rad}
        onPress={annonse ? () => gaFrem({ pathname: '/annonse/[id]', params: { id: annonse.id } }) : undefined}
        accessibilityLabel="Se annonsen"
      >
        <Avatar bokstav={(navn[0] ?? '?').toUpperCase()} bilde={den?.bilde} storrelse={52} />
        <View style={styles.flex}>
          <Tekst variant="listetittel" vekt={700}>
            {navn}
          </Tekst>
          <Tekst variant="under" numberOfLines={1}>
            {annonse ? `${annonse.tittel} · ${statustekst[annonse.status]}` : ' '}
          </Tekst>
        </View>
      </Kort>

      {laster ? (
        <ActivityIndicator color={farger.lilla} style={styles.laster} />
      ) : meldinger.length === 0 ? (
        <Tekst variant="under" style={styles.sentrert}>
          Ingen meldinger ennå. Si hei!
        </Tekst>
      ) : (
        <View style={styles.meldinger}>
          {meldinger.map((m) => {
            const fraMeg = m.avsender_id === meg;
            return (
              <View key={m.id} style={[styles.boble, fraMeg ? styles.bobleMeg : styles.bobleDem]}>
                <Tekst variant="brod" farge={fraMeg ? farger.hvit : farger.tekst}>
                  {m.tekst}
                </Tekst>
                <Tekst variant="liten" farge={fraMeg ? farger.lysLilla : farger.dempet}>
                  {nartekst(m.opprettet)}
                </Tekst>
              </View>
            );
          })}
        </View>
      )}
      <Tekst variant="underLiten" style={styles.sentrert}>
        Del aldri passord eller bankopplysninger i chatten. Er noe galt, trykk «Hjelp» øverst i appen.
      </Tekst>
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  rad: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  flex: { flex: 1 },
  laster: { paddingVertical: 24 },
  sentrert: { textAlign: 'center' },
  meldinger: { gap: 10 },
  boble: { maxWidth: '85%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 2 },
  bobleMeg: { alignSelf: 'flex-end', backgroundColor: farger.lilla, borderBottomRightRadius: 6 },
  bobleDem: {
    alignSelf: 'flex-start',
    backgroundColor: farger.kort,
    borderWidth: 1.5,
    borderColor: farger.linje,
    borderBottomLeftRadius: 6,
  },
  skriv: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  send: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: farger.lilla,
    alignItems: 'center',
    justifyContent: 'center',
  },
  av: { opacity: 0.45 },
});
