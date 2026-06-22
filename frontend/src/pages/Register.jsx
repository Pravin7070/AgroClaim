import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Button from '../components/Button';
import IconWrapper from '../components/IconWrapper';
import LanguageSelector from '../components/LanguageSelector';
import {
  LuUser,
  LuMail,
  LuPhone,
  LuLock,
  LuShieldCheck,
  LuUserPlus,
  LuArrowRight,
  LuAlertTriangle,
  LuSprout,
  LuZap,
  LuCoins,
  LuCpu,
  LuBarChart3
} from 'react-icons/lu';
import AgroLogo from '../components/AgroLogo';

export default function Register() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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
      setError(t('errors.password_mismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('errors.password_length'));
      return;
    }

    setLoading(true);

    try {
      const { data } = await authAPI.registerFarmer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      if (data.success) {
        login(data.token, data.user);
        navigate('/farmer/dashboard');
      }
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || data?.errors?.[0]?.msg || t('errors.registration_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 bg-slate-50 py-20">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[5%] right-[5%] w-[35%] h-[35%] bg-farmer-200/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-[5%] left-[5%] w-[35%] h-[35%] bg-blue-200/20 rounded-full blur-[100px] animate-float [animation-delay:2s]" />
      </div>

      <div className="relative max-w-[540px] w-full z-10">
        <div className="card-glass p-8 md:p-12 animate-fade-in-up border-white/40 shadow-soft-xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            <AgroLogo className="w-16 h-16 mb-4" />
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('auth.create_account')}</h1>
            <p className="text-gray-400 font-bold uppercase tracking-[0.1em] text-[11px] mt-2">{t('auth.get_help')}</p>
          </div>

          {/* Language Selector */}
          <div className="flex justify-center mb-6">
            <LanguageSelector />
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('auth.full_name')}</label>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-farmer-600">
                  <LuUser className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  className="input-field pl-12 bg-white/50 focus:bg-white border-gray-100 hover:border-gray-200"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('auth.email')}</label>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-farmer-600">
                  <LuMail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  className="input-field pl-12 bg-white/50 focus:bg-white border-gray-100 hover:border-gray-200"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('auth.phone')}</label>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-farmer-600">
                  <LuPhone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  required
                  className="input-field pl-12 bg-white/50 focus:bg-white border-gray-100 hover:border-gray-200"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('auth.choose_password')}</label>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-farmer-600">
                  <LuLock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  className="input-field pl-12 bg-white/50 focus:bg-white border-gray-100 hover:border-gray-200"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('auth.repeat_password')}</label>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-farmer-600">
                  <LuShieldCheck className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  className="input-field pl-12 bg-white/50 focus:bg-white border-gray-100 hover:border-gray-200"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <div className="md:col-span-2 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-shake font-bold text-sm">
                <LuAlertTriangle className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="md:col-span-2 pt-4">
              <Button
                type="submit"
                variant="farmer"
                loading={loading}
                className="w-full py-5 text-lg"
                icon={LuUserPlus}
              >
                {t('auth.register_farmer')}
              </Button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-500 font-medium">
              {t('auth.already_verified')}{' '}
              <Link to="/login" className="text-farmer-600 font-bold hover:underline underline-offset-4 flex items-center justify-center gap-1 mt-1 group">
                {t('auth.login_to_portal')} <LuArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
