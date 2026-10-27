import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { StorKnapp } from '../components/StorKnapp';
import { useBestillinger } from '../lib/bestillinger';
import { farger, skrift, storrelse } from '../lib/tema';

export default function MineBestillinger() {
  const { bestillinger } = useBestillinger();

  return (
    <ScrollView contentContainerStyle={styles.side}>
      {bestillinger.length === 0 ? (
        <>
          <Text style={styles.tekst}>Du har ingen bestillinger ennå.</Text>
          <StorKnapp ikon="🤝" tekst="Bestill hjelp" onPress={() => router.replace('/bestill')} />
        </>
      ) : (
        bestillinger.map((b) => (
          <View key={b.id} style={styles.kort}>
            <Text style={styles.tittel}>{b.tjeneste}</Text>
            <Text style={styles.tekst}>Når: {b.dag}</Text>
            {b.melding !== '' && <Text style={styles.tekst}>Melding: {b.melding}</Text>}
            <Text style={styles.status}>Venter på en hjelper</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  side: {
    padding: 24,
    gap: 18,
  },
  kort: {
    backgroundColor: farger.hvit,
    borderRadius: 20,
    padding: 20,
    gap: 6,
    borderWidth: 3,
    borderColor: farger.lavendel,
  },
  tittel: {
    fontFamily: skrift.fet,
    fontSize: storrelse.knapp,
    color: farger.morkLilla,
  },
  tekst: {
    fontFamily: skrift.vanlig,
    fontSize: storrelse.tekst,
    color: farger.tekst,
  },
  status: {
    fontFamily: skrift.fet,
    fontSize: storrelse.tekst,
    color: farger.lilla,
    marginTop: 4,
  },
});
