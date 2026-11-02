-- Idempotent tenant isolation migration. Run in Supabase SQL editor.
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

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view tenant specific guests' AND tablename = 'guests') THEN
    CREATE POLICY "Public can view tenant specific guests" ON public.guests FOR SELECT TO anon USING (
      tenant_id IN (
        SELECT id FROM public.tenants
        WHERE slug = current_setting('request.jwt.claims', true)::json->>'custom_tenant_slug'
      )
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view approved wishes' AND tablename = 'wishes') THEN
    CREATE POLICY "Public can view approved wishes" ON public.wishes FOR SELECT TO anon USING (
      approved = true AND tenant_id IN (
        SELECT id FROM public.tenants
        WHERE slug = current_setting('request.jwt.claims', true)::json->>'custom_tenant_slug'
      )
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view approved guest photos' AND tablename = 'guest_photos') THEN
    CREATE POLICY "Public can view approved guest photos" ON public.guest_photos FOR SELECT TO anon USING (
      approved = true AND tenant_id IN (
        SELECT id FROM public.tenants
        WHERE slug = current_setting('request.jwt.claims', true)::json->>'custom_tenant_slug'
      )
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tenants can manage own guests' AND tablename = 'guests') THEN
    CREATE POLICY "Tenants can manage own guests" ON public.guests FOR ALL TO authenticated USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tenants can manage own wishes' AND tablename = 'wishes') THEN
    CREATE POLICY "Tenants can manage own wishes" ON public.wishes FOR ALL TO authenticated USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tenants can manage own photos' AND tablename = 'guest_photos') THEN
    CREATE POLICY "Tenants can manage own photos" ON public.guest_photos FOR ALL TO authenticated USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tenants can view own payments' AND tablename = 'payments') THEN
    CREATE POLICY "Tenants can view own payments" ON public.payments FOR SELECT TO authenticated USING (tenant_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own tenant' AND tablename = 'tenants') THEN
    CREATE POLICY "Users can view own tenant" ON public.tenants FOR SELECT TO authenticated USING (id = auth.uid());
  END IF;
END $$;