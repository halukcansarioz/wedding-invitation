import React from 'react';
// import * as Sentry from '@sentry/react'; // Şimdilik tekrar yoruma aldık

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
    
    // SENTRY ENTEGRASYONU ŞİMDİLİK İPTAL
    // Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container" style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#9f4f68', marginBottom: '14px' }}>Opps! Beklenmeyen bir hata oluştu.</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>Lütfen sayfayı yenileyerek tekrar deneyin veya yöneticiyle iletişime geçin.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '14px 28px', background: '#9f4f68', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}