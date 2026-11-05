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

  // 7. A endrer og sletter
  await a.from('annonser').update({ pris: 400 }).eq('id', annonseId);
  const { data: endret } = await b.from('annonser').select('pris').eq('id', annonseId).single();
  sjekk('A kan endre, og B ser endringen', endret?.pris === 400, JSON.stringify(endret));
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
