import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import IconWrapper from '../components/IconWrapper';
import Button from '../components/Button';
import LanguageSelector from '../components/LanguageSelector';
import {
    LuSprout,
    LuShieldCheck,
    LuArrowLeft,
    LuTrendingUp,
    LuUser,
    LuChevronRight,
    LuZap,
    LuBarChart3
} from 'react-icons/lu';
import AgroLogo from '../components/AgroLogo';

export default function AuthSelection() {
    const { t } = useTranslation();
    
    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-slate-50 font-sans">
            {/* Dynamic Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-100/40 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px] animate-pulse-slow [animation-delay:2s]" />
            </div>

            <div className="relative z-10 max-w-5xl w-full">
                <div className="text-center mb-16 animate-fade-in-up">
                    <AgroLogo className="w-16 h-16 mb-8 mx-auto animate-float" />
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-4">
                        {t('auth.who_are_you')}
                    </h1>
                    <p className="text-lg text-gray-500 font-medium">{t('auth.choose_account')}</p>
                </div>

                {/* Language Selector */}
                <div className="flex justify-center mb-8">
                    <LanguageSelector />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Farmer Card */}
                    <div className="card-glass p-10 group hover:scale-[1.02] transition-all duration-500 animate-fade-in-up border-white/60 shadow-2xl shadow-emerald-200/20" style={{ animationDelay: '0.1s' }}>
                        <div className="relative">
                            <div className="w-20 h-20 mb-8 mx-auto rounded-3xl overflow-hidden shadow-xl border border-emerald-100 group-hover:border-emerald-300 transition-all duration-500">
                                <img
                                    src="https://t4.ftcdn.net/jpg/05/38/00/67/240_F_538006758_ICKegU84LCVUdCTpDu2tCZUq9BKiBJKy.jpg"
                                    alt="Farmer illustration"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4 text-center">{t('auth.i_am_farmer')}</h2>
                            <p className="text-gray-500 font-medium text-center mb-12 leading-relaxed">
                                {t('auth.farmer_desc')}
                            </p>

                            <div className="space-y-4">
                                <Link
                                    to="/login"
                                    state={{ userType: 'farmer' }}
                                    className="block"
                                >
                                    <Button variant="farmer" className="w-full py-4 text-lg !rounded-2xl shadow-lg" icon={LuZap}>
                                        {t('home.nav.farmer_login')}
                                    </Button>
                                </Link>
                                <Link to="/register" className="block text-center text-emerald-600 font-black text-sm hover:underline tracking-tight">
                                    {t('auth.apply_for_account')} →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Officer Card */}
                    <div className="card-glass p-10 group hover:scale-[1.02] transition-all duration-500 animate-fade-in-up border-white/60 shadow-2xl shadow-blue-200/20" style={{ animationDelay: '0.2s' }}>
                        <div className="relative">
                            <div className="w-20 h-20 mb-8 mx-auto rounded-3xl overflow-hidden shadow-xl border border-blue-100 group-hover:border-blue-300 transition-all duration-500">
                                <img
                                    src="https://t3.ftcdn.net/jpg/05/44/84/48/240_F_544844831_XzM2SUQ2f7y5Rw2cVwcdEIl9f020m265.jpg"
                                    alt="Officer illustration"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4 text-center">{t('auth.i_am_officer')}</h2>
                            <p className="text-gray-500 font-medium text-center mb-12 leading-relaxed">
                                {t('auth.officer_desc')}
                            </p>

                            <div className="space-y-4">
                                <Link
                                    to="/login"
                                    state={{ userType: 'officer' }}
                                    className="block"
                                >
                                    <Button variant="officer" className="w-full py-4 text-lg !rounded-2xl shadow-lg" icon={LuBarChart3}>
                                        {t('home.nav.officer_login')}
                                    </Button>
                                </Link>
                                <Link to="/officer/register" className="block text-center text-blue-600 font-black text-sm hover:underline tracking-tight">
                                    {t('auth.register')} →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 font-black text-xs uppercase tracking-[0.2em] hover:text-gray-900 transition-colors group">
                        <LuArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        {t('common.back')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
