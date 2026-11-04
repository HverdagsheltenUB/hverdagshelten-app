import { router } from 'expo-router';
import { LayoutDashboard, RotateCcw } from 'lucide-react-native';

import { useApp } from '../lib/app-tilstand';
import { gaFrem, settRetning } from '../lib/overgang';
import { useBekreft } from './Dialog';
import { Kort } from './Kort';
import { Listevalg } from './Listevalg';
import { Tekst } from './Tekst';
import { BryterRad } from './Valg';

// Bare for testversjonen: gjør det lett å prøve begge versjonene og teamvisningen.
export function Rollebryter() {
  const { rolle, endre, slettAlt } = useApp();
  const bekreft = useBekreft();
  const tilUngdom = rolle !== 'ungdom';

  return (
    <>
      <Tekst variant="under" vekt={700}>
        For testing
      </Tekst>
      <Kort>
        <BryterRad
          etikett={tilUngdom ? 'Bytt til ungdomsversjon' : 'Bytt til eldreversjon'}
          pa={false}
          onEndre={() => {
            settRetning('rolle');
            // Testbrukeren Emil regnes som ferdig sjekket, så man slipper oppstarten på nytt.
            endre((d) => ({
              ...d,
              rolle: tilUngdom ? 'ungdom' : 'eldre',
              ungdom: tilUngdom ? { ...d.ungdom, bankId: true, foresattGodkjent: true } : d.ungdom,
            }));
          }}
        />
      </Kort>
      <Listevalg
        ikon={LayoutDashboard}
        tittel="Teamvisning"
        undertekst="Bestillinger, nye hjelpere og meldinger"
        onPress={() => gaFrem('/team')}
      />
      <Listevalg
        ikon={RotateCcw}
        tittel="Start testen på nytt"
        undertekst="Tilbakestiller eksempeldataene"
        onPress={async () => {
          const ja = await bekreft({
            tittel: 'Starte på nytt?',
            tekst: 'Alt du har gjort i testen blir slettet, og du ser oppstarten igjen.',
            ja: 'Ja, start på nytt',
            farlig: true,
          });
          if (!ja) return;
          slettAlt();
          settRetning('rolle');
          router.replace('/oppstart');
        }}
      />
    </>
  );
}
