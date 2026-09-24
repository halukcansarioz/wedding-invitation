// src/pages/AdminView.jsx
import React from "react";
import AdminDashboard from "../components/AdminDashboard";
import { AdminPanelContent } from "../components/admin/AdminPanelComponents";
import { useStore } from "../store/useStore";

export default function AdminView(props) {
  const activeAdminTab = useStore(state => state.activeAdminTab);
  
  const adminTabs = [
    { id: "general", label: "Genel Bilgiler", description: "İsim, tarih, mekan, linkler" },
    { id: "theme", label: "Tema", description: "Renk teması ve yayın ayarları" },
    { id: "security", label: "Admin Şifresi", description: "Panel giriş şifresi değiştirme" },
    { id: "messages", label: "WhatsApp Mesajları", description: "Paylaşım ve katılım metinleri" },
    { id: "copy", label: "Başlıklar", description: "Sayfadaki yazı ve başlıklar" },
    { id: "family", label: "Aile Bilgileri", description: "Gelin ve damat aileleri" },
    { id: "story", label: "Bizim Hikayemiz", description: "Tanışma ve teklif anıları" }, 
    { id: "ceremony", label: "Nikah / Düğün", description: "Nikah ve eğlence ayrımı" },
    { id: "schedule", label: "Düğün Takvimi", description: "Saat saat düğün akışı" },
    { id: "gallery", label: "Görsel / Müzik", description: "Ana görseller, galeri ve müzik" },
    // YENİ EKLENEN: Misafir Fotoğrafları Sekmesi
    { id: "guestPhotos", label: "Misafir Fotoğrafları (POV)", description: "Misafirlerin yüklediği kareler" },
    { id: "guests", label: "Katılım (LCV) Kayıtları", description: "Ad, kişi sayısı, çocuk, not" },
    { id: "tablePlan", label: "Oturma Planı", description: "Misafirleri masalara yerleştir" },
    { id: "wishes", label: "Anı Defteri Formu", description: "Ad soyad ve dilek mesajları" },
    { id: "qr", label: "QR Kod", description: "Davetiye QR kodu ve linki" },
    { id: "personalLink", label: "Özel Link Üret", description: "Davetliye özel isimli link" },
    { id: "data", label: "Veri Yedeği", description: "Yedek alma ve yükleme (JSON)" },
  ];

  const activeTabInfo = adminTabs.find((tab) => tab.id === activeAdminTab) || adminTabs[0];

  return (
    <AdminDashboard
      activeTabInfo={activeTabInfo}
      adminTabs={adminTabs}
      {...props}
      renderAdminActivePanel={() => <AdminPanelContent {...props} activeAdminTab={activeAdminTab} />}
    />
  );
}