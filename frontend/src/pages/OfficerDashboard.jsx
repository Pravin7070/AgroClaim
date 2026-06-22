import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { officerAPI } from '../services/api';
import IconWrapper from '../components/IconWrapper';
import AgroLogo from '../components/AgroLogo';
import { DashboardSkeleton } from '../components/Skeleton';
import { getCropEmoji, getDamageEmoji } from '../utils/emojiMaps';
import {
  LuClock,
  LuCheckCircle2,
  LuXCircle,
  LuCoins,
  LuShieldCheck,
  LuBarChart3,
  LuFileSpreadsheet,
  LuArrowRight,
  LuSparkles,
  LuLayoutGrid
} from 'react-icons/lu';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashboardRes, claimsRes] = await Promise.all([
        officerAPI.getDashboard(),
        officerAPI.getPendingClaims({ limit: 5 })
      ]);

      if (dashboardRes.data.success) {
        setDashboard(dashboardRes.data.data);
      }

      if (claimsRes.data.success) {
        setClaims(claimsRes.data.claims);
      }
    } catch (error) {
      console.error('Failed to get data:', error);
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
            Officer Dashboard
            <AgroLogo className="w-10 h-10" />
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Total work summary • Hello, <span className="text-blue-600 font-bold">{user?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">All systems okay</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {[
          { label: 'Wait to Check', value: dashboard?.pendingClaims || 0, icon: <LuClock />, color: 'amber', sub: 'Claims need check' },
          { label: 'Scheme Requests', value: dashboard?.pendingSchemes || 0, icon: <LuFileSpreadsheet />, color: 'indigo', sub: 'Pending schemes' },
          { label: 'Approved', value: dashboard?.approvedClaims || 0, icon: <LuCheckCircle2 />, color: 'emerald', sub: 'Money sent' },
          { label: 'Refused', value: dashboard?.rejectedClaims || 0, icon: <LuXCircle />, color: 'red', sub: 'Requests stopped' },
          { label: 'Total Money', value: `₹${dashboard?.fundBalance?.toLocaleString() || 0}`, icon: <LuCoins />, color: 'blue', sub: 'Money in system' }
        ].map((stat, i) => (
          <div key={i} className={`card-glass p-6 group lg:p-4 hover:border-${stat.color}-200 transition-all relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-${stat.color}-100 transition-colors`} />
            <div className="relative z-10 space-y-4 lg:space-y-2">
              <IconWrapper color={`text-${stat.color}-600`} bgColor={`bg-${stat.color}-50`} size="w-10 h-10 lg:w-8 lg:h-8">
                {stat.icon}
              </IconWrapper>
              <div>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
                <p className={`text-[9px] font-bold text-${stat.color}-600 mt-1 uppercase tracking-wider`}>{stat.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Pending Claims Table - 2 columns */}
        <div className="xl:col-span-2 card-glass p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <IconWrapper color="text-amber-600" bgColor="bg-amber-50" size="w-10 h-10">
                <LuFileSpreadsheet />
              </IconWrapper>
              Wait to check
            </h2>
            <Link to="/officer/claims" className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-2 group">
              View All Claims <LuArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {claims.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest">Farmer Name</th>
                    <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest">Crop / Land</th>
                    <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest">Money Needed</th>
                    <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {claims.map((claim) => (
                    <tr key={claim._id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-100">
                            {claim.farmerId?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{claim.farmerId?.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{claim.farmerId?.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <p className="font-bold text-gray-900 text-sm capitalize">{getCropEmoji(claim.crop)} {claim.crop}</p>
                        <p className="text-xs text-gray-500 font-medium">{claim.acres} Acres • {getDamageEmoji(claim.damageInfo?.type)} {claim.damageInfo?.type}</p>
                      </td>
                      <td className="py-4">
                        <span className="font-mono font-bold text-blue-600">₹{claim.aiAnalysis?.compensationAmount?.toLocaleString() || 0}</span>
                      </td>
                      <td className="py-4 text-right">
                        <Link
                          to={`/officer/claims/${claim._id}`}
                          className={`py-2.5 px-5 text-xs rounded-xl shadow-md transition-all inline-block font-black uppercase tracking-widest ${!claim.aiAnalysis?.analyzedAt
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 animate-pulse'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
                            }`}
                        >
                          {!claim.aiAnalysis?.analyzedAt ? 'Analyze Now' : 'Review'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <LuSparkles className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No requests waiting</h3>
              <p className="text-gray-500 text-sm max-w-[200px] mt-2">All farm help requests have been checked.</p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-4xl text-white relative overflow-hidden group shadow-xl">
            <LuLayoutGrid className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
            <h3 className="text-xl font-black mb-2">Check Money</h3>
            <p className="text-blue-100 text-sm font-medium mb-6">Money currently available to pay farmers for damage.</p>
            <Link to="/officer/funds" className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-2xl font-bold text-sm transition-all inline-block">
              Edit Funds
            </Link>
          </div>

          <div className="card-glass p-8 border-l-4 border-blue-500">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-2 italic">
              Quick Tip
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Always check the photos uploaded by farmers before approving the money.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
