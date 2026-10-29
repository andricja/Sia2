import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, FileText, Eye, X, Calendar, DollarSign,
  ShoppingCart, Package, User, Phone, Mail, Download,
  ChevronUp, ChevronDown, ChevronsUpDown
} from 'lucide-react';

function AdminTransactions() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [error, setError] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Sorting states
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.request('/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.success) {
        setTransactions(response.data);
      }
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'refunded':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = !searchTerm || 
      txn.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.customer_name && txn.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (txn.customer_phone && txn.customer_phone.includes(searchTerm));
    
    const matchesStatus = filterStatus === 'all' || txn.status === filterStatus;
    
    const matchesDate = !filterDate || 
      new Date(txn.created_at).toISOString().split('T')[0] === filterDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Sorting logic
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue, bValue;

    switch (sortField) {
      case 'created_at':
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
        break;
      case 'order_number':
        aValue = a.order_number || '';
        bValue = b.order_number || '';
        break;
      case 'customer_name':
        aValue = a.customer_name || '';
        bValue = b.customer_name || '';
        break;
      case 'total_amount':
        aValue = parseFloat(a.total_amount);
        bValue = parseFloat(b.total_amount);
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterDate]);

  const stats = {
    total: transactions.length,
    completed: transactions.filter(t => t.status === 'completed').length,
    confirmed: transactions.filter(t => t.status === 'confirmed').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    totalRevenue: transactions
      .filter(t => t.status === 'completed' && t.payment_status === 'paid')
      .reduce((sum, t) => sum + parseFloat(t.total_amount), 0)
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Order Number', 'Date', 'Customer', 'Phone', 'Items', 'Amount', 'Status', 'Payment'];
    const rows = filteredTransactions.map(t => [
      t.order_number,
      new Date(t.created_at).toLocaleString(),
      t.customer_name || 'N/A',
      t.customer_phone || 'N/A',
      t.order_items?.length || 0,
      `₱${parseFloat(t.total_amount).toFixed(2)}`,
      t.status,
      t.payment_status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header - Medipulse Style */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent mb-1">
              Transactions
            </h1>
            <p className="text-gray-600 font-medium">View and manage all completed transactions</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center px-5 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Stats Cards - Medipulse Style Compact */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-soft p-4 border-2 border-black hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-soft p-4 border-2 border-black hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="h-4 w-4 text-accent-600" />
              </div>
            </div>
            <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Completed</p>
            <p className="text-2xl font-bold text-accent-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-xl shadow-soft p-4 border-2 border-black hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="h-4 w-4 text-secondary-600" />
              </div>
            </div>
            <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Confirmed</p>
            <p className="text-2xl font-bold text-secondary-600">{stats.confirmed}</p>
          </div>
          <div className="bg-white rounded-xl shadow-soft p-4 border-2 border-black hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-soft p-4 border-2 border-black hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-4 w-4 text-primary-600" />
              </div>
            </div>
            <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Total Revenue</p>
            <p className="text-2xl font-bold text-primary-700">₱{stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Transactions Table with Filters - No Gap */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border-2 border-black">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border-2 border-black">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border-2 border-black overflow-hidden">
            {/* Filters inside table container */}
            <div className="bg-gray-50 p-4 border-b-2 border-black">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search by order number, customer, phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setFilterDate('');
                      setCurrentPage(1);
                    }}
                    className="w-full flex items-center justify-center px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-black rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th 
                      onClick={() => handleSort('order_number')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Order #
                        {sortField === 'order_number' ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('created_at')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Date & Time
                        {sortField === 'created_at' ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('customer_name')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Customer
                        {sortField === 'customer_name' ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th 
                      onClick={() => handleSort('total_amount')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Amount
                        {sortField === 'total_amount' ? (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {transaction.order_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium text-gray-900">{transaction.customer_name || 'N/A'}</p>
                        <p className="text-gray-500">{transaction.customer_phone || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.order_items?.length || 0} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ₱{parseFloat(transaction.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(transaction.payment_status)}`}>
                          {transaction.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewDetails(transaction)}
                          className="text-primary-700 hover:text-primary-900 font-medium flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {sortedTransactions.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, sortedTransactions.length)}</span> of{' '}
                    <span className="font-medium">{sortedTransactions.length}</span> results
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
        )}

        {/* Results Count */}
        {!loading && sortedTransactions.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Total: {transactions.length} transactions
            {(searchTerm || filterStatus !== 'all' || filterDate) && ` (${sortedTransactions.length} filtered)`}
          </div>
        )}

        {/* Transaction Details Modal */}
        {showDetailsModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Transaction Details</h2>
                  <p className="text-sm text-gray-600 mt-1">Order #{selectedTransaction.order_number}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                {/* Status and Payment */}
                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedTransaction.status)}`}>
                    Order: {selectedTransaction.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(selectedTransaction.payment_status)}`}>
                    Payment: {selectedTransaction.payment_status}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">{selectedTransaction.customer_name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{selectedTransaction.customer_phone || 'N/A'}</p>
                      </div>
                    </div>
                    {selectedTransaction.customer_email && (
                      <div className="flex items-center md:col-span-2">
                        <Mail className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{selectedTransaction.customer_email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {selectedTransaction.order_items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center flex-1">
                          <Package className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{item.medicine?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-600">{item.medicine?.medicine_code || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          <p className="font-semibold text-gray-900">₱{parseFloat(item.subtotal).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-primary-700">₱{parseFloat(selectedTransaction.total_amount).toFixed(2)}</span>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Created: {new Date(selectedTransaction.created_at).toLocaleString()}</p>
                  <p>Updated: {new Date(selectedTransaction.updated_at).toLocaleString()}</p>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
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

export default AdminTransactions;

