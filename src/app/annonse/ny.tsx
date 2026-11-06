import { HandHeart } from 'lucide-react-native';

import { Tomtilstand } from '../../components/Annonse';
import { Skjerm } from '../../components/Skjerm';
import { useKonto } from '../../lib/konto';
import { gaTilbake } from '../../lib/overgang';
import { Annonseskjema } from '../../skjermer/Annonseskjema';

export default function NyAnnonse() {
  const { profil } = useKonto();
  // Bare de som trenger hjelp legger ut annonser. Hjelperne aksepterer dem.
  if (profil?.rolle === 'ungdom') {
    return (
      <Skjerm tilbake={{}}>
        <Tomtilstand
          ikon={HandHeart}
          tittel="Det er de som trenger hjelp som legger ut annonser"
          tekst="Som hjelper finner du annonsene på Hjem, og aksepterer dem du vil ta."
          knapp={{ tekst: 'Til Hjem', onPress: () => gaTilbake('/') }}
        />
      </Skjerm>
    );
  }
  return <Annonseskjema />;
}
