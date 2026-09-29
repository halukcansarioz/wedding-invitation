create extension if not exists pgcrypto;
create table if not exists public.invitation_settings (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.invitation_settings (id, content, updated_at)
values ('main', '{}'::jsonb, now()) on conflict (id) do nothing;
create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  attendance text not null default 'Katılacağım',
  person_count text not null default '1',
  side text not null default 'Gelin Tarafı',
  has_child text not null default 'Hayır',
  song_request text,
  note text,
  has_arrived boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
-- RATE LIMIT TABLOSU (YENİ EKLENDİ)
create table if not exists public.rate_limits (
  id text primary key,
  count int not null default 1,
  reset_time timestamptz not null
);
alter table public.rate_limits enable row level security;
-- EDGE FUNCTION RATE LIMIT KONTROL RPC'Sİ (YENİ EKLENDİ)
CREATE OR REPLACE FUNCTION check_rate_limit(client_ip text, max_req int, window_seconds int) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE current_count int;
current_reset timestamptz;
BEGIN
SELECT count,
  reset_time INTO current_count,
  current_reset
FROM public.rate_limits
WHERE id = client_ip;
-- Eğer kayıt yoksa veya süre dolduysa sıfırla
IF current_reset IS NULL
OR now() > current_reset THEN
INSERT INTO public.rate_limits (id, count, reset_time)
VALUES (
    client_ip,
    1,
    now() + (window_seconds || ' seconds')::interval
  ) ON CONFLICT (id) DO
UPDATE
SET count = 1,
  reset_time = now() + (window_seconds || ' seconds')::interval;
RETURN false;
END IF;
-- Limit aşıldıysa true dön
IF current_count >= max_req THEN RETURN true;
END IF;
-- Aksi takdirde sayacı artır
UPDATE public.rate_limits
SET count = count + 1
WHERE id = client_ip;
RETURN false;
END;
$$;
-- Mevcut Security Policy'ler
alter table public.invitation_settings enable row level security;
alter table public.guests enable row level security;
alter table public.wishes enable row level security;
drop policy if exists "Public can read settings" on public.invitation_settings;
drop policy if exists "Authenticated can manage settings" on public.invitation_settings;
drop policy if exists "Authenticated can manage guests" on public.guests;
drop policy if exists "Anyone can read approved wishes" on public.wishes;
drop policy if exists "Authenticated can manage wishes" on public.wishes;
create policy "Public can read settings" on public.invitation_settings for
select to anon,
  authenticated using (id = 'main');
create policy "Authenticated can manage settings" on public.invitation_settings for all to authenticated using (true) with check (true);
create policy "Authenticated can manage guests" on public.guests for all to authenticated using (true) with check (true);
create policy "Anyone can read approved wishes" on public.wishes for
select to anon using (approved = true);
create policy "Authenticated can manage wishes" on public.wishes for all to authenticated using (true) with check (true);
-- Güvenli Form Gönderim Fonksiyonları (RPC)
CREATE OR REPLACE FUNCTION submit_guest_secure(guest_data jsonb, token text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE inserted_row record;
BEGIN
INSERT INTO public.guests (
    name,
    phone,
    attendance,
    person_count,
    side,
    has_child,
    song_request,
    note
  )
VALUES (
    guest_data->>'name',
    guest_data->>'phone',
    guest_data->>'attendance',
    COALESCE(guest_data->>'person_count', '1'),
    COALESCE(guest_data->>'side', 'Gelin Tarafı'),
    COALESCE(guest_data->>'has_child', 'Hayır'),
    guest_data->>'song_request',
    guest_data->>'note'
  )
RETURNING * INTO inserted_row;
RETURN row_to_json(inserted_row)::jsonb;
END;
$$;
CREATE OR REPLACE FUNCTION submit_wish_secure(
    wish_name text,
    wish_message text,
    is_approved boolean,
    token text
  ) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE inserted_row record;
BEGIN
INSERT INTO public.wishes (name, message, approved)
VALUES (wish_name, wish_message, is_approved)
RETURNING * INTO inserted_row;
RETURN row_to_json(inserted_row)::jsonb;
END;
$$;
-- Storage ve Guest Photos
insert into storage.buckets (id, name, public)
values ('wedding-media', 'wedding-media', true) on conflict (id) do
update
set public = true;
create policy "Public can view wedding media" on storage.objects for
select to anon,
  authenticated using (bucket_id = 'wedding-media');
create policy "Authenticated can upload wedding media" on storage.objects for
insert to authenticated with check (bucket_id = 'wedding-media');
create policy "Authenticated can update wedding media" on storage.objects for
update to authenticated using (bucket_id = 'wedding-media') with check (bucket_id = 'wedding-media');
create policy "Authenticated can delete wedding media" on storage.objects for delete to authenticated using (bucket_id = 'wedding-media');
create table if not exists public.guest_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.guest_photos enable row level security;
create policy "Anyone can read approved guest photos" on public.guest_photos for
select to anon using (approved = true);
create policy "Anon can insert guest photos" on public.guest_photos for
insert to anon with check (true);
create policy "Authenticated can manage guest photos" on public.guest_photos for all to authenticated using (true) with check (true);