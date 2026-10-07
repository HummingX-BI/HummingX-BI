import { useState } from 'react';
import Layout from '../../components/Layout';
import OverviewTab from './analytics/OverviewTab';
import ProjectsTab from './analytics/ProjectsTab';
import BehaviorTab from './analytics/BehaviorTab';
import ClientTab from './analytics/ClientTab';

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [range, setRange] = useState(30);

  return (
    <Layout customBreadcrumbLabel="Control y Analíticas">
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Header & Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>
              Control y Analíticas
            </h1>
            <p style={{ fontSize: '15px', color: '#6B7280', margin: 0 }}>
              Supervisa el estado global de todos los proyectos activos, uso de la plataforma y comportamiento de tus clientes.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', background: '#F3F4F6', padding: '4px', borderRadius: '8px' }}>
              <button 
                onClick={() => setRange(7)}
                style={{ padding: '6px 16px', fontSize: '13px', fontWeight: 600, border: 'none', background: range === 7 ? '#fff' : 'transparent', color: range === 7 ? '#111827' : '#6B7280', borderRadius: '6px', cursor: 'pointer', boxShadow: range === 7 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
              >
                7D
              </button>
              <button 
                onClick={() => setRange(30)}
                style={{ padding: '6px 16px', fontSize: '13px', fontWeight: 600, border: 'none', background: range === 30 ? '#fff' : 'transparent', color: range === 30 ? '#111827' : '#6B7280', borderRadius: '6px', cursor: 'pointer', boxShadow: range === 30 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
              >
                30D
              </button>
              <button 
                onClick={() => setRange(90)}
                style={{ padding: '6px 16px', fontSize: '13px', fontWeight: 600, border: 'none', background: range === 90 ? '#fff' : 'transparent', color: range === 90 ? '#111827' : '#6B7280', borderRadius: '6px', cursor: 'pointer', boxShadow: range === 90 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
              >
                90D
              </button>
            </div>
            
            <button className="btn-secondary" onClick={() => window.print()} style={{ padding: '8px 16px' }}>
              Exportar
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', gap: '32px', overflowX: 'auto' }}>
          {[
            { id: 'overview', label: 'Resumen Global' },
            { id: 'projects', label: 'Proyectos' },
            { id: 'behavior', label: 'Comportamiento' },
            { id: 'client', label: 'Por Cliente' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 0',
                fontSize: '14px',
                fontWeight: 600,
                color: activeTab === tab.id ? '#00C4CC' : '#6B7280',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #00C4CC' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: '400px' }}>
          {activeTab === 'overview' && <OverviewTab range={range} />}
          {activeTab === 'projects' && <ProjectsTab range={range} />}
          {activeTab === 'behavior' && <BehaviorTab range={range} />}
          {activeTab === 'client' && <ClientTab range={range} />}
        </div>

      </div>
    </Layout>
  );
}
