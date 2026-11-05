import { router } from 'expo-router';
import { Camera, Eye, ImagePlus, PenLine, Send, Sparkles, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Annonsevisning } from '../components/Annonsevisning';
import { useBekreft } from '../components/Dialog';
import { Infoboks } from '../components/Ekstra';
import { Knapp } from '../components/Knapp';
import { Skjerm } from '../components/Skjerm';
import { Tekstfelt } from '../components/Skjema';
import { Overskrift } from '../components/Smaabiter';
import { Tekst } from '../components/Tekst';
import { BryterRad, Chip, Chiprad } from '../components/Valg';
import { useApp } from '../lib/app-tilstand';
import {
  annonsekategorier,
  finnAnnonsekategori,
  foreslaKategori,
  lagreAnnonse,
  radFraUtkast,
  tilstander,
  tomtUtkast,
  utkastFraAnnonse,
  type Annonse,
  type Annonseutkast,
  type Levering,
} from '../lib/annonser';
import { hentBilde, hentFlereBilder } from '../lib/bilde';
import { useKonto } from '../lib/konto';
import { gaTilbake, settRetning } from '../lib/overgang';
import { farger, ikonStrek } from '../lib/tema';
import { harInnhold, hentUtkast, lagreUtkast, slettUtkast } from '../lib/utkast';

const maksBilder = 6;

type Props = {
  // Satt når en eksisterende annonse endres.
  eksisterende?: Annonse | null;
};

