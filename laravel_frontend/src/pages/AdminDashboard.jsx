import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, ShoppingCart, DollarSign, Users, 
  AlertTriangle, TrendingUp, Activity, BarChart3,
  Clock, CheckCircle, XCircle, Archive
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

function AdminDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMedicines: 0,
    activeMedicines: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    completedToday: 0,
    totalSalesToday: 0,
    transactionsToday: 0
  });
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date range filters for charts
  const [salesDateRange, setSalesDateRange] = useState('week'); // 'today', 'week', 'month', 'year', 'custom'
  const [stockDateRange, setStockDateRange] = useState('today');
  const [salesCustomStart, setSalesCustomStart] = useState('');
  const [salesCustomEnd, setSalesCustomEnd] = useState('');
  const [stockCustomStart, setStockCustomStart] = useState('');
  const [stockCustomEnd, setStockCustomEnd] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch medicines
      const medicinesResponse = await api.getMedicines();
      const medicinesData = medicinesResponse.data || [];
      setMedicines(medicinesData);

      // Fetch orders
      const ordersResponse = await api.request('/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ordersData = ordersResponse.data || [];
      setOrders(ordersData);

      // Calculate today's date
      const today = new Date().toDateString();

      // Calculate comprehensive stats
      const completedToday = ordersData.filter(o => {
        return o.status === 'completed' && 
               new Date(o.updated_at).toDateString() === today;
      });

      const totalSalesToday = completedToday.reduce((sum, order) => {
        return sum + parseFloat(order.total_amount || 0);
      }, 0);

      setStats({
        totalMedicines: medicinesData.length,
        activeMedicines: medicinesData.filter(m => m.is_active !== false).length,
        lowStockCount: medicinesData.filter(m => m.stock_quantity > 0 && m.stock_quantity < 50).length,
        outOfStockCount: medicinesData.filter(m => m.stock_quantity === 0).length,
        totalOrders: ordersData.length,
        pendingOrders: ordersData.filter(o => o.status === 'pending').length,
        confirmedOrders: ordersData.filter(o => o.status === 'confirmed').length,
        completedToday: completedToday.length,
        totalSalesToday: totalSalesToday,
        transactionsToday: completedToday.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Helper function to get date range
  const getDateRange = (rangeType, customStart, customEnd) => {
    const now = new Date();
    let startDate, endDate = now;
    
    switch(rangeType) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        if (customStart && customEnd) {
          startDate = new Date(customStart);
          endDate = new Date(customEnd);
        } else {
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
        }
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }
    
    return { startDate, endDate };
  };

  // Get sales data based on date range
  const getSalesChartData = () => {
    const { startDate, endDate } = getDateRange(salesDateRange, salesCustomStart, salesCustomEnd);
    const salesData = [];
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = orders.filter(o => 
        o.status === 'completed' && 
        new Date(o.created_at).toISOString().split('T')[0] === dateStr
      );
      const sales = dayOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      salesData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: sales,
        orders: dayOrders.length
      });
    }
    
    return salesData;
  };

  const statCards = [
    {
      title: 'Active Medicines',
      value: stats.activeMedicines,
      total: stats.totalMedicines,
      icon: Package,
      color: 'text-primary-600',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100',
      borderColor: 'border-primary-200',
      gradient: 'from-primary-500 to-primary-700'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockCount,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      gradient: 'from-orange-500 to-orange-700'
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStockCount,
      icon: Archive,
      color: 'text-red-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      borderColor: 'border-red-200',
      gradient: 'from-red-500 to-red-700'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      total: stats.totalOrders,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
      borderColor: 'border-amber-200',
      gradient: 'from-amber-500 to-amber-700'
    },
    {
      title: 'Confirmed Orders',
      value: stats.confirmedOrders,
      icon: CheckCircle,
      color: 'text-accent-600',
      bgColor: 'bg-gradient-to-br from-accent-50 to-accent-100',
      borderColor: 'border-accent-200',
      gradient: 'from-accent-500 to-accent-700'
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      icon: Activity,
      color: 'text-secondary-600',
      bgColor: 'bg-gradient-to-br from-secondary-50 to-secondary-100',
      borderColor: 'border-secondary-200',
      gradient: 'from-secondary-500 to-secondary-700'
    },
    {
      title: 'Sales Today',
      value: `₱${stats.totalSalesToday.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-200',
      gradient: 'from-emerald-500 to-emerald-700'
    },
    {
      title: 'Transactions Today',
      value: stats.transactionsToday,
      icon: BarChart3,
      color: 'text-cyan-600',
      bgColor: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
      borderColor: 'border-cyan-200',
      gradient: 'from-cyan-500 to-cyan-700'
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header - Medipulse Style */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent mb-1">Dashboard Overview</h1>
            <p className="text-gray-600 font-medium">Complete pharmacy system overview and statistics</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white px-4 py-2 rounded-xl border-2 border-black shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Today</p>
              <p className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid - Medipulse Style Compact - 4 cards per row, 2 rows */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.slice(0, 4).map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="group relative bg-white rounded-xl border-2 border-black p-4 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${stat.bgColor} p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    {stat.total && (
                      <p className="text-[10px] text-gray-400 font-medium">of {stat.total}</p>
                    )}
                  </div>
                  <h3 className="text-gray-500 text-[10px] font-semibold mb-1.5 uppercase tracking-wide">{stat.title}</h3>
                  <p className={`text-2xl font-bold ${stat.color} group-hover:scale-105 transition-transform duration-300`}>{stat.value}</p>
                </div>
                
                {/* Bottom Accent Line */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.slice(4, 8).map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index + 4} className="group relative bg-white rounded-xl border-2 border-black p-4 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${stat.bgColor} p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    {stat.total && (
                      <p className="text-[10px] text-gray-400 font-medium">of {stat.total}</p>
                    )}
                  </div>
                  <h3 className="text-gray-500 text-[10px] font-semibold mb-1.5 uppercase tracking-wide">{stat.title}</h3>
                  <p className={`text-2xl font-bold ${stat.color} group-hover:scale-105 transition-transform duration-300`}>{stat.value}</p>
                </div>
                
                {/* Bottom Accent Line */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions - Medipulse Style */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/medicines')}
              className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30 p-6 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 text-left group hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="bg-white/20 backdrop-blur-sm w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <Package className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Medicines</h3>
                <p className="text-white/90 text-sm font-medium">Manage medicine catalog</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/transactions')}
              className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl shadow-lg shadow-accent-500/30 p-6 hover:shadow-xl hover:shadow-accent-500/40 transition-all duration-300 text-left group hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="bg-white/20 backdrop-blur-sm w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <ShoppingCart className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Transactions</h3>
                <p className="text-white/90 text-sm font-medium">View all transactions</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/staff')}
              className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl shadow-lg shadow-secondary-500/30 p-6 hover:shadow-xl hover:shadow-secondary-500/40 transition-all duration-300 text-left group hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="bg-white/20 backdrop-blur-sm w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Staff</h3>
                <p className="text-white/90 text-sm font-medium">Manage staff accounts</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/reports')}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/30 p-6 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 text-left group hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="bg-white/20 backdrop-blur-sm w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Reports</h3>
                <p className="text-white/90 text-sm font-medium">Sales & analytics</p>
              </div>
            </button>
          </div>
        </div>

        {/* Low Stock Alert - Medipulse Style */}
        <div className="bg-white rounded-2xl shadow-soft border-2 border-black p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Low Stock Alert</h3>
                <p className="text-sm text-gray-500">Items below 50 units</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {medicines
              .filter(m => m.stock_quantity < 50 && m.stock_quantity > 0)
              .slice(0, 8)
              .map(medicine => (
                <div key={medicine.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors duration-200 border-2 border-black hover:border-orange-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white p-2 rounded-lg border-2 border-black">
                      <Package className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{medicine.name}</p>
                      <p className="text-xs text-gray-500">{medicine.medicine_code}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      medicine.stock_quantity <= 10 
                        ? 'bg-red-100 text-red-700' 
                        : medicine.stock_quantity <= 25 
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {medicine.stock_quantity} left
                    </span>
                  </div>
                </div>
              ))}
            {medicines.filter(m => m.stock_quantity < 50 && m.stock_quantity > 0).length === 0 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-50 to-accent-100 rounded-full mb-3">
                  <CheckCircle className="h-8 w-8 text-accent-600" />
                </div>
                <p className="text-gray-600 font-medium">All medicines are well stocked!</p>
                <p className="text-sm text-gray-500 mt-1">No items below 50 units</p>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6">
          {/* Sales Trend Chart */}
          <div className="bg-white rounded-2xl shadow-soft border-2 border-black p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Sales Trend</h3>
                <p className="text-sm text-gray-500">Sales overview</p>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={salesDateRange}
                  onChange={(e) => setSalesDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                  <option value="custom">Custom Range</option>
                </select>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-2.5 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                </div>
              </div>
            </div>
            
            {/* Custom Date Range Inputs */}
            {salesDateRange === 'custom' && (
              <div className="mb-4 flex items-center space-x-3">
                <input
                  type="date"
                  value={salesCustomStart}
                  onChange={(e) => setSalesCustomStart(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  placeholder="Start Date"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={salesCustomEnd}
                  onChange={(e) => setSalesCustomEnd(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  placeholder="End Date"
                />
              </div>
            )}
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getSalesChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value, name) => name === 'sales' ? [`₱${value.toFixed(2)}`, 'Sales'] : [value, 'Orders']}
                />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#14b8a6" strokeWidth={3} dot={{ fill: '#14b8a6', r: 5 }} name="Sales (₱)" />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Distribution Chart */}
        <div className="bg-white rounded-2xl shadow-soft border-2 border-black p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Stock Distribution by Category</h3>
              <p className="text-sm text-gray-500">Current inventory levels</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={stockDateRange}
                onChange={(e) => setStockDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
              <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-2.5 rounded-xl">
                <Package className="h-5 w-5 text-accent-600" />
              </div>
            </div>
          </div>
          
          {/* Custom Date Range Inputs */}
          {stockDateRange === 'custom' && (
            <div className="mb-4 flex items-center space-x-3">
              <input
                type="date"
                value={stockCustomStart}
                onChange={(e) => setStockCustomStart(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                placeholder="Start Date"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={stockCustomEnd}
                onChange={(e) => setStockCustomEnd(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                placeholder="End Date"
              />
            </div>
          )}
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(() => {
              const categories = [...new Set(medicines.map(m => m.category))];
              return categories.map(cat => {
                const categoryMeds = medicines.filter(m => m.category === cat);
                return {
                  category: cat,
                  'Good Stock': categoryMeds.filter(m => m.stock_quantity >= 50).length,
                  'Low Stock': categoryMeds.filter(m => m.stock_quantity > 0 && m.stock_quantity < 50).length,
                  'Out of Stock': categoryMeds.filter(m => m.stock_quantity === 0).length
                };
              });
            })()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="Good Stock" fill="#22c55e" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Low Stock" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Out of Stock" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;

