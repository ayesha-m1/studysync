
import { useState, useEffect } from 'react';
import { Award, Star } from 'lucide-react';
import api from '../../utils/api';

export default function LevelProgress() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/gamification/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
  <div className="bg-gradient-to-r from-slate-700 to-gray-800 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Award className="w-6 h-6" />
          <h3 className="text-lg font-bold">Level {stats.level}</h3>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-300" />
          <span className="font-semibold">{stats.xp} XP</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress to Level {stats.level + 1}</span>
          <span>{Math.round(stats.xpProgress)}%</span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-yellow-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.xpProgress}%` }}
          />
        </div>
      </div>

      <div className="text-xs text-white/80">
        {stats.xpNeeded} XP needed for next level
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/20">
        <div>
          <div className="text-xs text-white/70">Current Streak</div>
          <div className="text-lg font-bold">{stats.currentStreak} days</div>
        </div>
        <div>
          <div className="text-xs text-white/70">Longest Streak</div>
          <div className="text-lg font-bold">{stats.longestStreak} days</div>
        </div>
      </div>
    </div>
  );
}