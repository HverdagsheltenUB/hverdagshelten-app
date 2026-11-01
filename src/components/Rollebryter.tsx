import { useApp } from '../lib/app-tilstand';
import { settRetning } from '../lib/overgang';
import { Kort } from './Kort';
import { BryterRad } from './Valg';

// Gjør det lett å teste begge versjonene av appen.
export function Rollebryter() {
  const { rolle, velgRolle } = useApp();
  const tilUngdom = rolle !== 'ungdom';

  return (
    <Kort>
      <BryterRad
        etikett={tilUngdom ? 'Bytt til ungdomsversjon' : 'Bytt til eldreversjon'}
        pa={false}
        onEndre={() => {
          settRetning('rolle');
          velgRolle(tilUngdom ? 'ungdom' : 'eldre');
        }}
      />
    </Kort>
  );
}
