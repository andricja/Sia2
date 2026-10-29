import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  TrendingUp, Calendar, DollarSign, ShoppingCart, Download,
  ArrowUp, ArrowDown, Filter
} from 'lucide-react';
import api from '../services/api';

function AdminSalesReports() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.request('/orders');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const exportToCSV = () => {
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
            <p className="text-gray-600 mt-1">Sales analytics and performance metrics</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline h-4 w-4 mr-1" />
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <span className="flex items-center text-sm font-medium text-green-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                Revenue
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              ₱{totalRevenue.toFixed(2)}
            </h3>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <span className="flex items-center text-sm font-medium text-blue-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                Orders
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{totalOrders}</h3>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <span className="flex items-center text-sm font-medium text-purple-600">
                Average
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              ₱{averageOrderValue.toFixed(2)}
            </h3>
            <p className="text-sm text-gray-600">Avg Order Value</p>
          </div>
        </div>

        {/* Top Selling Medicines */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                      <p className="font-medium text-gray-900">{item.name}</p>
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

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
      </div>
    </AdminLayout>
  );
}

export default AdminSalesReports;
