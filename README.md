# 💍 Dijital Düğün Davetiyesi (Wedding Invitation)

<div align="center">
  <p><strong>Mobil uyumlu, sinematik animasyonlara sahip, bulut tabanlı medya yönetimi ile optimize edilmiş yüksek performanslı dijital düğün davetiyesi uygulaması.</strong></p>

  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase Storage" />
  <img src="https://img.shields.io/badge/Responsive-Yes-brightgreen?style=for-the-badge" alt="Responsive Design" />
</div>

---

## 📖 Proje Hakkında

**Wedding Invitation**, geleneksel kağıt davetiyelerin zarafetini modern web teknolojileriyle buluşturan yeni nesil bir dijital davetiye projesidir. Kullanıcılara yalnızca bir bilgi ekranı sunmakla kalmaz; pürüzsüz zarf açılış kurgusu, 3D mühür tasarımı ve temaya özel animasyonlarla (örneğin uçuşan kelebekler) etkileşimli bir deneyim yaşatır.

Mobil cihazlarda maksimum akıcılık ve performans sağlamak amacıyla projenin mimarisi **hafif kod tabanı (lightweight codebase)** prensibine göre tasarlanmıştır. Yüksek çözünürlüklü dinamik video arka planları uygulama içine gömülmek yerine **Supabase Storage** üzerinde depolanır ve bulut üzerinden optimize edilmiş URL'ler aracılığıyla dinamik olarak servis edilir.

---

## ✨ Temel Özellikler

* **💌 Sinematik Açılış ve 3D Mühür:** 96px boyutunda özel 3D mühür tasarımı ile desteklenen, gerçekçi ve pürüzsüz zarf açılış animasyonu.
* **🦋 Tematik Özel Animasyonlar:** Lavanta ve benzeri özel temalar için saf CSS (`index.css`) kullanılarak geliştirilmiş, performansı yormayan uçuşan kelebek animasyonları ve görsel efektler.
* **🎥 Dinamik Video Arka Planları:** Pexels ve Pixabay gibi platformlardan özenle seçilen, mobil veriyi ve şarjı korumak adına 5–15 saniyelik döngüler ve 2–5 MB boyut aralığında optimize edilen HD/Full HD arka plan videoları.
* **☁️ Supabase Storage Entegrasyonu:** Videoların doğrudan repository'de tutulmasını engelleyerek derleme (build) boyutunu minimize eden bulut mimarisi. İçerik ve videolar, yeniden deploy işlemine gerek kalmadan yalnızca URL güncellenerek değiştirilebilir.
* **📱 Tam Mobil Uyumluluk (Responsive UI):** Dokunmatik ekranlar ve tüm cihaz çözünürlükleri için kusursuz çalışan yerleşim planı, gelişmiş açılır menü (dropdown) yapıları ve etkileşimli buton hover animasyonları.

---

## 🛠️ Teknoloji Yığını

* **Frontend:** React (`App.jsx`), JavaScript (ES6+), HTML5
* **Stil & Animasyonlar:** Pure CSS / CSS3 (`index.css`), Keyframe Animasyonları
* **Medya & Bulut Depolama:** Supabase Storage
* **Sürüm Kontrolü & Dağıtım:** Git & GitHub

---

## 📂 Proje Yapısı ve Mimari

Proje, sürdürülebilirlik ve kolay bakım odaklı bir dosya organizasyonuna sahiptir:

```text
├── src/
│   ├── App.jsx          # Ana uygulama bileşeni ve arayüz mantığı
│   ├── constants.js     # Supabase Storage video linkleri, tema ayarları ve sabit veriler
│   ├── index.css        # Temel stiller, mühür/zarf efektleri, kelebek animasyonları ve responsive layout
│   └── ...
├── public/              # Statik ikincil varlıklar (ikonlar, favicon vb.)
├── package.json         # Proje bağımlılıkları ve scriptler
└── README.md            # Proje dokümantasyonu
