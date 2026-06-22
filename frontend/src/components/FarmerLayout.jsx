import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import AgroLogo from './AgroLogo';
import LanguageSelector from './LanguageSelector';

export default function FarmerLayout() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Premium Header */}
                <header className="h-20 bg-white/70 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-30 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <div
                            className="md:hidden cursor-pointer"
                            onClick={() => navigate('/')}
                        >
                            <AgroLogo className="w-10 h-10" />
                        </div>
                        <div
                            className="cursor-pointer group"
                            onClick={() => navigate('/')}
                        >
                            <h1 className="text-xl font-black text-gray-800 tracking-tight group-hover:text-farmer-600 transition-colors">{t('app_name')} <span className="text-farmer-600 group-hover:text-farmer-700">{t('farmer.sidebar.home')}</span></h1>
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest leading-none">{t('common.back')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <LanguageSelector />
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-black text-gray-900 leading-none">{user?.name}</span>
                            <span className="text-[10px] font-bold text-farmer-600 uppercase tracking-wider mt-1">{t('auth.farmer')}</span>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-farmer-400 to-farmer-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-farmer-200 ring-2 ring-white">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Content Container */}
                <main className="flex-1 overflow-y-auto relative bg-[#f8fafc]">
                    {/* Floating Decorative Elements */}
                    <div className="absolute top-20 right-20 w-96 h-96 bg-farmer-200/20 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="absolute bottom-20 left-20 w-80 h-80 bg-green-200/20 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10">
                        <Outlet />
                    </div>

                    {/* Footer for dashboard consistency */}
                    <footer className="p-8 text-center border-t border-gray-100 mt-20">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                            © 2026 {t('app_name')} • {t('tagline')}
                        </p>
                    </footer>
                </main>
            </div>
        </div>
    );
}
