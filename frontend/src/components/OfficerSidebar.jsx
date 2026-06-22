import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import IconWrapper from './IconWrapper';
import AgroLogo from './AgroLogo';
import {
    LuBarChart3,
    LuTrendingUp,
    LuCoins,
    LuFolderOpen,
    LuLogOut,
    LuShieldCheck,
    LuHistory
} from 'react-icons/lu';

export default function OfficerSidebar() {
    const { t } = useTranslation();
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        {
            path: '/officer/dashboard',
            icon: <LuBarChart3 />,
            title: t('officer.sidebar.dashboard'),
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            path: '/officer/analytics',
            icon: <LuTrendingUp />,
            title: t('officer.sidebar.analytics'),
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50'
        },
        {
            path: '/officer/funds',
            icon: <LuCoins />,
            title: t('officer.sidebar.funds'),
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50'
        },
        {
            path: '/officer/claims',
            icon: <LuFolderOpen />,
            title: t('officer.sidebar.claims'),
            color: 'text-amber-600',
            bgColor: 'bg-amber-50'
        },
        {
            path: '/officer/schemes',
            icon: <LuShieldCheck />,
            title: t('officer.sidebar.schemes'),
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            path: '/officer/audit-logs',
            icon: <LuHistory />,
            title: t('officer.sidebar.audit_logs'),
            color: 'text-rose-600',
            bgColor: 'bg-rose-50'
        }
    ];

    return (
        <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 animate-fade-in flex flex-col h-full flex-shrink-0 z-40 font-sans">
            <div className="p-8 flex-1 scrollbar-hide overflow-y-auto">
                <Link
                    to="/"
                    className="mb-10 flex items-center gap-3 cursor-pointer group"
                >
                    <AgroLogo className="w-12 h-12 group-hover:rotate-12 transition-transform duration-500" />
                    <div>
                        <h2 className="text-sm font-black text-gray-900 tracking-tight leading-none uppercase group-hover:text-blue-600 transition-colors">{t('app_name')}</h2>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{t('farmer.sidebar.menu')}</p>
                    </div>
                </Link>

                <nav className="space-y-3">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/officer/dashboard' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 group ${isActive
                                    ? 'bg-white shadow-xl shadow-blue-200/20 translate-x-1 border border-blue-50'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <IconWrapper
                                    color={isActive ? 'text-white' : item.color}
                                    bgColor={isActive ? 'bg-gradient-to-br from-blue-500 to-blue-600' : item.bgColor}
                                    size="w-11 h-11"
                                >
                                    {item.icon}
                                </IconWrapper>
                                <span className={`font-bold text-sm tracking-tight ${isActive ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                    {item.title}
                                </span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <button
                    onClick={logout}
                    className="flex items-center gap-4 w-full p-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all duration-300 group font-bold font-sans"
                >
                    <IconWrapper color="text-red-500" bgColor="bg-red-50" size="w-11 h-11">
                        <LuLogOut />
                    </IconWrapper>
                    <span className="text-sm text-red-600">{t('common.logout')}</span>
                </button>
            </div>
        </div>
    );
}
