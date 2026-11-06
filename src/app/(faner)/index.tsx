import { CalendarHeart, HandHeart, Sparkles, Sun, WifiOff } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Tilbudskort, Tomtilstand } from '../../components/Annonse';
import { useBekreft } from '../../components/Dialog';
import { Aktivitet, Dagstripe } from '../../components/Kalender';
import { Kort } from '../../components/Kort';
import { Skjerm } from '../../components/Skjerm';
import { Avatar, Pille, Seksjon } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { useApp } from '../../lib/app-tilstand';
import {
  dagerFraIdag,
  dagtekst,
  datonokkel,
  maaneder,
  takkJa,
  ukedager,
  useAnnonser,
  type Annonse,
} from '../../lib/annonser';
import { fornavn, useKonto } from '../../lib/konto';
import { gaFrem, gaTilFane } from '../../lib/overgang';
import { farger, ikonStrek } from '../../lib/tema';

const apne = (a: Annonse) => gaFrem({ pathname: '/annonse/[id]', params: { id: a.id } });

// Forsiden. Begge profiltypene får sin egen oversikt over dagen og dagene som kommer.
// Hjelperne ser i tillegg annonsene de kan takke ja til.
export default function Hjem() {
  const { profil, session } = useKonto();
  const meg = session?.user.id ?? 'ingen';
  const hjelper = profil?.rolle === 'ungdom';
  // Det man har planlagt: egne annonser for de som trenger hjelp, oppdragene man har tatt for hjelperne.
  const planlagt = useAnnonser(hjelper ? { hjelperId: meg } : { brukerId: meg });

  return (
    <Skjerm oppdater={planlagt.oppdater}>
      <Velkomst />
      <Dagsoversikt annonser={planlagt.annonser} laster={planlagt.laster} hjelper={hjelper} />
      {hjelper && <LedigeAnnonser etterTakkJa={planlagt.oppdater} />}
    </Skjerm>
  );
}

function Velkomst() {
  const { profil } = useKonto();
  const navn = fornavn(profil?.navn);
  const idag = new Date();
  const dato = `${ukedager[idag.getDay()]} ${idag.getDate()}. ${maaneder[idag.getMonth()]}`;
  return (
    <View style={styles.velkomst}>
      <View style={styles.flex}>
        <Tekst variant="tittel" accessibilityRole="header">
          {navn ? `Hei, ${navn}!` : 'Hei!'}
        </Tekst>
        <Tekst variant="under">{dato[0].toUpperCase() + dato.slice(1)}</Tekst>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Gå til profilen din"
        onPress={() => gaTilFane('/profil')}
        hitSlop={6}
      >
        <Avatar bokstav={(navn[0] ?? '?').toUpperCase()} bilde={profil?.bilde} storrelse={56} />
      </Pressable>
    </View>
  );
}

// Kort linje under hver avtale, sett fra den som trenger hjelp eller fra hjelperen.
function beskriv(a: Annonse, hjelper: boolean) {
  if (hjelper) {
    const hos = `Hos ${fornavn(a.profiler?.navn) || 'en nabo'}${a.sted ? ` · ${a.sted}` : ''}`;
    if (a.status === 'pa_vei') return `${hos} · Du er på vei`;
    if (a.status === 'ferdig') return `${hos} · Ferdig`;
    return hos;
  }
  const navn = fornavn(a.hjelper?.navn) || 'Hjelperen';
  if (a.status === 'ledig') return 'Venter på at noen takker ja';
  if (a.status === 'akseptert') return `${navn} har takket ja`;
  if (a.status === 'pa_vei') return `${navn} er på vei`;
  return 'Ferdig';
}

