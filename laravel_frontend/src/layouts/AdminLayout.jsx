import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { Bell, Settings, LogOut, AlertCircle, User, ChevronDown } from 'lucide-react';

function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogoutClick = () => {
    setShowProfileDropdown(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/admin/settings');
    setShowProfileDropdown(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar onLogout={handleLogoutClick} />

      {/* Main Content - Add left margin to account for fixed sidebar */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">Administrator</h2>
                <p className="text-sm text-gray-600 font-medium">Manage your pharmacy system</p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl relative transition-all duration-200 hover:scale-105">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>

                {/* User Info - With Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-3 px-4 py-2.5 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 hover:from-primary-100 hover:to-primary-200 hover:border-primary-300 transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer"
                  >
                    <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-md shadow-primary-500/30">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-primary-600 capitalize font-medium">{user?.role}</p>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileDropdown && (
                    <>
                      {/* Backdrop to close dropdown when clicking outside */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowProfileDropdown(false)}
                      ></div>
                      
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                        <button
                          onClick={handleProfileClick}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="h-4 w-4 mr-3 text-gray-500" />
                          <span className="font-medium">View Profile</span>
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={handleLogoutClick}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-4">
                <LogOut className="h-8 w-8 text-orange-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Logout Confirmation</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to logout? Any unsaved changes will be lost.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl font-semibold transition-all shadow-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLayout;
