-- Hverdagshelten: database for brukerkontoer og annonser.
-- Lim inn hele denne teksten i Supabase → SQL Editor → «Run».
-- Den kan kjøres flere ganger uten at noe blir dobbelt.

-- ─────────────────────────────────────────────────────────────
-- 1. Profiler: navn, rolle og område for hver bruker
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiler (
  id uuid primary key references auth.users (id) on delete cascade,
  navn text not null default '' check (char_length(navn) <= 80),
  rolle text check (rolle in ('eldre', 'ungdom')),
  omrade text not null default '' check (char_length(omrade) <= 80),
  opprettet timestamptz not null default now()
);

alter table public.profiler enable row level security;

drop policy if exists "Innloggede kan se profiler" on public.profiler;
create policy "Innloggede kan se profiler" on public.profiler
  for select to authenticated using (true);

drop policy if exists "Lag egen profil" on public.profiler;
create policy "Lag egen profil" on public.profiler
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "Endre egen profil" on public.profiler;
create policy "Endre egen profil" on public.profiler
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

grant select, insert, update on public.profiler to authenticated;

-- Lager profilen automatisk når noen oppretter en bruker.
create or replace function public.lag_profil_for_ny_bruker()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiler (id, navn, rolle, omrade)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'navn', ''), 80),
    case when new.raw_user_meta_data ->> 'rolle' in ('eldre', 'ungdom')
         then new.raw_user_meta_data ->> 'rolle' end,
    left(coalesce(new.raw_user_meta_data ->> 'omrade', ''), 80)
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists ny_bruker_far_profil on auth.users;
create trigger ny_bruker_far_profil
  after insert on auth.users
  for each row execute function public.lag_profil_for_ny_bruker();

-- ─────────────────────────────────────────────────────────────
-- 2. Annonser
-- ─────────────────────────────────────────────────────────────
create table if not exists public.annonser (
  id uuid primary key default gen_random_uuid(),
  bruker_id uuid not null default auth.uid() references public.profiler (id) on delete cascade,
  -- 'hjelp' = noen trenger hjelp, 'ting' = noe selges eller gis bort
  type text not null check (type in ('hjelp', 'ting')),
  tittel text not null check (char_length(btrim(tittel)) between 3 and 80),
  kategori text not null check (char_length(kategori) between 1 and 40),
  beskrivelse text not null default '' check (char_length(beskrivelse) <= 2000),
  -- Kroner. null = «pris etter avtale», 0 = gratis
  pris integer check (pris between 0 and 1000000),
  tilstand text check (char_length(tilstand) <= 40),
  storrelse text check (char_length(storrelse) <= 40),
  sted text not null default '' check (char_length(sted) <= 80),
  levering text check (levering in ('hentes', 'sendes', 'begge')),
  bilder text[] not null default '{}' check (coalesce(array_length(bilder, 1), 0) <= 6),
  opprettet timestamptz not null default now(),
  endret timestamptz not null default now()
);

create index if not exists annonser_opprettet_idx on public.annonser (opprettet desc);
create index if not exists annonser_bruker_idx on public.annonser (bruker_id);

alter table public.annonser enable row level security;

-- Alle innloggede ser alle annonser.
drop policy if exists "Innloggede kan se annonser" on public.annonser;
create policy "Innloggede kan se annonser" on public.annonser
  for select to authenticated using (true);

-- Man kan bare legge ut annonser i eget navn …
drop policy if exists "Legg ut egne annonser" on public.annonser;
create policy "Legg ut egne annonser" on public.annonser
  for insert to authenticated with check ((select auth.uid()) = bruker_id);

-- … og bare endre og slette sine egne.
drop policy if exists "Endre egne annonser" on public.annonser;
create policy "Endre egne annonser" on public.annonser
  for update to authenticated
  using ((select auth.uid()) = bruker_id) with check ((select auth.uid()) = bruker_id);

drop policy if exists "Slett egne annonser" on public.annonser;
create policy "Slett egne annonser" on public.annonser
  for delete to authenticated using ((select auth.uid()) = bruker_id);

grant select, insert, update, delete on public.annonser to authenticated;

-- Holder «endret» oppdatert, og hindrer at noen endrer når annonsen ble laget.
create or replace function public.annonse_endret()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.endret := now();
  new.opprettet := old.opprettet;
  return new;
end $$;

