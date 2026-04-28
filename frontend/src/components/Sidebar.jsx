import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BarChart3, Settings, LogOut, BookOpen, FileText } from 'lucide-react';
import { useState } from "react";
import { logout } from "../utils/auth";

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
     { path: "/notes", icon: FileText, label: "My Notes" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
  ];

 

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen p-4 transition-all duration-300 flex flex-col shadow-2xl`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mt-16 mb-8 p-4 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all duration-300 self-end"
      >
        <div className={`w-5 h-0.5 bg-white rounded ${collapsed ? "" : "rotate-45"}`} />
        <div className={`w-5 h-0.5 bg-white rounded my-1 ${collapsed ? "" : "opacity-0"}`} />
        <div className={`w-5 h-0.5 bg-white rounded ${collapsed ? "" : "-rotate-45 -mt-1.5"}`} />
      </button>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item, index) => (
          <MenuItem
            key={item.path}
            item={item}
            isActive={location.pathname === item.path}
            collapsed={collapsed}
            index={index}
          />
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="space-y-2 pt-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-red-400 hover:bg-red-500/10 hover:text-red-300 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Decorative Card */}
      {!collapsed && (
        <div className="mt-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <p className="text-xs font-semibold text-indigo-400">Study Tip</p>
          </div>
          <p className="text-xs text-gray-300">
            Take a 5-minute break every 25 minutes for better focus.
          </p>
        </div>
      )}
    </div>
  );
}

function MenuItem({ item, isActive, collapsed, index }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        collapsed ? "justify-center" : ""
      } ${
        isActive
          ? "bg-indigo-600 text-white shadow-md"
          : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
      }`}
      style={{
        animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
      }}
    >
      <Icon className="w-5 h-5" />

      {!collapsed && (
        <span className="font-medium">
          {item.label}
        </span>
      )}

      {/* Tooltip */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
          {item.label}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Link>
  );
}