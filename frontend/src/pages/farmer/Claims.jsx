import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { farmerAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Spinner } from '../../components/Loading';
import IconWrapper from '../../components/IconWrapper';
import { getCropEmoji } from '../../utils/emojiMaps';
import {
  LuClock,
  LuScan,
  LuInbox,
  LuHelpCircle,
  LuBrain,
  LuShieldCheck,
  LuCoins,
  LuChevronDown,
  LuChevronUp,
  LuRefreshCw,
  LuSearch,
  LuFileText,
  LuCheckCircle2,
  LuFilePlus,
  LuFilter,
  LuTrash2,
  LuChevronRight,
  LuAlertCircle
} from 'react-icons/lu';

export default function FarmerClaims() {
  const navigate = useNavigate();
  const toast = useToast();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const trackingSteps = [
    { key: 'submitted', label: 'Submitted', desc: 'Claim received by our system', icon: LuFileText, color: 'blue' },
    { key: 'ai_analyzing', label: 'Under AI Review', desc: 'Forensic vision AI analyzing damage', icon: LuBrain, color: 'indigo' },
    { key: 'pending_review', label: 'Officer Verification', desc: 'Manual check by local officer', icon: LuShieldCheck, color: 'amber' },
    { key: 'approved', label: 'Approved', desc: 'Claim verified and finalized', icon: LuCheckCircle2, color: 'emerald' },
    { key: 'funds_released', label: 'Fund Released', desc: 'Compensation sent to your wallet', icon: LuCoins, color: 'green' }
  ];

  const getStatusIndex = (status) => {
    if (status === 'rejected') return -1;
    if (status === 'info_requested') return 2; // Stuck at officer verification
    return trackingSteps.findIndex(s => s.key === status);
  };

  useEffect(() => {
    fetchClaims();
  }, [filter]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await farmerAPI.getClaims(params);
      if (data.success) {
        setClaims(data.claims);
      }
    } catch (error) {
      console.error('Failed to get claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (claimId) => {
    if (!window.confirm('Do you want to cancel this request? You cannot undo this.')) return;

    setDeleting(claimId);
    try {
      const { data } = await farmerAPI.deleteClaim(claimId);
      if (data.success) {
        setClaims(claims.filter(claim => claim._id !== claimId));
        toast.success('Claim cancelled successfully');
      }
    } catch (error) {
      toast.error('Could not cancel request. It might be already checked.');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      submitted: { color: 'text-blue-600', bg: 'bg-blue-50', icon: <LuInbox />, label: 'Sent' },
      ai_analyzing: { color: 'text-purple-600', bg: 'bg-purple-50', icon: <LuScan />, label: 'AI Checking' },
      pending_review: { color: 'text-amber-600', bg: 'bg-amber-50', icon: <LuClock />, label: 'Waiting for Officer' },
      approved: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <LuCheckCircle2 />, label: 'Approved' },
      rejected: { color: 'text-red-600', bg: 'bg-red-50', icon: <LuAlertCircle />, label: 'Refused' },
      info_requested: { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <LuHelpCircle />, label: 'Need more info' }
    };
    return configs[status] || { color: 'text-gray-600', bg: 'bg-gray-50', icon: <LuFilePlus />, label: status };
  };

  return (
    <div className="p-6 md:p-8 animate-fade-in-up pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Claim History
            <IconWrapper color="text-farmer-600" bgColor="bg-farmer-50" size="w-10 h-10 border border-farmer-100">
              <LuFilePlus />
            </IconWrapper>
          </h1>
          <p className="text-gray-500 font-medium mt-1">See all your help requests and their status</p>
        </div>
        <Link
          to="/farmer/submit-claim"
          className="btn-farmer py-4 px-8 rounded-2xl shadow-xl shadow-farmer-200 hover:shadow-glow-green transition-all flex items-center gap-3 group"
        >
          <LuFilePlus className="group-hover:rotate-12 transition-transform" />
          <span>Ask for New Help</span>
        </Link>
      </div>

      {/* Premium Filter bar */}
      <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm mr-2">
          <LuFilter className="text-gray-400" />
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Show:</span>
        </div>
        {[
          { label: 'All', value: 'all' },
          { label: 'Just Sent', value: 'submitted' },
          { label: 'Waiting', value: 'pending_review' },
          { label: 'Done', value: 'approved' },
          { label: 'Refused', value: 'rejected' },
          { label: 'Need Info', value: 'info_requested' }
        ].map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 border ${filter === s.value
              ? 'bg-farmer-600 text-white shadow-lg border-farmer-500 scale-105'
              : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
              }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Claims Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-farmer-100 border-t-farmer-600 rounded-full animate-spin mb-4" />
          <p className="mt-4 text-gray-400 font-black uppercase tracking-[0.2em] text-xs">Opening history...</p>
        </div>
      ) : claims.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {claims.map((claim, idx) => {
            const config = getStatusConfig(claim.status);
            return (
              <div
                key={claim._id}
                className="card-glass p-6 md:p-8 group hover:border-farmer-200 transition-all duration-500 relative overflow-hidden"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-farmer-500 to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-farmer-100 group-hover:scale-110 transition-transform duration-500 text-3xl">
                      {getCropEmoji(claim.crop)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-gray-900 capitalize">{claim.crop}</h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${config.bg} ${config.color} border border-current/10`}>
                          {config.icon}
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
                        <LuClock size={12} />
                        Sent on: {new Date(claim.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payout Est.</p>
                      <p className="font-bold text-gray-900">₹{(claim.aiAnalysis?.suggestedCompensation || claim.acres * 20000).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-auto md:ml-4">
                      <button
                        onClick={() => setExpandedId(expandedId === claim._id ? null : claim._id)}
                        className={`py-3 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm ${expandedId === claim._id
                          ? 'bg-gray-900 text-white shadow-xl translate-y-[-2px]'
                          : 'bg-white text-blue-600 border border-blue-100 hover:bg-blue-50'
                          }`}
                      >
                        {expandedId === claim._id ? <><LuChevronUp /> Close Tracker</> : <><LuSearch /> Track Order</>}
                      </button>

                      {['submitted', 'info_requested'].includes(claim.status) && (
                        <button
                          onClick={() => navigate('/farmer/submit-claim', { state: { claim } })}
                          className="w-11 h-11 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-farmer-600 hover:border-farmer-200 transition-all shadow-sm"
                          title="Edit Details"
                        >
                          <LuChevronRight size={20} />
                        </button>
                      )}

                      {['submitted', 'pending_review'].includes(claim.status) && (
                        <button
                          onClick={() => handleDelete(claim._id)}
                          disabled={deleting === claim._id}
                          className="w-11 h-11 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm disabled:opacity-50"
                          title="Cancel Claim"
                        >
                          <LuTrash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tracker Expandable Section */}
                {expandedId === claim._id && (
                  <div className="mt-8 pt-8 border-t border-gray-100 animate-slide-up">
                    <div className="bg-slate-50/50 rounded-3xl p-6 md:p-10 border border-gray-100">
                      <div className="flex items-center justify-between mb-10">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                          <LuRefreshCw className="text-blue-600 animate-spin-slow" />
                          Live Tracking
                        </h4>
                        <span className="text-[10px] font-bold text-gray-400">Order ID: #{claim._id.slice(-6).toUpperCase()}</span>
                      </div>

                      {claim.status === 'rejected' ? (
                        <div className="p-8 bg-rose-50 rounded-2xl border border-rose-100 text-center">
                          <LuAlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                          <h5 className="font-black text-rose-900 text-xl mb-2">Claim Refused</h5>
                          <p className="text-rose-700 text-sm font-medium">"{claim.verification?.comments || 'Evidence requirements not met.'}"</p>
                        </div>
                      ) : (
                        <div className="relative pl-4 md:pl-20 py-4">
                          {/* Vertical Progress Line */}
                          <div className="absolute left-6 md:left-[96px] top-8 bottom-8 w-1 bg-gray-200 rounded-full" />
                          <div
                            className="absolute left-6 md:left-[96px] top-8 w-1 bg-blue-500 rounded-full transition-all duration-1000"
                            style={{ height: `${(getStatusIndex(claim.status) / (trackingSteps.length - 1)) * 82}%` }}
                          />

                          <div className="space-y-12">
                            {trackingSteps.map((step, sIdx) => {
                              const currIdx = getStatusIndex(claim.status);
                              const isDone = sIdx < currIdx;
                              const isCurrent = sIdx === currIdx;
                              const isPending = sIdx > currIdx;

                              return (
                                <div key={step.key} className={`flex items-start gap-6 md:gap-12 relative ${isPending ? 'opacity-30' : ''}`}>
                                  <div className={`relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl transition-all duration-500 ${isDone ? 'bg-blue-600 text-white' :
                                    isCurrent ? 'bg-white text-blue-600 border-blue-200 scale-110 shadow-blue-100' :
                                      'bg-gray-100 text-gray-400'
                                    }`}>
                                    <step.icon size={24} />
                                    {isDone && <LuCheckCircle2 size={16} className="absolute -right-2 -top-2 bg-emerald-500 text-white rounded-full border-2 border-white" />}
                                  </div>
                                  <div>
                                    <h5 className={`font-black tracking-tight ${isCurrent ? 'text-blue-600 text-lg' : 'text-gray-900 text-base'}`}>
                                      {step.label}
                                    </h5>
                                    <p className="text-xs text-gray-500 font-medium mt-1">{step.desc}</p>
                                    {isCurrent && claim.status === 'info_requested' && (
                                      <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-xs font-bold italic">
                                        " {claim.verification?.requestedInfo} "
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-glass text-center py-32 animate-fade-in-up border-dashed border-2">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <LuInbox className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No help requests found</h3>
          <p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto">You haven't sent any requests for help yet. Click below to start.</p>
          <Link to="/farmer/submit-claim" className="btn-farmer py-4 px-10 rounded-2xl shadow-xl">
            Ask for Help for the First Time
          </Link>
        </div>
      )}
    </div>
  );
}
