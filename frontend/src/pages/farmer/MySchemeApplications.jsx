import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { farmerAPI } from '../../services/api';
import IconWrapper from '../../components/IconWrapper';
import { LuClock, LuCheckCircle2, LuXCircle, LuInfo, LuArrowLeft, LuSearch, LuCalendar, LuLandmark } from 'react-icons/lu';
import Button from '../../components/Button';
import { motion } from 'framer-motion';

export default function MySchemeApplications() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            // 20ms animation as requested
            await new Promise(r => setTimeout(r, 20));
            const { data } = await farmerAPI.getSchemeApplications();
            if (data.success) {
                setApplications(data.applications);
            }
        } catch (err) {
            console.error('Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <LuCheckCircle2 className="text-green-500" />;
            case 'Rejected': return <LuXCircle className="text-red-500" />;
            case 'InfoRequested': return <LuInfo className="text-amber-500" />;
            default: return <LuClock className="text-blue-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'InfoRequested': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 animate-fade-in pb-20 font-sans">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate('/farmer/schemes')}
                    className="flex items-center gap-2 text-emerald-600 font-black mb-8 hover:gap-3 transition-all"
                >
                    <LuArrowLeft /> Back to Schemes
                </button>

                <div className="mb-10">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Track Applications</h1>
                    <p className="text-gray-500 font-medium mt-1">Real-time status of your government scheme requests.</p>
                </div>

                {applications.length === 0 ? (
                    <div className="card-glass p-12 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
                            <LuSearch className="text-gray-300 w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">No applications found</h3>
                        <p className="text-gray-500 mb-8">You haven't applied for any schemes yet.</p>
                        <Button variant="farmer" onClick={() => navigate('/farmer/schemes')}>
                            Browse Schemes
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {applications.map((app) => (
                            <motion.div
                                key={app._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="card-glass p-6 md:p-8 hover:shadow-xl transition-all border border-transparent hover:border-emerald-100"
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(app.status)} flex items-center gap-2`}>
                                                {getStatusIcon(app.status)} {app.status}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                <LuCalendar className="w-3 h-3" /> {new Date(app.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-black text-gray-900 mb-2">{app.schemeName}</h3>
                                        <p className="text-gray-500 font-medium flex items-center gap-2 mb-6">
                                            <LuInfo className="w-4 h-4 text-emerald-500" /> Category: {app.category}
                                        </p>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Land Info</p>
                                                <p className="font-bold text-gray-900">{app.applicationData?.landSize} Acres</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bank Account</p>
                                                <p className="font-bold text-gray-900">****{app.applicationData?.bankAccount?.slice(-4)}</p>
                                            </div>
                                            {app.sanctionedAmount > 0 && (
                                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Sanctioned</p>
                                                    <p className="font-black text-emerald-700 text-lg">₹{app.sanctionedAmount.toLocaleString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="md:w-64 space-y-4">
                                        <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-lg overflow-hidden relative group">
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-2">Tracking Status</p>
                                                <div className="space-y-4 pt-2">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shadow-glow-green" />
                                                        <div>
                                                            <p className="text-xs font-black">Submitted</p>
                                                            <p className="text-[10px] opacity-40">{new Date(app.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-2 h-2 rounded-full mt-1.5 ${app.status === 'Pending' ? 'bg-amber-400 shadow-glow-amber animate-pulse' : 'bg-emerald-400'}`} />
                                                        <div>
                                                            <p className="text-xs font-black">Verification</p>
                                                            <p className="text-[10px] opacity-40">In Progress</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <LuLandmark className="absolute -bottom-4 -right-4 w-24 h-24 opacity-5 group-hover:scale-110 transition-transform" />
                                        </div>

                                        {app.reviewComments && (
                                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 font-serif">Officer Note</p>
                                                <p className="text-xs text-red-800 italic leading-relaxed">"{app.reviewComments}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
