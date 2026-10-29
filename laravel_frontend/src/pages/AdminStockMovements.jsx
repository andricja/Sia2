import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, Filter, TrendingUp, TrendingDown, Package, 
  AlertCircle, Calendar, User, FileText, Download,
  ChevronUp, ChevronDown, ChevronsUpDown
} from 'lucide-react';

function AdminStockMovements() {
  const { token } = useAuth();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [error, setError] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Sorting states
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const response = await api.request('/stock-movements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Handle paginated response
      if (response.success && response.data) {
        // Check if it's paginated data (has data property) or direct array
        const movementsData = response.data.data || response.data;
        setMovements(Array.isArray(movementsData) ? movementsData : []);
      } else if (Array.isArray(response.data)) {
        setMovements(response.data);
      } else {
        setMovements([]);
      }
    } catch (err) {
      console.error('Error fetching movements:', err);
      setError('Failed to load stock movements');
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const getMovementTypeIcon = (type) => {
    switch (type) {
      case 'received':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'adjustment':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'damaged':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'returned':
        return <TrendingDown className="h-5 w-5 text-purple-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getMovementTypeColor = (type) => {
    switch (type) {
      case 'received':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'adjustment':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'damaged':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'expired':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'returned':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredMovements = (Array.isArray(movements) ? movements : []).filter(movement => {
    const matchesSearch = !searchTerm || 
      movement.medicine?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.medicine?.medicine_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || movement.movement_type === filterType;
    
    const matchesDate = !filterDate || 
      new Date(movement.created_at).toISOString().split('T')[0] === filterDate;
    
    return matchesSearch && matchesType && matchesDate;
  });

  // Sorting logic
  const sortedMovements = [...filteredMovements].sort((a, b) => {
    let aValue, bValue;

    switch (sortField) {
      case 'created_at':
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
        break;
      case 'medicine':
        aValue = a.medicine?.name || '';
        bValue = b.medicine?.name || '';
        break;
      case 'type':
        aValue = a.movement_type || '';
        bValue = b.movement_type || '';
        break;
      case 'quantity':
        aValue = a.quantity_change;
        bValue = b.quantity_change;
        break;
      case 'user':
        aValue = a.user?.name || '';
        bValue = b.user?.name || '';
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedMovements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMovements = sortedMovements.slice(startIndex, endIndex);

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
  }, [searchTerm, filterType, filterDate]);

  const movementsArray = Array.isArray(movements) ? movements : [];
  const stats = {
    total: movementsArray.length,
    received: movementsArray.filter(m => m.movement_type === 'received').length,
    adjustments: movementsArray.filter(m => m.movement_type === 'adjustment').length,
    damaged: movementsArray.filter(m => m.movement_type === 'damaged').length,
    expired: movementsArray.filter(m => m.movement_type === 'expired').length,
    returned: movementsArray.filter(m => m.movement_type === 'returned').length,
  };

  const handleExportCSV = () => {
    if (filteredMovements.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Date', 'Medicine', 'Code', 'Type', 'Quantity Change', 'Before', 'After', 'Reason', 'Staff', 'Notes'];
    const rows = filteredMovements.map(m => [
      new Date(m.created_at).toLocaleString(),
      m.medicine?.name || 'N/A',
      m.medicine?.medicine_code || 'N/A',
      m.movement_type,
      m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change,
      m.quantity_before,
      m.quantity_after,
      m.reason || 'N/A',
      m.user?.name || 'N/A',
      m.notes || 'N/A'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-movements-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Movements</h1>
          <p className="text-gray-600">Track all inventory changes and stock adjustments</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Total Movements</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-green-200">
            <p className="text-xs text-gray-600 mb-1">Received</p>
            <p className="text-2xl font-bold text-green-600">{stats.received}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-200">
            <p className="text-xs text-gray-600 mb-1">Adjustments</p>
            <p className="text-2xl font-bold text-blue-600">{stats.adjustments}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-red-200">
            <p className="text-xs text-gray-600 mb-1">Damaged</p>
            <p className="text-2xl font-bold text-red-600">{stats.damaged}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-orange-200">
            <p className="text-xs text-gray-600 mb-1">Expired</p>
            <p className="text-2xl font-bold text-orange-600">{stats.expired}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-purple-200">
            <p className="text-xs text-gray-600 mb-1">Returned</p>
            <p className="text-2xl font-bold text-purple-600">{stats.returned}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search medicine, code, or staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Movement Type
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Types</option>
                  <option value="received">Received</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="damaged">Damaged</option>
                  <option value="expired">Expired</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
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
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterDate('');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800"
            >
              <Download className="h-5 w-5 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Movements Table */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
            <p className="mt-4 text-gray-600">Loading stock movements...</p>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stock movements found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' || filterDate
                ? 'Try adjusting your filters'
                : 'Stock movements will appear here when inventory is adjusted'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th 
                      onClick={() => handleSort('created_at')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                      onClick={() => handleSort('medicine')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Medicine
                        {sortField === 'medicine' ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('type')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Type
                        {sortField === 'type' ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('quantity')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Quantity Change
                        {sortField === 'quantity' ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Level
                    </th>
                    <th 
                      onClick={() => handleSort('user')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        User
                        {sortField === 'user' ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedMovements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(movement.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium text-gray-900">{movement.medicine?.name || 'N/A'}</p>
                        <p className="text-gray-500">{movement.medicine?.medicine_code || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMovementTypeColor(movement.movement_type)}`}>
                          {getMovementTypeIcon(movement.movement_type)}
                          <span className="ml-1 capitalize">{movement.movement_type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-semibold ${movement.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="text-gray-500">{movement.quantity_before}</span>
                        <span className="mx-2">→</span>
                        <span className="font-medium">{movement.quantity_after}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-gray-900">
                            {movement.user?.name || 'N/A'}
                          </span>
                        </div>
                        {movement.user?.role && (
                          <div className="text-xs text-gray-500 mt-0.5 ml-5">
                            {movement.user.role.charAt(0).toUpperCase() + movement.user.role.slice(1)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <p className="font-medium">{movement.reason || 'N/A'}</p>
                        {movement.notes && (
                          <p className="text-xs text-gray-500 mt-1">{movement.notes}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {sortedMovements.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, sortedMovements.length)}</span> of{' '}
                    <span className="font-medium">{sortedMovements.length}</span> results
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

        {/* Results Summary */}
        {!loading && filteredMovements.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Total: {movements.length} stock movements 
            {(searchTerm || filterType !== 'all' || filterDate) && ` (${filteredMovements.length} filtered)`}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminStockMovements;
