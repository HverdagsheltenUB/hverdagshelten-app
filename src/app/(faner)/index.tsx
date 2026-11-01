import { useApp } from '../../lib/app-tilstand';
import { Hjem as HjemEldre } from '../../skjermer/eldre/Hjem';
import { Hjem as HjemUngdom } from '../../skjermer/ungdom/Hjem';

export default function HjemFane() {
  const { rolle } = useApp();
  return rolle === 'ungdom' ? <HjemUngdom /> : <HjemEldre />;
}
