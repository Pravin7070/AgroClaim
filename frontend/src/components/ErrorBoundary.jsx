import React from 'react';
import { LuAlertTriangle, LuRefreshCw, LuHome } from 'react-icons/lu';
import Button from './Button';
import IconWrapper from './IconWrapper';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-red-100 animate-fade-in">
                    <div className="max-w-md w-full text-center">
                        <IconWrapper color="text-red-600" bgColor="bg-red-50" size="w-20 h-20 mb-6 mx-auto shadow-xl">
                            <LuAlertTriangle className="animate-pulse" />
                        </IconWrapper>
                        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">System Interruption</h2>
                        <p className="text-gray-500 font-medium mb-10 leading-relaxed text-lg">
                            We've encountered a runtime synchronization error. Our automated diagnostic protocols have been notified.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                            <Button
                                onClick={() => window.location.reload()}
                                variant="officer"
                                className="w-full sm:w-auto px-8 py-4 flex items-center justify-center gap-2"
                                icon={LuRefreshCw}
                            >
                                Re-initialize Page
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/'}
                                variant="secondary"
                                className="w-full sm:w-auto px-8 py-4 flex items-center justify-center gap-2"
                                icon={LuHome}
                            >
                                Safe Recovery
                            </Button>
                        </div>
                        {(import.meta.env.MODE === 'development' || import.meta.env.DEV) && (
                            <div className="mt-12 p-6 bg-red-50/50 rounded-2xl text-left border border-red-100 overflow-auto scrollbar-hide max-h-48 shadow-inner">
                                <p className="text-red-700 font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                                    Diagnostic Trace
                                </p>
                                <code className="text-xs text-red-600 font-mono break-all leading-relaxed whitespace-pre-wrap">
                                    {this.state.error?.toString()}
                                </code>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
