import { useState, useEffect } from 'react';
import { officerAPI } from '../../services/api';
import { Spinner } from '../../components/Loading';
import IconWrapper from '../../components/IconWrapper';
import Button from '../../components/Button';
import {
    LuWallet,
    LuArrowUpRight,
    LuHistory,
    LuPlusCircle,
    LuLandmark,
    LuShieldCheck,
    LuInfo,
    LuX,
    LuCoins,
    LuBanknote,
    LuClock
} from 'react-icons/lu';

export default function Funds() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);

    const [amount, setAmount] = useState('');
    const [source, setSource] = useState('Central Office Fund');
    const [submitting, setSubmitting] = useState(false);

    const fundSources = [
        'Central Office Fund',
        'State Government Fund',
        'Local District Fund',
        'Emergency Relief Fund',
        'Crop Support Fund'
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await officerAPI.getFunds();
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (err) {
            setError('Failed to open money system');
        } finally {
            setTimeout(() => setLoading(false), 800);
        }
    };

    const handleAddFunds = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return;

        try {
            setSubmitting(true);
            const res = await officerAPI.addFunds({ amount, source });
            if (res.data.success) {
                await fetchData();
                setShowModal(false);
                setAmount('');
                setSource(fundSources[0]);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Could not add money');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-12">
            <LuCoins className="w-16 h-16 text-blue-500 animate-bounce mb-6" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Opening money system...</p>
        </div>
    );

    return (
        <div className="p-6 md:p-8 space-y-10 animate-fade-in-up pb-24 max-w-[1400px] mx-auto font-sans">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                        Manage Money
                        <IconWrapper color="text-emerald-600" bgColor="bg-emerald-50" size="w-10 h-10 border border-emerald-100">
                            <LuWallet />
                        </IconWrapper>
                    </h1>
                    <p className="text-gray-500 font-medium mt-2">Check how much money is available for farmers.</p>
                </div>
                <Button
                    variant="officer"
                    onClick={() => setShowModal(true)}
                    icon={LuPlusCircle}
                    className="shadow-xl shadow-blue-100 hover:shadow-2xl transition-all"
                >
                    Add More Money
                </Button>
            </div>

            {/* Main Balance Card */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-12 rounded-[40px] shadow-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] -mr-32 -mt-32 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -ml-24 -mb-24" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest text-blue-100">Money Status: Stable</span>
                        </div>
                        <div>
                            <p className="text-blue-200/70 font-bold uppercase tracking-[0.3em] text-xs mb-4">Total Money in System</p>
                            <div className="flex items-baseline gap-4">
                                <span className="text-6xl md:text-8xl font-black tracking-tighter">
                                    ₹{data?.balance?.toLocaleString('en-IN') || '0'}
                                </span>
                                <span className="text-2xl font-bold text-blue-300/50">RS</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 group-hover:bg-white/10 transition-colors">
                            <LuLandmark className="text-blue-400 mb-4" size={24} />
                            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Last Money Added</p>
                            <p className="text-lg font-black">₹{data?.history?.filter(h => h.type === 'CREDIT')[0]?.amount?.toLocaleString() || 0}</p>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 group-hover:bg-white/10 transition-colors">
                            <LuShieldCheck className="text-emerald-400 mb-4" size={24} />
                            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Money Safety</p>
                            <p className="text-lg font-black">{data?.balance > 500000 ? 'Very Safe' : 'Need more funds'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Ledger */}
            <div className="card-premium p-10">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black text-gray-900 flex items-center gap-4">
                        <IconWrapper color="text-blue-600" bgColor="bg-blue-50" size="w-12 h-12 shadow-sm">
                            <LuHistory />
                        </IconWrapper>
                        Past Payments
                    </h3>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <LuClock size={16} />
                        Updated now
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 italic">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Where from / to</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data?.history?.length > 0 ? (
                                data.history.map((txn, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/80 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-gray-700">{new Date(txn.date).toLocaleDateString()}</p>
                                            <p className="text-[10px] font-mono text-gray-400 uppercase">{new Date(txn.date).toLocaleTimeString()}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${txn.type === 'CREDIT'
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                }`}>
                                                {txn.type === 'CREDIT' ? <LuPlusCircle size={12} /> : <LuArrowUpRight size={12} />}
                                                {txn.type === 'CREDIT' ? 'Added' : 'Paid Out'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.type === 'CREDIT' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {txn.type === 'CREDIT' ? <LuLandmark size={20} /> : <LuBanknote size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 group-hover:text-blue-700 transition-colors">{txn.source}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {txn._id?.slice(-8).toUpperCase() || 'EXTERNAL'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`px-8 py-6 text-right font-mono font-black text-xl ${txn.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-24 text-center">
                                        <IconWrapper color="text-gray-300" bgColor="bg-gray-50" size="w-16 h-16 mb-4 mx-auto">
                                            <LuInfo />
                                        </IconWrapper>
                                        <h4 className="text-lg font-black text-gray-900 mb-2">No payments yet</h4>
                                        <p className="text-gray-400 font-medium">No money has been moved in or out yet.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal to add money */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-[40px] shadow-3xl w-full max-w-xl overflow-hidden animate-scale-up border border-white/40">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 text-white relative">
                            <LuCoins className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <h3 className="text-3xl font-black tracking-tight">Add Money</h3>
                                    <p className="text-blue-100 font-medium mt-1">Request more money for the system</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                                    <LuX size={24} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleAddFunds} className="p-10 space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Where is this money from?</label>
                                <select
                                    value={source}
                                    onChange={(e) => setSource(e.target.value)}
                                    className="input-field w-full py-4 text-sm font-bold bg-white"
                                >
                                    {fundSources.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Amount to add (₹)</label>
                                <div className="relative">
                                    <LuBanknote className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                                    <input
                                        type="number"
                                        min="1"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="input-field w-full pl-16 py-5 font-mono text-2xl font-black tracking-tight bg-white"
                                        placeholder="0,00,000"
                                        required
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest text-center">Money will be added to the common pool instantly</p>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-5"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="officer"
                                    type="submit"
                                    loading={submitting}
                                    className="flex-1 py-5 shadow-lg shadow-blue-100"
                                    icon={LuShieldCheck}
                                >
                                    Confirm and Add
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
