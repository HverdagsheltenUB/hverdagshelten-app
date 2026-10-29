import { Kart as Kartvisning, type Kartnal } from '../../components/Kart';
import { Listevalg } from '../../components/Listevalg';
import { Skjerm } from '../../components/Skjerm';
import { Overskrift } from '../../components/Smaabiter';
import { motested } from '../../lib/eksempeldata';
import { useLedigeOppdrag } from '../../lib/ledige-oppdrag';
import { gaFrem } from '../../lib/overgang';

export function Kart() {
  const ledige = useLedigeOppdrag();
  const apne = (id: string) => gaFrem({ pathname: '/oppdrag/[id]', params: { id } });

  const naler: Kartnal[] = [
    { id: 'anne', punkt: motested.punkt, etikett: 'Tur med Anne' },
    ...ledige.map((o, i) => ({
      id: o.id,
      punkt: o.punkt,
      etikett: `${i + 1}. ${o.tittel}`,
      nummer: i + 1,
      onPress: () => apne(o.id),
    })),
  ];

  return (
    <Skjerm>
      <Overskrift tittel="Oppdrag nær deg" undertekst="Eksempelkart · Oslo" />
      <Kartvisning naler={naler} />
      {ledige.map((o, i) => (
        <Listevalg
          key={o.id}
          tall={i + 1}
          tittel={o.tittel}
          undertekst={`${o.sted} · ${o.avstand}`}
          hoyre={`${o.belop} kr`}
          onPress={() => apne(o.id)}
        />
      ))}
    </Skjerm>
  );
}
