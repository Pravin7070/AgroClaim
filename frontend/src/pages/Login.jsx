import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Button from '../components/Button';
import IconWrapper from '../components/IconWrapper';
import LanguageSelector from '../components/LanguageSelector';
import {
  LuMail,
  LuLock,
  LuUser,
  LuShieldCheck,
  LuZap,
  LuTarget,
  LuSprout,
  LuArrowRight,
  LuLogIn,
  LuAlertTriangle
} from 'react-icons/lu';
import AgroLogo from '../components/AgroLogo';

export default function Login() {
  const { t } = useTranslation();
  const location = useLocation();
  const [userType, setUserType] = useState(location.state?.userType || 'farmer');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginFn = userType === 'farmer' ? authAPI.loginFarmer : authAPI.loginOfficer;
      const { data } = await loginFn(formData);

      if (data.success) {
        login(data.token, data.user);
        navigate(userType === 'farmer' ? '/farmer/dashboard' : '/officer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 bg-slate-50">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-farmer-200/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[120px] animate-float [animation-delay:2s]" />
      </div>

      <div className="relative max-w-[480px] w-full z-10">
        <div className="card-glass p-8 md:p-12 animate-fade-in-up border-white/40 shadow-soft-xl">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10 text-center">
            <Link to="/" className="group">
              <h1 className="text-5xl font-black tracking-tighter text-gray-900">
                Agro<span className="text-farmer-600">Claim</span>
              </h1>
              <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-3">
                {t('auth.easy_farm_help')}
              </p>
            </Link>
          </div>

          {/* Language Selector */}
          <div className="flex justify-center mb-8">
            <LanguageSelector />
          </div>

          {/* Role Selection */}
          <div className="flex p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-2xl mb-8 border border-gray-200/50">
            <button
              type="button"
              onClick={() => setUserType('farmer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-300 ${userType === 'farmer'
                ? 'bg-white text-farmer-600 shadow-md scale-[1.02]'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <LuUser size={18} />
              {t('auth.farmer')}
            </button>
            <button
              type="button"
              onClick={() => setUserType('officer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-300 ${userType === 'officer'
                ? 'bg-white text-blue-600 shadow-md scale-[1.02]'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <LuShieldCheck size={18} />
              {t('auth.officer')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('auth.your_email')}</label>
              <input
                type="email"
                required
                className="input-field px-6 bg-white/50 focus:bg-white border-gray-100 hover:border-gray-200 focus:ring-2 focus:ring-farmer-500/20 transition-all text-sm h-14"
                placeholder={t('auth.enter_email')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('auth.your_password')}</label>
              <input
                type="password"
                required
                className="input-field px-6 bg-white/50 focus:bg-white border-gray-100 hover:border-gray-200 focus:ring-2 focus:ring-farmer-500/20 transition-all text-sm h-14"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-shake font-bold text-sm">
                <LuAlertTriangle className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant={userType === 'farmer' ? 'farmer' : 'officer'}
              loading={loading}
              className="w-full py-5 text-lg"
              icon={LuLogIn}
            >
              {t('auth.login_now')}
            </Button>
          </form>

          {userType === 'farmer' && (
            <div className="mt-10 text-center">
              <p className="text-gray-500 font-medium">
                {t('auth.new_to_platform')}{' '}
                <Link
                  to="/register"
                  className="text-farmer-600 font-bold hover:underline underline-offset-4 flex items-center justify-center gap-1 mt-1 group"
                >
                  {t('auth.apply_for_account')} <LuArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
            </div>
          )}

          {userType === 'officer' && (
            <div className="mt-10 text-center">
              <p className="text-gray-500 font-medium">
                {t('auth.new_to_platform')}{' '}
                <Link
                  to="/officer/register"
                  className="text-blue-600 font-bold hover:underline underline-offset-4 flex items-center justify-center gap-1 mt-1 group"
                >
                  {t('auth.register')} <LuArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
