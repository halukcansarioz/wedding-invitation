import React, { useState, useEffect } from "react";
import { AdminSection } from "../../AdminUI";
import { supabase } from "../../../supabaseClient";

export function PaymentsTab({ isEn }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPayments(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalAmount = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <AdminSection title={isEn ? "Received Gifts & Payments" : "Gelen Hediyeler ve Ödemeler"}>
      <p className="admin-help-text">
        {isEn 
          ? "Gifts and payments sent by your guests via credit card (Stripe) are listed here." 
          : "Misafirlerinizin kredi kartı (Stripe) aracılığıyla gönderdiği takı ve hediyeler burada listelenir."}
      </p>

      <div className="admin-stats admin-stats-inside" style={{ marginBottom: "20px" }}>
        <div>
          <strong style={{ color: "#27ae60" }}>
            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalAmount)}
          </strong>
          <span>{isEn ? "Total Revenue" : "Toplam Gelen Tutar"}</span>
        </div>
        <div>
          <strong>{payments.filter(p => p.status === 'completed').length}</strong>
          <span>{isEn ? "Successful Transactions" : "Başarılı İşlem"}</span>
        </div>
        <button type="button" className="secondary-button" style={{ margin: "auto" }} onClick={fetchPayments}>
          {isEn ? "Refresh 🔄" : "Yenile 🔄"}
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "20px" }}>{isEn ? "Loading payments..." : "Ödemeler yükleniyor..."}</p>
      ) : error ? (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      ) : payments.length === 0 ? (
        <p className="empty-text">{isEn ? "No payments received yet." : "Henüz bir hediye/ödeme alınmamış."}</p>
      ) : (
        <div className="admin-list admin-list-full" style={{ maxHeight: "500px", overflowY: "auto" }}>
          {payments.map(payment => (
            <div key={payment.id} className="admin-row" style={{ borderLeftColor: payment.status === 'completed' ? "#27ae60" : "#f1c40f", marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong style={{ fontSize: "16px" }}>{payment.guest_name}</strong>
                <strong style={{ color: payment.status === 'completed' ? "#27ae60" : "#f39c12", fontSize: "16px" }}>
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: payment.currency }).format(payment.amount)}
                </strong>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", color: "var(--text-muted)" }}>
                <span>{new Date(payment.created_at).toLocaleString('tr-TR')}</span>
                <span style={{ 
                  padding: "4px 8px", 
                  borderRadius: "8px", 
                  background: payment.status === 'completed' ? "rgba(46, 204, 113, 0.15)" : "rgba(241, 196, 15, 0.2)", 
                  color: payment.status === 'completed' ? "#27ae60" : "#d35400", 
                  fontWeight: "bold" 
                }}>
                  {payment.status === 'completed' ? (isEn ? "Completed" : "Başarılı") : (isEn ? "Pending" : "Bekliyor")}
                </span>
              </div>

              {payment.note && (
                <p style={{ margin: "10px 0 0 0", fontStyle: "italic", fontSize: "14px", padding: "8px", background: "var(--paper-soft)", borderRadius: "6px" }}>
                  "{payment.note}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminSection>
  );
}