import React from 'react';
import { LuLoader2 } from 'react-icons/lu';

const Button = ({
    children,
    loading = false,
    disabled = false,
    variant = 'farmer', // 'farmer', 'officer', 'outline', 'danger'
    type = 'button',
    onClick,
    className = '',
    icon: Icon,
    border, // Capture but don't use
    ...props
}) => {
    const baseStyles = "relative flex items-center justify-center gap-2 font-bold transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed overflow-hidden";

    const variants = {
        farmer: "bg-farmer-600 text-white hover:bg-farmer-700 shadow-lg shadow-farmer-200 hover:shadow-glow-green rounded-2xl py-3.5 px-6",
        officer: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-glow-blue rounded-2xl py-3.5 px-6",
        outline: "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-2xl py-3.5 px-6",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl py-3.5 px-6 border border-red-100",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            <div className={`flex items-center gap-2 transition-all duration-300 ${loading ? 'opacity-0 scale-90 blur-sm' : 'opacity-100 scale-100'}`}>
                {Icon && <Icon className="w-5 h-5" />}
                {children}
            </div>

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <LuLoader2 className="w-6 h-6 animate-spin text-current" />
                </div>
            )}
        </button>
    );
};

export default Button;
