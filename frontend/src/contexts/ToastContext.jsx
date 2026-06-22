import { createContext, useContext, useState, useCallback } from 'react';
import { LuCheckCircle2, LuAlertCircle, LuInfo, LuX, LuAlertTriangle } from 'react-icons/lu';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

const TOAST_TYPES = {
    success: { icon: LuCheckCircle2, gradient: 'from-emerald-600 to-green-700', iconColor: 'text-emerald-600' },
    error: { icon: LuAlertCircle, gradient: 'from-red-600 to-rose-700', iconColor: 'text-red-600' },
    warning: { icon: LuAlertTriangle, gradient: 'from-amber-600 to-orange-700', iconColor: 'text-amber-600' },
    info: { icon: LuInfo, gradient: 'from-blue-600 to-indigo-700', iconColor: 'text-blue-600' }
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const successToasts = toasts.filter(t => t.type === 'success');
    const otherToasts = toasts.filter(t => t.type !== 'success');
    const latestSuccess = successToasts[successToasts.length - 1];

    return (
        <ToastContext.Provider value={{ showToast, success: (msg) => showToast(msg, 'success'), error: (msg) => showToast(msg, 'error'), warning: (msg) => showToast(msg, 'warning'), info: (msg) => showToast(msg, 'info') }}>
            {children}

            {/* Centered success notification card */}
            {latestSuccess && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
                    <div
                        className="pointer-events-auto animate-success-card w-full max-w-md absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[28px] overflow-hidden shadow-2xl border border-emerald-200/50"
                        style={{ boxShadow: '0 0 60px rgba(5, 150, 105, 0.35), 0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
                    >
                        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 p-8 relative">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.2)_0%,_transparent_50%)]" />
                            <div className="relative flex items-center gap-4">
                                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
                                    <LuCheckCircle2 className="w-9 h-9 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-lg font-black leading-snug drop-shadow-sm">{latestSuccess.message}</p>
                                    <p className="text-emerald-100/90 text-xs font-bold uppercase tracking-widest mt-1">Success</p>
                                </div>
                                <button
                                    onClick={() => removeToast(latestSuccess.id)}
                                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white/90 hover:text-white transition-all"
                                >
                                    <LuX className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Other toasts (error, warning, info) in corner */}
            <div className="fixed bottom-6 right-6 z-[9998] space-y-3 max-w-sm w-full px-4 pointer-events-none">
                {otherToasts.map((toast) => {
                    const config = TOAST_TYPES[toast.type];
                    const Icon = config.icon;
                    return (
                        <div
                            key={toast.id}
                            className="pointer-events-auto animate-slide-up bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                        >
                            <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />
                            <div className="p-4 flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <p className="flex-1 text-sm font-bold text-gray-900 leading-relaxed pt-2">{toast.message}</p>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                                >
                                    <LuX className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};
