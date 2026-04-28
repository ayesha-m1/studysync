
import { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import api from '../../utils/api';

export default function BadgeCollection() {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await api.get('/gamification/badges');
      console.log('Badges API response:', response.data);
      const badgesData = response.data.data?.badges || response.data.badges || [];
      setBadges(badgesData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (badges.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Award className="w-5 h-5 text-yellow-500" />
          <span>Your Badges</span>
        </h2>
        <p className="text-gray-500 text-center py-4">No badges earned yet. Keep studying!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
        <Award className="w-5 h-5 text-yellow-500" />
        <span>Your Badges ({badges.length})</span>
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {badges.map((badge) => (
          <div key={badge.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 text-center border border-yellow-200">
            <div className="text-3xl mb-1">{badge.badge_icon || '🏆'}</div>
            <div className="font-semibold text-gray-900 text-sm">{badge.name}</div>
            <div className="text-xs text-gray-500">{badge.description}</div>
            {badge.earned_at && (
              <div className="text-xs text-green-600 mt-1">
                {new Date(badge.earned_at).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}