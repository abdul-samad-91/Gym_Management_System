import { useState } from 'react';
import { Save, User, Lock, Bell, Database } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/auth/users/${user.id}`, profileData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="card lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="card lg:col-span-3">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, fullName: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Role</label>
                  <input
                    type="text"
                    value={user?.role}
                    className="input"
                    disabled
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
              <form className="space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <input type="password" className="input" />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input type="password" className="input" />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input type="password" className="input" />
                </div>
                <button type="submit" className="btn btn-primary">
                  <Lock className="w-5 h-5 mr-2" />
                  Update Password
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <div>
                    <p className="font-medium text-gray-900">Membership Expiry Alerts</p>
                    <p className="text-sm text-gray-600">
                      Get notified when memberships are about to expire
                    </p>
                  </div>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <div>
                    <p className="font-medium text-gray-900">New Member Registration</p>
                    <p className="text-sm text-gray-600">
                      Receive notifications for new member registrations
                    </p>
                  </div>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" />
                  <div>
                    <p className="font-medium text-gray-900">Payment Reminders</p>
                    <p className="text-sm text-gray-600">
                      Send reminders for pending payments
                    </p>
                  </div>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <div>
                    <p className="font-medium text-gray-900">Daily Attendance Summary</p>
                    <p className="text-sm text-gray-600">
                      Receive daily attendance reports
                    </p>
                  </div>
                </label>
                <button type="button" className="btn btn-primary">
                  <Save className="w-5 h-5 mr-2" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Offline Mode</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Enable offline mode to continue working without internet connection
                  </p>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">Enable offline mode</span>
                  </label>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Data Sync</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Automatically sync data when internet connection is available
                  </p>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">Auto-sync</span>
                  </label>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Biometric Integration</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Configure biometric device settings
                  </p>
                  <button className="btn btn-secondary">Configure Devices</button>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Database Backup</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Backup and restore your database
                  </p>
                  <div className="flex space-x-2">
                    <button className="btn btn-secondary">Backup Now</button>
                    <button className="btn btn-secondary">Restore</button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">System Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version</span>
                      <span className="font-medium text-gray-900">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Backup</span>
                      <span className="font-medium text-gray-900">Never</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Storage Used</span>
                      <span className="font-medium text-gray-900">24.5 MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

