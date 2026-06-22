import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { farmerAPI } from '../../services/api';
import IconWrapper from '../../components/IconWrapper';
import AgroLogo from '../../components/AgroLogo';
import { DashboardSkeleton } from '../../components/Skeleton';
import {
  LuSprout,
  LuListChecks,
  LuClipboardEdit,
  LuClock,
  LuCheckCircle2,
  LuXCircle,
  LuAlertCircle,
  LuSparkles,
  LuTrendingUp,
  LuArrowRight,
  LuInbox,
  LuShieldCheck
} from 'react-icons/lu';

export default function FarmerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await farmerAPI.getDashboard();
      if (data.success) {
        setDashboard(data.data);
      }
    } catch (error) {
      console.error('Failed to get info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-6 md:p-8 animate-fade-in-up pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            {t('farmer.dashboard.title')}
            <AgroLogo className="w-10 h-10" />
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            {t('farmer.dashboard.welcome')}, <span className="text-farmer-600 font-bold">{user?.name}</span>! {t('farmer.dashboard.welcome_back')}
          </p>
        </div>
        <button
          onClick={() => navigate('/farmer/submit-claim')}
          className="btn-farmer py-4 px-8 rounded-2xl shadow-xl shadow-farmer-200 hover:shadow-glow-green transition-all duration-300 flex items-center gap-3 group"
        >
          <LuClipboardEdit className="group-hover:rotate-12 transition-transform" />
          <span>{t('farmer.dashboard.ask_for_help')}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="card-glass p-6 overflow-hidden relative group hover:border-farmer-200 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-farmer-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-farmer-100 transition-colors" />
          <div className="flex items-center gap-4 relative z-10">
            <IconWrapper color="text-farmer-600" bgColor="bg-farmer-50" size="w-14 h-14">
              <LuSprout />
            </IconWrapper>
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{t('farmer.dashboard.help_requests')}</p>
              <h3 className="text-3xl font-black text-gray-900">{dashboard?.activeClaims || 0}</h3>
            </div>
          </div>
        </div>

        <div className="card-glass p-6 overflow-hidden relative group hover:border-blue-200 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-100 transition-colors" />
          <div className="flex items-center gap-4 relative z-10">
            <IconWrapper color="text-blue-600" bgColor="bg-blue-50" size="w-14 h-14">
              <LuTrendingUp />
            </IconWrapper>
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{t('farmer.dashboard.your_money')}</p>
              <h3 className="text-3xl font-black text-gray-900">₹{dashboard?.walletBalance?.toLocaleString() || 0}</h3>
            </div>
          </div>
        </div>

        <div className="card-glass p-6 overflow-hidden relative group hover:border-indigo-200 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-100 transition-colors" />
          <div className="flex items-center gap-4 relative z-10">
            <IconWrapper color="text-indigo-600" bgColor="bg-indigo-50" size="w-14 h-14">
              <LuShieldCheck />
            </IconWrapper>
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Active Schemes</p>
              <h3 className="text-3xl font-black text-gray-900">{dashboard?.activeSchemes || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="card-glass p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <IconWrapper color="text-indigo-600" bgColor="bg-indigo-50" size="w-10 h-10">
                <LuListChecks />
              </IconWrapper>
              {t('farmer.dashboard.latest_news')}
            </h2>
            <Link to="/farmer/claims" className="text-farmer-600 hover:text-farmer-700 font-bold text-sm flex items-center gap-2 group">
              {t('farmer.dashboard.view_all_history')} <LuArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-4">
            {dashboard?.recentClaims?.length > 0 ? (
              dashboard.recentClaims.map((claim) => (
                <div key={claim._id} className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 hover:border-farmer-200 hover:shadow-xl hover:shadow-farmer-100 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <IconWrapper
                        color={claim.status === 'approved' ? 'text-emerald-600' : claim.status === 'rejected' ? 'text-red-600' : 'text-amber-600'}
                        bgColor={claim.status === 'approved' ? 'bg-emerald-50' : claim.status === 'rejected' ? 'bg-red-50' : 'bg-amber-50'}
                        size="w-12 h-12"
                      >
                        {claim.status === 'approved' ? <LuCheckCircle2 /> : claim.status === 'rejected' ? <LuXCircle /> : <LuClock />}
                      </IconWrapper>
                      <div>
                        <h4 className="font-bold text-gray-900 capitalize tracking-tight group-hover:text-farmer-600 transition-colors">{claim.crop} {t('farmer.dashboard.help_requests')}</h4>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">{t('farmer.dashboard.paper_id')}: {claim._id.slice(-6)} • {new Date(claim.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {claim.status === 'approved' && claim.funds?.amount != null && (
                        <p className="text-sm font-black text-gray-900">₹{claim.funds.amount.toLocaleString()}</p>
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border mt-2 inline-block ${claim.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        claim.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                        {claim.status === 'approved' ? t('farmer.dashboard.done') : claim.status === 'rejected' ? t('farmer.dashboard.refused') : t('farmer.dashboard.waiting')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <LuInbox className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{t('farmer.dashboard.no_news')}</h3>
                <p className="text-gray-500 text-sm max-w-[200px] mt-2">{t('farmer.dashboard.submit_first')}</p>
                <button onClick={() => navigate('/farmer/submit-claim')} className="mt-6 btn-farmer px-6 py-2 text-sm">{t('farmer.dashboard.ask_for_help')}</button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips / Info Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 to-green-700 text-white p-8 rounded-[32px] relative overflow-hidden group shadow-2xl shadow-emerald-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/20 transition-all duration-700" />
            <div className="relative z-10">
              <IconWrapper color="text-emerald-600" bgColor="bg-white" size="w-14 h-14 mb-6 shadow-xl">
                <LuSprout />
              </IconWrapper>
              <h2 className="text-3xl font-black mb-4 leading-tight">{t('farmer.dashboard.get_paid_quickly')}</h2>
              <p className="text-emerald-50/90 font-medium text-lg leading-relaxed">
                {t('farmer.dashboard.ai_help_desc')}
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-emerald-600 bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-bold text-emerald-100 underline underline-offset-4 decoration-emerald-400">{t('farmer.dashboard.join_farmers')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
