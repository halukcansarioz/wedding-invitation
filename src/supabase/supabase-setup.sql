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
alter table public.guests
add column if not exists song_request text;
alter table public.guests
add column if not exists has_arrived boolean not null default false;
create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.invitation_settings enable row level security;
alter table public.guests enable row level security;
alter table public.wishes enable row level security;
-- Eski policy'leri temizle.
drop policy if exists "Public can read settings" on public.invitation_settings;
drop policy if exists "Authenticated can manage settings" on public.invitation_settings;
drop policy if exists "Anyone can add guests" on public.guests;
drop policy if exists "Authenticated can manage guests" on public.guests;
drop policy if exists "Anyone can add wishes" on public.wishes;
drop policy if exists "Anyone can read approved wishes" on public.wishes;
drop policy if exists "Authenticated can manage wishes" on public.wishes;
-- Ayarlar Policy
create policy "Public can read settings" on public.invitation_settings for
select to anon,
  authenticated using (id = 'main');
create policy "Authenticated can manage settings" on public.invitation_settings for all to authenticated using (true) with check (true);
-- Guests Policy: GÜVENLİK GÜNCELLEMESİ (Ziyaretçiler artık doğrudan insert yapamaz, sadece yöneticiler (authenticated) işlem yapabilir)
create policy "Authenticated can manage guests" on public.guests for all to authenticated using (true) with check (true);
-- Wishes Policy: GÜVENLİK GÜNCELLEMESİ (Ziyaretçiler onaylı mesajları okur, doğrudan insert yapamaz)
create policy "Anyone can read approved wishes" on public.wishes for
select to anon using (approved = true);
create policy "Authenticated can manage wishes" on public.wishes for all to authenticated using (true) with check (true);
-- =========================================================================================
-- GÜVENLİ INSERT FONKSİYONLARI (RPC)
-- Ziyaretçilerin sadece bu fonksiyonlar üzerinden veri eklemesine izin verilir (SECURITY DEFINER)
-- =========================================================================================
CREATE OR REPLACE FUNCTION submit_guest_secure(guest_data jsonb, token text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE inserted_row record;
BEGIN -- İleride Cloudflare Turnstile / reCAPTCHA kontrolünü bu bloğa ekleyebilirsiniz.
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
BEGIN -- İleride Cloudflare Turnstile / reCAPTCHA kontrolünü bu bloğa ekleyebilirsiniz.
INSERT INTO public.wishes (name, message, approved)
VALUES (wish_name, wish_message, is_approved)
RETURNING * INTO inserted_row;
RETURN row_to_json(inserted_row)::jsonb;
END;
$$;
-- Storage Ayarları
insert into storage.buckets (id, name, public)
values ('wedding-media', 'wedding-media', true) on conflict (id) do
update
set public = true;
drop policy if exists "Public can view wedding media" on storage.objects;
drop policy if exists "Authenticated can upload wedding media" on storage.objects;
drop policy if exists "Authenticated can update wedding media" on storage.objects;
drop policy if exists "Authenticated can delete wedding media" on storage.objects;
create policy "Public can view wedding media" on storage.objects for
select to anon,
  authenticated using (bucket_id = 'wedding-media');
create policy "Authenticated can upload wedding media" on storage.objects for
insert to authenticated with check (bucket_id = 'wedding-media');
create policy "Authenticated can update wedding media" on storage.objects for
update to authenticated using (bucket_id = 'wedding-media') with check (bucket_id = 'wedding-media');
create policy "Authenticated can delete wedding media" on storage.objects for delete to authenticated using (bucket_id = 'wedding-media');
-- (Mevcut 'insert into public.invitation_settings' JSON tema içeriğinizi bu bölümün altına olduğu gibi bırakabilirsiniz.)