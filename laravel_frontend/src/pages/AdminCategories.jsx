import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, Search, Edit2, Trash2, Eye, FolderTree, 
  Package, TrendingUp, AlertCircle, X, Check
} from 'lucide-react';

function AdminCategories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'pill',
    is_active: true,
    display_order: 0
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Available icons for categories
  const availableIcons = [
    'pill', 'shield-plus', 'sparkles', 'thermometer', 'activity',
    'heart-pulse', 'syringe', 'wind', 'leaf', 'droplet', 'cross',
    'stethoscope', 'bandage', 'tablets', 'syringe'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.request('/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, category = null) => {
    setModalMode(mode);
    if (mode === 'edit' && category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        icon: category.icon || 'pill',
        is_active: category.is_active,
        display_order: category.display_order
      });
      setSelectedCategory(category);
    } else {
      setFormData({
        name: '',
        description: '',
        icon: 'pill',
        is_active: true,
        display_order: categories.length
      });
      setSelectedCategory(null);
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (modalMode === 'add') {
        const response = await api.request('/categories', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        if (response.success) {
          setSuccess('Category created successfully!');
          fetchCategories();
          setTimeout(() => {
            handleCloseModal();
            setSuccess('');
          }, 1500);
        }
      } else {
        const response = await api.request(`/categories/${selectedCategory.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        if (response.success) {
          setSuccess('Category updated successfully!');
          fetchCategories();
          setTimeout(() => {
            handleCloseModal();
            setSuccess('');
          }, 1500);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save category');
    }
  };

  const handleDelete = async (category) => {
    if (category.medicines_count > 0) {
      alert(`Cannot delete "${category.name}" - it has ${category.medicines_count} medicine(s). Please reassign or delete medicines first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        const response = await api.request(`/categories/${category.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.success) {
          setSuccess('Category deleted successfully!');
          fetchCategories();
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError(err.message || 'Failed to delete category');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleViewCategory = async (category) => {
    try {
      const response = await api.request(`/categories/${category.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.success) {
        setSelectedCategory(response.data);
        setShowViewModal(true);
      }
    } catch (err) {
      setError('Failed to load category details');
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.is_active).length;
  const totalMedicines = categories.reduce((sum, cat) => sum + (cat.medicines_count || 0), 0);

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Management</h1>
          <p className="text-gray-600">Organize medicines into categories for easy browsing</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <Check className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Categories</p>
                <p className="text-3xl font-bold text-gray-900">{totalCategories}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <FolderTree className="h-8 w-8 text-primary-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Categories</p>
                <p className="text-3xl font-bold text-green-600">{activeCategories}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Medicines</p>
                <p className="text-3xl font-bold text-blue-600">{totalMedicines}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="h-8 w-8 text-blue-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Add */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => handleOpenModal('add')}
              className="flex items-center justify-center px-6 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Category
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <FolderTree className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try a different search term' : 'Get started by adding your first category'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => handleOpenModal('add')}
                className="inline-flex items-center px-6 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Category
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${category.is_active ? 'bg-primary-100' : 'bg-gray-100'}`}>
                      <Package className={`h-6 w-6 ${category.is_active ? 'text-primary-700' : 'text-gray-400'}`} />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.medicines_count || 0} medicines</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {category.description || 'No description'}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewCategory(category)}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleOpenModal('edit', category)}
                    className="flex-1 px-3 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalMode === 'add' ? 'Add New Category' : 'Edit Category'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Pain Relief"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Brief description of this category"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., pill, heart-pulse"
                    />
                    <p className="mt-1 text-xs text-gray-500">Icon name from Lucide icons library</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4 text-primary-700 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                      Active (visible to customers)
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800"
                  >
                    {modalMode === 'add' ? 'Add Category' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">{selectedCategory.name}</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-primary-100 p-3 rounded-lg">
                        <Package className="h-8 w-8 text-primary-700" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">Total Medicines</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedCategory.medicines_count || 0}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      selectedCategory.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedCategory.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Description</p>
                      <p className="text-gray-900">{selectedCategory.description || 'No description'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Display Order</p>
                      <p className="text-gray-900">{selectedCategory.display_order}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Slug</p>
                      <p className="text-gray-900">{selectedCategory.slug}</p>
                    </div>
                  </div>
                </div>

                {selectedCategory.medicines && selectedCategory.medicines.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Medicines in this category</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedCategory.medicines.map((medicine) => (
                        <div key={medicine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{medicine.name}</p>
                            <p className="text-sm text-gray-600">Code: {medicine.medicine_code}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary-700">₱{parseFloat(medicine.price).toFixed(2)}</p>
                            <p className="text-sm text-gray-600">Stock: {medicine.stock_quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleOpenModal('edit', selectedCategory);
                    }}
                    className="flex-1 px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800"
                  >
                    Edit Category
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminCategories;
