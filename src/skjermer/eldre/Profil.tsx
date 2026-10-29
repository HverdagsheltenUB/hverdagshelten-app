import * as Linking from 'expo-linking';
import { CreditCard, Phone, ShieldCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Knapp } from '../../components/Knapp';
import { Kort, Skillelinje } from '../../components/Kort';
import { Listevalg } from '../../components/Listevalg';
import { Rollebryter } from '../../components/Rollebryter';
import { Skjerm } from '../../components/Skjerm';
import { Avatar } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { BryterRad } from '../../components/Valg';
import { useApp } from '../../lib/app-tilstand';
import { anne, kontaktEpost } from '../../lib/eksempeldata';

export function Profil() {
  const { storreTekst, settStorreTekst, paminnelse, settPaminnelse, visToast } = useApp();

  return (
    <Skjerm>
      <View style={styles.topp}>
        <Avatar bokstav="A" storrelse={72} />
        <Tekst variant="tittel">{anne.navn}</Tekst>
        <Tekst variant="under">{anne.sted}</Tekst>
      </View>

      <Kort>
        <BryterRad etikett="Større tekst" pa={storreTekst} onEndre={settStorreTekst} />
        <Skillelinje />
        <BryterRad etikett="Påminnelse dagen før" pa={paminnelse} onEndre={settPaminnelse} />
      </Kort>

      <Kort>
        <Tekst variant="under" vekt={600}>
          Pårørende som får beskjed
        </Tekst>
        <View>
          <Tekst variant="listetittel">{anne.parorende.navn}</Tekst>
          <Tekst variant="under">{anne.parorende.telefon}</Tekst>
        </View>
      </Kort>

      <Listevalg
        ikon={CreditCard}
        tittel="Betaling"
        undertekst="Vipps · betaler etter besøket"
        onPress={() => visToast('Kommer snart.')}
      />
      <Listevalg
        ikon={ShieldCheck}
        tittel="Trygghet"
        undertekst="Slik sjekker vi hjelperne"
        onPress={() => visToast('Kommer snart.')}
      />

      <View style={styles.kontakt}>
        <Knapp ikon={Phone} tekst="Kontakt oss" onPress={() => Linking.openURL(`mailto:${kontaktEpost}`)} />
        <Tekst variant="under" style={styles.midtstilt}>
          Ring oss hverdager 09–16. Vi hjelper gjerne.
        </Tekst>
      </View>

      <Rollebryter />
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  topp: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  kontakt: {
    gap: 10,
    marginTop: 4,
  },
  midtstilt: {
    textAlign: 'center',
  },
});
