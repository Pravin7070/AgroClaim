import React from 'react';

const Skeleton = ({ className = '', variant = 'rect' }) => {
    const baseClasses = 'bg-gray-200/50 relative overflow-hidden animate-shimmer before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent';

    const variants = {
        rect: 'rounded-lg',
        circle: 'rounded-full',
        text: 'rounded h-4 w-full',
    };

    return (
        <div className={`${baseClasses} ${variants[variant]} ${className}`} />
    );
};

export const DashboardSkeleton = () => {
    return (
        <div className="p-6 md:p-8 space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>

            <Skeleton className="h-48 w-full rounded-2xl" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
            </div>

            <div className="card-glass p-6 space-y-6">
                <div className="flex justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-20" />
                </div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-3 w-1/3" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Skeleton;
