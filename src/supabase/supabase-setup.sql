-- Wedding Invitation Supabase setup
-- Supabase SQL Editor içine tamamını yapıştırıp çalıştır.
-- service_role key'i frontend içine koyma; .env.local içinde sadece anon public key kullan.
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
  -- YENİ: Müzik İstek Kutusu Sütunu
  note text,
  created_at timestamptz not null default now()
);
-- Tablo daha önce oluşturulduysa song_request sütununu güvenle ekler
alter table public.guests
add column if not exists song_request text;
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
-- Eski policy'ler varsa temizle.
drop policy if exists "Public can read settings" on public.invitation_settings;
drop policy if exists "Authenticated can manage settings" on public.invitation_settings;
drop policy if exists "Anyone can add guests" on public.guests;
drop policy if exists "Authenticated can manage guests" on public.guests;
drop policy if exists "Anyone can add wishes" on public.wishes;
drop policy if exists "Anyone can read approved wishes" on public.wishes;
drop policy if exists "Authenticated can manage wishes" on public.wishes;
-- Davetiye ayarları herkes tarafından okunabilir, sadece giriş yapan admin değiştirebilir.
create policy "Public can read settings" on public.invitation_settings for
select to anon,
  authenticated using (id = 'main');
create policy "Authenticated can manage settings" on public.invitation_settings for all to authenticated using (true) with check (true);
-- Ziyaretçiler katılım formu gönderebilir. Admin tüm kayıtları yönetebilir.
create policy "Anyone can add guests" on public.guests for
insert to anon,
  authenticated with check (true);
create policy "Authenticated can manage guests" on public.guests for all to authenticated using (true) with check (true);
-- Ziyaretçiler anı defteri mesajı gönderebilir. Yayındaki mesajlar davetiyede okunur. Admin hepsini yönetir.
create policy "Anyone can add wishes" on public.wishes for
insert to anon,
  authenticated with check (true);
