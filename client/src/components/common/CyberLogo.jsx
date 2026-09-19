import React from 'react';

/**
 * CyberLogo - Professional Enterprise Cybersecurity Brand Emblem & Typography
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} variant - 'dark' (for dark sidebars/headers) | 'light' (for light cards/pages)
 * @param {boolean} showSubtitle - whether to display the subtitle label
 * @param {string} title - Custom brand title text
 * @param {string} subtitle - Custom brand subtitle text
 */
export const CyberLogo = ({ 
  size = 'md', 
  variant = 'dark', 
  showSubtitle = true,
  title = "CYBERAI SOC",
  subtitle = "ENTERPRISE PLATFORM",
  className = ""
}) => {
  // Dimensions scaling
  const sizeMap = {
    sm: { icon: "w-6 h-6", text: "text-xs", sub: "text-[8px]", iconSize: 24 },
    md: { icon: "w-8 h-8", text: "text-sm", sub: "text-[9px]", iconSize: 32 },
    lg: { icon: "w-10 h-10", text: "text-base", sub: "text-[10px]", iconSize: 40 },
    xl: { icon: "w-12 h-12", text: "text-xl", sub: "text-[11px]", iconSize: 48 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* High-Tech Vector Cyber Shield Emblem */}
      <div className={`relative ${currentSize.icon} shrink-0 flex items-center justify-center rounded-lg p-1 transition-transform hover:scale-105 duration-200 shadow-md ${
        isDark 
          ? "bg-gradient-to-br from-[#0B1930] via-[#07111F] to-[#151B24] border border-blue-500/30 text-blue-400" 
          : "bg-gradient-to-br from-[#07111F] via-[#0B1930] to-[#1E293B] border border-slate-700/50 text-blue-400"
      }`}>
        {/* SVG Shield Emblem with Geometric Nodes */}
        <svg 
          viewBox="0 0 36 36" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(21,112,239,0.3)]"
        >
          {/* Outer Shield Hex Path */}
          <path 
            d="M18 3L30 8.25V17.25C30 24.75 24.75 30.75 18 33C11.25 30.75 6 24.75 6 17.25V8.25L18 3Z" 
            fill="url(#shieldGrad)" 
            stroke="url(#shieldBorder)" 
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Inner Security Core Matrix */}
          <path 
            d="M18 8L25.5 11.5V17C25.5 21.8 22.3 26 18 27.5C13.7 26 10.5 21.8 10.5 17V11.5L18 8Z" 
            fill="#07111F" 
            fillOpacity="0.8" 
            stroke="#3B82F6" 
            strokeWidth="1" 
            strokeDasharray="2 1"
          />
          {/* Central Target / Lock Core */}
          <circle cx="18" cy="16" r="3.5" fill="#1570EF" stroke="#60A5FA" strokeWidth="1" />
          <circle cx="18" cy="16" r="1.5" fill="#FFFFFF" />
          {/* Pulse Node Beam */}
          <path d="M18 19.5V24" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="18" cy="24" r="1" fill="#10B981" />

          {/* Gradients */}
          <defs>
            <linearGradient id="shieldGrad" x1="6" y1="3" x2="30" y2="33" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0B1930" />
              <stop offset="0.5" stopColor="#0F2847" />
              <stop offset="1" stopColor="#07111F" />
            </linearGradient>
            <linearGradient id="shieldBorder" x1="6" y1="3" x2="30" y2="33" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" />
              <stop offset="0.5" stopColor="#1D4ED8" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>

        {/* Live Status Indicator Pixel */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#07111F]"></span>
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight font-sans ${currentSize.text} ${
            isDark ? "text-white" : "text-[#07111F]"
          }`}>
            {title.split(' ')[0]}
          </span>
          {title.split(' ')[1] && (
            <span className={`font-semibold tracking-wider text-xs px-1.5 py-0.5 rounded ${
              isDark 
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                : "bg-blue-600 text-white"
            }`}>
              {title.split(' ')[1]}
            </span>
          )}
        </div>

        {showSubtitle && (
          <span className={`font-mono font-medium tracking-widest uppercase ${currentSize.sub} ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default CyberLogo;
