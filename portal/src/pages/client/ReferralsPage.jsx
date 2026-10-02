import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Hammer } from 'lucide-react';
import { Player } from '@lottiefiles/react-lottie-player';
import officeAnimation from '../../assets/lottie/Office illustration.json';

export default function ReferralsPage() {
  return (
    <Layout>
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '-16px' }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.025em' }}>
            Mis recomendaciones
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, maxWidth: '520px' }}>
            Programa de referidos HummingX BI.
          </p>
        </div>
        {/* Coming Soon Card */}
        <div id="tour-coming-soon" className="card" style={{ 
          padding: '40px 32px 80px 32px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
          minHeight: '450px',
          justifyContent: 'center',
          border: '1px solid #E5E7EB'
        }}>
          
          <div style={{ marginTop: '-40px', marginBottom: '0px', width: 360, height: 360 }}>
            <Player
              autoplay
              loop
              src={officeAnimation}
              style={{ height: '360px', width: '360px' }}
            />
          </div>

          <h2 style={{ 
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '32px', 
            fontWeight: 800, 
            background: 'linear-gradient(135deg, #111827 0%, #0E7490 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 16px',
            letterSpacing: '-0.03em'
          }}>
            Grandes recompensas en camino
          </h2>
          
          <p style={{ 
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px', 
            color: '#4B5563', 
            margin: '0 0 32px', 
            maxWidth: '540px', 
            lineHeight: 1.7 
          }}>
            Estamos afinando los últimos detalles de nuestro programa de referidos. 
            Muy pronto podrás invitar a otras empresas a potenciar su negocio con 
            <strong> HummingX BI</strong> y ganar increíbles beneficios por cada recomendación exitosa.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#FFFFFF', borderRadius: '9999px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <span style={{ position: 'relative', display: 'flex', width: '10px', height: '10px' }}>
              <span style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite', position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', background: '#00C4CC', opacity: 0.75 }}></span>
              <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '10px', width: '10px', background: '#00C4CC' }}></span>
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Próximamente disponible
            </span>
          </div>
          
        </div>
      </div>
    </Layout>
  );
}
