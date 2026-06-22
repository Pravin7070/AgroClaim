import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { officerAPI } from '../../services/api';
import IconWrapper from '../../components/IconWrapper';
import {
    LuSearch,
    LuFilter,
    LuEye,
    LuChevronRight,
    LuSprout,
    LuUser,
    LuClock,
    LuCheckCircle2,
    LuXCircle,
    LuAlertCircle,
    LuTerminal,
    LuShield
} from 'react-icons/lu';

export default function ClaimsList() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('pending_review');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ total: 0 });

    useEffect(() => {
        fetchClaims();
    }, [status]);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const { data } = await officerAPI.getAllClaims({
                status: status === 'all' ? undefined : status,
                limit: 100
            });
            if (data.success) {
                setClaims(data.claims);
                setStats({ total: data.totalClaims });
            }
        } catch (error) {
            console.error('Failed to get claims:', error);
        } finally {
            setTimeout(() => setLoading(false), 600);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'approved': return { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <LuCheckCircle2 size={14} />, label: 'Done' };
            case 'rejected': return { color: 'text-rose-600', bg: 'bg-rose-50', icon: <LuXCircle size={14} />, label: 'Refused' };
            case 'submitted': return { color: 'text-sky-600', bg: 'bg-sky-50', icon: <LuClock size={14} />, label: 'New' };
            case 'pending_review': return { color: 'text-amber-600', bg: 'bg-amber-50', icon: <LuClock size={14} />, label: 'Waiting' };
            case 'info_requested': return { color: 'text-blue-600', bg: 'bg-blue-50', icon: <LuAlertCircle size={14} />, label: 'Checking' };
            case 'ai_analyzing': return { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <LuTerminal size={14} />, label: 'AI Check' };
            default: return { color: 'text-gray-600', bg: 'bg-gray-50', icon: <LuAlertCircle size={14} />, label: status };
        }
    };

    const filteredClaims = claims.filter(c =>
        c.farmerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.crop.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8 animate-fade-in-up pb-24 max-w-[1400px] mx-auto font-sans">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                        All Claims
                        <IconWrapper color="text-blue-600" bgColor="bg-blue-50" size="w-10 h-10 border border-blue-100">
                            <LuShield />
                        </IconWrapper>
                    </h1>
                    <p className="text-gray-500 font-medium mt-2">Checking {stats.total} help requests from farmers.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-80 group">
                        <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find by ID, Farmer or Crop..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all font-medium text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Status Tabs */}
                    <div className="flex bg-gray-100 p-1.5 rounded-[20px] shadow-inner w-full md:w-auto overflow-x-auto no-scrollbar">
                        {[
                            { label: 'Wait to Check', value: 'pending_review' },
                            { label: 'Finished', value: 'approved' },
                            { label: 'Refused', value: 'rejected' },
                            { label: 'See All', value: 'all' }
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setStatus(tab.value)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${status === tab.value
                                    ? 'bg-white text-gray-900 shadow-xl'
                                    : 'text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Registry Grid/Table */}
            <div className="card-premium overflow-hidden border-white/60">
                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Opening claims...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Farmer</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Crop and Damage</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Sent</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Money Needed</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredClaims.length > 0 ? (
                                    filteredClaims.map((claim) => {
                                        const s = getStatusStyles(claim.status);
                                        return (
                                            <tr key={claim._id} className="group hover:bg-gray-50/80 transition-all duration-300">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
                                                            {claim.farmerId?.name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 leading-tight">{claim.farmerId?.name}</p>
                                                            <p className="text-xs text-gray-400 font-medium mt-0.5">{claim.farmerId?.phone}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <LuSprout className="text-emerald-500" size={18} />
                                                        <div>
                                                            <p className="font-bold text-gray-900 capitalize">{claim.crop}</p>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{claim.damageInfo?.type}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div>
                                                        <p className="font-bold text-gray-700">{new Date(claim.createdAt).toLocaleDateString()}</p>
                                                        <p className="text-[10px] font-mono text-gray-400 uppercase">{new Date(claim.createdAt).toLocaleTimeString()}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="font-black text-gray-900 text-lg font-mono">
                                                        {claim.aiAnalysis?.suggestedCompensation != null || claim.aiAnalysis?.compensationAmount != null
                                                            ? `₹${(claim.aiAnalysis?.suggestedCompensation ?? claim.aiAnalysis?.compensationAmount ?? 0).toLocaleString()}`
                                                            : '—'}
                                                    </p>
                                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">AI when opened</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${s.bg} ${s.color} text-[10px] font-black uppercase tracking-widest border border-current opacity-80 shadow-sm`}>
                                                        {s.icon}
                                                        {s.label}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <Link
                                                        to={`/officer/claims/${claim._id}`}
                                                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-0.5 ${!claim.aiAnalysis?.analyzedAt
                                                                ? 'bg-blue-600 text-white hover:bg-blue-700 animate-pulse'
                                                                : 'bg-white text-gray-900 border border-gray-200 hover:bg-black hover:text-white'
                                                            }`}
                                                    >
                                                        {!claim.aiAnalysis?.analyzedAt ? 'Analyze Now' : 'Check Now'}
                                                        <LuChevronRight size={16} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-32 text-center">
                                            <div className="max-w-xs mx-auto">
                                                <IconWrapper color="text-gray-300" bgColor="bg-gray-50" size="w-16 h-14 mb-4 mx-auto">
                                                    <LuFilter />
                                                </IconWrapper>
                                                <h4 className="text-lg font-black text-gray-900 mb-2">No claims found</h4>
                                                <p className="text-gray-400 font-medium text-sm">No results match your search.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
