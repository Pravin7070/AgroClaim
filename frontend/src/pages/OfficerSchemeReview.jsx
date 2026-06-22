import { useState, useEffect } from 'react';
import { officerAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import IconWrapper from '../components/IconWrapper';
import { LuFileText, LuCheckCircle, LuXCircle, LuInfo, LuFilter, LuUser, LuMapPin, LuDollarSign, LuClock, LuSearch, LuLoader2, LuLayoutList } from 'react-icons/lu';
import Button from '../components/Button';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfficerSchemeReview() {
    const toast = useToast();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [selectedApp, setSelectedApp] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewData, setReviewData] = useState({ comments: '', amount: '' });

    useEffect(() => {
        fetchApplications();
    }, [filter]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            // 20ms animation as requested
            await new Promise(r => setTimeout(r, 20));
            const { data } = await officerAPI.getSchemeApplications({ status: filter });
            if (data.success) {
                setApplications(data.applications);
            }
        } catch (err) {
            console.error('Failed to fetch scheme applications');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (decision) => {
        if (!selectedApp) return;
        setReviewLoading(true);
        try {
            await officerAPI.verifyScheme(selectedApp._id, {
                decision,
                comments: reviewData.comments,
                amount: decision === 'Approved' ? Number(reviewData.amount) : 0
            });
            toast.success(`Application ${decision.toLowerCase()} successfully`);
            setSelectedApp(null);
            setReviewData({ comments: '', amount: '' });
            fetchApplications();
        } catch (err) {
            toast.error('Review failed. Please try again.');
        } finally {
            setReviewLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <div className="p-6 md:p-8 animate-fade-in pb-20 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            Scheme Inbox
                            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                {applications.length} Requests
                            </div>
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">Review and approve government scheme benefits for farmers.</p>
                    </div>

                    <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                        {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* List Section */}
                    <div className="lg:col-span-12">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <LuLoader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                            </div>
                        ) : applications.length === 0 ? (
                            <div className="card-glass p-16 text-center">
                                <LuSearch className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                                <h3 className="text-xl font-black text-gray-900">No applications found</h3>
                                <p className="text-gray-500">There are no {filter.toLowerCase()} applications to review.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {applications.map(app => (
                                    <motion.div
                                        layoutId={app._id}
                                        key={app._id}
                                        onClick={() => setSelectedApp(app)}
                                        className={`card-glass p-6 cursor-pointer border-2 transition-all hover:shadow-2xl hover:border-indigo-200 group ${selectedApp?._id === app._id ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-transparent'}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(app.status)}`}>
                                                {app.status}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                <LuClock className="w-3 h-3" /> {new Date(app.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 mb-2 truncate group-hover:text-indigo-600">
                                            {app.schemeName}
                                        </h3>
                                        <p className="text-sm font-bold text-indigo-600 mb-6 flex items-center gap-1">
                                            <LuUser className="w-3 h-3" /> {app.farmerId?.name}
                                        </p>

                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="p-3 bg-gray-50 rounded-xl">
                                                <p className="text-[8px] font-black text-gray-400 uppercase">Land Size</p>
                                                <p className="text-xs font-black text-gray-900">{app.applicationData?.landSize} Ac</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-xl">
                                                <p className="text-[8px] font-black text-gray-400 uppercase">District</p>
                                                <p className="text-xs font-black text-gray-900 truncate">{app.applicationData?.district}</p>
                                            </div>
                                        </div>

                                        <Button variant="secondary" className="w-full text-xs py-3">View Details</Button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal-style Detail View */}
                <AnimatePresence>
                    {selectedApp && (
                        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm p-4">
                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                className="w-full max-w-2xl h-full bg-white shadow-2xl rounded-l-4xl overflow-y-auto p-8 md:p-12 relative"
                            >
                                <button
                                    onClick={() => setSelectedApp(null)}
                                    className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 font-black text-2xl"
                                >
                                    ×
                                </button>

                                <div className="mb-10">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Application Detail</p>
                                    <h2 className="text-3xl font-black text-gray-900 mb-2">{selectedApp.schemeName}</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase text-gray-500">{selectedApp.schemeType}</span>
                                        <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase text-gray-500">{selectedApp.category}</span>
                                    </div>
                                </div>

                                <section className="space-y-8 mb-12">
                                    <div className="p-6 bg-gray-50 rounded-3xl space-y-4 border border-gray-100">
                                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                            <LuUser className="w-4 h-4 text-indigo-600" /> Farmer Personal Info
                                        </h4>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase">Full Name</p>
                                                <p className="font-bold text-gray-900">{selectedApp.applicationData?.fullName}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase">Aadhaar</p>
                                                <p className="font-bold text-gray-900">{selectedApp.applicationData?.aadhaar}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] font-black text-gray-400 uppercase">Address</p>
                                                <p className="font-bold text-gray-900">{selectedApp.applicationData?.addressLine}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase">Location</p>
                                                <p className="font-bold text-gray-900">{selectedApp.applicationData?.village}, {selectedApp.applicationData?.taluka}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase">District</p>
                                                <p className="font-bold text-gray-900">{selectedApp.applicationData?.district}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase">Phone</p>
                                                <p className="font-bold text-gray-900">{selectedApp.applicationData?.phone}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-gray-50 rounded-3xl space-y-4 border border-gray-100">
                                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                            🏦 Disbursement Account
                                        </h4>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase">Account Number</p>
                                                <p className="font-mono font-bold text-gray-900">{selectedApp.applicationData?.bankAccount}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedApp.documents?.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Verification Documents</h4>
                                            <div className="flex flex-wrap gap-4">
                                                {selectedApp.documents.map((doc, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={`${import.meta.env.VITE_BACKEND_URL || ''}${doc.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-3 hover:shadow-lg transition-all"
                                                    >
                                                        <LuFileText className="text-indigo-600" />
                                                        <span className="text-xs font-bold text-gray-700">{doc.name}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </section>

                                {/* Actions */}
                                {selectedApp.status === 'Pending' ? (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-gray-900 uppercase tracking-widest">Amount to Sanction (₹)</label>
                                            <input
                                                type="number" className="input-field text-2xl font-black text-indigo-600" placeholder="0.00"
                                                value={reviewData.amount}
                                                onChange={e => setReviewData({ ...reviewData, amount: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-gray-900 uppercase tracking-widest">Decision Comments</label>
                                            <textarea
                                                className="input-field min-h-[100px]" placeholder="Add review notes here..."
                                                value={reviewData.comments}
                                                onChange={e => setReviewData({ ...reviewData, comments: e.target.value })}
                                            ></textarea>
                                        </div>
                                        <div className="flex gap-4">
                                            <Button
                                                variant="farmer" // Green style
                                                className="flex-1 py-4 text-white !bg-emerald-600 hover:!bg-emerald-700"
                                                onClick={() => handleReview('Approved')}
                                                disabled={reviewLoading}
                                            >
                                                {reviewLoading ? <LuLoader2 className="animate-spin mx-auto" /> : 'Approve & Credit'}
                                            </Button>
                                            <Button
                                                className="flex-1 py-4 text-white !bg-red-600 hover:!bg-red-700"
                                                onClick={() => handleReview('Rejected')}
                                                disabled={reviewLoading}
                                            >
                                                Reject Application
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`p-8 rounded-4xl text-center border-2 ${selectedApp.status === 'Approved' ? 'border-emerald-500 bg-emerald-50/20' : 'border-red-500 bg-red-50/20'}`}>
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 shadow-sm bg-white">
                                            {selectedApp.status === 'Approved' ? <LuCheckCircle className="text-emerald-500 w-8 h-8" /> : <LuXCircle className="text-red-500 w-8 h-8" />}
                                        </div>
                                        <h4 className="text-2xl font-black text-gray-900 mb-1">Decision: {selectedApp.status}</h4>
                                        {selectedApp.sanctionedAmount > 0 && <p className="text-xl font-bold text-emerald-600 mb-4">₹{selectedApp.sanctionedAmount.toLocaleString()}</p>}
                                        <p className="text-gray-500 font-medium italic">"{selectedApp.reviewComments}"</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
