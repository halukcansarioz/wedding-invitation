import React from 'react';
import { useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', color: 'var(--text-main)', fontFamily: '"Playfair Display", serif' }}>
      
      {/* Navbar */}
      <header style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(159, 79, 104, 0.1)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--rose-deep)', margin: 0 }}>Davetiyem.AI</h1>
        <nav style={{ display: 'flex', gap: '24px' }}>
          <button onClick={() => navigate('/demo-cift')} className="secondary-button" style={{ margin: 0 }}>Demo İncele</button>
          <button onClick={() => navigate('/demo-cift/admin')} className="main-button" style={{ margin: 0 }}>Admin Girişi</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '100px 24px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <m.h2 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ fontSize: '48px', color: 'var(--rose-dark)', marginBottom: '24px', lineHeight: 1.2 }}
        >
          En Mutlu Gününüz İçin<br />Akıllı Dijital Davetiye
        </m.h2>
        <m.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: '20px', color: 'var(--text-muted)', marginBottom: '40px', fontFamily: 'sans-serif' }}
        >
          Yapay zeka destekli teşekkür mesajları, canlı barkovizyon, LCV yönetimi ve misafirlerin gözünden ortak fotoğraf albümü. Klasik davetiyeleri unutun.
        </m.p>
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <button onClick={() => navigate('/demo-cift')} className="main-button" style={{ fontSize: '18px', padding: '16px 32px' }}>
            Hemen Ücretsiz Dene ✨
          </button>
        </m.div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '60px 24px', backgroundColor: 'var(--paper-soft)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          
          <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '16px' }}>📊</span>
            <h3 style={{ fontSize: '22px', color: 'var(--rose-deep)', marginBottom: '12px' }}>Gelişmiş LCV (RSVP)</h3>
            <p style={{ fontFamily: 'sans-serif', color: 'var(--text-muted)' }}>Masa planlaması, QR kod ile kapı kontrolü ve anlık katılım istatistikleri.</p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '16px' }}>📸</span>
            <h3 style={{ fontSize: '22px', color: 'var(--rose-deep)', marginBottom: '12px' }}>Misafir POV Albüm</h3>
            <p style={{ fontFamily: 'sans-serif', color: 'var(--text-muted)' }}>Misafirleriniz kendi çektikleri fotoğrafları anında davetiyenize yüklesin.</p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '16px' }}>🎬</span>
            <h3 style={{ fontSize: '22px', color: 'var(--rose-deep)', marginBottom: '12px' }}>Canlı Barkovizyon</h3>
            <p style={{ fontFamily: 'sans-serif', color: 'var(--text-muted)' }}>Düğün gecesi dev ekranda akan canlı anı defteri ve kutlama mesajları.</p>
          </div>

        </div>
      </section>
      
    </div>
  );
}