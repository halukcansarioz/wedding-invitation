import React from 'react';
import * as Sentry from '@sentry/react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary Yakaladı:", error, errorInfo);
    
    // Sentry hata fırlatma aktif edildi
    Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container" style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          {/* SABİT RENKLER YERİNE TEMA DEĞİŞKENLERİ KULLANILDI */}
          <h2 style={{ color: 'var(--rose-dark)', marginBottom: '14px' }}>Opps! Beklenmeyen bir hata oluştu.</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Lütfen sayfayı yenileyerek tekrar deneyin veya yöneticiyle iletişime geçin.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '14px 28px', background: 'var(--rose-dark)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}