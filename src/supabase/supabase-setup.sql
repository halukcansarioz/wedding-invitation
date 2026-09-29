-- Mevcut tablolarınıza tenant_id sütunlarını ekleme
ALTER TABLE public.guests
ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.wishes
ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.guest_photos
ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS tenant_id uuid;
-- Tenant (Kiralama/Çift) tablosunun oluşturulması
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);
-- Row Level Security (RLS) İzolasyon Politikaları
-- Misafirler (Anonim) yalnızca doğru slug ile ulaştıkları tenant'ın verilerini görebilir
CREATE POLICY "Public can view tenant specific guests" ON public.guests FOR
SELECT TO anon USING (
    tenant_id IN (
      SELECT id
      FROM tenants
      WHERE slug = current_setting('request.jwt.claims', true)::json->>'custom_tenant_slug'
    )
  );
-- Sistem Yöneticileri (Authenticated - Çiftler) yalnızca KENDİ tenant verilerini okuyup/değiştirebilir
CREATE POLICY "Tenants can manage own guests" ON public.guests FOR ALL TO authenticated USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());
CREATE POLICY "Tenants can manage own wishes" ON public.wishes FOR ALL TO authenticated USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());