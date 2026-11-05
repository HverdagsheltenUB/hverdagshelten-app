import { ClipboardList, FilePen, Megaphone, MessageCircle, Plus, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Annonsekort, Tomtilstand } from '../../components/Annonse';
import { useBekreft } from '../../components/Dialog';
import { Knapp } from '../../components/Knapp';
import { Kort } from '../../components/Kort';
import { Skjerm } from '../../components/Skjerm';
import { Overskrift, Seksjon } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { useApp } from '../../lib/app-tilstand';
import { slettAnnonse, useAnnonser, type Annonse, type Annonseutkast } from '../../lib/annonser';
import { fornavn, useKonto } from '../../lib/konto';
import { gaFrem, gaTilFane } from '../../lib/overgang';
import { farger } from '../../lib/tema';
import { harInnhold, hentUtkast, slettUtkast } from '../../lib/utkast';

// Fane nummer to: «Mine annonser» for de som trenger hjelp, «Mine oppdrag» for hjelperne.
export default function MineFane() {
  const { profil } = useKonto();
  return profil?.rolle === 'ungdom' ? <MineOppdrag /> : <MineAnnonser />;
}

// Oppdragene hjelperen har akseptert.
function MineOppdrag() {
  const { session } = useKonto();
  const { annonser, laster, oppdater } = useAnnonser({ hjelperId: session?.user.id ?? 'ingen' });
  const pagaende = annonser.filter((a) => a.status !== 'ferdig');
  const ferdige = annonser.filter((a) => a.status === 'ferdig');

  return (
    <Skjerm oppdater={oppdater}>
      <Overskrift tittel="Mine oppdrag" undertekst="Det du har akseptert. Trykk for adresse, veibeskrivelse og chat." />
      {laster ? (
        <ActivityIndicator color={farger.lilla} size="large" style={styles.laster} />
      ) : annonser.length === 0 ? (
        <Tomtilstand
          ikon={ClipboardList}
          tittel="Ingen oppdrag ennå"
          tekst="Finn en annonse på Hjem og trykk «Aksepter oppdraget». Da dukker den opp her."
          knapp={{ tekst: 'Se ledige annonser', onPress: () => gaTilFane('/') }}
        />
      ) : (
        <>
          <Seksjon tittel="Pågående" />
          {pagaende.length === 0 && <Tekst variant="under">Ingen pågående oppdrag akkurat nå.</Tekst>}
          {pagaende.map((a) => (
            <View key={a.id} style={styles.gruppe}>
              <Annonsekort annonse={a} onPress={() => gaFrem({ pathname: '/annonse/[id]', params: { id: a.id } })} />
              <Knapp
                liten
                variant="sekundar"
                ikon={MessageCircle}
                tekst={`Skriv med ${fornavn(a.profiler?.navn) || 'den som la den ut'}`}
                onPress={() => gaFrem({ pathname: '/chat/[id]', params: { id: a.id } })}
              />
            </View>
          ))}
          {ferdige.length > 0 && (
            <>
              <Seksjon tittel={`Ferdige (${ferdige.length})`} />
              {ferdige.map((a) => (
                <Annonsekort
                  key={a.id}
                  annonse={a}
                  onPress={() => gaFrem({ pathname: '/annonse/[id]', params: { id: a.id } })}
                />
              ))}
            </>
          )}
        </>
      )}
    </Skjerm>
  );
}

// Annonsene brukeren selv har lagt ut, med endring og sletting.
function MineAnnonser() {
  const { session } = useKonto();
  const brukerId = session?.user.id;
  const { annonser, laster, oppdater } = useAnnonser({ brukerId: brukerId ?? 'ingen' });
  const { visToast } = useApp();
  const bekreft = useBekreft();
  const [utkast, setUtkast] = useState<Annonseutkast | null>(null);
  const [sletter, setSletter] = useState<string | null>(null);

  useEffect(() => {
    if (brukerId) hentUtkast(brukerId).then((u) => setUtkast(u && harInnhold(u) ? u : null));
  }, [brukerId, annonser]);

  async function slett(a: Annonse) {
    const ja = await bekreft({
      tittel: 'Slette annonsen?',
      tekst: `«${a.tittel}» blir borte for alle. Dette kan ikke angres.`,
      ja: 'Ja, slett annonsen',
      farlig: true,
    });
    if (!ja) return;
    setSletter(a.id);
    const svar = await slettAnnonse(a);
    setSletter(null);
    if (svar.feil) visToast(svar.feil);
    else {
      visToast('Annonsen er slettet.');
      oppdater();
    }
  }

  return (
    <Skjerm oppdater={oppdater}>
      <Overskrift tittel="Mine annonser" undertekst="Det du har lagt ut. Bare du kan endre og slette dem." />
      <Knapp ikon={Plus} tekst="Legg ut annonse" onPress={() => gaFrem('/annonse/ny')} />

      {utkast && (
        <Kort myk onPress={() => gaFrem('/annonse/ny')} accessibilityLabel="Fortsett på utkastet" style={styles.rad}>
          <FilePen size={26} color={farger.morkLilla} />
          <View style={styles.flex}>
            <Tekst variant="listetittel">Du har et utkast</Tekst>
            <Tekst variant="under" numberOfLines={1}>
              {utkast.tittel.trim() || 'Uten tittel'} · trykk for å fortsette
            </Tekst>
          </View>
          <Knapp
            liten
            variant="sekundar"
            tekst="Slett"
            style={styles.slettUtkast}
            onPress={async () => {
              if (!brukerId) return;
              await slettUtkast(brukerId);
              setUtkast(null);
            }}
          />
        </Kort>
      )}

      <Seksjon tittel="Publisert" />
      {laster ? (
        <ActivityIndicator color={farger.lilla} size="large" style={styles.laster} />
      ) : annonser.length === 0 ? (
        <Tomtilstand
          ikon={Megaphone}
          tittel="Du har ingen annonser ennå"
          tekst="Når du legger ut noe, ser du det her. Da kan du også endre eller slette det."
        />
      ) : (
        annonser.map((a) => (
          <View key={a.id} style={styles.gruppe}>
            <Annonsekort annonse={a} onPress={() => gaFrem({ pathname: '/annonse/[id]', params: { id: a.id } })} />
            <View style={styles.knapper}>
              {a.status !== 'ledig' && (
                <Knapp
                  liten
                  variant="sekundar"
                  ikon={MessageCircle}
                  tekst="Chat"
                  onPress={() => gaFrem({ pathname: '/chat/[id]', params: { id: a.id } })}
                />
              )}
              <Knapp
                liten
                variant="sekundar"
                ikon={FilePen}
                tekst="Endre"
                onPress={() => gaFrem({ pathname: '/annonse/endre/[id]', params: { id: a.id } })}
              />
              <Knapp
                liten
                variant="sekundar"
                ikon={Trash2}
                tekst="Slett"
                laster={sletter === a.id}
                onPress={() => slett(a)}
              />
            </View>
          </View>
        ))
      )}
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  rad: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  flex: { flex: 1 },
  slettUtkast: { flex: 0 },
  laster: { paddingVertical: 24 },
  gruppe: { gap: 8 },
  knapper: { flexDirection: 'row', gap: 10 },
});
