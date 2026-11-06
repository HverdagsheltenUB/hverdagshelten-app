import { useState } from 'react';

import { takkJa, type Annonse } from '../lib/annonser';
import { useApp } from '../lib/app-tilstand';
import { fornavn } from '../lib/konto';
import { gaFrem } from '../lib/overgang';
import { useBekreft } from './Dialog';

// «Takk ja» fra et annonsekort: spør først, tar annonsen, sier hei i chatten og åpner annonsen.
export function useTakkJa(etterpa: () => Promise<unknown>) {
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
      await etterpa();
      return;
    }
    visToast(`Du har takket ja! ${navn} har fått beskjed.`);
    await etterpa();
    gaFrem({ pathname: '/annonse/[id]', params: { id: a.id } });
  }

  return { tar, sierJa };
}
