import React, { useState } from "react";
import { AdminSection, AdminField, AdminTextarea } from "../../AdminUI";
import { supabase } from "../../../supabaseClient";

export function NotificationsTab({ isEn }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState("");

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      alert(isEn ? "Please provide a title and message." : "Lütfen bildirim başlığı ve mesajını doldurun.");
      return;
    }

    setIsSending(true);
    setResult("");

    try {
      const { data, error } = await supabase.functions.invoke('send-push', {
        body: { title, body, url }
      });

      if (error) throw error;

      setResult(
        isEn 
          ? `✅ Successfully sent to ${data?.count || 0} subscribers.` 
          : `✅ Bildirim ${data?.count || 0} aboneye başarıyla iletildi.`
      );
      setTitle("");
      setBody("");
      setUrl("/");
    } catch (err) {
      console.error(err);
      setResult(isEn ? "❌ Failed to send notification." : "❌ Bildirim gönderilirken bir hata oluştu.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminSection title={isEn ? "Push Notifications" : "Anlık Bildirim Gönderimi (Push)"}>
      <p className="admin-help-text" style={{ marginBottom: "24px" }}>
        {isEn 
          ? "Send instant push notifications to guests who have installed the invitation app on their phones." 
          : "Davetiyeyi telefonuna (PWA olarak) kuran ve bildirim izni veren misafirlerinize anında bildirim gönderin."}
      </p>

      <div className="admin-edit-grid" style={{ marginBottom: "24px", gridTemplateColumns: "1fr" }}>
        <AdminField 
          label={isEn ? "Notification Title" : "Bildirim Başlığı"} 
          value={title} 
          onChange={setTitle} 
          placeholder={isEn ? "Ex: Ceremony is Starting!" : "Örn: Nikah Töreni Başlıyor!"} 
        />
        <AdminTextarea 
          label={isEn ? "Message Content" : "Mesaj İçeriği"} 
          value={body} 
          onChange={setBody} 
          placeholder={isEn ? "Ex: Please take your seats, the bride and groom are arriving." : "Örn: Lütfen yerlerinizi alın, gelin ve damat salona giriş yapıyor."} 
        />
        <AdminField 
          label={isEn ? "Redirect URL (Optional)" : "Yönlendirme Linki (İsteğe Bağlı)"} 
          value={url} 
          onChange={setUrl} 
          placeholder={isEn ? "Ex: /gallery" : "Örn: /?masa=12 (Varsayılan: /)"} 
        />
      </div>

      <div style={{ padding: "20px", background: "var(--paper-soft)", borderRadius: "12px", border: "1px solid var(--admin-border-color)" }}>
        <button 
          type="button" 
          className="main-button" 
          onClick={handleSendNotification}
          disabled={isSending}
          style={{ margin: 0, width: "100%", background: "linear-gradient(135deg, #8e44ad, #9b59b6)", borderColor: "#8e44ad" }}
        >
          {isSending 
            ? (isEn ? "Broadcasting... 📡" : "Bildirimler İletiliyor... 📡") 
            : (isEn ? "Send Push Notification 🚀" : "Anlık Bildirimi Gönder 🚀")}
        </button>

        {result && (
          <p style={{ margin: "16px 0 0 0", textAlign: "center", fontSize: "14px", fontWeight: "bold", color: result.includes("✅") ? "#27ae60" : "#e74c3c" }}>
            {result}
          </p>
        )}
      </div>
    </AdminSection>
  );
}