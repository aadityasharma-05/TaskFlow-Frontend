import React from 'react';
import { X, User, Bell, Shield, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState('profile');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-center items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl flex flex-col md:flex-row overflow-hidden m-4 max-h-[90vh]">
        
        {/* Settings Sidebar */}
        <div className="w-full md:w-48 bg-gray-50 border-r border-gray-100 p-4 flex-shrink-0">
          <h2 className="text-sm font-bold text-gray-900 mb-4 px-2">Settings</h2>
          <nav className="space-y-1">
            {[
              { id: 'profile', icon: User, label: 'Profile' },
              { id: 'preferences', icon: Palette, label: 'Preferences' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'security', icon: Shield, label: 'Security' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                }`}
              >
                <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-[500px] md:h-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 capitalize">{activeTab}</h3>
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <button className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-700 rounded hover:bg-gray-50 transition-colors shadow-sm">
                      Upload new picture
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    disabled
                    defaultValue={user?.email}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">Your email address cannot be changed right now.</p>
                </div>
              </div>
            )}

            {activeTab !== 'profile' && (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                <Palette className="w-8 h-8 mb-2 text-gray-300" />
                <p className="text-sm font-medium">This section is currently under construction.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {activeTab === 'profile' && (
            <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors mr-2"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors shadow-sm"
                onClick={() => alert("Profile updated (Demo only)")}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
