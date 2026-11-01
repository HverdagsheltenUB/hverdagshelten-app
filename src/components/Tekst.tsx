import { Text, type TextProps } from 'react-native';

import { useApp } from '../lib/app-tilstand';
import { farger, skrift, tekststorrelser, type Tekststorrelse, type Vekt } from '../lib/tema';

const standardVekt: Partial<Record<Tekststorrelse, Vekt>> = {
  tittel: 800,
  mellomtittel: 700,
  stor: 800,
  listetittel: 600,
  knapp: 700,
  pille: 700,
};

const dempedeVarianter: Tekststorrelse[] = ['under', 'underLiten', 'liten'];

type Props = TextProps & {
  variant?: Tekststorrelse;
  vekt?: Vekt;
  farge?: string;
};

// All tekst i appen går gjennom denne, så «Større tekst» virker overalt.
export function Tekst({ variant = 'brod', vekt, farge, style, ...rest }: Props) {
  const { storreTekst } = useApp();
  const fontSize = tekststorrelser[variant][storreTekst ? 1 : 0];

  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: skrift[vekt ?? standardVekt[variant] ?? 400],
          fontSize,
          lineHeight: Math.round(fontSize * 1.3),
          color: farge ?? (dempedeVarianter.includes(variant) ? farger.dempet : farger.tekst),
        },
        style,
      ]}
    />
  );
}

export function useTekststorrelse(variant: Tekststorrelse) {
  const { storreTekst } = useApp();
  return tekststorrelser[variant][storreTekst ? 1 : 0];
}
