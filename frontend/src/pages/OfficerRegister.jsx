import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import IconWrapper from '../components/IconWrapper';
import Button from '../components/Button';
import {
    LuUser,
    LuMail,
    LuPhone,
    LuLock,
    LuShieldCheck,
    LuUserPlus,
    LuArrowRight,
    LuAlertTriangle,
    LuMapPin,
    LuBrain,
    LuBarChart3,
    LuZap,
    LuAward
} from 'react-icons/lu';
import AgroLogo from '../components/AgroLogo';

export default function OfficerRegister() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        employeeId: '',
        district: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { data } = await authAPI.registerOfficer({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                employeeId: formData.employeeId,
                district: formData.district,
                password: formData.password
            });

            if (data.success) {
                login(data.token, data.user);
                navigate('/officer/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 py-12 bg-slate-50 font-sans">
            {/* Premium Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[120px] animate-pulse-slow [animation-delay:2s]" />
            </div>

            {/* Register Card */}
            <div className="relative max-w-2xl w-full">
                <div className="card-glass p-8 md:p-12 animate-fade-in-up shadow-2xl shadow-blue-200/50 border-white/60">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <AgroLogo className="w-20 h-20 mb-6 mx-auto animate-float" />
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
                            Officer Sign Up
                        </h1>
                        <p className="text-gray-500 font-medium">Create your official officer account to help farmers</p>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors">
                                        <LuUser className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="input-field pl-12 bg-white/50"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Officer ID Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors">
                                        <LuUser className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="input-field pl-12 bg-white/50"
                                        placeholder="Enter ID Number"
                                        value={formData.employeeId}
                                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors">
                                        <LuMail className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="input-field pl-12 bg-white/50"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors">
                                        <LuPhone className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        className="input-field pl-12 bg-white/50"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work District</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors">
                                    <LuMapPin className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="input-field pl-12 bg-white/50"
                                    placeholder="Enter district name"
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Choose Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors">
                                        <LuLock className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        className="input-field pl-12 bg-white/50"
                                        placeholder="Choose a strong password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Repeat Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors">
                                        <LuAward className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="input-field pl-12 bg-white/50"
                                        placeholder="Repeat your password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-shake font-bold text-sm">
                                <LuAlertTriangle className="flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="officer"
                            loading={loading}
                            border
                            className="w-full py-5 text-lg"
                            icon={LuUserPlus}
                        >
                            Register as Officer
                        </Button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-500 font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 font-black hover:underline inline-flex items-center gap-1 group">
                                Login here
                                <LuArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: <LuBrain />, label: 'AI Check', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                            { icon: <LuBarChart3 />, label: 'Insights', color: 'text-blue-500', bg: 'bg-blue-50' },
                            { icon: <LuShieldCheck />, label: 'Safe', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            { icon: <LuZap />, label: 'Fast', color: 'text-amber-500', bg: 'bg-amber-50' }
                        ].map((item, idx) => (
                            <div key={idx} className={`${item.bg} p-3 rounded-2xl flex flex-col items-center justify-center text-center group hover:scale-105 transition-transform duration-300 border border-transparent hover:border-white/50`}>
                                <div className={`${item.color} mb-1 group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                </div>
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
