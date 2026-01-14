import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 max-w-2xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search members, trainers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4 ml-4">
          {/* Online/Offline Status */}
          {/* <div className="flex items-center space-x-2">
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-orange-600">Offline</span>
              </>
            )}
          </div> */}

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-[-2px] right-1 w-5 h-5 bg-[#FB2C36] rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative border-l-4">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/settings');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

