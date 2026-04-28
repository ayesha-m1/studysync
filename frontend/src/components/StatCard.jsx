import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'blue',
  index = 0 
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Animate number counting
    const numericValue = typeof value === 'number' ? value : parseInt(value) || 0;
    let current = 0;
    const increment = numericValue / 30;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, 30);

    return () => clearInterval(timer);
  }, [value]);

  const colorSchemes = {
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      icon: 'bg-blue-100 text-blue-600',
      glow: 'shadow-blue-500/20',
    },
    green: {
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      icon: 'bg-green-100 text-green-600',
      glow: 'shadow-green-500/20',
    },
    purple: {
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      icon: 'bg-purple-100 text-purple-600',
      glow: 'shadow-purple-500/20',
    },
    orange: {
      gradient: 'from-orange-500 to-red-500',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200',
      icon: 'bg-orange-100 text-orange-600',
      glow: 'shadow-orange-500/20',
    },
  };

  const scheme = colorSchemes[color];

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 bg-green-100';
    if (trend === 'down') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div
      className={`relative bg-white rounded-2xl p-6 transition-all duration-500 cursor-pointer overflow-hidden group border ${scheme.border} ${
        isHovered ? `shadow-2xl ${scheme.glow} scale-105` : 'shadow-lg hover:shadow-xl'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
      }}
    >
      {/* Background Gradient Effect */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${scheme.gradient} opacity-5 rounded-full blur-3xl transition-all duration-500 ${
        isHovered ? 'scale-150 opacity-10' : ''
      }`} />

      {/* Decorative corner accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${scheme.gradient} opacity-10 rounded-bl-full`} />

      <div className="relative z-10">
        {/* Header with Icon */}
        <div className="flex items-start justify-between mb-4">
          {Icon && (
            <div className={`p-3 rounded-xl ${scheme.icon} transition-transform duration-300 ${
              isHovered ? 'scale-110 rotate-6' : ''
            }`}>
              <Icon className="w-6 h-6" />
            </div>
          )}
          
          {/* Trend Indicator */}
          {trend && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${getTrendColor()}`}>
              {getTrendIcon()}
              {trendValue && <span>{trendValue}</span>}
            </div>
          )}
        </div>

        {/* Label */}
        <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>

        {/* Value */}
        <div className="flex items-end space-x-2">
          <h3 className={`text-4xl font-bold ${scheme.text} transition-all duration-300 ${
            isHovered ? 'scale-110' : ''
          }`}>
            {typeof value === 'number' ? displayValue : value}
          </h3>
        </div>

        {/* Progress bar at bottom */}
        <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${scheme.gradient} transition-all duration-1000 ease-out`}
            style={{ 
              width: `${isHovered ? '100%' : '70%'}`,
              animation: 'expandWidth 1s ease-out forwards'
            }}
          />
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${scheme.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes expandWidth {
          from {
            width: 0%;
          }
          to {
            width: 70%;
          }
        }
      `}</style>
    </div>
  );
}