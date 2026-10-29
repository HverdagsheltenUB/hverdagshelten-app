import { useApp } from '../../lib/app-tilstand';
import { Profil as ProfilEldre } from '../../skjermer/eldre/Profil';
import { Profil as ProfilUngdom } from '../../skjermer/ungdom/Profil';

export default function ProfilFane() {
  const { rolle } = useApp();
  return rolle === 'ungdom' ? <ProfilUngdom /> : <ProfilEldre />;
}
