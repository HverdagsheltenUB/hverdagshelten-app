import * as Linking from 'expo-linking';
import { ChevronDown, ChevronUp, Mail, Send } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Knapp } from '../components/Knapp';
import { Kort } from '../components/Kort';
import { Skjerm } from '../components/Skjerm';
import { Tekstfelt } from '../components/Skjema';
import { Avatar, Overskrift, Seksjon } from '../components/Smaabiter';
import { Tekst } from '../components/Tekst';
import { useApp } from '../lib/app-tilstand';
import { kontaktEpost, kontaktperson } from '../lib/eksempeldata';
import { finnSvar, vanligeSporsmal } from '../lib/svarhjelper';
import { farger, ikonStrek } from '../lib/tema';

export default function Kontakt() {
  const { data, sendMelding, visToast } = useApp();
  const [tekst, setTekst] = useState('');
  const [apen, setApen] = useState<number | null>(null);

  function send() {
    const t = tekst.trim();
    if (!t) return;
    sendMelding(t, finnSvar(t));
    setTekst('');
  }

  return (
    <Skjerm
      tilbake={{}}
      hjelp={false}
      bunn={
        <View style={styles.skriv}>
          <View style={styles.flex}>
            <Tekstfelt
              etikett={`Skriv til ${kontaktperson.fornavn}`}
              value={tekst}
              onChangeText={setTekst}
              placeholder="Skriv spørsmålet ditt her"
              returnKeyType="send"
              onSubmitEditing={send}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send meldingen"
            onPress={send}
            style={({ pressed }) => [styles.send, pressed && { opacity: 0.85 }]}
          >
            <Send size={24} color={farger.hvit} strokeWidth={ikonStrek} />
          </Pressable>
        </View>
      }
    >
      <Overskrift tittel="Hjelp og kontakt" undertekst="Vi hjelper deg gjerne." />

      <Kort myk style={styles.rad}>
        <Avatar bokstav={kontaktperson.fornavn[0]} storrelse={56} />
        <View style={styles.flex}>
          <Tekst variant="listetittel">{kontaktperson.fornavn}</Tekst>
          <Tekst variant="under">{kontaktperson.rolle}</Tekst>
          <Tekst variant="under">{kontaktperson.apent}</Tekst>
        </View>
      </Kort>

      <View style={styles.meldinger}>
        <Boble
          fra="team"
          tekst={`Hei! Jeg heter ${kontaktperson.fornavn}. Skriv hva du lurer på, så hjelper vi deg. Enkle spørsmål får svar med en gang, også om kvelden.`}
        />
        {data.meldinger.map((m) => (
          <Boble key={m.id} fra={m.fra} tekst={m.tekst} />
        ))}
      </View>

      <Seksjon tittel="Vanlige spørsmål" />
      {vanligeSporsmal.map((s, i) => (
        <Kort key={s.sporsmal} onPress={() => setApen(apen === i ? null : i)} accessibilityLabel={s.sporsmal}>
          <View style={styles.rad}>
            <Tekst variant="listetittel" style={styles.flex}>
              {s.sporsmal}
            </Tekst>
            {apen === i ? (
              <ChevronUp size={22} color={farger.dempet} strokeWidth={ikonStrek} />
            ) : (
              <ChevronDown size={22} color={farger.dempet} strokeWidth={ikonStrek} />
            )}
          </View>
          {apen === i && <Tekst variant="brod">{s.svar}</Tekst>}
        </Kort>
      ))}

      <Knapp
        variant="sekundar"
        ikon={Mail}
        tekst="Send e-post i stedet"
        onPress={() =>
          Linking.openURL(`mailto:${kontaktEpost}`).catch(() =>
            visToast(`Vi fikk ikke åpnet e-post. Adressen er ${kontaktEpost}.`),
          )
        }
      />
    </Skjerm>
  );
}

function Boble({ fra, tekst }: { fra: 'meg' | 'team' | 'automatisk'; tekst: string }) {
  const meg = fra === 'meg';
  return (
    <View style={[styles.boble, meg ? styles.bobleMeg : styles.bobleDem]}>
      {fra === 'automatisk' && (
        <Tekst variant="liten" vekt={700} farge={farger.lilla}>
          Automatisk svar
        </Tekst>
      )}
      {fra === 'team' && (
        <Tekst variant="liten" vekt={700} farge={farger.lilla}>
          {kontaktperson.fornavn}
        </Tekst>
      )}
      <Tekst variant="brod" farge={meg ? farger.hvit : farger.tekst}>
        {tekst}
      </Tekst>
    </View>
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
  meldinger: {
    gap: 10,
  },
  boble: {
    maxWidth: '85%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 2,
  },
  bobleMeg: {
    alignSelf: 'flex-end',
    backgroundColor: farger.lilla,
    borderBottomRightRadius: 6,
  },
  bobleDem: {
    alignSelf: 'flex-start',
    backgroundColor: farger.kort,
    borderWidth: 1.5,
    borderColor: farger.linje,
    borderBottomLeftRadius: 6,
  },
  skriv: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  send: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: farger.lilla,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
