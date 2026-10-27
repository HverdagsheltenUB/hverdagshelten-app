import * as Linking from 'expo-linking';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { StorKnapp } from '../components/StorKnapp';
import { farger, skrift, storrelse } from '../lib/tema';

const epost = 'hverdagsheltenub@gmail.com';
const nettside = 'https://hverdagsheltenub.github.io/hverdagshelten-nettside/';

export default function Kontakt() {
  return (
    <ScrollView contentContainerStyle={styles.side}>
      <Text style={styles.tekst}>
        Vi er en gjeng ungdommer som vil hjelpe eldre i nærmiljøet. Skriv til oss, så svarer vi så fort vi kan.
      </Text>
      <Text style={styles.epost}>{epost}</Text>
      <StorKnapp ikon="✉️" tekst="Send oss en e-post" onPress={() => Linking.openURL(`mailto:${epost}`)} />
      <StorKnapp ikon="🌐" tekst="Åpne nettsiden" variant="lys" onPress={() => Linking.openURL(nettside)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  side: {
    padding: 24,
    gap: 20,
  },
  tekst: {
    fontFamily: skrift.vanlig,
    fontSize: storrelse.tekst,
    color: farger.tekst,
    lineHeight: 30,
  },
  epost: {
    fontFamily: skrift.fet,
    fontSize: storrelse.tekst,
    color: farger.lilla,
  },
});
