import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { farger, ikonStrek } from '../lib/tema';
import { Ikonboks, Kort } from './Kort';
import { Tekst } from './Tekst';

type Props = {
  tittel: string;
  undertekst?: string;
  ikon?: LucideIcon;
  tall?: number;
  hoyre?: string;
  onPress: () => void;
};

export function Listevalg({ tittel, undertekst, ikon, tall, hoyre, onPress }: Props) {
  return (
    <Kort onPress={onPress} accessibilityLabel={tittel} style={styles.rad}>
      {(ikon || tall !== undefined) && <Ikonboks ikon={ikon} tall={tall} />}
      <View style={styles.tekster}>
        <Tekst variant="listetittel">{tittel}</Tekst>
        {undertekst && <Tekst variant="under">{undertekst}</Tekst>}
      </View>
      {hoyre ? (
        <Tekst variant="listetittel" vekt={800}>
          {hoyre}
        </Tekst>
      ) : (
        <ChevronRight size={22} color={farger.dempet} strokeWidth={ikonStrek} />
      )}
    </Kort>
  );
}

const styles = StyleSheet.create({
  rad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  tekster: {
    flex: 1,
    gap: 2,
  },
});
