import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, FileText, BarChart3, 
  Users, User, LogOut, Pill
} from 'lucide-react';

function AdminSidebar({ onLogout }) {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard Overview', path: '/admin/dashboard' },
    { icon: Package, label: 'Medicine Management', path: '/admin/medicines' },
    { icon: FileText, label: 'Transactions', path: '/admin/transactions' },
    { icon: BarChart3, label: 'Reports & Analytics', path: '/admin/reports' },
    { icon: Users, label: 'Staff Accounts', path: '/admin/staff' },
    { icon: Package, label: 'Barcode Generator', path: '/admin/barcodes' },
    { icon: User, label: 'Settings', path: '/admin/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-2xl shadow-lg shadow-primary-500/30 ring-4 ring-primary-100">
            <Pill className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">MediKiosk</h1>
            <p className="text-xs text-gray-500 font-semibold">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={index}
              to={item.path}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-left group relative overflow-hidden ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
              }`}
            >
              {/* Active Indicator */}
              {isActive(item.path) && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
              )}
              
              <Icon className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ${
                isActive(item.path) ? 'drop-shadow-sm' : 'group-hover:scale-110'
              }`} />
              <span className="text-sm font-semibold">{item.label}</span>
              
              {/* Hover Glow Effect */}
              {!isActive(item.path) && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group relative overflow-hidden"
        >
          <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;
