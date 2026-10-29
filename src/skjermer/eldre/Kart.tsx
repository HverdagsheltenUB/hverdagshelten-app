import * as Linking from 'expo-linking';
import { Navigation } from 'lucide-react-native';

import { Kart as Kartvisning } from '../../components/Kart';
import { Knapp } from '../../components/Knapp';
import { Kort, Skillelinje } from '../../components/Kort';
import { Skjerm } from '../../components/Skjerm';
import { Overskrift } from '../../components/Smaabiter';
import { Tekst } from '../../components/Tekst';
import { motested } from '../../lib/eksempeldata';

const veibeskrivelse = 'https://www.google.com/maps/dir/?api=1&destination=Nationaltheatret%2C%20Oslo';

export function Kart() {
  return (
    <Skjerm>
      <Overskrift tittel="Her møtes dere" undertekst="Eksempelkart · Oslo" />

      <Kartvisning naler={[{ id: 'motested', punkt: motested.punkt, etikett: motested.navn }]} />

      <Kort>
        <Tekst variant="listetittel">{motested.navn}</Tekst>
        <Tekst variant="under" style={{ marginTop: -10 }}>
          {motested.beskrivelse}
        </Tekst>
        <Skillelinje />
        <Tekst variant="listetittel">Torsdag kl. 14.00</Tekst>
        <Tekst variant="under" style={{ marginTop: -10 }}>
          Tur sammen med Emil
        </Tekst>
      </Kort>

      <Knapp variant="sekundar" ikon={Navigation} tekst="Vis veien dit" onPress={() => Linking.openURL(veibeskrivelse)} />

      <Tekst variant="underLiten" style={{ textAlign: 'center' }}>
        Møtested og avtale er eksempeldata.
      </Tekst>
    </Skjerm>
  );
}
