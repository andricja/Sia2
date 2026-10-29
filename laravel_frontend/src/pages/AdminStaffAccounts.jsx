import React, { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  Users, Plus, Edit, Trash2, X, Save, AlertCircle, CheckCircle,
  Shield, Mail, User, Lock, Search,
  ChevronUp, ChevronDown, ChevronsUpDown
} from 'lucide-react';

function AdminStaffAccounts() {
  const [staff, setStaff] = useState([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@medikiosk.com',
      role: 'admin',
      status: 'active',
      created_at: '2026-10-16',
      last_login: '2026-10-18'
    },
    {
      id: 2,
      name: 'Staff User',
      email: 'staff@medikiosk.com',
      role: 'staff',
      status: 'active',
      created_at: '2026-10-16',
      last_login: '2026-10-18'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Sorting states
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    status: 'active'
  });

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'staff',
      status: 'active'
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (staffMember) => {
    setModalMode('edit');
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      password: '',
      role: staffMember.role,
      status: staffMember.status
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    if (modalMode === 'add' && !formData.password) {
      setError('Password is required for new staff');
      return;
    }

    if (modalMode === 'add') {
      const newStaff = {
        id: staff.length + 1,
        ...formData,
        created_at: new Date().toISOString().split('T')[0],
        last_login: 'Never'
      };
      setStaff([...staff, newStaff]);
      setSuccess('Staff member added successfully!');
    } else {
      setStaff(staff.map(s => 
        s.id === selectedStaff.id ? { ...s, ...formData } : s
      ));
      setSuccess('Staff member updated successfully!');
    }

    setShowModal(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = (staffMember) => {
    if (window.confirm(`Are you sure you want to delete ${staffMember.name}?`)) {
      setStaff(staff.filter(s => s.id !== staffMember.id));
      setSuccess('Staff member deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const toggleStatus = (staffMember) => {
    setStaff(staff.map(s => 
      s.id === staffMember.id 
        ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
        : s
    ));
    setSuccess(`Staff member ${staffMember.status === 'active' ? 'deactivated' : 'activated'} successfully!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sorting logic
  const sortedStaff = [...filteredStaff].sort((a, b) => {
    let aValue, bValue;

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'email':
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
        break;
      case 'role':
        aValue = a.role;
        bValue = b.role;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'created_at':
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStaff = sortedStaff.slice(startIndex, endIndex);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const activeStaff = staff.filter(s => s.status === 'active').length;
  const adminCount = staff.filter(s => s.role === 'admin').length;
  const staffCount = staff.filter(s => s.role === 'staff').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Accounts</h1>
            <p className="text-gray-600 mt-1">Manage staff members and their access</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Staff
          </button>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border-2 border-black p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{staff.length}</h3>
            <p className="text-sm text-gray-600">Total Staff</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border-2 border-black p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-green-600 mb-1">{activeStaff}</h3>
            <p className="text-sm text-gray-600">Active</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border-2 border-black p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-purple-600 mb-1">{adminCount}</h3>
            <p className="text-sm text-gray-600">Administrators</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border-2 border-black p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-orange-100 mb-4">
              <User className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-3xl font-bold text-orange-600 mb-1">{staffCount}</h3>
            <p className="text-sm text-gray-600">Staff Members</p>
          </div>
        </div>

        {/* Search + Staff Table Container - magkadikit */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-black overflow-hidden">
          {/* Search Filter */}
          <div className="bg-gray-50 p-4 border-b-2 border-black">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Staff Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    onClick={() => handleSort('name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Staff Member
                      {sortField === 'name' ? (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('role')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Role
                      {sortField === 'role' ? (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {sortField === 'status' ? (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedStaff.map((staffMember) => (
                  <tr key={staffMember.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{staffMember.name}</div>
                        <div className="text-sm text-gray-500">{staffMember.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        staffMember.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {staffMember.role === 'admin' ? 'Administrator' : 'Staff Member'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(staffMember)}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          staffMember.status === 'active'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {staffMember.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {staffMember.last_login}
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <button
                        onClick={() => openEditModal(staffMember)}
                        className="text-primary-600 hover:text-primary-900 inline-block"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(staffMember)}
                        className="text-red-600 hover:text-red-900 inline-block"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {sortedStaff.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, sortedStaff.length)}</span> of{' '}
                  <span className="font-medium">{sortedStaff.length}</span> results
                </span>
                
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 || 
                             page === totalPages || 
                             (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            currentPage === page
                              ? 'bg-primary-700 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Add Staff Member' : 'Edit Staff Member'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="john@medikiosk.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {modalMode === 'edit' && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder={modalMode === 'add' ? 'Required' : 'Optional'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="staff">Staff Member</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {modalMode === 'add' ? 'Add Staff' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminStaffAccounts;

