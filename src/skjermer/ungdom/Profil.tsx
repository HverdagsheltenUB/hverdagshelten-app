import * as Linking from 'expo-linking';
import { BookOpen, Clock, Mail, Wallet } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Knapp } from '../../components/Knapp';
import { Kort, Skillelinje } from '../../components/Kort';
import { Listevalg } from '../../components/Listevalg';
import { Rollebryter } from '../../components/Rollebryter';
import { Skjerm } from '../../components/Skjerm';
import { Avatar, Pille, Statboks, Statrad } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { BryterRad, Chip, Chiprad } from '../../components/Valg';
import { useApp } from '../../lib/app-tilstand';
import { emil, hjelpeomrader, kontaktEpost } from '../../lib/eksempeldata';

export function Profil() {
  const {
    storreTekst,
    settStorreTekst,
    varselNyeOppdrag,
    settVarselNyeOppdrag,
    likerAHjelpeMed,
    byttHjelpeomrade,
    visToast,
  } = useApp();

  return (
    <Skjerm>
      <View style={styles.topp}>
        <Avatar bokstav="E" storrelse={72} />
        <Tekst variant="tittel">{emil.navn}</Tekst>
        <Tekst variant="under">{emil.beskrivelse}</Tekst>
        <View style={styles.piller}>
          <Pille tekst="✓ Bekreftet med BankID" variant="gronn" />
          <Pille tekst="✓ Foresatt har godkjent" variant="gronn" />
        </View>
      </View>

      <Statrad>
        <Statboks etikett="Oppdrag utført" verdi={String(emil.oppdragUtfort)} />
        <Statboks etikett="Vurdering" verdi={emil.vurdering} stjerne />
      </Statrad>

      <Kort>
        <Tekst variant="mellomtittel">Dette liker jeg å hjelpe med</Tekst>
        <Chiprad>
          {hjelpeomrader.map((navn) => (
            <Chip
              key={navn}
              tekst={navn}
              valgt={likerAHjelpeMed.includes(navn)}
              onPress={() => byttHjelpeomrade(navn)}
            />
          ))}
        </Chiprad>
      </Kort>

      <Kort>
        <BryterRad etikett="Varsel om nye oppdrag" pa={varselNyeOppdrag} onEndre={settVarselNyeOppdrag} />
        <Skillelinje />
        <BryterRad etikett="Større tekst" pa={storreTekst} onEndre={settStorreTekst} />
      </Kort>

      <Listevalg
        ikon={Wallet}
        tittel="Utbetaling"
        undertekst="Kontonummer og historikk"
        onPress={() => visToast('Kommer snart.')}
      />
      <Listevalg
        ikon={Clock}
        tittel="Når kan jeg hjelpe?"
        undertekst="Ettermiddager og helg"
        onPress={() => visToast('Kommer snart.')}
      />
      <Listevalg
        ikon={BookOpen}
        tittel="Retningslinjer"
        undertekst="Slik er du en god hverdagshelt"
        onPress={() => visToast('Kommer snart.')}
      />

      <Knapp
        variant="sekundar"
        ikon={Mail}
        tekst="Kontakt oss"
        onPress={() => Linking.openURL(`mailto:${kontaktEpost}`)}
      />

      <Rollebryter />
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  topp: {
    alignItems: 'center',
    gap: 4,
  },
  piller: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
});
