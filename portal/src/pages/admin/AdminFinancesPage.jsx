import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import {
  DollarSign,
  Calendar,
  TrendingDown,
  TrendingUp,
  Plus,
  Users,
  CheckCircle2,
  Wallet,
  Briefcase,
  Layers,
  X,
  FileText,
} from 'lucide-react';

import OverviewTab from './finances/OverviewTab';
import CobranzaTab from './finances/CobranzaTab';
import ExpensesTab from './finances/ExpensesTab';
import HistoricalDealsTab from './finances/HistoricalDealsTab';
import ExpenseModal from './finances/ExpenseModal';
import DealModal from './finances/DealModal';

export default function AdminFinancesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'cobranza' | 'expenses' | 'deals'
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [showDealModal, setShowDealModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const fetchFinances = async () => {
    try {
      const res = await api.get('/admin/finances/overview');
      setData(res.data);
    } catch (err) {
      console.error('Error al cargar finanzas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinances();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Handlers for Deals
  const handleOpenNewDeal = () => {
    setEditingDeal(null);
    setShowDealModal(true);
  };

  const handleOpenEditDeal = (deal) => {
    setEditingDeal(deal);
    setShowDealModal(true);
  };

  // Handlers for Expenses
  const handleOpenNewExpense = () => {
    setEditingExpense(null);
    setShowExpenseModal(true);
  };

  const handleOpenEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowExpenseModal(true);
  };

  return (
    <Layout>
      <div
        className="fade-in-up"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginTop: '-12px',
          paddingBottom: '60px',
        }}
      >
        {/* Toast Notification */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              background: '#111827',
              color: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              fontSize: '13.5px',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={16} color="#00C4CC" />
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage('')}
              style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', marginLeft: '6px' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Top Header Strip ─────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #00C4CC 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(0, 196, 204, 0.25)',
                }}
              >
                <DollarSign size={18} />
              </div>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#111827',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Finanzas, Flujo & Reparto de Socios
              </h1>
            </div>
            <p style={{ fontSize: '13.5px', color: '#6B7280', margin: 0, maxWidth: '720px' }}>
              Control del total cobrado, costos de servidores y herramientas, calendario de cobranza y reparto equitativo 1/3 para los socios.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleOpenNewExpense}
              className="btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 15px',
                borderRadius: '9px',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              <TrendingDown size={14} color="#DC2626" />
              Nuevo Gasto
            </button>

            <button
              onClick={handleOpenNewDeal}
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '9px',
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              <Plus size={15} />
              Registrar Proyecto Cerrado
            </button>
          </div>
        </div>

        {/* ── Navigation Tabs ──────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderBottom: '1px solid #E5E7EB',
            paddingBottom: '2px',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              border: 'none',
              borderBottom: activeTab === 'overview' ? '2px solid #00C4CC' : '2px solid transparent',
              background: 'none',
              fontSize: '13.5px',
              fontWeight: activeTab === 'overview' ? 700 : 500,
              color: activeTab === 'overview' ? '#0099AA' : '#6B7280',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <Users size={16} />
            Visión General & Reparto
          </button>

          <button
            onClick={() => setActiveTab('cobranza')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              border: 'none',
              borderBottom: activeTab === 'cobranza' ? '2px solid #00C4CC' : '2px solid transparent',
              background: 'none',
              fontSize: '13.5px',
              fontWeight: activeTab === 'cobranza' ? 700 : 500,
              color: activeTab === 'cobranza' ? '#0099AA' : '#6B7280',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <Calendar size={16} />
            Calendario de Cobranza
            {data?.upcomingPayments?.length > 0 && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  background: '#FEF3C7',
                  color: '#B45309',
                }}
              >
                {data.upcomingPayments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              border: 'none',
              borderBottom: activeTab === 'expenses' ? '2px solid #00C4CC' : '2px solid transparent',
              background: 'none',
              fontSize: '13.5px',
              fontWeight: activeTab === 'expenses' ? 700 : 500,
              color: activeTab === 'expenses' ? '#0099AA' : '#6B7280',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <TrendingDown size={16} />
            Gastos Operativos & Hosting
            {data?.expenses?.length > 0 && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  background: '#FEE2E2',
                  color: '#DC2626',
                }}
              >
                {data.expenses.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('deals')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              border: 'none',
              borderBottom: activeTab === 'deals' ? '2px solid #00C4CC' : '2px solid transparent',
              background: 'none',
              fontSize: '13.5px',
              fontWeight: activeTab === 'deals' ? 700 : 500,
              color: activeTab === 'deals' ? '#0099AA' : '#6B7280',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <Briefcase size={16} />
            Proyectos Cerrados Históricos
            {data?.historicalDeals?.length > 0 && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  background: '#F3F4F6',
                  color: '#4B5563',
                }}
              >
                {data.historicalDeals.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Active Tab View Content ──────────────────────────────── */}
        {loading ? (
          <div style={{ padding: '70px', textAlign: 'center', color: '#6B7280' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '14px', fontWeight: 500 }}>Calculando balance general y reparto de socios...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewTab data={data} onGoToTab={(tab) => setActiveTab(tab)} />
            )}

            {activeTab === 'cobranza' && (
              <CobranzaTab
                data={data}
                onRefresh={fetchFinances}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpensesTab
                expenses={data?.expenses || []}
                onOpenNewExpense={handleOpenNewExpense}
                onOpenEditExpense={handleOpenEditExpense}
                onRefresh={fetchFinances}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'deals' && (
              <HistoricalDealsTab
                deals={data?.historicalDeals || []}
                onOpenNewDeal={handleOpenNewDeal}
                onOpenEditDeal={handleOpenEditDeal}
                onRefresh={fetchFinances}
                onShowToast={showToast}
              />
            )}
          </>
        )}

        {/* ── Modals ──────────────────────────────────────────────── */}
        <ExpenseModal
          isOpen={showExpenseModal}
          expense={editingExpense}
          onClose={() => {
            setShowExpenseModal(false);
            setEditingExpense(null);
          }}
          onSaved={(msg) => {
            showToast(msg);
            fetchFinances();
          }}
        />

        <DealModal
          isOpen={showDealModal}
          deal={editingDeal}
          onClose={() => {
            setShowDealModal(false);
            setEditingDeal(null);
          }}
          onSaved={(msg) => {
            showToast(msg);
            fetchFinances();
          }}
        />
      </div>
    </Layout>
  );
}