// Legg ut eller endre en annonse: ett skjema, forhåndsvisning, publiser.
export function Annonseskjema({ eksisterende }: Props) {
  const { session, profil } = useKonto();
  const { visToast } = useApp();
  const bekreft = useBekreft();
  const brukerId = session?.user.id ?? '';
  const ny = !eksisterende;

  const [u, setU] = useState<Annonseutkast>(() =>
    eksisterende ? utkastFraAnnonse(eksisterende) : { ...tomtUtkast, sted: profil?.omrade ?? '' },
  );
  const [steg, setSteg] = useState<'skjema' | 'forhandsvis'>('skjema');
  const [valgtSelv, setValgtSelv] = useState(Boolean(eksisterende));
  const [visAlleKategorier, setVisAlleKategorier] = useState(!eksisterende);
  const [lagrer, setLagrer] = useState(false);
  const [utkastLagret, setUtkastLagret] = useState(false);
  const hentet = useRef(!ny);

  // Hent et uferdig utkast fra sist, hvis det finnes.
  useEffect(() => {
    if (!ny || !brukerId) return;
    hentUtkast(brukerId).then((lagret) => {
      if (lagret && harInnhold(lagret)) {
        setU(lagret);
        setValgtSelv(Boolean(lagret.kategori));
        setVisAlleKategorier(!lagret.kategori);
        visToast('Vi fant utkastet ditt fra sist.');
      }
      hentet.current = true;
    });
  }, [ny, brukerId, visToast]);

  // Lagre utkastet mens man skriver (bare for nye annonser).
  useEffect(() => {
    if (!ny || !brukerId || !hentet.current) return;
    const t = setTimeout(() => {
      if (harInnhold(u)) {
        lagreUtkast(brukerId, u);
        setUtkastLagret(true);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [u, ny, brukerId]);

  const sett = (endring: Partial<Annonseutkast>) => {
    setUtkastLagret(false);
    const neste = { ...u, ...endring };
    // Foreslå kategori automatisk ut fra tittel og beskrivelse, til brukeren velger selv.
    if (!valgtSelv && ('tittel' in endring || 'beskrivelse' in endring)) {
      const forslag = foreslaKategori(`${neste.tittel} ${neste.beskrivelse}`);
      if (forslag && forslag.navn !== neste.kategori) {
        neste.kategori = forslag.navn;
        setVisAlleKategorier(false);
      }
    }
    setU(neste);
  };

  const kategori = finnAnnonsekategori(u.kategori);
  const erTing = kategori?.type === 'ting';
  const tittelOk = u.tittel.trim().length >= 3;
  const klar = tittelOk && Boolean(kategori);
  const mangler = !tittelOk ? 'Skriv en tittel på minst tre tegn.' : !kategori ? 'Velg en kategori.' : null;

  async function leggTilBilder(fraKamera: boolean) {
    const plass = maksBilder - u.bilder.length;
    if (plass <= 0) return;
    if (fraKamera) {
      const { uri, feil } = await hentBilde(true);
      if (feil) visToast(feil);
      if (uri) sett({ bilder: [...u.bilder, uri] });
      return;
    }
    const { uris, feil } = await hentFlereBilder(plass);
    if (feil) visToast(feil);
    if (uris.length > 0) sett({ bilder: [...u.bilder, ...uris].slice(0, maksBilder) });
  }

  async function publiser() {
    if (!klar || !brukerId) return;
    setLagrer(true);
    const svar = await lagreAnnonse(brukerId, u, eksisterende);
    setLagrer(false);
    if (svar.feil || !svar.id) {
      visToast(svar.feil ?? 'Noe gikk galt. Prøv igjen.');
      return;
    }
    if (ny) await slettUtkast(brukerId);
    visToast(ny ? 'Annonsen er publisert! Nå kan alle se den.' : 'Endringene er lagret.');
    settRetning('frem');
    router.replace({ pathname: '/annonse/[id]', params: { id: svar.id } });
  }

  async function avbryt() {
    if (ny && harInnhold(u)) {
      const behold = await bekreft({
        tittel: 'Vil du beholde utkastet?',
        tekst: 'Da kan du fortsette der du slapp senere.',
        ja: 'Ja, behold utkastet',
        nei: 'Nei, slett det',
      });
      if (behold) await lagreUtkast(brukerId, u);
      else await slettUtkast(brukerId);
    }
    gaTilbake('/');
  }

  if (steg === 'forhandsvis') {
    const rad = radFraUtkast(u);
    return (
      <Skjerm
        nokkel="forhandsvis"
        tilbake={{ tekst: 'Endre', onPress: () => { settRetning('tilbake'); setSteg('skjema'); } }}
        bunn={
          <View style={styles.bunnknapper}>
            <Knapp ikon={Send} tekst={ny ? 'Publiser annonse' : 'Lagre endringene'} laster={lagrer} onPress={publiser} />
          </View>
        }
      >
        <Overskrift tittel="Slik ser annonsen ut" undertekst="Sjekk at alt stemmer før andre får se den." />
        <Annonsevisning
          a={{
            ...rad,
            bilder: u.bilder,
            navn: profil?.navn ?? '',
            medlemSiden: profil?.opprettet,
            opprettet: eksisterende?.opprettet,
          }}
        />
        {lagrer && u.bilder.some((b) => !b.startsWith('http')) && (
          <Infoboks tekst="Laster opp bildene. Det kan ta litt tid hvis nettet er tregt." />
        )}
      </Skjerm>
    );
  }

  return (
    <Skjerm
      nokkel="skjema"
      tilbake={{ tekst: 'Avbryt', onPress: avbryt }}
      bunn={
        <View style={styles.bunnknapper}>
          {mangler && (
            <Tekst variant="underLiten" style={styles.sentrert}>
              {mangler}
            </Tekst>
          )}
          <Knapp
            ikon={Eye}
            tekst="Forhåndsvis annonsen"
            deaktivert={!klar}
            onPress={() => {
              settRetning('frem');
              setSteg('forhandsvis');
            }}
          />
        </View>
      }
    >
      <Overskrift
        tittel={ny ? 'Legg ut annonse' : 'Endre annonsen'}
        undertekst={
          ny
            ? 'Bare tittel og kategori må fylles ut. Resten er valgfritt.'
            : 'Endringene vises for alle når du lagrer.'
        }
      />
      {ny && utkastLagret && (
        <Tekst variant="underLiten" farge={farger.gronn} vekt={600}>
          ✓ Utkastet er lagret på telefonen
        </Tekst>
      )}

      {/* Bilder */}
      <View style={styles.gruppe}>
        <Tekst variant="brodLiten" vekt={700}>
          Bilder <Tekst variant="underLiten">(valgfritt, opptil {maksBilder})</Tekst>
        </Tekst>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bilderad}>
          {u.bilder.map((uri, i) => (
            <View key={uri} style={styles.bildeboks}>
              <Image source={{ uri }} style={styles.bilde} />
              {i === 0 && (
                <View style={styles.forsidemerke}>
                  <Tekst variant="liten" vekt={700} farge={farger.hvit}>
                    Forsidebilde
                  </Tekst>
                </View>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Fjern bilde ${i + 1}`}
                onPress={() => sett({ bilder: u.bilder.filter((b) => b !== uri) })}
                hitSlop={8}
                style={styles.fjern}
              >
                <X size={18} color={farger.hvit} strokeWidth={2.5} />
              </Pressable>
            </View>
          ))}
          {u.bilder.length < maksBilder && (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Velg bilder fra telefonen"
                onPress={() => leggTilBilder(false)}
                style={({ pressed }) => [styles.leggTil, pressed && styles.trykket]}
              >
                <ImagePlus size={30} color={farger.lilla} strokeWidth={ikonStrek} />
                <Tekst variant="underLiten" vekt={700} farge={farger.lilla}>
                  Velg bilder
                </Tekst>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ta bilde med kameraet"
                onPress={() => leggTilBilder(true)}
                style={({ pressed }) => [styles.leggTil, pressed && styles.trykket]}
              >
                <Camera size={30} color={farger.lilla} strokeWidth={ikonStrek} />
                <Tekst variant="underLiten" vekt={700} farge={farger.lilla}>
                  Ta bilde
                </Tekst>
              </Pressable>
            </>
          )}
        </ScrollView>
      </View>

      <Tekstfelt
        etikett="Tittel"
        hjelpetekst="Kort og tydelig, for eksempel «Trenger hjelp til å klippe plenen» eller «Pent brukt sykkel»."
        value={u.tittel}
        onChangeText={(tittel) => sett({ tittel: tittel.slice(0, 80) })}
        maxLength={80}
        returnKeyType="next"
      />

      {/* Kategori */}
      <View style={styles.gruppe}>
        <Tekst variant="brodLiten" vekt={700}>
          Kategori
        </Tekst>
        {kategori && !visAlleKategorier ? (
          <View style={styles.valgtKategori}>
            <Chip tekst={kategori.navn} valgt onPress={() => setVisAlleKategorier(true)} />
            {!valgtSelv && (
              <View style={styles.foreslatt}>
                <Sparkles size={16} color={farger.lilla} strokeWidth={ikonStrek} />
                <Tekst variant="underLiten" farge={farger.lilla} vekt={600}>
                  Foreslått ut fra tittelen
                </Tekst>
              </View>
            )}
            <Pressable accessibilityRole="button" onPress={() => setVisAlleKategorier(true)} hitSlop={10}>
              <Tekst variant="brodLiten" vekt={700} farge={farger.lilla} style={styles.understrek}>
                Endre
              </Tekst>
            </Pressable>
          </View>
        ) : (
          <>
            <Tekst variant="underLiten">Trenger du hjelp?</Tekst>
            <Chiprad>
              {annonsekategorier
                .filter((k) => k.type === 'hjelp')
                .map((k) => (
                  <Chip
                    key={k.navn}
                    tekst={k.navn}
                    valgt={u.kategori === k.navn}
                    onPress={() => {
                      setValgtSelv(true);
                      setVisAlleKategorier(false);
                      sett({ kategori: k.navn });
                    }}
                  />
                ))}
            </Chiprad>
            <Tekst variant="underLiten">Selger du eller gir bort noe?</Tekst>
            <Chiprad>
              {annonsekategorier
                .filter((k) => k.type === 'ting')
                .map((k) => (
                  <Chip
                    key={k.navn}
                    tekst={k.navn}
                    valgt={u.kategori === k.navn}
                    onPress={() => {
                      setValgtSelv(true);
                      setVisAlleKategorier(false);
                      sett({ kategori: k.navn });
                    }}
                  />
                ))}
            </Chiprad>
          </>
        )}
      </View>

      <Tekstfelt
        etikett="Beskrivelse (valgfritt)"
        hjelpetekst={
          erTing
            ? 'Fortell kort om tingen, for eksempel merke, mål eller hvorfor du selger.'
            : 'Fortell kort hva du trenger hjelp med, og når det passer.'
        }
        flereLinjer
        value={u.beskrivelse}
        onChangeText={(beskrivelse) => sett({ beskrivelse: beskrivelse.slice(0, 2000) })}
      />

      {/* Pris */}
      <View style={styles.gruppe}>
        {!u.gratis && (
          <Tekstfelt
            etikett={erTing ? 'Pris i kroner (valgfritt)' : 'Hva vil du betale? (valgfritt)'}
            hjelpetekst={
              erTing ? 'La feltet stå tomt hvis prisen er etter avtale.' : 'Vanlig er 150 kr per time. Tomt betyr etter avtale.'
            }
            value={u.pris}
            onChangeText={(pris) => sett({ pris: pris.replace(/\D/g, '').slice(0, 7) })}
            keyboardType="number-pad"
            placeholder="For eksempel 200"
          />
        )}
        {erTing && <BryterRad etikett="Gis bort gratis" pa={u.gratis} onEndre={(gratis) => sett({ gratis })} />}
      </View>

      {erTing && (
        <View style={styles.gruppe}>
          <Tekst variant="brodLiten" vekt={700}>
            Tilstand (valgfritt)
          </Tekst>
          <Chiprad>
            {tilstander.map((t) => (
              <Chip key={t} tekst={t} valgt={u.tilstand === t} onPress={() => sett({ tilstand: u.tilstand === t ? '' : t })} />
            ))}
          </Chiprad>
        </View>
      )}

      {kategori?.storrelse && (
        <Tekstfelt
          etikett="Størrelse (valgfritt)"
          hjelpetekst={kategori.navn === 'Klær og sko' ? 'For eksempel M, 42 eller 38.' : 'For eksempel 26 tommer eller 180 cm.'}
          value={u.storrelse}
          onChangeText={(storrelse) => sett({ storrelse: storrelse.slice(0, 40) })}
        />
      )}

      <Tekstfelt
        etikett="Sted (valgfritt)"
        hjelpetekst="Skriv bare området, for eksempel «Sagene». Ikke full adresse."
        value={u.sted}
        onChangeText={(sted) => sett({ sted: sted.slice(0, 80) })}
      />

      {erTing && (
        <View style={styles.gruppe}>
          <Tekst variant="brodLiten" vekt={700}>
            Levering (valgfritt)
          </Tekst>
          <Chiprad>
            {(['hentes', 'sendes', 'begge'] as Levering[]).map((l) => (
              <Chip
                key={l}
                tekst={l === 'hentes' ? 'Må hentes' : l === 'sendes' ? 'Kan sendes' : 'Begge deler'}
                valgt={u.levering === l}
                onPress={() => sett({ levering: u.levering === l ? null : l })}
              />
            ))}
          </Chiprad>
        </View>
      )}

      {!ny && (
        <Knapp
          variant="sekundar"
          ikon={PenLine}
          tekst="Lagre uten forhåndsvisning"
          deaktivert={!klar}
          laster={lagrer}
          onPress={publiser}
        />
      )}
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  gruppe: { gap: 10 },
  bilderad: { gap: 10, paddingRight: 4 },
  bildeboks: { width: 104, height: 104, borderRadius: 14, overflow: 'hidden' },
  bilde: { width: '100%', height: '100%' },
  forsidemerke: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(62,47,75,0.8)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  fjern: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: 'rgba(43,34,48,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leggTil: {
    width: 104,
    height: 104,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: farger.lilla,
    backgroundColor: farger.lysLilla,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  trykket: { opacity: 0.75 },
  valgtKategori: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  foreslatt: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  understrek: { textDecorationLine: 'underline' },
  bunnknapper: { gap: 8 },
  sentrert: { textAlign: 'center' },
});
