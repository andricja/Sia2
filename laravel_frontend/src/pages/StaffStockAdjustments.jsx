import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StaffLayout from '../layouts/StaffLayout';
import { Plus, Minus, Package, History, AlertCircle } from 'lucide-react';
import api from '../services/api';

function StaffStockAdjustments() {
  const { token, user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [movements, setMovements] = useState([]);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    movement_type: 'adjustment',
    quantity_change: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [medicinesRes, movementsRes] = await Promise.all([
        api.getMedicines(),
        api.request('/stock-movements', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setMedicines(medicinesRes.data || []);
      setMovements(movementsRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = (medicine) => {
    setSelectedMedicine(medicine);
    setShowAdjustmentModal(true);
    setError('');
    setSuccess('');
    setFormData({
      movement_type: 'adjustment',
      quantity_change: '',
      reason: '',
      notes: ''
    });
  };

  const handleSubmitAdjustment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await api.request('/stock-movements', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          medicine_id: selectedMedicine.id,
          movement_type: formData.movement_type,
          quantity_change: parseInt(formData.quantity_change),
          reason: formData.reason,
          notes: formData.notes
        })
      });

      if (response.success) {
        setSuccess('Stock adjusted successfully!');
        setTimeout(() => {
          setShowAdjustmentModal(false);
          fetchData();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'received':
        return 'bg-green-100 text-green-700';
      case 'adjustment':
        return 'bg-blue-100 text-blue-700';
      case 'damaged':
        return 'bg-red-100 text-red-700';
      case 'expired':
        return 'bg-orange-100 text-orange-700';
      case 'sold':
        return 'bg-purple-100 text-purple-700';
      case 'returned':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Adjustments</h1>
          <p className="text-gray-600 mt-1">Manage inventory stock levels</p>
        </div>

        {/* Medicine List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Select Medicine to Adjust</h2>
          </div>
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading medicines...</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {medicines.map(medicine => (
                  <div key={medicine.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{medicine.name}</h3>
                        <p className="text-sm text-gray-500">{medicine.medicine_code}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        medicine.stock_quantity === 0 ? 'bg-red-100 text-red-700' :
                        medicine.stock_quantity < 50 ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {medicine.stock_quantity} in stock
                      </span>
                    </div>
                    <button
                      onClick={() => handleAdjustStock(medicine)}
                      className="w-full mt-2 px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors text-sm font-medium"
                    >
                      Adjust Stock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Stock Movements */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Recent Stock Movements</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Before</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">After</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {movements.map(movement => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(movement.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{movement.medicine?.name}</p>
                        <p className="text-sm text-gray-500">{movement.medicine?.medicine_code}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMovementColor(movement.movement_type)}`}>
                        {movement.movement_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${movement.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{movement.quantity_before}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{movement.quantity_after}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{movement.reason}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{movement.user?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {movements.length === 0 && (
              <div className="p-12 text-center">
                <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No stock movements yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Adjustment Modal */}
      {showAdjustmentModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Adjust Stock</h3>
            <p className="text-gray-600 mb-6">
              {selectedMedicine.name} - Current Stock: <strong>{selectedMedicine.stock_quantity}</strong>
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmitAdjustment} className="space-y-4">
              {/* Movement Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Movement Type</label>
                <select
                  value={formData.movement_type}
                  onChange={(e) => setFormData({...formData, movement_type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="adjustment">Stock Adjustment</option>
                  <option value="received">Stock Received</option>
                  <option value="damaged">Damaged Stock</option>
                  <option value="expired">Expired Stock</option>
                  <option value="returned">Customer Return</option>
                </select>
              </div>

              {/* Quantity Change */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity Change (use negative for decrease)
                </label>
                <input
                  type="number"
                  value={formData.quantity_change}
                  onChange={(e) => setFormData({...formData, quantity_change: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 50 or -10"
                  required
                />
                {formData.quantity_change && (
                  <p className="mt-1 text-sm text-gray-600">
                    New stock will be: <strong>{selectedMedicine.stock_quantity + parseInt(formData.quantity_change || 0)}</strong>
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Required)</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., New delivery, Physical count correction"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Adjusting...' : 'Adjust Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

export default StaffStockAdjustments;
