import { useLocation } from 'react-router-dom';
import { LuHome, LuLayoutDashboard, LuFileText, LuWallet, LuUser, LuBarChart3, LuCoins, LuClipboardList, LuGavel, LuShieldCheck } from 'react-icons/lu';

const routeIcons = {
  '/': LuHome,
  '/farmer/dashboard': LuLayoutDashboard,
  '/farmer/submit-claim': LuFileText,
  '/farmer/claims': LuClipboardList,
  '/farmer/wallet': LuWallet,
  '/farmer/profile': LuUser,
  '/officer/dashboard': LuShieldCheck,
  '/officer/analytics': LuBarChart3,
  '/officer/funds': LuCoins,
  '/officer/claims': LuClipboardList,
  '/officer/audit-logs': LuClipboardList,
  '/about': LuHome,
  '/services': LuBarChart3,
  '/contact': LuUser
};

export default function PageLoader({ show = true }) {
  const location = useLocation();
  
  if (!show) return null;

  const getIcon = () => {
    const path = location.pathname;
    for (const [route, Icon] of Object.entries(routeIcons)) {
      if (path.startsWith(route) || path === route) {
        return Icon;
      }
    }
    return LuLayoutDashboard;
  };

  const Icon = getIcon();

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative inline-block">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl animate-spin-slow">
            <Icon className="w-10 h-10 text-white" />
          </div>
          <div className="absolute inset-0 bg-emerald-400/30 rounded-2xl animate-ping" />
        </div>
      </div>
    </div>
  );
}
