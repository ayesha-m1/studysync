import { useEffect, useState } from 'react';

export default function ProgressBar({ value, showLabel = true, size = 'md', animated = true }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated]);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const getColor = (val) => {
    if (val >= 80) return 'from-green-400 to-emerald-500';
    if (val >= 50) return 'from-blue-400 to-cyan-500';
    if (val >= 30) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm font-bold text-gray-900">{Math.round(displayValue)}%</span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]} relative`}>
        {/* Background shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer" />
        
        {/* Progress fill */}
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getColor(displayValue)} transition-all duration-1000 ease-out relative overflow-hidden`}
          style={{ width: `${displayValue}%` }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine" />
          
          {/* Pulse effect for high values */}
          {displayValue >= 80 && (
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          )}
        </div>
      </div>

      {/* Milestone markers */}
      {size === 'lg' && (
        <div className="flex justify-between mt-1 px-0.5">
          {[0, 25, 50, 75, 100].map((milestone) => (
            <div
              key={milestone}
              className={`w-0.5 h-2 rounded transition-all duration-300 ${
                displayValue >= milestone 
                  ? 'bg-gradient-to-b ' + getColor(displayValue) 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shine {
          animation: shine 2s infinite;
        }
        
        .shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}