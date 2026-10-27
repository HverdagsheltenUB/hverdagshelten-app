import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { StorKnapp } from '../components/StorKnapp';
import { farger, skrift, storrelse } from '../lib/tema';

export default function Forside() {
  return (
    <ScrollView contentContainerStyle={styles.side}>
      <View style={styles.topp}>
        <Text style={styles.slagord}>En hjelpende hånd.</Text>
        <Text style={styles.tittel}>Hei! Hva kan vi hjelpe deg med i dag?</Text>
      </View>

      <View style={styles.knapper}>
        <StorKnapp ikon="🤝" tekst="Bestill hjelp" onPress={() => router.push('/bestill')} />
        <StorKnapp
          ikon="📋"
          tekst="Mine bestillinger"
          variant="lys"
          onPress={() => router.push('/mine-bestillinger')}
        />
        <StorKnapp ikon="✉️" tekst="Kontakt oss" variant="lys" onPress={() => router.push('/kontakt')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  side: {
    padding: 24,
    gap: 32,
  },
  topp: {
    gap: 8,
    marginTop: 8,
  },
  slagord: {
    fontFamily: skrift.fet,
    fontSize: storrelse.tekst,
    color: farger.lilla,
  },
  tittel: {
    fontFamily: skrift.fet,
    fontSize: storrelse.tittel,
    color: farger.tekst,
    lineHeight: 42,
  },
  knapper: {
    gap: 20,
  },
});
