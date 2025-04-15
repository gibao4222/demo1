import React from 'react';

function NavItem({ icon, text, active = false, activeStyle = 'default', onClick }) {
    const getActiveStyle = () => {
        switch (activeStyle) {
            case 'none':
                return '';
            case 'rotate':
                return 'transform';
            case 'default':
            default:
                return 'bg-white text-gray-600';
        }
    };

    
    const paddingXClass = !text && icon ? 'px-2.5' : 'px-3';

    const iconSizeClass = icon && text ? 'w-4 h-4' : 'w-6 h-6';

    return (
        <button
        onClick={onClick}
        className={`w-full flex items-center space-x-2.5 py-2.5 rounded-full transition-colors duration-200 bg-gray-800 text-white hover:bg-gray-700 ${paddingXClass} ${
            active && activeStyle !== 'none' && activeStyle !== 'rotate' ? getActiveStyle() : ''
        }`}
        >
        {/* Icon (nếu có) */}
        {icon && (
            <div className={`flex items-center justify-center ${iconSizeClass} ${active && activeStyle === 'rotate' ? 'rotate-45 transition-transform duration-200' : ''}`}>
                {typeof icon === 'string' ? (
                    <img src={icon} alt="Icon" className={iconSizeClass} />
                ) : (
                    icon
                )}
            </div>
        )}

        {/* Text (nếu có) */}
        {text && (
            <span className="text-sm font-medium">
            {text}
            </span>
        )}
        </button>
    );
}

export default NavItem;