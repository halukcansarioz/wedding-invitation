import React from "react";

export function AdminLogin({
  isEn, isPasswordRecovery, showForgotPassword, adminEmail, adminPassword,
  recoveryPassword, recoveryPasswordAgain, recoveryLoading, recoveryMessage,
  forgotPasswordEmail, forgotPasswordLoading, forgotPasswordMessage,
  adminAuthLoading, adminLoginNotice, adminError, setAdminEmail, setAdminPassword,
  setForgotPasswordEmail, setShowForgotPassword, setAdminError, setAdminLoginNotice,
  setRecoveryPassword, setRecoveryPasswordAgain, setForgotPasswordMessage,
  submitAdminPassword, completePasswordRecovery, sendPasswordResetEmail
}) {
  if (isPasswordRecovery) {
    return (
      <form className="admin-login admin-recovery-form" onSubmit={completePasswordRecovery}>
        <p className="admin-login-note">
          {isEn ? "Password reset link opened. Set your new admin password." : "Şifre sıfırlama linki açıldı. Yeni admin şifreni belirle."}
        </p>
        <input type="password" value={recoveryPassword} onChange={(e) => setRecoveryPassword(e.target.value)} placeholder={isEn ? "New password" : "Yeni şifre"} />
        <input type="password" value={recoveryPasswordAgain} onChange={(e) => setRecoveryPasswordAgain(e.target.value)} placeholder={isEn ? "New password again" : "Yeni şifre tekrar"} />
        <button className="main-button" type="submit" disabled={recoveryLoading}>
          {recoveryLoading ? (isEn ? "Saving..." : "Kaydediliyor...") : (isEn ? "Save New Password 💾" : "Yeni Şifreyi Kaydet 💾")}
        </button>
        {recoveryMessage && <span className="admin-login-message">{recoveryMessage}</span>}
      </form>
    );
  }

  if (showForgotPassword) {
    return (
      <form className="admin-login admin-forgot-form" onSubmit={sendPasswordResetEmail}>
        <p className="admin-login-note">
          {isEn ? "Enter your admin email. Supabase will send a reset link." : "Admin e-postanı yaz. Supabase sana şifre sıfırlama linki gönderecek."}
        </p>
        <input type="email" value={forgotPasswordEmail} onChange={(e) => setForgotPasswordEmail(e.target.value)} placeholder={isEn ? "Admin email" : "Admin e-posta"} />
        <button className="main-button" type="submit" disabled={forgotPasswordLoading}>
          {forgotPasswordLoading ? (isEn ? "Sending..." : "Gönderiliyor...") : (isEn ? "Send Reset Link 📧" : "Sıfırlama Linki Gönder 📧")}
        </button>
        <button type="button" className="admin-link-button" onClick={() => { setShowForgotPassword(false); setForgotPasswordMessage(""); }}>
          {isEn ? "Back to login ⬅️" : "Giriş ekranına dön ⬅️"}
        </button>
        {forgotPasswordMessage && <span className="admin-login-message">{forgotPasswordMessage}</span>}
      </form>
    );
  }

  return (
    <form className="admin-login" onSubmit={submitAdminPassword}>
      <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder={isEn ? "Admin email" : "Admin e-posta"} />
      <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder={isEn ? "Admin password" : "Admin şifresi"} />
      <button className="main-button" type="submit" disabled={adminAuthLoading}>
        {adminAuthLoading ? (isEn ? "Checking..." : "Giriş kontrol ediliyor...") : (isEn ? "Login 🔐" : "Giriş Yap 🔐")}
      </button>
      <button type="button" className="admin-link-button" onClick={() => { setForgotPasswordEmail(adminEmail); setShowForgotPassword(true); setAdminError(""); setAdminLoginNotice(""); }}>
        {isEn ? "Forgot password? 🔑" : "Şifremi unuttum 🔑"}
      </button>
      {adminLoginNotice && <span className="admin-login-message success">{adminLoginNotice}</span>}
      {adminError && <span className="admin-login-message error">{adminError}</span>}
      <small className="admin-login-note">
        {isEn ? "Note: Use the email/password from your Supabase Authentication." : "Not: Supabase Authentication bölümündeki admin bilgileriyle giriş yapılır."}
      </small>
    </form>
  );
}