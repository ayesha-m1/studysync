
import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function XPPopup({ xp, reason, onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onComplete(), 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-2xl p-4 flex items-center space-x-3">
        <div className="bg-white/20 rounded-full p-2">
          <Sparkles className="w-6 h-6 text-yellow-300" />
        </div>
        <div>
          <div className="text-white font-bold text-lg">+{xp} XP</div>
          <div className="text-white/90 text-sm">{reason}</div>
        </div>
        <TrendingUp className="w-5 h-5 text-white/70 animate-bounce" />
      </div>
    </div>
  );
}