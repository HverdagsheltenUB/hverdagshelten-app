import { router, useLocalSearchParams } from 'expo-router';
import { Flag, MessageCircle, PenLine, SearchX, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Tomtilstand } from '../../components/Annonse';
import { Annonsevisning } from '../../components/Annonsevisning';
import { useBekreft } from '../../components/Dialog';
import { Infoboks } from '../../components/Ekstra';
import { Knapp } from '../../components/Knapp';
import { Skjerm } from '../../components/Skjerm';
import { useApp } from '../../lib/app-tilstand';
import { slettAnnonse, useAnnonse } from '../../lib/annonser';
import { useKonto } from '../../lib/konto';
import { gaFrem, gaTilbake, settRetning } from '../../lib/overgang';
import { farger } from '../../lib/tema';

// Annonsesiden: slik alle ser annonsen. Eieren kan endre og slette.
export default function Annonseside() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { annonse, laster, feil, oppdater } = useAnnonse(id);
  const { session } = useKonto();
  const { visToast } = useApp();
  const bekreft = useBekreft();
  const [sletter, setSletter] = useState(false);

  if (laster) {
    return (
      <Skjerm tilbake={{}}>
        <ActivityIndicator color={farger.lilla} size="large" style={styles.laster} />
      </Skjerm>
    );
  }
  if (!annonse) {
    return (
      <Skjerm tilbake={{}}>
        <Tomtilstand
          ikon={SearchX}
          tittel={feil ? 'Fikk ikke hentet annonsen' : 'Annonsen finnes ikke lenger'}
          tekst={feil ?? 'Den som la den ut, kan ha slettet den.'}
          knapp={{ tekst: 'Til forsiden', onPress: () => gaTilbake('/') }}
        />
      </Skjerm>
    );
  }

  const min = annonse.bruker_id === session?.user.id;

  return (
    <Skjerm tilbake={{ onPress: () => gaTilbake('/') }} oppdater={oppdater}>
      <Annonsevisning
        a={{
          ...annonse,
          navn: annonse.profiler?.navn ?? '',
          medlemSiden: annonse.profiler?.opprettet,
        }}
      />
      {min ? (
        <View style={styles.knapper}>
          <Infoboks tekst="Dette er din annonse. Alle som bruker appen, kan se den." />
          <Knapp
            ikon={PenLine}
            tekst="Endre annonsen"
            onPress={() => gaFrem({ pathname: '/annonse/endre/[id]', params: { id: annonse.id } })}
          />
          <Knapp
            variant="sekundar"
            ikon={Trash2}
            tekst="Slett annonsen"
            laster={sletter}
            onPress={async () => {
              const ja = await bekreft({
                tittel: 'Slette annonsen?',
                tekst: `«${annonse.tittel}» blir borte for alle. Dette kan ikke angres.`,
                ja: 'Ja, slett annonsen',
                farlig: true,
              });
              if (!ja) return;
              setSletter(true);
              const svar = await slettAnnonse(annonse);
              setSletter(false);
              if (svar.feil) {
                visToast(svar.feil);
                return;
              }
              visToast('Annonsen er slettet.');
              settRetning('tilbake');
              router.replace('/mine');
            }}
          />
        </View>
      ) : (
        <View style={styles.knapper}>
          <Knapp ikon={MessageCircle} tekst="Send melding" deaktivert onPress={() => {}} />
          <Infoboks tekst="Meldinger mellom brukere kommer i neste versjon. I testen kan dere avtale direkte." />
          <Knapp
            variant="sekundar"
            ikon={Flag}
            tekst="Meld fra om annonsen"
            onPress={() => gaFrem({ pathname: '/melde-fra', params: { id: annonse.id, tittel: annonse.tittel } })}
          />
        </View>
      )}
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  laster: { paddingVertical: 48 },
  knapper: { gap: 12 },
});
