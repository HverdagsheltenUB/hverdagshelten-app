import { Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { useBekreft } from '../components/Dialog';
import { Infoboks } from '../components/Ekstra';
import { Knapp } from '../components/Knapp';
import { Kort } from '../components/Kort';
import { Skjerm } from '../components/Skjerm';
import { Tekstfelt } from '../components/Skjema';
import { Overskrift } from '../components/Smaabiter';
import { Tekst } from '../components/Tekst';
import { BryterRad } from '../components/Valg';
import { nyId, useApp } from '../lib/app-tilstand';
import { gaTilbake } from '../lib/overgang';

export default function Parorende() {
  const { data, endre, visToast } = useApp();
  const bekreft = useBekreft();
  const [ny, setNy] = useState({ navn: '', relasjon: '', telefon: '' });
  const klar = ny.navn.trim().length > 1 && ny.telefon.replace(/\D/g, '').length >= 8;

  return (
    <Skjerm tilbake={{ tekst: 'Til profilen', onPress: () => gaTilbake('/profil') }}>
      <Overskrift
        tittel="Pårørende"
        undertekst="De du legger til, kan få beskjed om avtaler, bestille for deg og betale for deg."
      />

      {data.parorende.map((p) => (
        <Kort key={p.id}>
          <View>
            <Tekst variant="listetittel">
              {p.navn} ({p.relasjon})
            </Tekst>
            <Tekst variant="under">{p.telefon}</Tekst>
          </View>
          <BryterRad
            etikett="Får beskjed om avtaler"
            pa={p.faarBeskjed}
            onEndre={(pa) =>
              endre((d) => ({
                ...d,
                parorende: d.parorende.map((x) => (x.id === p.id ? { ...x, faarBeskjed: pa } : x)),
              }))
            }
          />
          <Knapp
            liten
            variant="sekundar"
            ikon={Trash2}
            tekst="Fjern"
            onPress={async () => {
              const ja = await bekreft({ tittel: `Fjerne ${p.navn.split(' ')[0]}?`, ja: 'Ja, fjern', farlig: true });
              if (ja) endre((d) => ({ ...d, parorende: d.parorende.filter((x) => x.id !== p.id) }));
            }}
          />
        </Kort>
      ))}

      <Tekst variant="mellomtittel">Legg til pårørende</Tekst>
      <Tekstfelt etikett="Navn" value={ny.navn} onChangeText={(navn) => setNy((n) => ({ ...n, navn }))} />
      <Tekstfelt
        etikett="Hvem er det for deg?"
        placeholder="For eksempel sønn eller nabo"
        value={ny.relasjon}
        onChangeText={(relasjon) => setNy((n) => ({ ...n, relasjon }))}
      />
      <Tekstfelt
        etikett="Mobilnummer"
        value={ny.telefon}
        keyboardType="phone-pad"
        onChangeText={(telefon) => setNy((n) => ({ ...n, telefon }))}
      />
      <Knapp
        ikon={Plus}
        tekst="Legg til"
        deaktivert={!klar}
        onPress={() => {
          endre((d) => ({
            ...d,
            parorende: [
              ...d.parorende,
              {
                id: nyId('p'),
                navn: ny.navn.trim(),
                relasjon: ny.relasjon.trim() || 'pårørende',
                telefon: ny.telefon.trim(),
                faarBeskjed: true,
              },
            ],
          }));
          setNy({ navn: '', relasjon: '', telefon: '' });
          visToast('Lagt til. De får en SMS om at du har lagt dem til.');
        }}
      />
      <Infoboks tekst="Pårørende får bare se avtaler og kvitteringer, ikke annet." />
    </Skjerm>
  );
}
