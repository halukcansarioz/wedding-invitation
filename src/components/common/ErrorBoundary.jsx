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
        <div className="error-boundary-container">
          <h2>Opps! Beklenmeyen bir hata oluştu.</h2>
          <p>Lütfen sayfayı yenileyerek tekrar deneyin.</p>
          <button onClick={() => window.location.reload()} className="error-boundary-btn">
            Sayfayı Yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}