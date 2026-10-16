import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import TierHero from './referrals/TierHero';
import ReferralList from './referrals/ReferralList';
import CreditHistory from './referrals/CreditHistory';
import RecommendModal from './referrals/RecommendModal';

export default function ReferralsPage() {
  const [data, setData] = useState({
    referrals: [],
    creditMovements: [],
    totalCredits: 0,
    referralCode: '',
    level: 1,
    convertedCount: 0,
    allTiers: {},
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchReferrals = async () => {
    try {
      const res = await api.get('/referrals/my');
      setData(res.data);
    } catch (err) {
      console.error('[REFERRALS] Error al cargar recomendaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleCreated = () => {
    fetchReferrals();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bars-loader"><div></div><div></div><div></div></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="fade-in-up max-w-7xl mx-auto space-y-6 pb-12">
        {/* Tier Hero with 3D Level Badge, Available Credits, Progress Ring & Code */}
        <TierHero
          level={data.level}
          convertedCount={data.convertedCount}
          totalCredits={data.totalCredits}
          referralCode={data.referralCode}
        />

        {/* Referrals List with Interactive Timeline */}
        <ReferralList
          referrals={data.referrals}
          onOpenRecommendModal={() => setModalOpen(true)}
        />

        {/* Credit History & Movements */}
        <CreditHistory
          creditMovements={data.creditMovements}
          totalCredits={data.totalCredits}
        />

        {/* Modal for Recommending New Companies */}
        <RecommendModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
        />
      </div>
    </Layout>
  );
}
