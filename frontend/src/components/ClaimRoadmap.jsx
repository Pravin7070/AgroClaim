import React from 'react';
import {
    LuFilePlus,
    LuScan,
    LuShieldCheck,
    LuClipboardCheck,
    LuCheckCircle2,
    LuXCircle,
    LuBanknote,
    LuWallet,
    LuClock,
    LuChevronRight,
    LuMapPin
} from 'react-icons/lu';

const steps = [
    {
        id: 'submitted',
        title: 'Submitted',
        icon: LuFilePlus,
        description: 'Initial claim documentation successfully received.',
        getStatus: (claim) => claim.status === 'submitted' || claim.status === 'ai_analyzing' || claim.status === 'pending_review' || claim.status === 'approved' || claim.status === 'rejected' ? 'completed' : 'pending'
    },
    {
        id: 'ai_analyzing',
        title: 'AI Analysis Running',
        icon: LuScan,
        description: 'Vision models are analyzing imagery for damage verification.',
        getStatus: (claim) => {
            if (claim.status === 'ai_analyzing') return 'active';
            if (['pending_review', 'approved', 'rejected', 'info_requested'].includes(claim.status)) return 'completed';
            return 'pending';
        }
    },
    {
        id: 'officer_assigned',
        title: 'Officer Assigned',
        icon: LuShieldCheck,
        description: 'Qualified underwriter assigned to your case.',
        getStatus: (claim) => {
            if (claim.officerId && claim.status === 'pending_review') return 'active';
            if (['approved', 'rejected', 'info_requested'].includes(claim.status)) return 'completed';
            return 'pending';
        }
    },
    {
        id: 'under_review',
        title: 'Under Review',
        icon: LuClipboardCheck,
        description: 'Final human verification of AI assessment results.',
        getStatus: (claim) => {
            if (claim.status === 'pending_review') return 'active';
            if (['approved', 'rejected', 'info_requested'].includes(claim.status)) return 'completed';
            return 'pending';
        }
    },
    {
        id: 'final_verdict',
        title: 'Final Verdict',
        icon: LuCheckCircle2,
        description: 'Claim approved or further information required.',
        getStatus: (claim) => {
            if (['approved', 'rejected', 'info_requested'].includes(claim.status)) return 'completed';
            return 'pending';
        },
        getCustomIcon: (claim) => {
            if (claim.status === 'rejected') return LuXCircle;
            if (claim.status === 'approved') return LuCheckCircle2;
            return LuCheckCircle2;
        }
    },
    {
        id: 'funds_released',
        title: 'Funds Released',
        icon: LuBanknote,
        description: 'Treasury has authorized the disbursement of funds.',
        getStatus: (claim) => {
            if (claim.status === 'approved' && claim.funds?.releasedAt) return 'completed';
            if (claim.status === 'approved') return 'active';
            return 'pending';
        }
    },
    {
        id: 'wallet_credited',
        title: 'Wallet Credited',
        icon: LuWallet,
        description: 'Compensation successfully deposited into your secure wallet.',
        getStatus: (claim) => {
            if (claim.status === 'approved' && claim.funds?.releasedAt) return 'completed';
            return 'pending';
        }
    }
];

export default function ClaimRoadmap({ claim }) {
    if (!claim) return null;

    return (
        <div className="py-10 px-4 md:px-8 max-w-4xl mx-auto">
            <div className="relative">
                {/* Connection Line */}
                <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gray-100 -translate-x-1/2 hidden md:block" />
                <div className="absolute left-[27px] top-0 bottom-0 w-[2px] bg-gray-100 md:hidden" />

                {/* Steps */}
                <div className="space-y-12 relative z-10">
                    {steps.map((step, idx) => {
                        const status = step.getStatus(claim);
                        const StepIcon = step.getCustomIcon ? step.getCustomIcon(claim) : step.icon;
                        const isActive = status === 'active';
                        const isCompleted = status === 'completed';

                        return (
                            <div key={step.id} className={`flex flex-col md:flex-row items-start md:items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse text-right'}`}>
                                {/* Step Content */}
                                <div className={`flex-1 w-full ${idx % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                                    <div className={`card-glass p-6 group hover:scale-[1.02] transition-all duration-300 border-white/60 shadow-xl ${isActive ? 'ring-2 ring-emerald-500/50' : ''}`}>
                                        <div className={`flex items-center gap-4 mb-2 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'bg-emerald-50 text-emerald-600' :
                                                    isActive ? 'bg-amber-50 text-amber-600 animate-pulse' :
                                                        'bg-gray-50 text-gray-400'
                                                }`}>
                                                {status}
                                            </div>
                                            <span className="text-gray-400 text-[10px] font-bold">Step 0{idx + 1}</span>
                                        </div>
                                        <h4 className="text-xl font-black text-gray-900 mb-2">{step.title}</h4>
                                        <p className="text-gray-500 text-sm font-medium leading-relaxed">{step.description}</p>

                                        {step.id === 'submitted' && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs font-bold text-gray-400">
                                                <span className="flex items-center gap-1"><LuClock className="text-emerald-500" /> {new Date(claim.createdAt).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><LuMapPin className="text-blue-500" /> {claim.location?.village}</span>
                                            </div>
                                        )}

                                        {isActive && step.id === 'ai_analyzing' && (
                                            <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 animate-shimmer" style={{ width: '60%' }} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Step Connector Node */}
                                <div className="relative z-20 flex items-center justify-center">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${isCompleted ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white scale-110 shadow-emerald-200' :
                                            isActive ? 'bg-white text-emerald-600 border-2 border-emerald-500 scale-125 shadow-emerald-100 animate-float' :
                                                'bg-white text-gray-300 border border-gray-100'
                                        }`}>
                                        <StepIcon className={`${isActive ? 'animate-pulse' : ''} w-6 h-6`} />
                                    </div>
                                    {isActive && (
                                        <div className="absolute inset-0 rounded-2xl bg-emerald-400/20 animate-ping -z-10" />
                                    )}
                                </div>

                                {/* Spacing for layout */}
                                <div className="hidden md:block flex-1" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
