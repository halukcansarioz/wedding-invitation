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
values ('main', '{}'::jsonb, now())
on conflict (id) do nothing;

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  attendance text not null default 'Katılacağım',
  person_count text not null default '1',
  side text not null default 'Gelin Tarafı',
  has_child text not null default 'Hayır',
  note text,
  created_at timestamptz not null default now()
);

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
create policy "Public can read settings"
on public.invitation_settings
for select
to anon, authenticated
using (id = 'main');

create policy "Authenticated can manage settings"
on public.invitation_settings
for all
to authenticated
using (true)
with check (true);

-- Ziyaretçiler katılım formu gönderebilir. Admin tüm kayıtları yönetebilir.
create policy "Anyone can add guests"
on public.guests
for insert
to anon, authenticated
with check (true);

create policy "Authenticated can manage guests"
on public.guests
for all
to authenticated
using (true)
with check (true);

-- Ziyaretçiler anı defteri mesajı gönderebilir. Yayındaki mesajlar davetiyede okunur. Admin hepsini yönetir.
create policy "Anyone can add wishes"
on public.wishes
for insert
to anon, authenticated
with check (true);

create policy "Anyone can read approved wishes"
on public.wishes
for select
to anon
using (approved = true);

create policy "Authenticated can manage wishes"
on public.wishes
for all
to authenticated
using (true)
with check (true);

-- Görsel ve müzik bucket'ı. Public olmalı ki davetiyede görseller/müzik herkese açılsın.
insert into storage.buckets (id, name, public)
values ('wedding-media', 'wedding-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view wedding media" on storage.objects;
drop policy if exists "Authenticated can upload wedding media" on storage.objects;
drop policy if exists "Authenticated can update wedding media" on storage.objects;
drop policy if exists "Authenticated can delete wedding media" on storage.objects;

create policy "Public can view wedding media"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'wedding-media');

create policy "Authenticated can upload wedding media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'wedding-media');

create policy "Authenticated can update wedding media"
on storage.objects
for update
to authenticated
using (bucket_id = 'wedding-media')
with check (bucket_id = 'wedding-media');

create policy "Authenticated can delete wedding media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'wedding-media');
