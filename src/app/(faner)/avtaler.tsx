import { useApp } from '../../lib/app-tilstand';
import { Avtaler as AvtalerEldre } from '../../skjermer/eldre/Avtaler';
import { Avtaler as AvtalerUngdom } from '../../skjermer/ungdom/Avtaler';

export default function AvtalerFane() {
  const { rolle } = useApp();
  return rolle === 'ungdom' ? <AvtalerUngdom /> : <AvtalerEldre />;
}
