import { useApp } from '../../lib/app-tilstand';
import { Kart as KartEldre } from '../../skjermer/eldre/Kart';
import { Kart as KartUngdom } from '../../skjermer/ungdom/Kart';

export default function KartFane() {
  const { rolle } = useApp();
  return rolle === 'ungdom' ? <KartUngdom /> : <KartEldre />;
}
