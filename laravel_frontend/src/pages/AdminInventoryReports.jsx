import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  Package, AlertTriangle, TrendingDown, Download, BarChart3,
  Clock, CheckCircle
} from 'lucide-react';
import api from '../services/api';

function AdminInventoryReports() {
  const [medicines, setMedicines] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [medicinesRes, movementsRes] = await Promise.all([
        api.request('/medicines'),
        api.request('/stock-movements')
      ]);
      
      setMedicines(medicinesRes.data || []);
      setStockMovements(movementsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalMedicines = medicines.length;
  const outOfStock = medicines.filter(m => m.stock_quantity === 0).length;
  const lowStock = medicines.filter(m => m.stock_quantity > 0 && m.stock_quantity < 50).length;
  const goodStock = medicines.filter(m => m.stock_quantity >= 50).length;

  const totalStockValue = medicines.reduce((sum, med) => 
    sum + (parseFloat(med.price) * med.stock_quantity), 0
  );

  // Get expiring soon medicines (within 90 days)
  const expiringSoon = medicines.filter(med => {
    if (!med.expiry_date) return false;
    const expiryDate = new Date(med.expiry_date);
    const today = new Date();
    const daysUntilExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry > 0 && daysUntilExpiry <= 90;
  });

  // Get expired medicines
  const expired = medicines.filter(med => {
    if (!med.expiry_date) return false;
    return new Date(med.expiry_date) < new Date();
  });

  const exportToCSV = () => {
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
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Reports</h1>
            <p className="text-gray-600 mt-1">Stock levels and inventory analytics</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{totalMedicines}</h3>
            <p className="text-sm text-gray-600">Total Medicines</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-green-600 mb-1">{goodStock}</h3>
            <p className="text-sm text-gray-600">Good Stock</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-yellow-100">
                <TrendingDown className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-yellow-600 mb-1">{lowStock}</h3>
            <p className="text-sm text-gray-600">Low Stock</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-red-600 mb-1">{outOfStock}</h3>
            <p className="text-sm text-gray-600">Out of Stock</p>
          </div>
        </div>

        {/* Stock Value Card */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 mb-2">Total Inventory Value</p>
              <h2 className="text-4xl font-bold">₱{totalStockValue.toFixed(2)}</h2>
              <p className="text-primary-100 mt-2 text-sm">
                Based on current stock levels and prices
              </p>
            </div>
            <BarChart3 className="h-16 w-16 text-primary-200" />
          </div>
        </div>

        {/* Alerts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expiring Soon */}
          <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-6">
            <div className="flex items-center mb-4">
              <Clock className="h-5 w-5 text-orange-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-900">Expiring Soon (90 days)</h3>
            </div>
            <div className="space-y-3">
              {expiringSoon.length > 0 ? (
                expiringSoon.slice(0, 5).map(med => (
                  <div key={med.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{med.name}</p>
                      <p className="text-sm text-gray-600">{med.medicine_code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
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
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-900">Out of Stock</h3>
            </div>
            <div className="space-y-3">
              {medicines.filter(m => m.stock_quantity === 0).length > 0 ? (
                medicines.filter(m => m.stock_quantity === 0).slice(0, 5).map(med => (
                  <div key={med.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{med.name}</p>
                      <p className="text-sm text-gray-600">{med.medicine_code}</p>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
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

        {/* Stock Status Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{category}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{categoryMeds.length}</td>
                      <td className="px-6 py-4 text-sm text-green-600 text-right font-medium">{categoryGood}</td>
                      <td className="px-6 py-4 text-sm text-yellow-600 text-right font-medium">{categoryLow}</td>
                      <td className="px-6 py-4 text-sm text-red-600 text-right font-medium">{categoryOut}</td>
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
      </div>
    </AdminLayout>
  );
}

export default AdminInventoryReports;
