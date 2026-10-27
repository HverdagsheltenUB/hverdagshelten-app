import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { StorKnapp } from '../components/StorKnapp';
import { useBestillinger } from '../lib/bestillinger';
import { farger, priser, skrift, storrelse } from '../lib/tema';

const tjenester = [
  { navn: 'Handling', ikon: '🛒' },
  { navn: 'Hagearbeid', ikon: '🌱' },
  { navn: 'Kaffe og selskap', ikon: '☕' },
  { navn: 'Lufte hunden', ikon: '🐕' },
  { navn: 'Noe annet', ikon: '💬' },
];

const dager = ['I dag', 'I morgen', 'Denne uken'];

// Ett spørsmål om gangen, så det aldri blir for mye på skjermen.
export default function Bestill() {
  const { leggTil } = useBestillinger();
  const [steg, setSteg] = useState(1);
  const [tjeneste, setTjeneste] = useState('');
  const [dag, setDag] = useState('');
  const [melding, setMelding] = useState('');

  function send() {
    leggTil({ tjeneste, dag, melding });
    setSteg(4);
  }

  return (
    <ScrollView contentContainerStyle={styles.side} keyboardShouldPersistTaps="handled">
      {steg < 4 && <Text style={styles.steg}>Steg {steg} av 3</Text>}

      {steg === 1 && (
        <>
          <Text style={styles.sporsmal}>Hva trenger du hjelp med?</Text>
          {tjenester.map((t) => (
            <StorKnapp
              key={t.navn}
              ikon={t.ikon}
              tekst={t.navn}
              variant="lys"
              valgt={tjeneste === t.navn}
              onPress={() => {
                setTjeneste(t.navn);
                setSteg(2);
              }}
            />
          ))}
        </>
      )}

      {steg === 2 && (
        <>
          <Text style={styles.sporsmal}>Når passer det for deg?</Text>
          {dager.map((d) => (
            <StorKnapp
              key={d}
              tekst={d}
              variant="lys"
              valgt={dag === d}
              onPress={() => {
                setDag(d);
                setSteg(3);
              }}
            />
          ))}
          <StorKnapp tekst="Tilbake" variant="lys" onPress={() => setSteg(1)} />
        </>
      )}

      {steg === 3 && (
        <>
          <Text style={styles.sporsmal}>Se over bestillingen</Text>
          <View style={styles.kort}>
            <Text style={styles.tekst}>Hjelp med: {tjeneste}</Text>
            <Text style={styles.tekst}>Når: {dag}</Text>
            <Text style={styles.tekst}>
              Pris: {priser.timepris} kr per time + {priser.gebyr} kr per bestilling
            </Text>
          </View>

          <Text style={styles.tekst}>Vil du skrive noe til hjelperen? (Du kan hoppe over dette.)</Text>
          <TextInput
            style={styles.felt}
            value={melding}
            onChangeText={setMelding}
            placeholder="For eksempel: Jeg trenger melk og brød"
            placeholderTextColor="#7A6A82"
            multiline
          />

          <StorKnapp ikon="✅" tekst="Send bestilling" onPress={send} />
          <StorKnapp tekst="Tilbake" variant="lys" onPress={() => setSteg(2)} />
        </>
      )}

      {steg === 4 && (
        <>
          <Text style={styles.sporsmal}>Takk! Bestillingen er sendt.</Text>
          <Text style={styles.tekst}>
            En hverdagshelt tar kontakt med deg så snart som mulig.
          </Text>
          <StorKnapp tekst="Tilbake til forsiden" onPress={() => router.dismissAll()} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  side: {
    padding: 24,
    gap: 18,
  },
  steg: {
    fontFamily: skrift.vanlig,
    fontSize: 20,
    color: farger.lilla,
  },
  sporsmal: {
    fontFamily: skrift.fet,
    fontSize: storrelse.tittel - 4,
    color: farger.tekst,
    marginBottom: 4,
  },
  tekst: {
    fontFamily: skrift.vanlig,
    fontSize: storrelse.tekst,
    color: farger.tekst,
    lineHeight: 30,
  },
  kort: {
    backgroundColor: farger.hvit,
    borderRadius: 20,
    padding: 20,
    gap: 8,
    borderWidth: 3,
    borderColor: farger.lavendel,
  },
  felt: {
    backgroundColor: farger.hvit,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: farger.lavendel,
    padding: 16,
    minHeight: 120,
    fontFamily: skrift.vanlig,
    fontSize: storrelse.tekst,
    color: farger.tekst,
    textAlignVertical: 'top',
  },
});
