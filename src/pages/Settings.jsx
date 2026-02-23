import { useState } from 'react';
import { Save, User, Lock, Bell, Database, ToggleRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import api from '../utils/api';
// import { Switch } from "@/components/ui/switch"
import CustomSwitch  from '../components/CustomSwitch.jsx';

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
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6  ">
        {/* Sidebar */}
        <div className="card1 col-span-full bg-gray-200  rounded-full">
          <nav className="grid grid-cols-2 sm:grid-cols-4 gap-3 ">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-4 py-4 rounded-full transition-colors ${activeTab === tab.id
                  ? 'bg-white text-black font-medium shadow-sm'
                  : 'bg-transparent text-black hover:bg-gray-100'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-sm font-medium text-center ">
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>
        </div>


        {/* Content */}
        <div className="card lg:col-span-full">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 ">Profile Information</h2>
              <p className='text-sm text-gray-500 mb-4'>Update your personal details</p>
              <hr />
              <form onSubmit={handleProfileUpdate} className="space-y-4 mt-4">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, fullName: e.target.value })
                    }
                    className="input bg-gray-200"
                  />
                </div>
                <div>
                  <label className="label">Email Adress </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="input bg-gray-200"
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="input bg-gray-200"
                  />
                </div>
                <div>
                  <label className="label">Role</label>
                  <input
                    type="text"
                    value={user?.role}
                    className="input bg-gray-200"
                    disabled
                  />
                </div>
                <div className='flex items-center justify-end gap-3'>
                  <button className='border border-gray-200 bg-gray-300 py-2 px-5 cursor-pointer rounded-md text-lg font-medium hover:bg-gray-400 '>
                    cancel
                  </button>
                  <button type="submit" className="btn btn-primary flex gap-3">
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-lg font-normal text-gray-900 ">Change Password</h2>
              <p className='mb-4 text-gray-500'>Update your password regularly for security</p>
              <hr />
              <form className="space-y-4 mt-5">
                <div>
                  <label className="label">Current Password</label>
                  <input type="password" className="input bg-gray-200" />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input type="password" className="input bg-gray-200" />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input type="password" className="input bg-gray-200" />
                </div>
                <hr />
                <div className='flex justify-end items-center gap-3'>
                  <button className='border border-gray-200 bg-gray-300 py-2 px-5 cursor-pointer rounded-md text-lg font-medium hover:bg-gray-400 '>
                    cancel
                  </button>
                  <button type="submit" className="btn btn-primary flex gap-3 ">
                    <Lock className="w-5 h-5 mr-2" />
                    Update Password
                  </button>
                </div>
              </form>

            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-lg font-normal text-gray-900 ">
                Email Notifications
              </h2>
              <p className='mb-4 text-gray-500 text-sm'>Choose what updates you want to receive</p>
              <hr />

              <div className="space-y-4 mt-4 ">

                <div className='flex items center justify-between'>
                  <div>
                    <p className="font-normal text-gray-900 text-lg">New Member Registration</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Get notified when new  members join
                    </p>
                  </div>
                  <div>
                 <CustomSwitch />
                  </div>
                </div>
                <hr />



                <div className='flex items center justify-between'>
                  <div>
                    <p className="font-normal text-gray-900 text-lg">Payment Notification</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Alerts for successful and failed payments
                    </p>
                  </div>
                  <div>
                      <CustomSwitch />
                  </div>
                </div>
                <hr />
                <div className='flex items center justify-between'>
                  <div>
                    <p className="font-normal text-gray-900 text-lg">Member Expiry Alerts </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Notifications for expiring memberships
                    </p>
                  </div>
                  <div>
                     <CustomSwitch />
                  </div>
                </div>
                <hr />
                <div className='flex items center justify-between '>
                  <div>
                    <p className="font-normal text-gray-900 text-lg">Weekly Reports </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Receive weekly analytics and insights
                    </p>
                  </div>
                  <div>
                    <CustomSwitch />
                  </div>
                </div>

                <hr />

                <div className='flex items center justify-between'>
                  <div>
                    <p className="font-normal text-gray-900 text-lg">System Updates </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Important system and feature updates
                    </p>
                  </div>
                  <div>
                   <CustomSwitch />
                  </div>
                </div>

                {/* <label className="flex items-center space-x-3">
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
                </label> */}
                {/* <button type="button" className="btn btn-primary">
                  <Save className="w-5 h-5 mr-2" />
                  Save Preferences
                </button> */}
              </div>

            </div>
          )}

          {/* {activeTab === 'system' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gym Information</h2>
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
          )} */}

          {activeTab === 'system' && (
            <div className='py-3'>
              <h3 className='font-normal'>Gym Information</h3>
              <p className='text-gray-500 mt-1 mb-4'>Basic details about your gym</p>
              <hr />

              <form className='mt-7'>
                <div>
                  <label className="label">Gym Name</label>
                  <input
                    type="text"
                    className="input bg-gray-200"
                  />
                </div>
                <div className='mt-4'>
                  <label className="label">Address </label>
                  <input
                    type="text"
                    className="input bg-gray-200"
                  />
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='mt-4'>
                    <label className="label">Phone </label>
                    <input
                      type="text"
                      className="input bg-gray-200"
                    />
                  </div>
                  <div className='mt-4'>
                    <label className="label">Email </label>
                    <input
                      type="text"
                      className="input bg-gray-200"
                    />

                  </div>
                </div>
                <hr className='mt-6' />
                <div className='flex items-center justify-end gap-3  mt-6 '>
                  <button className='border border-gray-200 bg-gray-300 py-2 px-5 cursor-pointer rounded-md text-lg font-medium hover:bg-gray-400 '>
                    cancel
                  </button>
                  <button type="submit" className="btn btn-primary flex gap-3">
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </button>
                </div>

              </form>


            </div>
          )}

        </div>
      </div>
    </div>
  );
}

