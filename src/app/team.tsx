import { Check, Megaphone } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Infoboks, Statuspille } from '../components/Ekstra';
import { Knapp } from '../components/Knapp';
import { Kort } from '../components/Kort';
import { Skjerm } from '../components/Skjerm';
import { Tekstfelt } from '../components/Skjema';
import { Overskrift, Pille, Statboks, Statrad } from '../components/Smaabiter';
import { Tekst } from '../components/Tekst';
import { Chip, Chiprad } from '../components/Valg';
import { useApp } from '../lib/app-tilstand';
import { dagnavn, tidsrom } from '../lib/dato';
import { finnHjelper, hjelpereTilGodkjenning, tittelFor } from '../lib/eksempeldata';
import { kroner, priser } from '../lib/tema';

type Fane = 'bestillinger' | 'hjelpere' | 'meldinger' | 'tall';

// Enkel oversikt for teamet. Senere blir dette en egen innlogget side for administratorer.
export default function Team() {
  const { data, endre, visToast } = useApp();
  const [fane, setFane] = useState<Fane>('bestillinger');
  const [beskjed, setBeskjed] = useState('');

  const aktive = data.oppdrag.filter((o) => o.status !== 'avlyst');
  const ferdige = data.oppdrag.filter((o) => o.status === 'ferdig');
  const vurderinger = ferdige.filter((o) => o.vurdering).map((o) => o.vurdering ?? 0);
  const snitt = vurderinger.length ? vurderinger.reduce((a, b) => a + b, 0) / vurderinger.length : 0;
  const apneMeldinger = data.rapporter.filter((r) => !r.fulgtOpp).length;

  return (
    <Skjerm tilbake={{}} hjelp={false}>
      <Overskrift tittel="Teamvisning" undertekst="Bare for Hverdagshelten-teamet." />
      <Chiprad>
        <Chip tekst="Bestillinger" valgt={fane === 'bestillinger'} onPress={() => setFane('bestillinger')} />
        <Chip tekst="Nye hjelpere" valgt={fane === 'hjelpere'} onPress={() => setFane('hjelpere')} />
        <Chip
          tekst={apneMeldinger ? `Meldinger (${apneMeldinger})` : 'Meldinger'}
          valgt={fane === 'meldinger'}
          onPress={() => setFane('meldinger')}
        />
        <Chip tekst="Tall" valgt={fane === 'tall'} onPress={() => setFane('tall')} />
      </Chiprad>

      {fane === 'bestillinger' &&
        aktive.map((o) => (
          <Kort key={o.id}>
            <View style={styles.rad}>
              <View style={styles.flex}>
                <Tekst variant="listetittel">
                  {tittelFor(o)} · {o.mottaker.navn}
                </Tekst>
                <Tekst variant="under">
                  {dagnavn(o.dato)} {tidsrom(o.start, o.varighet)} · {o.mottaker.omrade}
                </Tekst>
                <Tekst variant="under">
                  Hjelper: {finnHjelper(o.hjelperId)?.navn ?? 'ingen ennå'}
                  {o.status === 'ferdig' ? (o.betalt ? ' · betalt' : ' · ikke betalt') : ''}
                </Tekst>
              </View>
              <Statuspille status={o.status} />
            </View>
          </Kort>
        ))}

      {fane === 'hjelpere' &&
        hjelpereTilGodkjenning.map((h) => {
          const godkjent = data.godkjenteHjelpere.includes(h.id);
          return (
            <Kort key={h.id}>
              <Tekst variant="listetittel">
                {h.navn}, {h.alder} år
              </Tekst>
              <Tekst variant="under">{h.omrade}</Tekst>
              <View style={styles.piller}>
                <Pille tekst={h.bankId ? '✓ BankID' : 'BankID mangler'} variant={h.bankId ? 'gronn' : 'fersken'} />
                <Pille
                  tekst={h.foresatt ? '✓ Foresatt' : 'Venter på foresatt'}
                  variant={h.foresatt ? 'gronn' : 'fersken'}
                />
              </View>
              {godkjent ? (
                <Pille tekst="Godkjent" variant="gronn" />
              ) : (
                <Knapp
                  liten
                  ikon={Check}
                  tekst="Godkjenn etter møte"
                  deaktivert={!h.bankId || !h.foresatt}
                  onPress={() => {
                    endre((d) => ({ ...d, godkjenteHjelpere: [...d.godkjenteHjelpere, h.id] }));
                    visToast(`${h.navn.split(' ')[0]} er godkjent og kan ta oppdrag.`);
                  }}
                />
              )}
            </Kort>
          );
        })}

      {fane === 'meldinger' && (
        <>
          {data.rapporter.length === 0 && <Tekst variant="brod">Ingen meldinger om at noe gikk galt.</Tekst>}
          {data.rapporter.map((r) => (
            <Kort key={r.id}>
              <Tekst variant="listetittel">{r.tekst}</Tekst>
              <Tekst variant="under">
                Fra {r.rolle === 'ungdom' ? 'hjelper' : 'eldre'}
                {r.oppdragId
                  ? ` · gjelder ${tittelFor(data.oppdrag.find((o) => o.id === r.oppdragId) ?? { kategori: 'oppdrag' })}`
                  : ''}
              </Tekst>
              {r.fulgtOpp ? (
                <Pille tekst="Fulgt opp" variant="gronn" />
              ) : (
                <Knapp
                  liten
                  variant="sekundar"
                  ikon={Check}
                  tekst="Marker som fulgt opp"
                  onPress={() =>
                    endre((d) => ({
                      ...d,
                      rapporter: d.rapporter.map((x) => (x.id === r.id ? { ...x, fulgtOpp: true } : x)),
                    }))
                  }
                />
              )}
            </Kort>
          ))}
        </>
      )}

      {fane === 'tall' && (
        <>
          <Statrad>
            <Statboks etikett="Oppdrag totalt" verdi={String(aktive.length)} />
            <Statboks etikett="Fullført" verdi={String(ferdige.length)} />
          </Statrad>
          <Statrad>
            <Statboks etikett="Inntekt fra gebyr" verdi={kroner(ferdige.length * priser.gebyr)} />
            <Statboks etikett="Fornøyde brukere" verdi={snitt ? snitt.toFixed(1).replace('.', ',') : '–'} stjerne />
          </Statrad>
          <Tekstfelt
            etikett="Send beskjed til alle brukere"
            placeholder="For eksempel: Snøstorm i dag. Vi flytter alle turer."
            flereLinjer
            value={beskjed}
            onChangeText={setBeskjed}
          />
          <Knapp
            ikon={Megaphone}
            tekst="Send beskjed"
            deaktivert={beskjed.trim().length < 3}
            onPress={() => {
              setBeskjed('');
              visToast('Beskjeden er sendt til alle brukere.');
            }}
          />
        </>
      )}

      <Infoboks tekst="Testversjon: teamvisningen bruker eksempeldataene på denne telefonen." />
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  rad: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  piller: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
