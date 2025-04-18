import React, { useState } from 'react';

function NavItem({ icon, hoverIcon, text, active = false, activeStyle = 'default', rotateDegree = 45, hoverRotateDegree = 0, isParentHovered = false, onClick, className = '', noBackground = false, children }) {
  const [isHovered, setIsHovered] = useState(false);

  const getActiveStyle = () => {
    switch (activeStyle) {
      case 'none':
        return '';
      case 'rotate':
        return 'transform';
      case 'default':
      default:
        return 'bg-white';
    }
  };

  const getActiveTextColor = () => {
    if (active && activeStyle === 'default') {
      return 'text-gray-600 !important';
    }
    return 'text-white';
  };

  const paddingXClass = !text && icon ? 'px-2.5' : 'px-3';
  const iconSizeClass = icon && text ? 'w-3.5 h-3.5' : 'w-6 h-6';

  const rotateStyle = active && activeStyle === 'rotate'
    ? { transform: `rotate(${rotateDegree}deg)`, transition: 'transform 0.2s' }
    : { transition: 'transform 0.1s' };

  // Kết hợp trạng thái hover từ chính NavItem và từ parent (<li>)
  const shouldApplyHoverEffect = isHovered || isParentHovered;

  const hoverStyle = shouldApplyHoverEffect
    ? {
        transform: `rotate(${hoverRotateDegree}deg)`,
        transition: 'all 0.1s'
      }
    : { transition: 'all 0.1s' };
    const currentIcon = shouldApplyHoverEffect && hoverIcon ? hoverIcon : icon;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center justify-center space-x-2 rounded-full transition-colors duration-200 ${
        noBackground ? 'bg-transparent' : 'bg-neutral-800'
      } hover:bg-neutral-700 ${paddingXClass} py-2.5 ${
        active && activeStyle !== 'none' && activeStyle !== 'rotate' ? getActiveStyle() : ''
      } ${className}`}
    >
      {children ? (
        <div style={rotateStyle}>
          {children}
        </div>
      ) : (
        <>
          {icon && (
            <div
              className={`flex items-center justify-center ${iconSizeClass}`}
              style={rotateStyle}
            >
              {typeof icon === 'string' ? (
                <img
                  src={currentIcon}
                  alt="Icon"
                  className={iconSizeClass}
                  style={hoverStyle}
                />
              ) : (
                icon
              )}
            </div>
          )}

          {text && (
            <span className={`text-sm font-medium ${getActiveTextColor()}`}>
              {text}
            </span>
          )}
        </>
      )}
    </button>
  );
}

export default NavItem;