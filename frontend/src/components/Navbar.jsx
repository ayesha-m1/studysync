import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, Menu, X, Moon, Sun, LogOut, Settings } from 'lucide-react';
import api from '../utils/api';
import { logout } from '../utils/auth';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTasks, setActiveTasks] = useState(0);
  const [showNotificationTooltip, setShowNotificationTooltip] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
 

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    fetchActiveTasks();
    const interval = setInterval(fetchActiveTasks, 10000);

    // Close user menu when clicking outside
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const fetchActiveTasks = async () => {
    try {
      const response = await api.get('/tasks');
      const activeCount = response.data.data.tasks.filter(task => !task.isCompleted).length;
      setActiveTasks(activeCount);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };


  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg dark:bg-gray-900/95' 
          : 'bg-gradient-to-b from-gray-900 to-gray-800'
      }`}
      style={{
        animation: 'slideDown 0.5s ease-out'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className={`w-20 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                scrolled 
                  ? 'bg-gradient-to-br from-indigo-600 to-gray-600 text-white' 
                  : 'bg-white/20 text-white backdrop-blur-sm'
              } group-hover:scale-110`}>
                <img src="/logo.png" alt="StudySync Logo" className='rounded' />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
            <span className={`text-xl font-bold transition-colors duration-300 ${
              scrolled ? 'text-gray-900 dark:text-white' : 'text-white'
            }`}>
              StudySync
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications with Tooltip */}
            <div className="relative group">
              <button 
                onMouseEnter={() => setShowNotificationTooltip(true)}
                onMouseLeave={() => setShowNotificationTooltip(false)}
                className="relative"
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  scrolled 
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-800' 
                    : 'hover:bg-white/20'
                }`}>
                  <Bell className={`w-5 h-5 transition-colors ${
                    scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
                  }`} />
                  {activeTasks > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce font-bold">
                      {activeTasks > 9 ? '9+' : activeTasks}
                    </span>
                  )}
                </div>
              </button>

              {/* Tooltip */}
              {showNotificationTooltip && activeTasks > 0 && (
                <div className="absolute right-0 mt-2 bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap z-50">
                  You have {activeTasks} active {activeTasks === 1 ? 'task' : 'tasks'}
                  <div className="absolute bottom-full right-0 w-2 h-2 bg-gray-900 transform rotate-45 -mb-1"></div>
                </div>
              )}

              {showNotificationTooltip && activeTasks === 0 && (
                <div className="absolute right-0 mt-2 bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap z-50">
                  All tasks completed! 🎉
                  <div className="absolute bottom-full right-0 w-2 h-2 bg-gray-900 transform rotate-45 -mb-1"></div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative user-menu">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 ${
                  scrolled 
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-800' 
                    : 'hover:bg-white/20'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  scrolled 
                    ? 'bg-gradient-to-br from-indigo-600 to-blue-600' 
                    : 'bg-white/20'
                }`}>
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                 
                  {/* Divider */}
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>

                  {/* Settings */}
                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Settings</span>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors border-t border-gray-200 dark:border-gray-700"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </nav>
  );
}