create policy "Anyone can read approved wishes" on public.wishes for
select to anon using (approved = true);
create policy "Authenticated can manage wishes" on public.wishes for all to authenticated using (true) with check (true);
-- Görsel ve müzik bucket'ı. Public olmalı ki davetiyede görseller/müzik herkese açılsın.
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
insert into public.invitation_settings (id, content, updated_at)
values (
    'main',
    jsonb_build_object(
      'current_theme',
      'lavanta',
      'themes',
      jsonb_build_object(
        'burgundy',
        jsonb_build_object(
          'name',
          'Burgundy Teması',
          'intro',
          '/images/themes/burgundy/anita-austvika-6l9m9pFoL8g-unsplash.jpg',
          'hero',
          '/images/themes/burgundy/anita-austvika-lYoj3LBZd1E-unsplash.jpg',
          'gallery',
          jsonb_build_array(
            '/images/themes/burgundy/balint-henter-5F6ZgBbXnxo-unsplash.jpg',
            '/images/themes/burgundy/joanna-kosinska-xHDOokMbumY-unsplash.jpg',
            '/images/themes/burgundy/micheile-henderson-KWHoxdn1IUE-unsplash.jpg',
            '/images/themes/burgundy/waqar-pyt88XZAril-unsplash.jpg'
          )
        ),
        'dark',
        jsonb_build_object(
          'name',
          'Dark Teması',
          'intro',
          '/images/themes/dark/adi-albulescu-Q6bt8Ri7Uog-unsplash.jpg',
          'hero',
          '/images/themes/dark/christina-fxsznsmRnFI-unsplash.jpg',
          'gallery',
          jsonb_build_array(
            '/images/themes/dark/christina-o7yMtvuc8_0-unsplash.jpg',
            '/images/themes/dark/kelsey-booth-iZlVHQzJQgE-unsplash.jpg',
            '/images/themes/dark/mieke-campbell-O2PjI0Cj_7Q-unsplash.jpg',
            '/images/themes/dark/mike-marrah-1kCJYMKROiU-unsplash.jpg'
          )
        ),
        'gold',
        jsonb_build_object(
          'name',
          'Gold Teması',
          'intro',
          '/images/themes/gold/akhmad-jazuli-Spx_76BKJ5o-unsplash.jpg',
          'hero',
          '/images/themes/gold/akhmad-jazuli-T0oWIlbODal-unsplash.jpg',
          'gallery',
          jsonb_build_array(
            '/images/themes/gold/akhmad-jazuli-UO17MJcba-w-unsplash.jpg',
            '/images/themes/gold/american-heritage-chocolate-Bkm6wO6pHOY-unsplash.jpg',
            '/images/themes/gold/charlotte-cowell-cHzTNuMAIJs-unsplash.jpg',
            '/images/themes/gold/thlt-lcx-R5d7yOCkPJU-unsplash.jpg'
          )
        ),
        'lavanta',
        jsonb_build_object(
          'name',
          'Lavanta Teması',
          'intro',
          '/images/themes/lavanta/annie-spratt-NrflUuJJK0I-unsplash.jpg',
          'hero',
          '/images/themes/lavanta/antony-bec-nD9tEn63suc-unsplash.jpg',
          'gallery',
          jsonb_build_array(
            '/images/themes/lavanta/christina-w0dZXqq5cPI-unsplash.jpg',
            '/images/themes/lavanta/dimitri-iakymuk-mCR10j_B6sM-unsplash.jpg',
            '/images/themes/lavanta/joyce-toh-3PdHzNqMYbA-unsplash.jpg',
            '/images/themes/lavanta/simon-spring-LiQoWWD_Ql-unsplash.jpg'
          )
        ),
        'minimal',
        jsonb_build_object(
          'name',
          'Minimal Tema',
          'intro',
          '/images/themes/minimal/dan-lefebvre-mPyqJAwMAs0-unsplash.jpg',
          'hero',
          '/images/themes/minimal/kerri-shaver-E41FJBN09wc-unsplash.jpg',
          'gallery',
          jsonb_build_array(
            '/images/themes/minimal/kerri-shaver-oDV14167o1o-unsplash.jpg',
            '/images/themes/minimal/kerri-shaver-xepikEyPgml-unsplash.jpg',
            '/images/themes/minimal/max-letek-_zH2qqQ1dHA-unsplash.jpg',
            '/images/themes/minimal/micah-sammie-chaffin-ECZeV9L7Pc4-unsplash.jpg'
          )
        ),
        'rose',
        jsonb_build_object(
          'name',
          'Rose Teması',
          'intro',
          '/images/themes/rose/anton-mislawsky-d-eWwb40Bdg-unsplash.jpg',
          'hero',
          '/images/themes/rose/brigitte-tohm-buUFEtmNnjc-unsplash.jpg',
          'gallery',
          jsonb_build_array(
            '/images/themes/rose/ivonne-adame-6Hu3aJnDEV4-unsplash.jpg',
            '/images/themes/rose/natalie-kinnear-mcPnQ7wn1Kl-unsplash.jpg',
            '/images/themes/rose/sergey-semin-3gpzjLWHb0I-unsplash.jpg',
            '/images/themes/rose/thomas-curryer-UDfxsawmiKk-unsplash.jpg'
          )
        ),
        'sage',
        jsonb_build_object(
          'name',
          'Sage Teması',
          'intro',
          '/images/themes/sage/amith-nair-l4OzvWgMEkw-unsplash.jpg',
          'hero',
          '/images/themes/sage/hydra-4x-dfJGSX8d8jM-unsplash.jpg',
          'gallery',
          jsonb_build_array(
            '/images/themes/sage/lawrence-kayku-ZVKr8wADhpc-unsplash.jpg',
            '/images/themes/sage/matthew-PmFCYjRqHN8-unsplash.jpg',
            '/images/themes/sage/max-bohme-w0f0QOSqxLl-unsplash.jpg',
            '/images/themes/sage/silvia-mara-Hi69z0dFLjA-unsplash.jpg'
          )
        )
      )
    ),
    now()
  ) on conflict (id) do
update
set content = excluded.content,
  updated_at = now();