import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  TrendingUp, Calendar, DollarSign, ShoppingCart, Download,
  ArrowUp, Filter, Package, AlertTriangle, TrendingDown, BarChart3,
  Clock, CheckCircle
} from 'lucide-react';
import api from '../services/api';

function AdminReports() {
  const [activeTab, setActiveTab] = useState('sales'); // 'sales' or 'inventory'
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, medicinesRes, movementsRes] = await Promise.all([
        api.request('/orders'),
        api.request('/medicines'),
        api.request('/stock-movements')
      ]);
      
      setOrders(ordersRes.data || []);
      setMedicines(medicinesRes.data || []);
      setStockMovements(movementsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sales Report Functions
  const getFilteredOrders = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      
      switch(dateRange) {
        case 'today':
          return orderDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return orderDate >= monthAgo;
        case 'custom':
          if (startDate && endDate) {
            return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
          }
          return true;
        default:
          return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();
  const completedOrders = filteredOrders.filter(o => o.status === 'completed');
  
  const totalRevenue = completedOrders.reduce((sum, order) => 
    sum + parseFloat(order.total_amount), 0
  );
  
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / completedOrders.length : 0;

  const topSellingItems = {};
  completedOrders.forEach(order => {
    if (order.items) {
      order.items.forEach(item => {
        if (!topSellingItems[item.medicine_name]) {
          topSellingItems[item.medicine_name] = {
            name: item.medicine_name,
            quantity: 0,
            revenue: 0
          };
        }
        topSellingItems[item.medicine_name].quantity += item.quantity;
        topSellingItems[item.medicine_name].revenue += parseFloat(item.subtotal);
      });
    }
  });

  const topSellingArray = Object.values(topSellingItems)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Inventory Report Functions
  const totalMedicines = medicines.length;
  const outOfStock = medicines.filter(m => m.stock_quantity === 0).length;
  const lowStock = medicines.filter(m => m.stock_quantity > 0 && m.stock_quantity < 50).length;
  const goodStock = medicines.filter(m => m.stock_quantity >= 50).length;

  const totalStockValue = medicines.reduce((sum, med) => 
    sum + (parseFloat(med.price) * med.stock_quantity), 0
  );

  const expiringSoon = medicines.filter(med => {
    if (!med.expiry_date) return false;
    const expiryDate = new Date(med.expiry_date);
    const today = new Date();
    const daysUntilExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry > 0 && daysUntilExpiry <= 90;
  });

  // Export Functions
  const exportSalesToCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer', 'Status', 'Amount'];
    const rows = filteredOrders.map(order => [
      order.order_number,
      new Date(order.created_at).toLocaleDateString(),
      order.customer_name,
      order.status,
      order.total_amount
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportInventoryToCSV = () => {
    const headers = ['Code', 'Name', 'Category', 'Stock', 'Price', 'Value', 'Status', 'Expiry'];
    const rows = medicines.map(med => [
      med.medicine_code,
      med.name,
      med.category,
      med.stock_quantity,
      med.price,
      (parseFloat(med.price) * med.stock_quantity).toFixed(2),
      med.stock_quantity === 0 ? 'Out of Stock' : 
        med.stock_quantity < 50 ? 'Low Stock' : 'Good Stock',
      med.expiry_date || 'N/A'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header - Medipulse Style */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent mb-1">
              Reports & Analytics
            </h1>
            <p className="text-gray-600 font-medium">Sales and inventory analytics dashboard</p>
          </div>
          <button
            onClick={activeTab === 'sales' ? exportSalesToCSV : exportInventoryToCSV}
            className="flex items-center px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Tabs - Medipulse Style */}
        <div className="bg-white rounded-2xl border-2 border-black p-2 shadow-sm">
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'sales'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Sales Reports
              </div>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'inventory'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center">
                <Package className="h-5 w-5 mr-2" />
                Inventory Reports
              </div>
            </button>
          </nav>
        </div>

        {/* Sales Tab Content */}
        {activeTab === 'sales' && (
          <>
            {/* Statistics Cards - Medipulse Style Compact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-xl shadow-soft border-2 border-black p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-6 w-6 text-accent-600" />
                  </div>
                  <span className="flex items-center text-xs font-semibold text-accent-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Revenue
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-accent-600 mb-2">
                  ₱{totalRevenue.toFixed(2)}
                </h3>
                <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
              </div>

              <div className="bg-white rounded-xl shadow-soft border-2 border-black p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="h-6 w-6 text-secondary-600" />
                  </div>
                  <span className="flex items-center text-xs font-semibold text-secondary-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Orders
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-secondary-600 mb-2">{totalOrders}</h3>
                <p className="text-sm text-gray-600 font-medium">Total Orders</p>
              </div>

              <div className="bg-white rounded-xl shadow-soft border-2 border-black p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="flex items-center text-xs font-semibold text-purple-600">
                    Average
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-purple-600 mb-2">
                  ₱{averageOrderValue.toFixed(2)}
                </h3>
                <p className="text-sm text-gray-600 font-medium">Avg Order Value</p>
              </div>
            </div>

            {/* Top Selling Medicines - Medipulse Style */}
            <div className="bg-white rounded-2xl shadow-soft border-2 border-black p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top Selling Medicines</h3>
              <div className="space-y-4">
                {topSellingArray.length > 0 ? (
                  topSellingArray.map((item, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.quantity} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₱{item.revenue.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Revenue</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No sales data available for selected period</p>
                )}
              </div>
            </div>

            {/* Filter + Recent Orders Container - Medipulse Style */}
            <div className="bg-white rounded-2xl shadow-soft border-2 border-black overflow-hidden">
              {/* Date Range Filter */}
              <div className="bg-gray-50 p-5 border-b-2 border-black">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Filter className="inline h-4 w-4 mr-1" />
                      Date Range
                    </label>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                      <option value="all">All Time</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>

                  {dateRange === 'custom' && (
                    <>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Recent Orders Table */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.slice(0, 10).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {order.order_number}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{order.customer_name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                          ₱{parseFloat(order.total_amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Inventory Tab Content */}
        {activeTab === 'inventory' && (
          <>
            {/* Statistics Cards - Medipulse Style Compact */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-soft p-4 border-2 border-black hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Package className="h-4 w-4 text-secondary-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Total Medicines</p>
                <h3 className="text-2xl font-bold text-secondary-600">{totalMedicines}</h3>
              </div>

              <div className="bg-white rounded-xl shadow-soft p-4 border-2 border-black hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-4 w-4 text-accent-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Good Stock</p>
                <h3 className="text-2xl font-bold text-accent-600">{goodStock}</h3>
              </div>

              <div className="bg-white rounded-xl shadow-soft p-4 border-2 border-black hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingDown className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Low Stock</p>
                <h3 className="text-2xl font-bold text-amber-600">{lowStock}</h3>
              </div>

              <div className="bg-white rounded-xl shadow-soft p-4 border-2 border-black hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Out of Stock</p>
                <h3 className="text-2xl font-bold text-red-600">{outOfStock}</h3>
              </div>
            </div>

            {/* Stock Value Card */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 mb-2 font-medium">Total Inventory Value</p>
                  <h2 className="text-4xl font-bold">₱{totalStockValue.toFixed(2)}</h2>
                  <p className="text-primary-100 mt-2 text-sm">
                    Based on current stock levels and prices
                  </p>
                </div>
                <BarChart3 className="h-16 w-16 text-primary-200" />
              </div>
            </div>

            {/* Alerts Section - Medipulse Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Expiring Soon */}
              <div className="bg-white rounded-2xl shadow-soft border-2 border-black p-6">
                <div className="flex items-center mb-4">
                  <Clock className="h-5 w-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Expiring Soon (90 days)</h3>
                </div>
                <div className="space-y-3">
                  {expiringSoon.length > 0 ? (
                    expiringSoon.slice(0, 5).map(med => (
                      <div key={med.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-900">{med.name}</p>
                          <p className="text-sm text-gray-600">{med.medicine_code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-orange-600">
                            {new Date(med.expiry_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-600">Stock: {med.stock_quantity}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No medicines expiring soon</p>
                  )}
                </div>
              </div>

              {/* Out of Stock */}
              <div className="bg-white rounded-2xl shadow-soft border-2 border-black p-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Out of Stock</h3>
                </div>
                <div className="space-y-3">
                  {medicines.filter(m => m.stock_quantity === 0).length > 0 ? (
                    medicines.filter(m => m.stock_quantity === 0).slice(0, 5).map(med => (
                      <div key={med.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-900">{med.name}</p>
                          <p className="text-sm text-gray-600">{med.medicine_code}</p>
                        </div>
                        <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">All medicines in stock</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stock Status Table - Medipulse Style */}
            <div className="bg-white rounded-2xl shadow-soft border-2 border-black overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Stock Status by Category</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Items</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Good Stock</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Low Stock</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Out of Stock</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...new Set(medicines.map(m => m.category))].map(category => {
                      const categoryMeds = medicines.filter(m => m.category === category);
                      const categoryGood = categoryMeds.filter(m => m.stock_quantity >= 50).length;
                      const categoryLow = categoryMeds.filter(m => m.stock_quantity > 0 && m.stock_quantity < 50).length;
                      const categoryOut = categoryMeds.filter(m => m.stock_quantity === 0).length;
                      const categoryValue = categoryMeds.reduce((sum, m) => 
                        sum + (parseFloat(m.price) * m.stock_quantity), 0
                      );

                      return (
                        <tr key={category} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{category}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right">{categoryMeds.length}</td>
                          <td className="px-6 py-4 text-sm text-green-600 text-right font-semibold">{categoryGood}</td>
                          <td className="px-6 py-4 text-sm text-yellow-600 text-right font-semibold">{categoryLow}</td>
                          <td className="px-6 py-4 text-sm text-red-600 text-right font-semibold">{categoryOut}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                            ₱{categoryValue.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminReports;

