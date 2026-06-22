import { useState, useEffect } from 'react';
import { officerAPI } from '../../services/api';
import IconWrapper from '../../components/IconWrapper';
import { Spinner } from '../../components/Loading';
import Button from '../../components/Button';
import {
    LuHistory,
    LuActivity,
    LuUser,
    LuBox,
    LuClock,
    LuChevronLeft,
    LuChevronRight,
    LuTerminal,
    LuShieldAlert,
    LuFingerprint
} from 'react-icons/lu';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const DEFAULT_PAGINATION = { currentPage: 1, pages: 1, total: 0 };
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    const fetchLogs = async (page) => {
        try {
            setLoading(true);
            const res = await officerAPI.getAuditLogs({ page, limit: 15 });
            if (res.data.success) {
                setLogs(res.data.logs);
                const p = res.data.pagination || {};
                setPagination({
                    ...DEFAULT_PAGINATION,
                    ...p,
                    currentPage: typeof p.currentPage === 'number' ? p.currentPage : page
                });
            }
        } catch (err) {
            console.error('Failed to get logs:', err);
        } finally {
            setTimeout(() => setLoading(false), 600);
        }
    };

    const getActionStyles = (action) => {
        if (action.includes('approve')) return { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <LuShieldAlert /> };
        if (action.includes('reject')) return { color: 'text-rose-600', bg: 'bg-rose-50', icon: <LuShieldAlert /> };
        if (action.includes('fund')) return { color: 'text-blue-600', bg: 'bg-blue-50', icon: <LuTerminal /> };
        if (action.includes('login')) return { color: 'text-amber-600', bg: 'bg-amber-50', icon: <LuFingerprint /> };
        return { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <LuActivity /> };
    };

    if (loading && page === 1) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-12">
                <LuFingerprint className="w-16 h-16 text-blue-500 animate-pulse mb-6" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Opening action logs...</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-10 animate-fade-in-up pb-24 max-w-[1400px] mx-auto font-sans">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                        Action Logs
                        <IconWrapper color="text-amber-600" bgColor="bg-amber-50" size="w-10 h-10 border border-amber-100">
                            <LuHistory />
                        </IconWrapper>
                    </h1>
                    <p className="text-gray-500 font-medium mt-2">A list of everything that happened in the system.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            const headers = ['Order', 'Date', 'Action', 'Who', 'Where', 'Details'];
                            const csvContent = [
                                headers.join(','),
                                ...logs.map(log => [
                                    log._id,
                                    new Date(log.createdAt).toISOString(),
                                    log.action,
                                    log.userType,
                                    log.resource,
                                    JSON.stringify(log.metadata).replace(/,/g, ';')
                                ].join(','))
                            ].join('\n');

                            const blob = new Blob([csvContent], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `System_Logs_${new Date().getTime()}.csv`;
                            a.click();
                        }}
                        className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-all font-black text-[10px] uppercase tracking-widest text-emerald-600"
                    >
                        <LuBox className="w-4 h-4" />
                        Export to Excel
                    </button>
                    <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System is working</p>
                    </div>
                </div>
            </div>

            {/* Audit Core */}
            <div className="card-premium overflow-hidden border-white/60">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 italic">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date and Time</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action Taken</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Who did it</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Where</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Extra Info</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {logs.map((log) => {
                                const s = getActionStyles(log.action);
                                return (
                                    <tr key={log._id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <LuClock size={16} className="text-gray-400" />
                                                <div>
                                                    <p className="font-bold text-gray-700 text-sm">{new Date(log.createdAt).toLocaleDateString()}</p>
                                                    <p className="text-[10px] font-mono text-gray-400 uppercase">{new Date(log.createdAt).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${s.bg} ${s.color} border border-current opacity-80 group-hover:scale-110 transition-transform`}>
                                                    {s.icon}
                                                </div>
                                                <span className="font-black text-gray-900 text-xs uppercase tracking-widest">{log.action.replace(/_/g, ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 text-gray-600 border border-gray-100">
                                                <LuUser size={14} className="text-blue-500" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">{log.userType === 'officer' ? 'Officer' : 'Farmer'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <LuBox size={16} className="text-indigo-500" />
                                                <span className="text-sm font-bold text-gray-700 capitalize">{log.resource}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="group/meta relative">
                                                <div className="text-[10px] font-mono bg-gray-100/50 p-2.5 rounded-xl text-gray-500 max-w-[180px] truncate hover:max-w-none hover:absolute hover:z-20 hover:bg-gray-900 hover:text-white transition-all cursor-help border border-gray-100">
                                                    {JSON.stringify(log.metadata)}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-32 text-center">
                                        <IconWrapper color="text-gray-300" bgColor="bg-gray-50" size="w-16 h-16 mb-4 mx-auto">
                                            <LuTerminal />
                                        </IconWrapper>
                                        <h4 className="text-lg font-black text-gray-900 mb-2">No actions found</h4>
                                        <p className="text-gray-400 font-medium">No system actions have happened yet.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                    <div className="p-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6 bg-gray-50/30">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            Page {pagination.currentPage} of {pagination.pages}
                        </p>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                variant="secondary"
                                className="px-6 py-2.5"
                                icon={LuChevronLeft}
                            >
                                Previous Page
                            </Button>
                            <Button
                                onClick={() => setPage((p) => Math.min(pagination.pages || 1, p + 1))}
                                disabled={page === (pagination.pages || 1)}
                                variant="secondary"
                                className="px-6 py-2.5"
                                icon={LuChevronRight}
                            >
                                Next Page
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