drop trigger if exists annonse_endret on public.annonser;
create trigger annonse_endret
  before update on public.annonser
  for each row execute function public.annonse_endret();

-- ─────────────────────────────────────────────────────────────
-- 3. Bilder: alle kan se, men man laster bare opp i sin egen mappe
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('annonsebilder', 'annonsebilder', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Last opp egne annonsebilder" on storage.objects;
create policy "Last opp egne annonsebilder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'annonsebilder' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Endre egne annonsebilder" on storage.objects;
create policy "Endre egne annonsebilder" on storage.objects
  for update to authenticated
  using (bucket_id = 'annonsebilder' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Slett egne annonsebilder" on storage.objects;
create policy "Slett egne annonsebilder" on storage.objects
  for delete to authenticated
  using (bucket_id = 'annonsebilder' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Supabase trenger også å kunne lese sine egne filer for å slette dem.
drop policy if exists "Se egne annonsebilder" on storage.objects;
create policy "Se egne annonsebilder" on storage.objects
  for select to authenticated
  using (bucket_id = 'annonsebilder' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ─────────────────────────────────────────────────────────────
-- 4. «Slett kontoen min»: sletter brukeren, profilen og annonsene
-- ─────────────────────────────────────────────────────────────
create or replace function public.slett_min_konto()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'Ikke innlogget';
  end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.slett_min_konto() from public, anon;
grant execute on function public.slett_min_konto() to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 5. Nye annonser vises med en gang hos andre som har appen åpen
-- ─────────────────────────────────────────────────────────────
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables
                     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'annonser') then
    alter publication supabase_realtime add table public.annonser;
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────
-- 6. «Meld fra»: brukerne kan sende inn, bare teamet kan lese (i Supabase-dashbordet)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.rapporter (
  id uuid primary key default gen_random_uuid(),
  bruker_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  annonse_id uuid references public.annonser (id) on delete set null,
  grunn text not null check (char_length(grunn) between 1 and 80),
  tekst text not null default '' check (char_length(tekst) <= 2000),
  opprettet timestamptz not null default now()
);

alter table public.rapporter enable row level security;

drop policy if exists "Send inn rapport" on public.rapporter;
create policy "Send inn rapport" on public.rapporter
  for insert to authenticated with check ((select auth.uid()) = bruker_id);

grant insert on public.rapporter to authenticated;

-- ═════════════════════════════════════════════════════════════
-- DEL 2 (6. november): aksept av oppdrag, chat, adresse og profilbilde
-- ═════════════════════════════════════════════════════════════

alter table public.profiler add column if not exists bilde text check (char_length(bilde) <= 500);

-- Status på annonsen: ledig → akseptert → pa_vei → ferdig
alter table public.annonser add column if not exists status text not null default 'ledig';
alter table public.annonser drop constraint if exists annonser_status_check;
alter table public.annonser add constraint annonser_status_check
  check (status in ('ledig', 'akseptert', 'pa_vei', 'ferdig'));
alter table public.annonser add column if not exists hjelper_id uuid references public.profiler (id) on delete set null;
alter table public.annonser add column if not exists akseptert timestamptz;
alter table public.annonser add column if not exists vurdering smallint check (vurdering between 1 and 5);
alter table public.annonser add column if not exists takk text check (char_length(takk) <= 500);
create index if not exists annonser_hjelper_idx on public.annonser (hjelper_id);

-- Bare de som trenger hjelp (rolle «eldre») kan legge ut annonser.
drop policy if exists "Legg ut egne annonser" on public.annonser;
create policy "Legg ut egne annonser" on public.annonser
  for insert to authenticated
  with check (
    (select auth.uid()) = bruker_id
    and exists (select 1 from public.profiler p where p.id = (select auth.uid()) and p.rolle = 'eldre')
  );

-- Hjelperen endrer status gjennom disse funksjonene, aldri direkte i tabellen.
create or replace function public.aksepter_annonse(annonse uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Ikke innlogget'; end if;
  update public.annonser
     set status = 'akseptert', hjelper_id = auth.uid(), akseptert = now()
   where id = annonse and status = 'ledig' and hjelper_id is null and bruker_id <> auth.uid();
  if not found then raise exception 'Annonsen er ikke ledig lenger'; end if;
end $$;

create or replace function public.oppdater_oppdrag(annonse uuid, ny_status text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if ny_status not in ('akseptert', 'pa_vei', 'ferdig') then raise exception 'Ugyldig status'; end if;
  update public.annonser set status = ny_status
   where id = annonse and hjelper_id = auth.uid() and status <> 'ledig';
  if not found then raise exception 'Du har ikke dette oppdraget'; end if;
end $$;

-- Hjelperen ombestemmer seg, eller den som la ut annonsen gjør den ledig igjen.
create or replace function public.slipp_annonse(annonse uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.annonser set status = 'ledig', hjelper_id = null, akseptert = null
   where id = annonse and status in ('akseptert', 'pa_vei')
     and (hjelper_id = auth.uid() or bruker_id = auth.uid());
  if not found then raise exception 'Kan ikke slippe dette oppdraget'; end if;
end $$;

revoke all on function public.aksepter_annonse(uuid) from public, anon;
revoke all on function public.oppdater_oppdrag(uuid, text) from public, anon;
revoke all on function public.slipp_annonse(uuid) from public, anon;
grant execute on function public.aksepter_annonse(uuid) to authenticated;
grant execute on function public.oppdater_oppdrag(uuid, text) to authenticated;
grant execute on function public.slipp_annonse(uuid) to authenticated;

-- Eieren kan ikke selv sette en hjelper eller hoppe over statusene.
create or replace function public.annonse_endret()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.endret := now();
  new.opprettet := old.opprettet;
  if current_user = 'authenticated' then
    new.hjelper_id := old.hjelper_id;
    new.status := old.status;
    new.akseptert := old.akseptert;
    -- Stjerner og takk kan bare gis når oppdraget er ferdig.
    if old.status <> 'ferdig' then
      new.vurdering := old.vurdering;
      new.takk := old.takk;
    end if;
  end if;
  return new;
end $$;


-- ─── Adresse: bare eieren og den som har akseptert, ser den ───
create table if not exists public.annonse_adresser (
  annonse_id uuid primary key references public.annonser (id) on delete cascade,
  adresse text not null default '' check (char_length(adresse) <= 200),
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180)
);

alter table public.annonse_adresser enable row level security;

drop policy if exists "Se adresse" on public.annonse_adresser;
create policy "Se adresse" on public.annonse_adresser
  for select to authenticated
  using (exists (
    select 1 from public.annonser a
     where a.id = annonse_id
       and ((select auth.uid()) = a.bruker_id or ((select auth.uid()) = a.hjelper_id and a.status <> 'ferdig'))
  ));

drop policy if exists "Eier lagrer adresse" on public.annonse_adresser;
create policy "Eier lagrer adresse" on public.annonse_adresser
  for all to authenticated
  using (exists (select 1 from public.annonser a where a.id = annonse_id and a.bruker_id = (select auth.uid())))
  with check (exists (select 1 from public.annonser a where a.id = annonse_id and a.bruker_id = (select auth.uid())));

grant select, insert, update, delete on public.annonse_adresser to authenticated;

-- ─── Chat mellom den som la ut annonsen og hjelperen ───
create table if not exists public.meldinger (
  id uuid primary key default gen_random_uuid(),
  annonse_id uuid not null references public.annonser (id) on delete cascade,
  avsender_id uuid not null default auth.uid() references public.profiler (id) on delete cascade,
  tekst text not null check (char_length(btrim(tekst)) between 1 and 2000),
  opprettet timestamptz not null default now()
);
create index if not exists meldinger_annonse_idx on public.meldinger (annonse_id, opprettet);

alter table public.meldinger enable row level security;

drop policy if exists "Se egne samtaler" on public.meldinger;
create policy "Se egne samtaler" on public.meldinger
  for select to authenticated
  using (exists (
    select 1 from public.annonser a
     where a.id = annonse_id and (select auth.uid()) in (a.bruker_id, a.hjelper_id)
  ));

drop policy if exists "Skriv i egne samtaler" on public.meldinger;
create policy "Skriv i egne samtaler" on public.meldinger
  for insert to authenticated
  with check (
    avsender_id = (select auth.uid())
    and exists (
      select 1 from public.annonser a
       where a.id = annonse_id and a.hjelper_id is not null
         and (select auth.uid()) in (a.bruker_id, a.hjelper_id)
    )
  );

grant select, insert on public.meldinger to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables
                     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'meldinger') then
    alter publication supabase_realtime add table public.meldinger;
  end if;
end $$;
