import { useState, useEffect } from 'react';
import { officerAPI } from '../../services/api';
import { Spinner } from '../../components/Loading';
import IconWrapper from '../../components/IconWrapper';
import {
    LuTrendingUp,
    LuBarChart3,
    LuPieChart,
    LuWallet,
    LuActivity,
    LuSprout,
    LuArrowUpRight,
    LuArrowDownRight,
    LuCheckCircle2,
    LuXCircle,
    LuClock,
    LuHelpingHand,
    LuLayoutDashboard,
    LuHistory
} from 'react-icons/lu';

// Bar Chart for money
const SimpleBarChart = ({ data, color = 'emerald' }) => {
    const safeData = Array.isArray(data) ? data : [];
    const max = Math.max(...safeData.map(d => Number(d.value) || 0), 1);

    const gradients = {
        emerald: 'from-emerald-400 to-emerald-600',
        blue: 'from-blue-400 to-blue-600',
        amber: 'from-amber-400 to-amber-600',
        rose: 'from-rose-400 to-rose-600'
    };

    return (
        <div className="flex items-end justify-between h-56 gap-3 pb-2">
            {safeData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full">
                    <div className="relative w-full flex items-end justify-center h-full">
                        <div
                            className={`w-full rounded-2xl transition-all duration-700 ease-out bg-gradient-to-t ${gradients[color] || gradients.blue} group-hover:shadow-lg group-hover:scale-110 shadow-sm`}
                            style={{ height: `${((Number(d.value) || 0) / max) * 100}%` }}
                        >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900/90 text-white text-[10px] font-black py-1.5 px-3 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none transition-all duration-300 z-20 whitespace-nowrap">
                                ₹{(Number(d.value) || 0).toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-widest truncate w-full text-center">{d.label}</span>
                </div>
            ))}
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, trend, color, subValue }) => (
    <div className="card-glass p-8 overflow-hidden relative group hover:border-blue-100 transition-all duration-500">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-${color}-100/50 transition-colors`} />
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
                <IconWrapper color={`text-${color}-600`} bgColor={`bg-${color}-50`} size="w-14 h-14 shadow-sm group-hover:scale-110 transition-transform">
                    <Icon />
                </IconWrapper>
                {trend && (
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend > 0 ? <LuArrowUpRight size={14} /> : <LuArrowDownRight size={14} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black text-gray-900 tracking-tight">{value}</h3>
                    {subValue && <span className="text-sm font-bold text-gray-400">/ {subValue}</span>}
                </div>
            </div>
        </div>
    </div>
);

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await officerAPI.getAnalytics();
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (err) {
            console.error('Failed to get info:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-12">
            <LuActivity className="w-16 h-16 text-blue-500 animate-pulse mb-6" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs animate-bounce">Opening details...</p>
        </div>
    );

    const monthlyReleasedData = Object.entries(data?.monthlyReleased || {}).map(([month, val]) => ({
        label: month, value: val
    }));

    const statusCounts = data?.statusCounts || {};
    const totalProcessed = (statusCounts.approved || 0) + (statusCounts.rejected || 0);

    return (
        <div className="p-6 md:p-8 space-y-10 animate-fade-in-up pb-24 max-w-[1600px] mx-auto font-sans">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                        <LuLayoutDashboard className="text-blue-600" />
                        Insights
                    </h1>
                    <p className="text-gray-500 font-medium text-lg mt-2">See how much money is sent and which crops need help.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-xl overflow-hidden shadow-gray-100">
                    <div className="px-6 py-3 bg-blue-50/50 rounded-xl relative group overflow-hidden">
                        <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Money in System</p>
                        <p className="text-xl font-black text-gray-900 font-mono">₹{data?.treasuryBalance?.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Total Money Paid"
                    value={`₹${(data?.totalReleased || 0).toLocaleString()}`}
                    icon={LuWallet}
                    trend={12.4}
                    color="emerald"
                />
                <StatCard
                    title="Requests Checked"
                    value={totalProcessed}
                    icon={LuActivity}
                    trend={8.2}
                    color="blue"
                    subValue={data?.totalClaims}
                />
                <StatCard
                    title="Approval Rate"
                    value={`${Math.round((statusCounts.approved / (totalProcessed || 1)) * 100)}%`}
                    icon={LuTrendingUp}
                    trend={-2.1}
                    color="amber"
                />
                <StatCard
                    title="All Protected Farms"
                    value={data?.totalClaims || 0}
                    icon={LuSprout}
                    color="indigo"
                />
            </div>

            {/* Main Data Core */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Expenditure Matrix */}
                <div className="card-premium p-10 lg:col-span-2">
                    <div className="flex items-center justify-between mb-12">
                        <h3 className="text-2xl font-black text-gray-900 flex items-center gap-4">
                            <IconWrapper color="text-emerald-600" bgColor="bg-emerald-50" size="w-12 h-12 shadow-sm">
                                <LuBarChart3 />
                            </IconWrapper>
                            Monthly Payments
                        </h3>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Updates live</span>
                        </div>
                    </div>
                    <SimpleBarChart data={monthlyReleasedData} color="emerald" />
                </div>

                {/* Decision Breakdown */}
                <div className="card-premium p-10">
                    <h3 className="text-2xl font-black text-gray-900 mb-10 flex items-center gap-4">
                        <IconWrapper color="text-amber-600" bgColor="bg-amber-50" size="w-12 h-12 shadow-sm">
                            <LuPieChart />
                        </IconWrapper>
                        Decision Summary
                    </h3>
                    <div className="space-y-6">
                        {[
                            { label: 'Approved Claims', value: statusCounts.approved || 0, icon: <LuCheckCircle2 />, color: 'emerald', bg: 'bg-emerald-500' },
                            { label: 'Refused Claims', value: statusCounts.rejected || 0, icon: <LuXCircle />, color: 'rose', bg: 'bg-rose-500' },
                            { label: 'Waiting to check', value: statusCounts.pending_review || 0, icon: <LuClock />, color: 'blue', bg: 'bg-blue-500' },
                            { label: 'Need more info', value: statusCounts.info_requested || 0, icon: <LuHelpingHand />, color: 'amber', bg: 'bg-amber-500' }
                        ].map((s, i) => (
                            <div key={i} className="group cursor-default">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`text-${s.color}-600 group-hover:scale-110 transition-transform`}>{s.icon}</div>
                                        <span className="text-sm font-bold text-gray-700 tracking-tight">{s.label}</span>
                                    </div>
                                    <span className="font-mono font-black text-gray-900">{s.value}</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50 p-0.5">
                                    <div
                                        className={`h-full rounded-full ${s.bg} transition-all duration-1000 ease-out shadow-sm`}
                                        style={{ width: `${(s.value / (data?.totalClaims || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Extra Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="card-premium p-10 lg:col-span-1">
                    <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-4">
                        <IconWrapper color="text-indigo-600" bgColor="bg-indigo-50" size="w-12 h-12 shadow-sm">
                            <LuSprout />
                        </IconWrapper>
                        Crops Impacted
                    </h3>
                    <div className="space-y-4">
                        {data?.claimsPerCrop?.slice(0, 6).map((c, i) => (
                            <div key={i} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-indigo-200 transition-colors">
                                <span className="font-bold text-gray-700 capitalize group-hover:text-indigo-600 transition-colors">🌾 {c._id}</span>
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${(c.count / (data.totalClaims || 1)) * 100}%` }} />
                                    </div>
                                    <span className="font-mono font-black text-gray-400 text-xs">{c.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-premium p-10 lg:col-span-1">
                    <h3 className="text-2xl font-black text-gray-900 mb-10 flex items-center gap-4">
                        <IconWrapper color="text-purple-600" bgColor="bg-purple-50" size="w-12 h-12 shadow-sm">
                            <LuCheckCircle2 />
                        </IconWrapper>
                        Scheme Requests
                    </h3>
                    <div className="space-y-6">
                        {[
                            { label: 'Approved Schemes', value: data?.schemeCounts?.Approved || 0, color: 'emerald', bg: 'bg-emerald-500' },
                            { label: 'Pending Schemes', value: data?.schemeCounts?.Pending || 0, color: 'blue', bg: 'bg-blue-500' },
                            { label: 'Rejected Schemes', value: data?.schemeCounts?.Rejected || 0, color: 'rose', bg: 'bg-rose-500' }
                        ].map((s, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-gray-600 uppercase tracking-tighter">{s.label}</span>
                                    <span className="font-black text-gray-900">{s.value}</span>
                                </div>
                                <div className="h-4 bg-gray-100 rounded-lg overflow-hidden p-0.5">
                                    <div
                                        className={`h-full rounded-md ${s.bg} transition-all duration-1000`}
                                        style={{ width: `${(s.value / (Object.values(data?.schemeCounts || {}).reduce((a, b) => a + b, 0) || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-premium p-10 lg:col-span-1">
                    <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-4">
                        <IconWrapper color="text-amber-600" bgColor="bg-amber-50" size="w-12 h-12 shadow-sm">
                            <LuHistory />
                        </IconWrapper>
                        Recent Payouts
                    </h3>
                    <div className="space-y-4">
                        {data?.sourceUsage?.map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 group hover:translate-x-1 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                                        <LuArrowUpRight />
                                    </div>
                                    <div className="max-w-[120px]">
                                        <p className="font-black text-gray-900 truncate group-hover:text-amber-700">{s.name}</p>
                                        <p className="text-[10px] font-black text-gray-400">Authorized</p>
                                    </div>
                                </div>
                                <span className="font-mono font-black text-emerald-600">₹{s.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
