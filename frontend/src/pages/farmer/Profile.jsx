import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { farmerAPI } from '../../services/api';
import { Spinner } from '../../components/Loading';
import IconWrapper from '../../components/IconWrapper';
import Button from '../../components/Button';
import {
    LuUser,
    LuMail,
    LuPhone,
    LuMapPin,
    LuShieldCheck,
    LuCheckCircle2,
    LuAlertCircle,
    LuBuilding2,
    LuCreditCard,
    LuInfo,
    LuCamera,
    LuLandmark
} from 'react-icons/lu';

export default function Profile() {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: {
            village: '',
            district: '',
            state: '',
            pincode: ''
        },
        aadhaar: '',
        bankDetails: {
            accountNumber: '',
            ifscCode: '',
            bankName: '',
            accountHolderName: ''
        }
    });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: {
                    village: user.address?.village || '',
                    district: user.address?.district || '',
                    state: user.address?.state || '',
                    pincode: user.address?.pincode || ''
                },
                aadhaar: user.aadhaar || '',
                bankDetails: {
                    accountNumber: user.bankDetails?.accountNumber || '',
                    ifscCode: user.bankDetails?.ifscCode || '',
                    bankName: user.bankDetails?.bankName || '',
                    accountHolderName: user.bankDetails?.accountHolderName || ''
                }
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const { data } = await farmerAPI.updateProfile(formData);
            if (data.success) {
                setSuccess('Your info has been saved!');
                // Update global user state for responsive UI
                const updatedUser = { ...user, ...data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save changes. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 animate-fade-in-up font-sans pb-20">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">My Profile</h1>
                        <p className="text-gray-500">Your personal and farm details</p>
                    </div>
                </div>

                <div className="card-glass p-8 mb-8 animate-fade-in-up border-white/60">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 bg-gradient-to-br from-farmer-500 to-emerald-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl ring-4 ring-white group-hover:rotate-6 transition-transform">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center text-emerald-600">
                                    <LuCamera className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Your Account</p>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                    {user?.name}
                                </h2>
                                <p className="text-gray-500 font-medium">Keep your details correct to get payments quickly.</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center md:items-end">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">Checking Status</p>
                            <span className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${user?.profileComplete
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-lg shadow-emerald-50'
                                : 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
                                }`}>
                                {user?.profileComplete ? <LuCheckCircle2 size={16} /> : <LuAlertCircle size={16} />}
                                {user?.profileComplete ? 'All Good' : 'Need More Info'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="card-premium animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="text-3xl">📝</div>
                        <h3 className="text-2xl font-black text-gray-900">Edit Your Details</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* Personal Information */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <LuUser className="text-emerald-500" /> Basic Info
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Full Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field w-full"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Phone Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel"
                                        required
                                        pattern="[0-9]{10}"
                                        className="input-field w-full"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="10-digit mobile number"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Aadhaar Card Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        pattern="[0-9]{12}"
                                        maxLength="12"
                                        className="input-field w-full font-mono tracking-widest"
                                        value={formData.aadhaar}
                                        onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, '') })}
                                        placeholder="Enter 12 digits"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <LuMapPin className="text-blue-500" /> Where you live
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Village Name</label>
                                    <input
                                        type="text"
                                        className="input-field w-full"
                                        value={formData.address.village}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, village: e.target.value } })}
                                        placeholder="Village"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-1">District</label>
                                    <input
                                        type="text"
                                        className="input-field w-full"
                                        value={formData.address.district}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, district: e.target.value } })}
                                        placeholder="District"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-1">State</label>
                                    <input
                                        type="text"
                                        className="input-field w-full"
                                        value={formData.address.state}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                                        placeholder="State"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Pincode</label>
                                    <input
                                        type="text"
                                        className="input-field w-full"
                                        value={formData.address.pincode}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                                        placeholder="Pincode"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bank Details */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <LuLandmark className="text-amber-500" /> Bank Info
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Bank Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field w-full"
                                        value={formData.bankDetails.bankName}
                                        onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value } })}
                                        placeholder="Enter Bank Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Account Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field w-full"
                                        value={formData.bankDetails.accountNumber}
                                        onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNumber: e.target.value } })}
                                        placeholder="Enter Account Number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-1">IFSC Code <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        pattern="[A-Z]{4}0[A-Z0-9]{6}"
                                        maxLength="11"
                                        className="input-field w-full uppercase"
                                        value={formData.bankDetails.ifscCode}
                                        onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, ifscCode: e.target.value.toUpperCase() } })}
                                        placeholder="Enter IFSC"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Name in Bank Account <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field w-full"
                                        value={formData.bankDetails.accountHolderName}
                                        onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountHolderName: e.target.value } })}
                                        placeholder="Account Holder Name"
                                    />
                                </div>
                            </div>
                        </div>


                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-slide-up">
                                <LuAlertCircle className="shrink-0" />
                                <span className="text-sm font-bold">{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 animate-slide-up">
                                <LuCheckCircle2 className="shrink-0" />
                                <span className="text-sm font-bold">{success}</span>
                            </div>
                        )}

                        <div className="flex pt-8">
                            <Button
                                type="submit"
                                disabled={loading}
                                border
                                className="w-full !rounded-2xl py-4 shadow-xl hover:shadow-emerald-200/50 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Saving info...</span>
                                    </>
                                ) : (
                                    <>
                                        <LuShieldCheck className="w-5 h-5" />
                                        <span>Save My Details</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
