# Düğün Davetiyesi

React + Vite tabanlı, Supabase destekli dijital düğün davetiyesi uygulaması.

## Geliştirme

```bash
npm install
npm run dev
```

## Doğrulama

```bash
npm run lint
npm run test:unit
npm run test:e2e
npm run build
```

`npm test` unit ve Playwright E2E testlerini sırasıyla çalıştırır.

## Supabase Edge Functions

Edge Function CORS izinleri `ALLOWED_ORIGINS` ortam değişkeniyle virgülle ayrılmış origin listesi olarak yapılandırılır:

```text
ALLOWED_ORIGINS=https://your-domain.example,https://www.your-domain.example
```

Geliştirme ortamında production davetiyesi ve `localhost:5173` / `localhost:4173` varsayılan olarak desteklenir. Custom domain kullanıyorsanız production deploy öncesi `ALLOWED_ORIGINS` değerini Supabase secrets içine ekleyin.

## Üretim notları

- `npm run build` sonrası `dist/` klasörü deploy edilir.
- PWA görselleri runtime cache ile saklanır; büyük görseller precache’e alınmaz.
- Supabase service-role anahtarı yalnızca Edge Function secrets içinde tutulmalıdır.
- Vercel deploy’larında temel güvenlik başlıkları `vercel.json` üzerinden uygulanır.
- CI; push ve pull request olaylarında lint, production dependency audit, unit/E2E test ve build çalıştırır.

## Bilinen operasyonel gereksinimler

- Supabase veritabanı şeması ve RLS politikaları production projesinde yönetilir; kaynak repository’de migration dosyası yoksa mevcut production şeması silinmemelidir.
- Edge Function deploy’larında `ALLOWED_ORIGINS` secret’ı gerçek domain(ler) ile ayarlanmalıdır.
- Kamera, mikrofon ve konum özellikleri HTTPS altında ve kullanıcı izniyle çalışır.
