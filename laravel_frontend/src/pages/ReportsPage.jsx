import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ArrowLeft, TrendingUp, Package, ShoppingCart, DollarSign } from 'lucide-react';

function ReportsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-6 w-6 text-primary-700" />
                <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reports Coming Soon</h2>
          <p className="text-gray-600 mb-8">
            Advanced analytics and reporting features will be implemented in the next phase.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="border border-gray-200 rounded-lg p-4">
              <TrendingUp className="h-8 w-8 text-primary-700 mb-2" />
              <h3 className="font-bold text-gray-900 mb-1">Sales Reports</h3>
              <p className="text-sm text-gray-600">Daily, weekly, and monthly sales analysis</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <Package className="h-8 w-8 text-primary-700 mb-2" />
              <h3 className="font-bold text-gray-900 mb-1">Inventory Reports</h3>
              <p className="text-sm text-gray-600">Stock levels, movements, and alerts</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <ShoppingCart className="h-8 w-8 text-primary-700 mb-2" />
              <h3 className="font-bold text-gray-900 mb-1">Order Analytics</h3>
              <p className="text-sm text-gray-600">Order trends and performance metrics</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ReportsPage;
