// Tester databasen med to midlertidige testbrukere, og sletter alt etterpå.
// Kjør med: node scripts/test-supabase.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const konfig = readFileSync(new URL('../src/lib/konfig.ts', import.meta.url), 'utf8');
const url = konfig.match(/SUPABASE_URL \|\| '([^']+)'/)[1];
const nokkel = konfig.match(/PUBLISHABLE_KEY \|\| '([^']+)'/)[1];
const ny = () => createClient(url, nokkel, { auth: { persistSession: false, autoRefreshToken: false } });

const tid = Date.now().toString(36);
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
let ok = 0;
let feil = 0;
function sjekk(navn, betingelse, info = '') {
  if (betingelse) { ok++; console.log(`✓ ${navn}`); }
  else { feil++; console.log(`✗ ${navn} ${info}`); }
}

const a = ny();
const b = ny();
const epostA = `hverdagsheltenub+testa${tid}@gmail.com`;
const epostB = `hverdagsheltenub+testb${tid}@gmail.com`;

try {
  // 1. Registrering
  const ra = await a.auth.signUp({ email: epostA, password: 'testpassord1', options: { data: { navn: 'Test Tone', rolle: 'eldre' } } });
  sjekk('Bruker A kan registrere seg', !ra.error && ra.data.session, ra.error?.message ?? (ra.data.session ? '' : 'ingen innlogging – er «Confirm email» slått av?'));
  const rb = await b.auth.signUp({ email: epostB, password: 'testpassord2', options: { data: { navn: 'Test Didrik', rolle: 'ungdom' } } });
  sjekk('Bruker B kan registrere seg', !rb.error && rb.data.session, rb.error?.message ?? '');
  if (!ra.data.session || !rb.data.session) throw new Error('Kan ikke fortsette uten innlogging');
  const idA = ra.data.user.id;
  const idB = rb.data.user.id;
  sjekk('A og B er forskjellige kontoer', idA !== idB);

  // 2. Innlogging med passord
  const c = ny();
  const inn = await c.auth.signInWithPassword({ email: epostA, password: 'testpassord1' });
  sjekk('A kan logge inn igjen med passord', !inn.error && inn.data.user.id === idA, inn.error?.message);
  const galt = await c.auth.signInWithPassword({ email: epostA, password: 'feil' });
  sjekk('Feil passord blir avvist', Boolean(galt.error));

  // 3. Profil laget automatisk
  const { data: profilA } = await a.from('profiler').select('*').eq('id', idA).single();
  sjekk('Profil lages automatisk med navn og rolle', profilA?.navn === 'Test Tone' && profilA?.rolle === 'eldre', JSON.stringify(profilA));

  // 4. Bilde og annonse
  const sti = `${idA}/test-${tid}.png`;
  const opp = await a.storage.from('annonsebilder').upload(sti, PNG, { contentType: 'image/png' });
  sjekk('A kan laste opp bilde i egen mappe', !opp.error, opp.error?.message);
  const bildeUrl = a.storage.from('annonsebilder').getPublicUrl(sti).data.publicUrl;
  const hent = await fetch(bildeUrl);
  sjekk('Bildet kan vises for alle', hent.ok && (await hent.arrayBuffer()).byteLength === PNG.length, `status ${hent.status}`);
  const fremmed = await b.storage.from('annonsebilder').upload(`${idA}/inntrenger-${tid}.png`, PNG, { contentType: 'image/png' });
  sjekk('B kan ikke laste opp i As mappe', Boolean(fremmed.error));

  const ins = await a.from('annonser').insert({ type: 'ting', tittel: 'Testsykkel', kategori: 'Sport og fritid', pris: 500, tilstand: 'Pent brukt', storrelse: '26 tommer', sted: 'Sagene', levering: 'hentes', bilder: [bildeUrl] }).select('id').single();
  sjekk('A kan publisere annonse', !ins.error, ins.error?.message);
  const annonseId = ins.data?.id;

  const adr = await a.from('annonse_adresser').upsert({ annonse_id: annonseId, adresse: 'Testveien 1, 0001 Oslo', lat: 59.9, lng: 10.75 });
  sjekk('A kan lagre privat adresse', !adr.error, adr.error?.message);
  const egen = await b.from('annonser').insert({ type: 'hjelp', tittel: 'Hjelper vil legge ut', kategori: 'Handling' });
  sjekk('B (hjelper) kan ikke legge ut annonser', Boolean(egen.error));

  // 5. B ser annonsen, med navnet til A
  const { data: sett, error: settFeil } = await b.from('annonser').select('id, tittel, bilder, profiler(navn)').eq('id', annonseId).single();
  sjekk('B ser As annonse med navn', !settFeil && sett?.profiler?.navn === 'Test Tone' && sett.bilder.length === 1, settFeil?.message);

  // 6. B kan ikke endre eller slette
  await b.from('annonser').update({ tittel: 'Hacket' }).eq('id', annonseId);
  await b.from('annonser').delete().eq('id', annonseId);
  const { data: etter } = await a.from('annonser').select('tittel').eq('id', annonseId).single();
  sjekk('B kan ikke endre eller slette As annonse', etter?.tittel === 'Testsykkel', JSON.stringify(etter));
  const lure = await b.from('annonser').insert({ bruker_id: idA, type: 'hjelp', tittel: 'Falsk', kategori: 'Handling' });
  sjekk('B kan ikke legge ut annonse i As navn', Boolean(lure.error));

  // 6b. Aksept, adresse, chat og status
  const forAdr = await b.from('annonse_adresser').select('adresse').eq('annonse_id', annonseId);
  sjekk('B ser ikke adressen før aksept', forAdr.data?.length === 0, JSON.stringify(forAdr.data));
  const forChat = await b.from('meldinger').insert({ annonse_id: annonseId, tekst: 'for tidlig' });
  sjekk('B kan ikke skrive før aksept', Boolean(forChat.error));
  const aks = await b.rpc('aksepter_annonse', { annonse: annonseId });
  sjekk('B kan akseptere annonsen', !aks.error, aks.error?.message);
  const igjen = await b.rpc('aksepter_annonse', { annonse: annonseId });
  sjekk('Annonsen kan ikke aksepteres to ganger', Boolean(igjen.error));
  const etterAdr = await b.from('annonse_adresser').select('adresse').eq('annonse_id', annonseId).single();
  sjekk('B ser adressen etter aksept', etterAdr.data?.adresse === 'Testveien 1, 0001 Oslo', etterAdr.error?.message);
  const m1 = await b.from('meldinger').insert({ annonse_id: annonseId, tekst: 'Hei, jeg har tatt oppdraget!' });
  sjekk('B kan skrive i chatten', !m1.error, m1.error?.message);
  const lest = await a.from('meldinger').select('tekst, avsender_id').eq('annonse_id', annonseId);
  sjekk('A ser meldingen fra B', lest.data?.length === 1 && lest.data[0].avsender_id === idB, JSON.stringify(lest.data));
  const m2 = await a.from('meldinger').insert({ annonse_id: annonseId, tekst: 'Så fint!' });
  sjekk('A kan svare i chatten', !m2.error, m2.error?.message);
  const juks = await a.from('annonser').update({ status: 'ferdig' }).eq('id', annonseId);
  const { data: st0 } = await a.from('annonser').select('status').eq('id', annonseId).single();
  sjekk('A kan ikke hoppe over status selv', st0?.status === 'akseptert', JSON.stringify({ st0, e: juks.error?.message }));
  const pv = await b.rpc('oppdater_oppdrag', { annonse: annonseId, ny_status: 'pa_vei' });
  const { data: st1 } = await a.from('annonser').select('status, hjelper:profiler!annonser_hjelper_id_fkey(navn)').eq('id', annonseId).single();
  sjekk('B kan si «på vei», og A ser det', !pv.error && st1?.status === 'pa_vei' && st1?.hjelper?.navn === 'Test Didrik', JSON.stringify(st1));

  // 7. A endrer og sletter
  await a.from('annonser').update({ pris: 400 }).eq('id', annonseId);
  const { data: endret } = await b.from('annonser').select('pris').eq('id', annonseId).single();
  sjekk('A kan endre, og B ser endringen', endret?.pris === 400, JSON.stringify(endret));
  const fe = await b.rpc('oppdater_oppdrag', { annonse: annonseId, ny_status: 'ferdig' });
  const tk = await a.from('annonser').update({ vurdering: 5, takk: 'Tusen takk' }).eq('id', annonseId);
  const { data: st2 } = await b.from('annonser').select('status, vurdering, takk').eq('id', annonseId).single();
  sjekk('B kan si ferdig, og A kan gi stjerner', !fe.error && !tk.error && st2?.status === 'ferdig' && st2?.vurdering === 5, JSON.stringify(st2));
  const adrFerdig = await b.from('annonse_adresser').select('adresse').eq('annonse_id', annonseId);
  sjekk('Adressen skjules for B når oppdraget er ferdig', adrFerdig.data?.length === 0);
  const pb = await a.from('profiler').update({ bilde: bildeUrl }).eq('id', idA).select('bilde').single();
  sjekk('A kan lagre profilbilde', pb.data?.bilde === bildeUrl, pb.error?.message);
  const sl = await a.from('annonser').delete().eq('id', annonseId);
  const { data: borte } = await b.from('annonser').select('id').eq('id', annonseId);
  sjekk('A kan slette, og annonsen er borte for B', !sl.error && borte?.length === 0, sl.error?.message);
  await a.storage.from('annonsebilder').remove([sti]);

  // 8. Rapport
  const rap = await b.from('rapporter').insert({ grunn: 'Test', tekst: 'Automatisk test, kan slettes' });
  sjekk('«Meld fra» kan sendes', !rap.error, rap.error?.message);
} catch (e) {
  feil++;
  console.log('✗ Testen stoppet:', e.message);
} finally {
  // Rydd opp: slett testbrukerne (og alt de har laget).
  for (const k of [a, b]) {
    const { data } = await k.auth.getSession();
    if (data.session) {
      const r = await k.rpc('slett_min_konto');
      if (r.error) console.log('  (klarte ikke å slette testbruker:', r.error.message, ')');
    }
  }
  console.log(`\n${ok} bestått, ${feil} feilet`);
  process.exit(feil ? 1 : 0);
}
