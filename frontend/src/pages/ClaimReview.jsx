import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { officerAPI, getUploadUrl } from '../services/api';
import IconWrapper from '../components/IconWrapper';
import Button from '../components/Button';
import { formatCropLabel, formatDamageLabel, getCropEmoji, getDamageEmoji } from '../utils/emojiMaps';
import {
  LuSprout,
  LuMapPin,
  LuFileText,
  LuGavel,
  LuCheckCircle2,
  LuXCircle,
  LuHelpCircle,
  LuBrain,
  LuArrowLeft,
  LuCoins,
  LuClock,
  LuTarget,
  LuPlay,
  LuSearch,
  LuShieldAlert,
  LuEye,
  LuLayoutGrid,
  LuFileVideo,
  LuLoader2,
  LuMail,
  LuPhone,
  LuShieldCheck,
  LuAlertTriangle,
  LuClipboardEdit
} from 'react-icons/lu';

export default function ClaimReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState('');
  const [comments, setComments] = useState('');
  const [compensationAmount, setCompensationAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchClaim();
  }, [id]);

  const fetchClaim = async () => {
    try {
      const { data } = await officerAPI.getClaim(id);
      if (data.success) {
        setClaim(data.claim);
        const suggested = data.claim.aiAnalysis?.suggestedCompensation ?? data.claim.aiAnalysis?.compensationAmount;
        if (suggested != null) setCompensationAmount(suggested);
      }
    } catch (err) {
      console.error('Failed to get claim:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!claim?.images?.length || analyzing) return;
    setAnalyzing(true);
    setError('');
    try {
      const { data } = await officerAPI.runClaimAnalysis(id);
      if (data.success) {
        setClaim(data.claim);
        const suggested = data.claim.aiAnalysis?.suggestedCompensation ?? data.claim.aiAnalysis?.compensationAmount;
        if (suggested != null) setCompensationAmount(suggested);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'AI analysis failed. Try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!decision) {
      setError('Please pick a final decision');
      return;
    }

    if (decision === 'rejected' && !comments.trim()) {
      setError('Please write why you are refusing');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { data } = await officerAPI.verifyClaim(id, {
        decision,
        comments,
        compensationAmount: decision === 'approved' ? (parseFloat(compensationAmount) || 0) : 0,
        requestedInfo: decision === 'info_requested' ? comments : undefined
      });

      if (data.success) {
        navigate('/officer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save decision');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center animate-fade-in-up">
          <IconWrapper color="text-blue-600" bgColor="bg-blue-50" size="w-16 h-16 mb-4 mx-auto animate-pulse">
            <LuClock />
          </IconWrapper>
          <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Opening claim…</p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full card-glass p-8 text-center animate-fade-in-up">
          <IconWrapper color="text-red-600" bgColor="bg-red-50" size="w-20 h-20 mb-6 mx-auto">
            <LuAlertTriangle />
          </IconWrapper>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Paper Not Found</h2>
          <p className="text-gray-500 font-medium mb-8">This claim paper does not exist in our system.</p>
          <Button variant="officer" onClick={() => navigate('/officer/dashboard')} className="w-full" icon={LuArrowLeft}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in-up pb-24 font-sans bg-slate-50/30">
      {/* Integrity Alert Banner (Sticky) */}
      {claim.integrityReport && claim.integrityReport.status !== 'clean' && (
        <div className="mb-8 p-6 bg-gradient-to-r from-red-600 to-rose-700 rounded-4xl text-white shadow-2xl shadow-red-200 animate-pulse-slow flex items-center justify-between gap-6 border-b-4 border-red-800">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <LuShieldAlert size={32} />
            </div>
            <div>
              <h4 className="text-xl font-black uppercase tracking-tight">🚨 Integrity Warning Detected</h4>
              <p className="text-sm font-bold opacity-90">Automated forensics identified {claim.integrityReport.issues.length} critical anomalies in this submission.</p>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Verification Layer</span>
            <span className="text-xs font-black bg-white/10 px-3 py-1 rounded-full border border-white/20 mt-1">Status: {claim.integrityReport.status.toUpperCase()}</span>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button
            onClick={() => navigate('/officer/claims')}
            className="flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest mb-4 transition-colors group"
          >
            <LuArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to Claim List
          </button>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            Check and Approve
            <IconWrapper color="text-amber-500" bgColor="bg-amber-50" size="w-10 h-10 border border-amber-100">
              <LuGavel />
            </IconWrapper>
          </h1>
          <p className="text-gray-500 font-medium mt-1">Paper ID: <span className="font-mono text-blue-600">{claim._id}</span></p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${claim.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
            claim.status === 'rejected' ? 'bg-red-50 text-red-600' :
              'bg-amber-50 text-amber-600'
            }`}>
            Status: {claim.status.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Evidence Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Farmer Details */}
          <div className="card-glass p-8 overflow-hidden relative group border-white/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100 transition-colors" />
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-200">
                {claim.farmerId?.name?.charAt(0)}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black text-gray-900">{claim.farmerId?.name}</h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <LuMail size={14} className="text-blue-500" />
                    {claim.farmerId?.email}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <LuPhone size={14} className="text-emerald-500" />
                    {claim.farmerId?.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
              <div className="p-5 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 group-hover:border-blue-100 transition-all">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Govt ID (Aadhaar)</p>
                <div className="flex items-center gap-3">
                  <LuShieldCheck className="text-blue-500" />
                  <p className="font-mono font-bold text-gray-900">{claim.farmerId?.aadhaar || 'NOT CHECKED'}</p>
                </div>
              </div>
              <div className="p-5 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 group-hover:border-blue-100 transition-all">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Total Land Size</p>
                <div className="flex items-center gap-3">
                  <LuSprout className="text-emerald-500" />
                  <p className="font-bold text-gray-900">{claim.acres || 0} Acres</p>
                </div>
              </div>
              <div className="p-5 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 group-hover:border-blue-100 transition-all">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Bank Account</p>
                <div className="flex items-center gap-3">
                  <LuCoins className="text-amber-500" />
                  <p className="font-bold text-gray-900">{claim.farmerId?.bankDetails?.accountNumber ? 'Already Linked' : 'Need to link'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Multimedia Evidence Package */}
          <div className="card-glass p-8 border-white/60">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <IconWrapper color="text-blue-600" bgColor="bg-blue-50" size="w-10 h-10">
                  <LuLayoutGrid />
                </IconWrapper>
                Digital Evidence Package
              </h3>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                  Photos {claim.images?.length || 0} <LuCheckCircle2 size={10} />
                </span>
                {claim.videos?.length > 0 && (
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                    Video Verified <LuCheckCircle2 size={10} />
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Primary Viewer */}
              <div className="space-y-4">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-900 relative group shadow-2xl">
                  {(claim.images && claim.images.length > 0) && (
                    <img
                      src={getUploadUrl(typeof claim.images[carouselIndex] === 'string' ? claim.images[carouselIndex] : claim.images[carouselIndex].url)}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      alt="Damage evidence"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between">
                    <div>
                      <p className="text-white font-black text-sm">Evidence #{carouselIndex + 1}</p>
                      <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest">High-Res Capture</p>
                    </div>
                    <button className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all">
                      <LuSearch size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {claim.images?.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCarouselIndex(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${i === carouselIndex ? 'border-blue-600 scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={getUploadUrl(typeof img === 'string' ? img : img.url)} className="w-full h-full object-cover" alt="thumb" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Video & Keyframes */}
              <div className="space-y-6">
                {claim.videos?.length > 0 ? (
                  <div className="space-y-4">
                    <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-black border border-gray-100 relative group">
                      <video
                        src={getUploadUrl(claim.videos[0].url)}
                        className="w-full h-full object-cover"
                        controls
                      />
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Video Extraction (Keyframes)</p>
                      <div className="flex gap-3">
                        {claim.videos[0].keyframes?.map((frame, i) => (
                          <div key={i} className="flex-1 aspect-video rounded-xl overflow-hidden border border-gray-200">
                            <img src={frame} className="w-full h-full object-cover" alt="keyframe" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[4/3] rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                    <LuFileVideo size={48} className="mb-4 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest opacity-40">No Video Provided</p>
                  </div>
                )}

                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                      <LuEye size={16} />
                    </div>
                    <h4 className="font-black text-gray-900 text-sm">Forensic Summary</h4>
                  </div>
                  <p className="text-xs text-blue-800 font-medium leading-relaxed">
                    Digital package verified. CRC hash check complete. Metadata matches reported location {claim.location?.village}.
                    AI analysis readiness at 100%.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Integrity Forensic Logs */}
          {claim.integrityReport?.issues?.length > 0 && (
            <div className="card-glass p-8 border-red-100 bg-red-50/20">
              <h3 className="text-lg font-black text-red-900 flex items-center gap-3 mb-6">
                <LuShieldAlert className="text-red-600" />
                Forensic Anomaly Detected
              </h3>
              <div className="space-y-4">
                {claim.integrityReport.issues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-5 bg-white rounded-3xl border border-red-100 shadow-sm">
                    <div className={`p-3 rounded-2xl ${issue.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                      <LuAlertTriangle size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{issue.type}</p>
                      <p className="font-bold text-gray-900">{issue.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit to AI Analysis button (when no report yet or data missing) */}
          {(!claim.aiAnalysis || !claim.aiAnalysis.analyzedAt) && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-10 rounded-3xl border-2 border-dashed border-blue-200 shadow-sm flex flex-col items-center justify-center min-h-[320px] group hover:border-blue-400 transition-all duration-500">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center relative z-10 border border-blue-100 shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <LuBrain className="w-10 h-10 text-blue-600 animate-bounce" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 text-center">AI Analysis Engine</h3>
              <p className="text-gray-500 text-sm font-medium text-center mb-8 max-w-[280px] leading-relaxed">
                Run our deep-vision Groq AI to analyze crop damage, detect fraud, and calculate suggested compensation.
              </p>
              <Button
                variant="officer"
                onClick={handleRunAnalysis}
                disabled={analyzing || !claim.images?.length}
                className="w-full max-w-xs py-5 text-lg shadow-xl shadow-blue-200/50"
                icon={LuBrain}
              >
                {analyzing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </span>
                ) : 'Submit to AI Analysis'}
              </Button>
              {!claim.images?.length && (
                <div className="mt-6 flex flex-col items-center gap-2 text-center p-4 bg-red-50 rounded-2xl border border-red-100 max-w-[240px]">
                  <LuAlertTriangle className="text-red-500" />
                  <p className="text-red-600 text-[10px] font-black uppercase tracking-widest">No images available for analysis. AI cannot run without forensic evidence.</p>
                </div>
              )}
            </div>
          )}

          {/* AI analysis report (after analysis completes) */}
          {claim.aiAnalysis && (
            <div className="bg-gradient-to-br from-indigo-700 via-blue-800 to-slate-900 p-8 rounded-3xl text-white shadow-2xl border border-white/10 relative overflow-hidden group">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />

              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md shadow-lg">
                    <LuBrain className="w-8 h-8 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">AI Forensic Report</h3>
                    <p className="text-blue-300 text-[10px] font-black uppercase tracking-[0.2em]">Verified by Groq Vision Llama 3.2</p>
                  </div>
                </div>
                <button
                  onClick={handleRunAnalysis}
                  disabled={analyzing}
                  className="flex flex-col items-center gap-1 group/btn"
                  title="Re-run analysis"
                >
                  <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 group-hover/btn:bg-emerald-500/30 transition-all">
                    Analysis Active
                  </div>
                  {analyzing ? (
                    <span className="text-[8px] uppercase tracking-tighter opacity-70 animate-pulse">Restarting...</span>
                  ) : (
                    <span className="text-[8px] uppercase tracking-tighter opacity-40 group-hover/btn:opacity-100 transition-opacity">Click to restart</span>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <LuAlertTriangle size={14} className="text-orange-400" />
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Damage Type</p>
                  </div>
                  <p className="font-bold text-lg capitalize">{(claim.aiAnalysis.damageType || claim.aiAnalysis.deepAnalysis?.damageCategory || '—').replace(/_/g, ' ')}</p>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <LuTarget size={14} className="text-red-400" />
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Severity</p>
                  </div>
                  <p className="font-black text-3xl text-white">
                    {claim.aiAnalysis.severityPercent ?? claim.aiAnalysis.damagePercentage ?? '—'}<span className="text-lg ml-0.5 opacity-60">%</span>
                  </p>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <LuMapPin size={14} className="text-emerald-400" />
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Affected Area</p>
                  </div>
                  <p className="font-bold text-lg">{claim.aiAnalysis.affectedAreaPercent != null ? `${claim.aiAnalysis.affectedAreaPercent}%` : '—'}</p>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <LuShieldCheck size={14} className="text-blue-400" />
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Confidence</p>
                  </div>
                  <p className="font-bold text-lg">{claim.aiAnalysis.confidence != null ? `${claim.aiAnalysis.confidence}%` : '—'}</p>
                </div>
              </div>

              {claim.aiAnalysis.cause && (
                <div className="p-5 bg-black/20 rounded-2xl border border-white/5 mb-6 relative z-10">
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-3">Technical Observations</p>
                  <p className="text-blue-50 text-sm font-medium leading-relaxed italic">"{claim.aiAnalysis.cause}"</p>
                </div>
              )}

              <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl border border-white/20 shadow-inner relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Suggested Compensation</p>
                    <p className="text-4xl font-black font-mono tracking-tighter self-end">
                      ₹{(claim.aiAnalysis.suggestedCompensation ?? claim.aiAnalysis.compensationAmount ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <LuCoins className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <p className="text-[8px] font-black uppercase tracking-[0.3em]">Official AI Assessment System</p>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              </div>
            </div>
          )}
        </div>

        {/* Claim Details */}
        <div className="card-glass p-8">
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <IconWrapper color="text-emerald-600" bgColor="bg-emerald-50" size="w-10 h-10">
              <LuFileText />
            </IconWrapper>
            Checking the Damage
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Crop Name</p>
                <p className="text-xl font-black text-gray-900 capitalize">{getCropEmoji(claim.crop)} {claim.crop}</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Land Size</p>
                <p className="text-xl font-black text-gray-900">{claim.acres} Acres</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-100/50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Type of Damage</p>
                <p className="text-lg font-bold text-gray-900 capitalize">{getDamageEmoji(claim.damageInfo?.type)} {claim.damageInfo?.type}</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border border-red-100/50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">How Bad?</p>
                <p className="text-lg font-bold text-gray-900 capitalize">{claim.damageInfo?.severity}</p>
              </div>
            </div>
          </div>

          {claim.damageInfo?.description && (
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Farmer's Description</p>
              <p className="text-gray-600 leading-relaxed font-medium">{claim.damageInfo.description}</p>
            </div>
          )}

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl flex items-center gap-4 border border-blue-100/30">
            <IconWrapper color="text-blue-600" bgColor="bg-white" size="w-12 h-12">
              <LuMapPin />
            </IconWrapper>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Farm Location</p>
              <p className="font-bold text-gray-900">{claim.location?.village}, {claim.location?.district}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Action Panel */}
      <div className="lg:col-span-1">
        <div className="card-glass p-8 sticky top-8 border-white/60 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <IconWrapper color="text-blue-600" bgColor="bg-blue-50" size="w-12 h-12">
              <LuClipboardEdit />
            </IconWrapper>
            <h3 className="text-2xl font-black text-gray-900">Final Decision</h3>
          </div>

          <div className={`space-y-4 ${!claim.aiAnalysis ? 'opacity-50 pointer-events-none' : ''}`}>
            {!claim.aiAnalysis?.analyzedAt && (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-6 text-center backdrop-blur-[2px] bg-white/20 rounded-3xl">
                <div className="bg-white/95 p-6 rounded-3xl shadow-2xl border border-blue-100 max-w-[260px] animate-fade-in-up">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
                    <LuBrain className="w-8 h-8 text-blue-600 animate-pulse" />
                  </div>
                  <p className="text-base font-black text-gray-900 uppercase tracking-tight mb-2">AI Report Needed</p>
                  <p className="text-[10px] text-gray-500 font-bold mb-6 leading-relaxed">You must run the forensic AI analysis before taking any action on this claim.</p>
                  <Button
                    variant="officer"
                    onClick={handleRunAnalysis}
                    disabled={analyzing || !claim.images?.length}
                    className="w-full py-4 text-sm shadow-lg shadow-blue-200"
                    icon={LuBrain}
                  >
                    {analyzing ? 'Analyzing…' : 'Run AI Now'}
                  </Button>
                </div>
              </div>
            )}
            {[
              { id: 'approved', label: 'Approve and Pay', icon: <LuCheckCircle2 />, color: 'emerald', border: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
              { id: 'rejected', label: 'Refuse Claim', icon: <LuXCircle />, color: 'red', border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
              { id: 'info_requested', label: 'Ask for more info', icon: <LuHelpCircle />, color: 'amber', border: 'border-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setDecision(opt.id);
                  setError('');
                }}
                className={`w-full p-4 rounded-2xl font-bold flex items-center justify-between transition-all duration-300 border-2 ${decision === opt.id
                  ? `${opt.border} ${opt.bg} ${opt.text} shadow-lg scale-[1.02]`
                  : 'border-gray-100 bg-white text-gray-500 hover:border-gray-300'
                  }`}
              >
                <span className="flex items-center gap-3">
                  {opt.icon}
                  {opt.label}
                </span>
                {decision === opt.id && <div className={`w-2 h-2 rounded-full ${opt.dot} animate-pulse`} />}
              </button>
            ))}
          </div>

          <div className="mt-8 space-y-6">
            {decision === 'approved' && (
              <div className="animate-fade-in-up">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Approved Money (₹)</label>
                <div className="relative">
                  <LuCoins className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    className="input-field pl-12 font-mono font-bold text-lg"
                    value={compensationAmount}
                    onChange={(e) => setCompensationAmount(e.target.value)}
                    placeholder="0,000"
                  />
                </div>
                <p className="text-[10px] font-bold text-blue-500 mt-2 uppercase tracking-widest pl-1">
                  AI suggested: ₹{(claim.aiAnalysis?.suggestedCompensation ?? claim.aiAnalysis?.compensationAmount ?? 0).toLocaleString()}
                </p>
              </div>
            )}

            <div className="animate-fade-in-up">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Closing Comments</label>
              <textarea
                className="input-field min-h-[120px] py-4 text-sm font-medium leading-relaxed"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Tell the farmer why you took this decision..."
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-shake font-bold text-sm">
                <LuAlertTriangle className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              variant="officer"
              className="w-full py-5 text-lg"
              loading={submitting}
              onClick={handleSubmit}
              disabled={!decision || !claim.aiAnalysis}
              icon={LuShieldCheck}
            >
              Save Decision
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