function Dagsoversikt({ annonser, laster, hjelper }: { annonser: Annonse[]; laster: boolean; hjelper: boolean }) {
  const [idag, ...neste] = useMemo(() => dagerFraIdag(8), []);
  const idagNokkel = datonokkel(idag);

  // Grupper alt med tidspunkt etter dag, sortert etter klokkeslett.
  const perDag = useMemo(() => {
    const m: Record<string, Annonse[]> = {};
    for (const a of annonser) {
      if (!a.tidspunkt) continue;
      const n = datonokkel(new Date(a.tidspunkt));
      (m[n] ??= []).push(a);
    }
    for (const liste of Object.values(m)) liste.sort((x, y) => (x.tidspunkt ?? '').localeCompare(y.tidspunkt ?? ''));
    return m;
  }, [annonser]);
  const antall = useMemo(
    () => Object.fromEntries(Object.entries(perDag).map(([n, l]) => [n, l.length])),
    [perDag],
  );
  // Avtalt, men uten fast tid: vises så det ikke blir borte.
  const utenTid = annonser.filter((a) => !a.tidspunkt && (a.status === 'akseptert' || a.status === 'pa_vei'));

  const forsteMedNoe = neste.find((d) => antall[datonokkel(d)]) ?? neste[0];
  const [valgt, setValgt] = useState<string | null>(null);
  const valgtDag = valgt ?? datonokkel(forsteMedNoe);
  const valgtDato = neste.find((d) => datonokkel(d) === valgtDag) ?? neste[0];
  const iDag = perDag[idagNokkel] ?? [];
  const denDagen = perDag[valgtDag] ?? [];

  if (laster) {
    return <ActivityIndicator color={farger.lilla} size="large" style={styles.laster} />;
  }

  return (
    <>
      <Seksjon tittel="I dag" hoyre={iDag.length > 0 && <Pille tekst={`${iDag.length} avtale${iDag.length === 1 ? '' : 'r'}`} variant="lilla" />} />
      {iDag.length > 0 ? (
        <View style={styles.liste}>
          {iDag.map((a) => (
            <Aktivitet key={a.id} annonse={a} undertekst={beskriv(a, hjelper)} onPress={() => apne(a)} />
          ))}
        </View>
      ) : (
        <Kort myk style={styles.tomDag}>
          <View style={styles.solIkon}>
            <Sun size={26} color={farger.morkLilla} strokeWidth={ikonStrek} />
          </View>
          <View style={styles.flex}>
            <Tekst variant="listetittel" vekt={700}>
              Ingenting planlagt i dag
            </Tekst>
            <Tekst variant="under">
              {hjelper
                ? 'Ta en titt på annonsene under. Kanskje noen trenger akkurat deg?'
                : 'Nyt dagen! Når noen takker ja til en annonse, dukker det opp her.'}
            </Tekst>
          </View>
        </Kort>
      )}

      <Seksjon tittel="De neste dagene" />
      <Dagstripe dager={neste} valgt={valgtDag} onVelg={setValgt} antall={antall} />
      {denDagen.length > 0 ? (
        <View style={styles.liste}>
          {denDagen.map((a) => (
            <Aktivitet key={a.id} annonse={a} undertekst={beskriv(a, hjelper)} onPress={() => apne(a)} />
          ))}
        </View>
      ) : (
        <View style={styles.rolig}>
          <CalendarHeart size={20} color={farger.dempet} strokeWidth={ikonStrek} />
          <Tekst variant="under" style={styles.flex}>
            Ingenting planlagt {dagtekst(valgtDato)}.
          </Tekst>
        </View>
      )}

      {utenTid.length > 0 && (
        <>
          <Seksjon tittel="Avtalt, uten fast tid" />
          <View style={styles.liste}>
            {utenTid.map((a) => (
              <Aktivitet key={a.id} annonse={a} undertekst={beskriv(a, hjelper)} onPress={() => apne(a)} />
            ))}
          </View>
        </>
      )}
    </>
  );
}

// Annonsene fra de som trenger hjelp, med «Takk ja» rett på kortet.
function LedigeAnnonser({ etterTakkJa }: { etterTakkJa: () => Promise<void> }) {
  const { annonser, laster, feil, oppdater } = useAnnonser({ bareLedige: true });
  const { visToast } = useApp();
  const bekreft = useBekreft();
  const [tar, setTar] = useState<string | null>(null);

  async function sierJa(a: Annonse) {
    const navn = fornavn(a.profiler?.navn) || 'den som la den ut';
    const ja = await bekreft({
      tittel: `Takke ja til «${a.tittel}»?`,
      tekst: `Da får du adressen og kan skrive med ${navn}. Annonsen forsvinner for de andre hjelperne.`,
      ja: 'Ja, takk ja',
    });
    if (!ja) return;
    setTar(a.id);
    const svar = await takkJa(a);
    setTar(null);
    if (svar.feil) {
      visToast(svar.feil);
      await oppdater();
      return;
    }
    visToast(`Du har takket ja! ${navn} har fått beskjed.`);
    await Promise.all([oppdater(), etterTakkJa()]);
    apne(a);
  }

  return (
    <>
      <Seksjon
        tittel="Trenger hjelp i nabolaget"
        hoyre={!laster && annonser.length > 0 && <Pille tekst={`${annonser.length} ledige`} variant="lilla" />}
      />
      {laster ? (
        <ActivityIndicator color={farger.lilla} size="large" style={styles.laster} />
      ) : feil && annonser.length === 0 ? (
        <Tomtilstand
          ikon={WifiOff}
          tittel="Fikk ikke hentet annonsene"
          tekst={feil}
          knapp={{ tekst: 'Prøv igjen', onPress: () => void oppdater() }}
        />
      ) : annonser.length === 0 ? (
        <Tomtilstand
          ikon={Sparkles}
          tittel="Ingen ledige annonser akkurat nå"
          tekst="Når noen i nabolaget trenger hjelp, dukker det opp her. Dra ned for å se etter nye."
        />
      ) : (
        <View style={styles.liste}>
          {annonser.map((a) => (
            <Tilbudskort key={a.id} annonse={a} tar={tar === a.id} onTakkJa={() => sierJa(a)} onApne={() => apne(a)} />
          ))}
          <View style={styles.rolig}>
            <HandHeart size={20} color={farger.dempet} strokeWidth={ikonStrek} />
            <Tekst variant="underLiten" style={styles.flex}>
              Når du takker ja, får du adressen og kan skrive med den som trenger hjelp.
            </Tekst>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  velkomst: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  flex: { flex: 1 },
  liste: { gap: 12 },
  laster: { paddingVertical: 24 },
  tomDag: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  solIkon: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: farger.fersken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rolig: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
});
