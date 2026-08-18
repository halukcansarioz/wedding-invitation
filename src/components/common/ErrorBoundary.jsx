import React from 'react';

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
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px', textAlign: 'center', background: '#fffafb', color: '#9f4f68', fontFamily: 'sans-serif' }}>
          <h2>Opps! Beklenmeyen bir hata oluştu.</h2>
          <p>Lütfen sayfayı yenileyerek tekrar deneyin.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', marginTop: '16px', background: '#9f4f68', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Sayfayı Yenile</button>
        </div>
      );
    }
    return this.props.children;
  }
}