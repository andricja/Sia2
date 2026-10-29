import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  User, Mail, Shield, Key, Save, AlertCircle, CheckCircle,
  FileText, Calendar, Filter, Download,
  Database, Upload, HardDrive, RefreshCw, Trash2, Settings,
  Archive, RotateCcw, XCircle, Package, ShoppingCart
} from 'lucide-react';

function AdminSettings() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'audit', 'backup', 'archive'
  
  // Profile state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Audit Logs state
  const [logs] = useState([
    {
      id: 1,
      user: 'Admin User',
      action: 'Created Medicine',
      details: 'Added "Paracetamol 500mg" to inventory',
      timestamp: '2026-10-18 14:30:25',
      type: 'create'
    },
    {
      id: 2,
      user: 'Staff User',
      action: 'Created Order',
      details: 'Order #ORD-12345 - Total: ₱550.00',
      timestamp: '2026-10-18 14:15:10',
      type: 'create'
    },
    {
      id: 3,
      user: 'Admin User',
      action: 'Updated Medicine',
      details: 'Changed stock of "Amoxicillin 500mg" from 30 to 50',
      timestamp: '2026-10-18 13:45:00',
      type: 'update'
    },
    {
      id: 4,
      user: 'Admin User',
      action: 'Deleted Medicine',
      details: 'Removed "Expired Medicine XYZ"',
      timestamp: '2026-10-18 12:20:15',
      type: 'delete'
    },
    {
      id: 5,
      user: 'Staff User',
      action: 'Login',
      details: 'Successful login from 192.168.1.100',
      timestamp: '2026-10-18 09:00:00',
      type: 'auth'
    }
  ]);

  const [filterType, setFilterType] = useState('all');

  // Backup state
  const [backups] = useState([
    {
      id: 1,
      filename: 'medikiosk_backup_2026-10-18_14-30.sql',
      size: '2.5 MB',
      created_at: '2026-10-18 14:30:00',
      type: 'manual'
    },
    {
      id: 2,
      filename: 'medikiosk_backup_2026-10-17_00-00.sql',
      size: '2.4 MB',
      created_at: '2026-10-17 00:00:00',
      type: 'automatic'
    },
    {
      id: 3,
      filename: 'medikiosk_backup_2026-10-16_00-00.sql',
      size: '2.3 MB',
      created_at: '2026-10-16 00:00:00',
      type: 'automatic'
    }
  ]);

  const [loading, setLoading] = useState(false);

  // Archive state
  const [archiveFilter, setArchiveFilter] = useState('all');
  const [archivedItems, setArchivedItems] = useState([]);
  
  // Archive modals
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkRestoreModal, setShowBulkRestoreModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [itemToRestore, setItemToRestore] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Load archived items from localStorage
  useEffect(() => {
    const loadArchivedItems = () => {
      const archivedMedicines = JSON.parse(localStorage.getItem('archivedMedicines') || '[]');
      const archivedBatches = JSON.parse(localStorage.getItem('archivedExpiryBatches') || '[]');
      
      // Combine both arrays
      const allArchived = [...archivedMedicines, ...archivedBatches];
      setArchivedItems(allArchived);
    };
    
    loadArchivedItems();
    
    // Reload when tab becomes active
    if (activeTab === 'archive') {
      loadArchivedItems();
    }
  }, [activeTab]);

  // Profile Functions
  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    setTimeout(() => {
      setSuccess('Profile updated successfully!');
      setEditing(false);
      setSaving(false);
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    setTimeout(() => {
      setSuccess('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setSaving(false);
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  // Audit Log Functions
  const filteredLogs = filterType === 'all' 
    ? logs 
    : logs.filter(log => log.type === filterType);

  const getActionColor = (type) => {
    switch(type) {
      case 'create': return 'bg-green-100 text-green-700';
      case 'update': return 'bg-blue-100 text-blue-700';
      case 'delete': return 'bg-red-100 text-red-700';
      case 'auth': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const exportLogs = () => {
    const csv = [
      'Timestamp,User,Action,Details',
      ...filteredLogs.map(log => 
        `"${log.timestamp}","${log.user}","${log.action}","${log.details}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Backup Functions
  const handleCreateBackup = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess('Database backup created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }, 2000);
  };

  const handleDownloadBackup = (backup) => {
    setSuccess(`Downloading ${backup.filename}...`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteBackup = (backup) => {
    if (window.confirm(`Delete backup ${backup.filename}?`)) {
      setSuccess('Backup deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleOptimizeDatabase = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess('Database optimized successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }, 2000);
  };

  const handleClearCache = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess('Cache cleared successfully!');
      setTimeout(() => setSuccess(''), 2000);
    }, 1000);
  };

  // Archive functions
  const handleRestore = (item) => {
    setItemToRestore(item);
    setShowRestoreModal(true);
  };
  
  const confirmRestore = async () => {
    if (!itemToRestore) return;
    
    try {
      // If restoring an expiry batch, restore the stock
      if (itemToRestore.type === 'expiry_batch') {
        // Create stock movement to add the quantity back
        await api.request('/stock-movements', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            medicine_id: itemToRestore.medicine_id,
            movement_type: 'returned',
            quantity_change: itemToRestore.quantity,
            reason: 'Batch Restored from Archive',
            notes: `Restored batch: ${itemToRestore.quantity} units (Expiry: ${new Date(itemToRestore.expiry_date).toLocaleDateString()})`
          })
        });
      }
      
      // Determine which storage key to use based on type
      const storageKey = itemToRestore.type === 'expiry_batch' ? 'archivedExpiryBatches' : 'archivedMedicines';
      
      // Remove from archived items
      const archived = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedArchived = archived.filter(i => i.id !== itemToRestore.id);
      localStorage.setItem(storageKey, JSON.stringify(updatedArchived));
      
      // Reload all archived items
      const archivedMedicines = JSON.parse(localStorage.getItem('archivedMedicines') || '[]');
      const archivedBatches = JSON.parse(localStorage.getItem('archivedExpiryBatches') || '[]');
      setArchivedItems([...archivedMedicines, ...archivedBatches]);
      
      const itemName = itemToRestore.medicine_name || itemToRestore.name;
      const stockMessage = itemToRestore.type === 'expiry_batch' 
        ? ` Stock increased by ${itemToRestore.quantity} units.`
        : '';
      setSuccess(`${itemName} restored successfully!${stockMessage} Refresh the Medicine Management page to see it.`);
      setTimeout(() => setSuccess(''), 5000);
      
      setShowRestoreModal(false);
      setItemToRestore(null);
    } catch (error) {
      console.error('Restore error:', error);
      setError(error.message || 'Failed to restore item');
      setTimeout(() => setError(''), 3000);
      setShowRestoreModal(false);
      setItemToRestore(null);
    }
  };

  const handleDeletePermanently = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };
  
  const confirmDeletePermanently = () => {
    if (!itemToDelete) return;
    
    // Determine which storage key to use based on type
    const storageKey = itemToDelete.type === 'expiry_batch' ? 'archivedExpiryBatches' : 'archivedMedicines';
    
    // Remove from archived items
    const archived = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedArchived = archived.filter(i => i.id !== itemToDelete.id);
    localStorage.setItem(storageKey, JSON.stringify(updatedArchived));
    
    // Reload all archived items
    const archivedMedicines = JSON.parse(localStorage.getItem('archivedMedicines') || '[]');
    const archivedBatches = JSON.parse(localStorage.getItem('archivedExpiryBatches') || '[]');
    setArchivedItems([...archivedMedicines, ...archivedBatches]);
    
    const itemName = itemToDelete.medicine_name || itemToDelete.name;
    setSuccess(`${itemName} permanently deleted.`);
    setTimeout(() => setSuccess(''), 3000);
    
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleRestoreAll = () => {
    setShowBulkRestoreModal(true);
  };
  
  const confirmRestoreAll = async () => {
    const itemsToRestore = archivedItems.filter(item => 
      archiveFilter === 'all' || item.type === archiveFilter
    );
    
    try {
      // Separate by type
      const medicinesToRestore = itemsToRestore.filter(i => i.type === 'medicine');
      const batchesToRestore = itemsToRestore.filter(i => i.type === 'expiry_batch');
      
      // Restore stock for batches
      if (batchesToRestore.length > 0) {
        for (const batch of batchesToRestore) {
          await api.request('/stock-movements', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              medicine_id: batch.medicine_id,
              movement_type: 'returned',
              quantity_change: batch.quantity,
              reason: 'Batch Restored from Archive (Bulk)',
              notes: `Restored batch: ${batch.quantity} units (Expiry: ${new Date(batch.expiry_date).toLocaleDateString()})`
            })
          });
        }
      }
      
      // Remove medicines
      if (medicinesToRestore.length > 0) {
        const archivedMeds = JSON.parse(localStorage.getItem('archivedMedicines') || '[]');
        const medIds = medicinesToRestore.map(i => i.id);
        const updatedMeds = archivedMeds.filter(i => !medIds.includes(i.id));
        localStorage.setItem('archivedMedicines', JSON.stringify(updatedMeds));
      }
      
      // Remove batches
      if (batchesToRestore.length > 0) {
        const archivedBatches = JSON.parse(localStorage.getItem('archivedExpiryBatches') || '[]');
        const batchIds = batchesToRestore.map(i => i.id);
        const updatedBatches = archivedBatches.filter(i => !batchIds.includes(i.id));
        localStorage.setItem('archivedExpiryBatches', JSON.stringify(updatedBatches));
      }
      
      // Reload all archived items
      const archivedMedicines = JSON.parse(localStorage.getItem('archivedMedicines') || '[]');
      const archivedBatches = JSON.parse(localStorage.getItem('archivedExpiryBatches') || '[]');
      setArchivedItems([...archivedMedicines, ...archivedBatches]);
      
      const stockMessage = batchesToRestore.length > 0 
        ? ` Stock restored for ${batchesToRestore.length} batch(es).`
        : '';
      setSuccess(`${itemsToRestore.length} item(s) restored successfully!${stockMessage}`);
      setTimeout(() => setSuccess(''), 4000);
      
      setShowBulkRestoreModal(false);
    } catch (error) {
      console.error('Bulk restore error:', error);
      setError(error.message || 'Failed to restore items');
      setTimeout(() => setError(''), 3000);
      setShowBulkRestoreModal(false);
    }
  };

  const handleDeleteAll = () => {
    setShowBulkDeleteModal(true);
  };
  
  const confirmDeleteAll = () => {
    const itemsToDelete = archivedItems.filter(item => 
      archiveFilter === 'all' || item.type === archiveFilter
    );
    
    // Separate by type
    const medicinesToDelete = itemsToDelete.filter(i => i.type === 'medicine');
    const batchesToDelete = itemsToDelete.filter(i => i.type === 'expiry_batch');
    
    // Remove medicines
    if (medicinesToDelete.length > 0) {
      const archivedMeds = JSON.parse(localStorage.getItem('archivedMedicines') || '[]');
      const medIds = medicinesToDelete.map(i => i.id);
      const updatedMeds = archivedMeds.filter(i => !medIds.includes(i.id));
      localStorage.setItem('archivedMedicines', JSON.stringify(updatedMeds));
    }
    
    // Remove batches
    if (batchesToDelete.length > 0) {
      const archivedBatches = JSON.parse(localStorage.getItem('archivedExpiryBatches') || '[]');
      const batchIds = batchesToDelete.map(i => i.id);
      const updatedBatches = archivedBatches.filter(i => !batchIds.includes(i.id));
      localStorage.setItem('archivedExpiryBatches', JSON.stringify(updatedBatches));
    }
    
    // Reload all archived items
    const archivedMedicines = JSON.parse(localStorage.getItem('archivedMedicines') || '[]');
    const archivedBatches = JSON.parse(localStorage.getItem('archivedExpiryBatches') || '[]');
    setArchivedItems([...archivedMedicines, ...archivedBatches]);
    
    setSuccess(`${itemsToDelete.length} item(s) permanently deleted.`);
    setTimeout(() => setSuccess(''), 3000);
    
    setShowBulkDeleteModal(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header - Medipulse Style */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent mb-1">
            Settings
          </h1>
          <p className="text-gray-600 font-medium">System settings and configurations</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        {/* Tabs - Medipulse Style */}
        <div className="bg-white rounded-2xl border-2 border-black p-2 shadow-sm">
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center">
                <User className="h-5 w-5 mr-2" />
                My Profile
              </div>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'audit'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center">
                <FileText className="h-5 w-5 mr-2" />
                Audit Logs
              </div>
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'backup'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center">
                <Database className="h-5 w-5 mr-2" />
                Backup & Maintenance
              </div>
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'archive'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center">
                <Archive className="h-5 w-5 mr-2" />
                Archive
              </div>
            </button>
          </nav>
        </div>

        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
          <>
            {/* Profile Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/30"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Avatar */}
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white text-2xl font-bold shadow-lg shadow-primary-500/30">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full mt-1">
                    <Shield className="h-3 w-3 mr-1" />
                    {user?.role === 'admin' ? 'Administrator' : 'Staff Member'}
                  </span>
                </div>
              </div>

              {/* Profile Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Shield className="inline h-4 w-4 mr-1" />
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role === 'admin' ? 'Administrator' : 'Staff Member'}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                  />
                </div>

                {editing && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: user?.name || '',
                          email: user?.email || '',
                        });
                      }}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all flex items-center justify-center disabled:opacity-50 shadow-lg shadow-primary-500/30"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black/60 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Change Password
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-primary-500/30"
                >
                  {saving ? 'Changing Password...' : 'Change Password'}
                </button>
              </form>
            </div>

            {/* Account Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black/60 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Account Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Created:</span>
                  <span className="text-gray-900 font-semibold">October 16, 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Login:</span>
                  <span className="text-gray-900 font-semibold">Today, {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Status:</span>
                  <span className="inline-flex items-center text-green-700 font-semibold">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Audit Logs Tab Content */}
        {activeTab === 'audit' && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-blue-600 mb-1">{logs.length}</h3>
                <p className="text-sm text-gray-600 font-medium">Total Logs</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black p-6 hover:shadow-lg transition-all">
                <h3 className="text-3xl font-bold text-green-600 mb-1">
                  {logs.filter(l => l.type === 'create').length}
                </h3>
                <p className="text-sm text-gray-600 font-medium">Created</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black p-6 hover:shadow-lg transition-all">
                <h3 className="text-3xl font-bold text-blue-600 mb-1">
                  {logs.filter(l => l.type === 'update').length}
                </h3>
                <p className="text-sm text-gray-600 font-medium">Updated</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black p-6 hover:shadow-lg transition-all">
                <h3 className="text-3xl font-bold text-red-600 mb-1">
                  {logs.filter(l => l.type === 'delete').length}
                </h3>
                <p className="text-sm text-gray-600 font-medium">Deleted</p>
              </div>
            </div>

            {/* Filter + Logs List Container - magkadikit */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black overflow-hidden">
              {/* Filter */}
              <div className="bg-gray-50 p-4 border-b-2 border-black">
                <div className="flex items-center gap-4">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Actions</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="auth">Authentication</option>
                  </select>
                  <button
                    onClick={exportLogs}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-teal-500/30"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export Logs
                  </button>
                </div>
              </div>

              {/* Logs List */}
              <div className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getActionColor(log.type)}`}>
                            {log.action}
                          </span>
                          <span className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-1" />
                            {log.user}
                          </span>
                          <span className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {log.timestamp}
                          </span>
                        </div>
                        <p className="text-gray-900">{log.details}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Audit logs are stored for 90 days. Critical actions are permanently logged for compliance purposes.
              </p>
            </div>
          </>
        )}

        {/* Backup & Maintenance Tab Content */}
        {activeTab === 'backup' && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={handleCreateBackup}
                disabled={loading}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black/60 p-6 hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 mb-4 mx-auto">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Create Backup</h3>
                <p className="text-sm text-gray-600">Generate new database backup</p>
              </button>

              <button
                onClick={handleOptimizeDatabase}
                disabled={loading}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black/60 p-6 hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-purple-100 mb-4 mx-auto">
                  <RefreshCw className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Optimize Database</h3>
                <p className="text-sm text-gray-600">Improve database performance</p>
              </button>

              <button
                onClick={handleClearCache}
                disabled={loading}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black/60 p-6 hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-orange-100 mb-4 mx-auto">
                  <Trash2 className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Clear Cache</h3>
                <p className="text-sm text-gray-600">Clear system cache files</p>
              </button>
            </div>

            {/* Database Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black/60 p-6">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-green-100 mr-4">
                  <HardDrive className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Database Information</h3>
                  <p className="text-sm text-gray-600">Current database statistics</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-600 mb-1">Database Type</p>
                  <p className="text-xl font-bold text-gray-900">SQLite</p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-sm text-gray-600 mb-1">Database Size</p>
                  <p className="text-xl font-bold text-gray-900">2.5 MB</p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="text-sm text-gray-600 mb-1">Last Backup</p>
                  <p className="text-xl font-bold text-gray-900">Today</p>
                </div>
              </div>
            </div>

            {/* Backup History */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black/60 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Backup History</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filename</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {backups.map((backup) => (
                      <tr key={backup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {backup.filename}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{backup.size}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            backup.type === 'manual' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {backup.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{backup.created_at}</td>
                        <td className="px-6 py-4 text-right text-sm space-x-3">
                          <button
                            onClick={() => handleDownloadBackup(backup)}
                            className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </button>
                          <button
                            onClick={() => handleDeleteBackup(backup)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Automatic Backup Settings */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black/60 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Automatic Backup Settings</h3>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-primary-700 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-gray-900">Enable automatic daily backups</span>
                </label>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Backup Time
                  </label>
                  <select className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                    <option value="00:00">12:00 AM (Midnight)</option>
                    <option value="02:00">2:00 AM</option>
                    <option value="04:00">4:00 AM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Keep backups for
                  </label>
                  <select className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setSuccess('Backup settings saved!');
                    setTimeout(() => setSuccess(''), 3000);
                  }}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/30"
                >
                  Save Settings
                </button>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-bold text-yellow-900 mb-2">Important Notes</h4>
                  <ul className="space-y-1 text-sm text-yellow-800">
                    <li>• Always create a backup before major system updates</li>
                    <li>• Store backup files in a secure location</li>
                    <li>• Test backup restoration regularly</li>
                    <li>• Automatic backups run daily at scheduled time</li>
                    <li>• Old backups are automatically deleted based on retention policy</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Restore Backup */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-red-200 p-6">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-red-100 mr-4">
                  <Upload className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Restore Database</h3>
                  <p className="text-sm text-gray-600">Restore from backup file</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Warning: Restoring a backup will overwrite all current data. This action cannot be undone.
                </p>
              </div>

              <input
                type="file"
                accept=".sql"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200"
              />

              <button
                className="mt-4 flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all shadow-lg"
                onClick={() => {
                  if (window.confirm('Are you sure you want to restore from backup? This will overwrite all current data!')) {
                    setSuccess('Database restoration initiated...');
                    setTimeout(() => setSuccess(''), 3000);
                  }
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Restore from Backup
              </button>
            </div>
          </>
        )}

        {/* Archive Tab Content */}
        {activeTab === 'archive' && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gray-100 mb-4">
                  <Archive className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{archivedItems.length}</h3>
                <p className="text-sm text-gray-600 font-medium">Total Archived</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 mb-4">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-blue-600 mb-1">
                  {archivedItems.filter(item => item.type === 'medicine').length}
                </h3>
                <p className="text-sm text-gray-600 font-medium">Medicines</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-purple-100 mb-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-3xl font-bold text-purple-600 mb-1">
                  {archivedItems.filter(item => item.type === 'expiry_batch').length}
                </h3>
                <p className="text-sm text-gray-600 font-medium">Expiry Batches</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-orange-100 mb-4">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-3xl font-bold text-orange-600 mb-1">
                  {archivedItems.filter(item => item.type === 'order').length}
                </h3>
                <p className="text-sm text-gray-600 font-medium">Orders</p>
              </div>
            </div>

            {/* Filter + Archived Items List Container - magkadikit */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black overflow-hidden">
              {/* Filter */}
              <div className="bg-gray-50 p-4 border-b-2 border-black">
                <div className="flex items-center gap-4">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={archiveFilter}
                    onChange={(e) => setArchiveFilter(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Items</option>
                    <option value="medicine">Medicines Only</option>
                    <option value="expiry_batch">Expiry Batches Only</option>
                    <option value="order">Orders Only</option>
                  </select>
                </div>
              </div>

              {/* Archived Items List */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Archived Items</h3>
                <p className="text-sm text-gray-600 mt-1">Restore or permanently delete archived items</p>
              </div>

              <div className="divide-y divide-gray-200">
                {archivedItems
                  .filter(item => archiveFilter === 'all' || item.type === archiveFilter)
                  .map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100">
                            {item.type === 'medicine' ? (
                              <Package className="h-5 w-5 text-blue-600" />
                            ) : item.type === 'expiry_batch' ? (
                              <Calendar className="h-5 w-5 text-purple-600" />
                            ) : (
                              <ShoppingCart className="h-5 w-5 text-orange-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {item.medicine_name || item.name}
                              {item.type === 'expiry_batch' && ` (${item.quantity} units)`}
                            </h4>
                            <p className="text-sm text-gray-600">Code: {item.medicine_code || item.code}</p>
                            {item.type === 'expiry_batch' && item.expiry_date && (
                              <p className="text-sm text-gray-600">Expiry: {new Date(item.expiry_date).toLocaleDateString()}</p>
                            )}
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            item.type === 'medicine' 
                              ? 'bg-blue-100 text-blue-700' 
                              : item.type === 'expiry_batch'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {item.type === 'expiry_batch' ? 'expiry batch' : item.type}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">
                          {item.type === 'expiry_batch' 
                            ? `Batch from ${item.category || 'category'} - Added on ${item.added_date ? new Date(item.added_date).toLocaleDateString() : 'N/A'}`
                            : (item.description || item.details || 'No description')}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Archived: {new Date(item.archived_at).toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            By: {item.archived_by}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleRestore(item)}
                          className="flex items-center px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-sm font-semibold transition-all shadow-md"
                          title="Restore"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </button>
                        <button
                          onClick={() => handleDeletePermanently(item)}
                          className="flex items-center px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg text-sm font-semibold transition-all shadow-md"
                          title="Delete Permanently"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {archivedItems.filter(item => archiveFilter === 'all' || item.type === archiveFilter).length === 0 && (
                <div className="p-12 text-center">
                  <Archive className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No archived items</h3>
                  <p className="text-gray-600">
                    {archiveFilter === 'all' 
                      ? 'No items have been archived yet' 
                      : `No archived ${archiveFilter}s found`}
                  </p>
                </div>
              )}
            </div>

            {/* Bulk Actions */}
            {archivedItems.filter(item => archiveFilter === 'all' || item.type === archiveFilter).length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black/60 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Bulk Actions</h3>
                <div className="flex gap-3">
                  <button
                    onClick={handleRestoreAll}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all shadow-lg"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore All
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all shadow-lg"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Permanently
                  </button>
                </div>
              </div>
            )}

            {/* Archive Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-bold text-blue-900 mb-2">About Archive</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• <strong>Restore:</strong> Returns the item to active status (medicines back to inventory, orders to transaction history)</li>
                    <li>• <strong>Delete Permanently:</strong> Removes the item completely from the system - this cannot be undone</li>
                    <li>• Archived items are kept for 90 days before automatic permanent deletion</li>
                    <li>• Archived medicines do not appear in POS search or inventory counts</li>
                    <li>• Archived orders do not appear in reports or transaction history</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Restore Confirmation Modal */}
      {showRestoreModal && itemToRestore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <RotateCcw className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Restore Item?</h3>
              <p className="text-gray-600 mb-2">
                Restore <span className="font-semibold">"{itemToRestore.name}"</span>?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                This item will be returned to active status.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRestoreModal(false);
                    setItemToRestore(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRestore}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all shadow-lg"
                >
                  Restore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Permanently Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Permanently?</h3>
              <p className="text-gray-600 mb-2">
                Permanently delete <span className="font-semibold">"{itemToDelete.name}"</span>?
              </p>
              <p className="text-sm text-red-600 font-medium mb-6">
                ⚠️ This action cannot be undone!
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePermanently}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Bulk Restore Confirmation Modal */}
      {showBulkRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <RotateCcw className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Restore All Items?</h3>
              <p className="text-gray-600 mb-2">
                Restore <span className="font-semibold">
                  {archivedItems.filter(item => archiveFilter === 'all' || item.type === archiveFilter).length} archived item(s)
                </span>?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                All {archiveFilter === 'all' ? 'filtered' : archiveFilter} items will be returned to active status.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkRestoreModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRestoreAll}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all shadow-lg"
                >
                  Restore All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete All Permanently?</h3>
              <p className="text-gray-600 mb-2">
                Permanently delete <span className="font-semibold">
                  {archivedItems.filter(item => archiveFilter === 'all' || item.type === archiveFilter).length} archived item(s)
                </span>?
              </p>
              <p className="text-sm text-red-600 font-medium mb-6">
                ⚠️ This action cannot be undone!
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAll}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all shadow-lg"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminSettings;

