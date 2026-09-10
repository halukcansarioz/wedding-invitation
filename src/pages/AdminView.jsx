import React from "react";
import AdminDashboard from "../components/AdminDashboard";
import { AdminPanelContent } from "../components/admin/AdminPanelComponents";
import { useStore } from "../store/useStore";

export default function AdminView(props) {
  const activeAdminTab = useStore(state => state.activeAdminTab);
  
  const adminTabs = [
    { id: "general", label: "Genel Bilgiler", description: "İsim, tarih, mekan, linkler" },
    { id: "theme", label: "Tema", description: "Renk teması ve anı defteri onayı" },
    { id: "security", label: "Admin Şifresi", description: "Panel giriş şifresini değiştir" },
    { id: "messages", label: "WhatsApp Mesajları", description: "Paylaşım, katılım ve özel davetli metinleri" },
    { id: "copy", label: "Başlıklar", description: "Sayfadaki yazı ve başlıklar" },
    { id: "family", label: "Aile Bilgileri", description: "Gelin ve damat aileleri" },
    { id: "story", label: "Bizim Hikayemiz", description: "Tanışma ve teklif anıları" }, 
    { id: "ceremony", label: "Nikah / Düğün", description: "Nikah ve eğlence ayrımı" },
    { id: "schedule", label: "Düğün Takvimi", description: "Saat saat akış" },
    { id: "gallery", label: "Görsel / Müzik", description: "Ana ekran görselleri, galeri ve müzik" },
    { id: "guests", label: "Katılım Formu Kayıtları", description: "Ad, telefon, kişi, çocuk ve not bilgileri" },
    { id: "wishes", label: "Anı Defteri Formu", description: "Ad soyad ve mesaj kayıtları" },
    { id: "qr", label: "QR Kod", description: "Davetiye QR kodu ve genel paylaşım linki" },
    { id: "personalLink", label: "Özel Link", description: "Davetliye özel isimli link oluşturma" },
    { id: "data", label: "Veri Yedeği", description: "Excel / CSV ve JSON yedek alma" },
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