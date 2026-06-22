import React from 'react';

/**
 * Premium Icon Wrapper for consistent icon styling and animations
 * @param {Object} props
 * @param {React.ReactNode} props.children - The icon component (Lucide Icon)
 * @param {string} props.color - Color class (e.g., 'text-farmer-600')
 * @param {string} props.bgColor - Background color class (e.g., 'bg-farmer-50')
 * @param {string} props.size - Size of the container
 * @param {string} props.className - Additional classes
 */
const IconWrapper = ({ children, color = 'text-gray-600', bgColor = 'bg-gray-100', size = 'w-10 h-10', className = '' }) => {
    return (
        <div className={`flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 shadow-sm group ${bgColor} ${size} ${className}`}>
            {React.cloneElement(children, {
                size: 24,
                className: `${color} transition-colors duration-300 group-hover:drop-shadow-sm`,
                "aria-hidden": "true"
            })}
        </div>
    );
};

export default IconWrapper;
