import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import { 
  QrCode, Search, Printer, Download, Package, Filter, Grid, List, Check, AlertCircle,
  ChevronUp, ChevronDown, ChevronsUpDown, Archive, CheckCircle
} from 'lucide-react';
import api from '../services/api';
import Barcode from 'react-barcode';

function AdminBarcodeGenerator() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [loading, setLoading] = useState(true);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Archive modal state
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [medicineToArchive, setMedicineToArchive] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // 12 for grid view (3x4)
  
  // Sorting states
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    filterMedicines();
  }, [searchTerm, categoryFilter, medicines]);

  const fetchMedicines = async () => {
    try {
      const response = await api.getMedicines();
      // Filter out archived medicines
      const archivedItems = JSON.parse(localStorage.getItem('archivedMedicines') || '[]');
      const archivedIds = archivedItems.map(item => item.id);
      const activeMedicines = (response.data || []).filter(med => !archivedIds.includes(med.id));
      setMedicines(activeMedicines);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate unique barcode
  const generateUniqueBarcode = (existingBarcodes = []) => {
    const timestamp = Date.now().toString().slice(-10);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const barcode = timestamp + random;
    
    // Ensure uniqueness
    if (existingBarcodes.includes(barcode)) {
      return generateUniqueBarcode(existingBarcodes);
    }
    return barcode;
  };

  // Generate barcodes for medicines without them
  const generateMissingBarcodes = async () => {
    setGenerating(true);
    setError('');
    setSuccess('');
    
    try {
      const medicinesWithoutBarcodes = medicines.filter(m => !m.barcode);
      
      if (medicinesWithoutBarcodes.length === 0) {
        setSuccess('All medicines already have barcodes!');
        setGenerating(false);
        return;
      }
      
      const existingBarcodes = medicines.filter(m => m.barcode).map(m => m.barcode);
      let updatedCount = 0;
      
      for (const medicine of medicinesWithoutBarcodes) {
        const newBarcode = generateUniqueBarcode(existingBarcodes);
        existingBarcodes.push(newBarcode);
        
        try {
          await api.updateMedicine(medicine.id, {
            ...medicine,
            barcode: newBarcode
          });
          updatedCount++;
        } catch (err) {
          console.error(`Failed to update medicine ${medicine.id}:`, err);
        }
      }
      
      setSuccess(`Successfully generated ${updatedCount} barcodes!`);
      await fetchMedicines(); // Refresh the list
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to generate barcodes');
      setTimeout(() => setError(''), 5000);
    } finally {
      setGenerating(false);
    }
  };

  const filterMedicines = () => {
    let filtered = medicines;

    if (searchTerm) {
      filtered = filtered.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.medicine_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (med.barcode && med.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(med => med.category === categoryFilter);
    }

    setFilteredMedicines(filtered);
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  // Sorting logic
  const sortedMedicines = [...filteredMedicines].sort((a, b) => {
    let aValue, bValue;

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'medicine_code':
        aValue = a.medicine_code.toLowerCase();
        bValue = b.medicine_code.toLowerCase();
        break;
      case 'category':
        aValue = a.category.toLowerCase();
        bValue = b.category.toLowerCase();
        break;
      case 'price':
        aValue = parseFloat(a.price);
        bValue = parseFloat(b.price);
        break;
      case 'stock_quantity':
        aValue = a.stock_quantity;
        bValue = b.stock_quantity;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedMedicines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMedicines = sortedMedicines.slice(startIndex, endIndex);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const categories = [...new Set(medicines.map(m => m.category))];

  const toggleMedicineSelection = (medicineId) => {
    if (selectedMedicines.includes(medicineId)) {
      setSelectedMedicines(selectedMedicines.filter(id => id !== medicineId));
    } else {
      setSelectedMedicines([...selectedMedicines, medicineId]);
    }
  };

  const selectAll = () => {
    setSelectedMedicines(filteredMedicines.map(m => m.id));
  };

  const deselectAll = () => {
    setSelectedMedicines([]);
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadBarcodes = () => {
    setShowPrintPreview(true);
    setTimeout(() => {
      window.print();
      setShowPrintPreview(false);
    }, 500);
  };

  const handleArchiveMedicine = (medicine) => {
    setMedicineToArchive(medicine);
    setShowArchiveModal(true);
  };

  const confirmArchive = () => {
    if (!medicineToArchive) return;
    
    try {
      // Add to archived items in localStorage
      const archivedItems = JSON.parse(localStorage.getItem('archivedMedicines') || '[]');
      const archivedItem = {
        ...medicineToArchive,
        archived_at: new Date().toISOString(),
        archived_by: user?.name || 'Admin User',
        type: 'medicine'
      };
      archivedItems.push(archivedItem);
      localStorage.setItem('archivedMedicines', JSON.stringify(archivedItems));

      // Remove from active medicines list immediately
      const updatedMedicines = medicines.filter(m => m.id !== medicineToArchive.id);
      setMedicines(updatedMedicines);
      setFilteredMedicines(updatedMedicines.filter(med => {
        const matchesSearch = !searchTerm || 
          med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          med.medicine_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (med.barcode && med.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = !categoryFilter || med.category === categoryFilter;
        return matchesSearch && matchesCategory;
      }));
      
      setSuccessMessage(`"${medicineToArchive.name}" archived successfully!`);
      setShowArchiveModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Archive error:', error);
      setShowArchiveModal(false);
    } finally {
      setMedicineToArchive(null);
    }
  };

  const selectedMedicinesData = medicines.filter(m => selectedMedicines.includes(m.id));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Barcode Generator</h1>
            <p className="text-gray-600 mt-1">Generate and print medicine barcodes for POS scanning</p>
          </div>
          <div className="flex gap-3">
            {medicines.filter(m => !m.barcode).length > 0 && (
              <button
                onClick={generateMissingBarcodes}
                disabled={generating}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50"
              >
                <QrCode className="h-5 w-5 mr-2" />
                {generating ? 'Generating...' : `Generate ${medicines.filter(m => !m.barcode).length} Missing`}
              </button>
            )}
            {selectedMedicines.length > 0 && (
              <button
                onClick={() => setShowPrintPreview(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/30"
              >
                <Printer className="h-5 w-5 mr-2" />
                Print {selectedMedicines.length} Barcode{selectedMedicines.length > 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center">
            <Check className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Selection Info */}
        {selectedMedicines.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-blue-800 font-medium">
                {selectedMedicines.length} medicine{selectedMedicines.length > 1 ? 's' : ''} selected
              </p>
              <button
                onClick={deselectAll}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black/60 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, code, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Select All
              </button>
              <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-600'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-600'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 mb-4">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{medicines.length}</h3>
            <p className="text-sm text-gray-600 font-medium">Total Medicines</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-green-100 mb-4">
              <QrCode className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-green-600 mb-1">
              {medicines.filter(m => m.barcode).length}
            </h3>
            <p className="text-sm text-gray-600 font-medium">With Barcodes</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary-100 mb-4">
              <Printer className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-3xl font-bold text-primary-600 mb-1">{selectedMedicines.length}</h3>
            <p className="text-sm text-gray-600 font-medium">Selected to Print</p>
          </div>
        </div>

        {/* Medicine Grid/List */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black/60 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading medicines...</p>
          </div>
        ) : viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedMedicines.map((medicine) => (
              <div
                key={medicine.id}
                onClick={() => toggleMedicineSelection(medicine.id)}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
                  selectedMedicines.includes(medicine.id)
                    ? 'border-primary-500 ring-2 ring-primary-500'
                    : 'border-gray-200/60'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{medicine.name}</h3>
                      <p className="text-sm text-gray-600">{medicine.medicine_code}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedMedicines.includes(medicine.id)}
                      onChange={() => {}}
                      className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>

                  {medicine.barcode ? (
                    <div className="bg-white p-2 rounded-lg border-2 border-black overflow-hidden">
                      <div className="flex items-center justify-center w-full" style={{ maxWidth: '100%' }}>
                        <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
                          <Barcode 
                            value={medicine.barcode} 
                            height={40}
                            width={1}
                            fontSize={10}
                            background="#ffffff"
                            lineColor="#000000"
                            margin={0}
                            displayValue={true}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-4 rounded-lg text-center">
                      <QrCode className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No barcode assigned</p>
                    </div>
                  )}

                  <div className="mt-4 text-sm">
                    <p className="text-gray-600">Category: <span className="font-medium text-gray-900">{medicine.category}</span></p>
                    <p className="text-gray-600">Price: <span className="font-bold text-primary-600">₱{parseFloat(medicine.price).toFixed(2)}</span></p>
                  </div>

                  {/* Archive Button - Below Price */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchiveMedicine(medicine);
                    }}
                    className="mt-3 w-full flex items-center justify-center px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors text-sm font-medium"
                    title="Archive Medicine"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Medicine
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination Controls for Grid View */}
          {sortedMedicines.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black/60 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, sortedMedicines.length)}</span> of{' '}
                  <span className="font-medium">{sortedMedicines.length}</span> results
                </span>
                
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={48}>48 per page</option>
                  <option value={96}>96 per page</option>
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
        </>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-black/60 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedMedicines.length === paginatedMedicines.length && paginatedMedicines.length > 0}
                      onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
                      className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th 
                    onClick={() => handleSort('name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Medicine
                      {sortField === 'name' ? (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('medicine_code')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Code
                      {sortField === 'medicine_code' ? (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('category')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Category
                      {sortField === 'category' ? (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('price')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Price
                      {sortField === 'price' ? (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMedicines.map((medicine) => (
                  <tr
                    key={medicine.id}
                    className={`hover:bg-gray-50 ${
                      selectedMedicines.includes(medicine.id) ? 'bg-primary-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedMedicines.includes(medicine.id)}
                        onChange={() => toggleMedicineSelection(medicine.id)}
                        className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td 
                      onClick={() => toggleMedicineSelection(medicine.id)}
                      className="px-6 py-4 cursor-pointer"
                    >
                      <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveMedicine(medicine);
                        }}
                        className="mt-1 text-orange-600 hover:text-orange-900 inline-flex items-center text-xs font-medium"
                        title="Archive Medicine"
                      >
                        <Archive className="h-3 w-3 mr-1" />
                        Archive
                      </button>
                    </td>
                    <td 
                      onClick={() => toggleMedicineSelection(medicine.id)}
                      className="px-6 py-4 text-sm text-gray-600 cursor-pointer"
                    >
                      {medicine.medicine_code}
                    </td>
                    <td 
                      onClick={() => toggleMedicineSelection(medicine.id)}
                      className="px-6 py-4 text-sm text-gray-600 cursor-pointer"
                    >
                      {medicine.category}
                    </td>
                    <td 
                      onClick={() => toggleMedicineSelection(medicine.id)}
                      className="px-6 py-4 text-sm font-bold text-primary-600 cursor-pointer"
                    >
                      ₱{parseFloat(medicine.price).toFixed(2)}
                    </td>
                    <td 
                      onClick={() => toggleMedicineSelection(medicine.id)}
                      className="px-6 py-4 cursor-pointer"
                    >
                      {medicine.barcode ? (
                        <span className="text-sm text-gray-900 font-mono">{medicine.barcode}</span>
                      ) : (
                        <span className="text-sm text-gray-400">No barcode</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination Controls for List View */}
            {sortedMedicines.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, sortedMedicines.length)}</span> of{' '}
                    <span className="font-medium">{sortedMedicines.length}</span> results
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
      </div>

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center print:hidden">
              <h3 className="text-xl font-bold text-gray-900">Print Preview</h3>
              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </button>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="p-6" id="print-area">
              <div className="grid grid-cols-3 gap-4">
                {selectedMedicinesData.map((medicine) => (
                  medicine.barcode && (
                    <div key={medicine.id} className="border border-gray-300 rounded-lg p-4 bg-white text-center break-inside-avoid">
                      <h4 className="font-bold text-sm mb-2 truncate">{medicine.name}</h4>
                      <p className="text-xs text-gray-600 mb-2">{medicine.medicine_code}</p>
                      <div className="flex justify-center">
                        <Barcode 
                          value={medicine.barcode} 
                          height={60}
                          width={2}
                          fontSize={14}
                          background="#ffffff"
                          lineColor="#000000"
                        />
                      </div>
                      <p className="text-sm font-bold text-primary-600 mt-2">
                        ₱{parseFloat(medicine.price).toFixed(2)}
                      </p>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          #print-area,
          #print-area * {
            visibility: visible;
          }
          
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
        
        /* Responsive Barcode Styles */
        svg[class*="barcode"] {
          max-width: 100% !important;
          height: auto !important;
        }
      `}</style>
      
      {/* Archive Confirmation Modal */}
      {showArchiveModal && medicineToArchive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-4">
                <Archive className="h-8 w-8 text-orange-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Archive Medicine?</h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to archive <span className="font-semibold">"{medicineToArchive.name}"</span>?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Archived items can be restored from Settings → Archive.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowArchiveModal(false);
                    setMedicineToArchive(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmArchive}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl font-semibold transition-all shadow-lg"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 mb-2">{successMessage}</p>
              <p className="text-sm text-gray-500 mb-6">
                View archived items in Settings → Archive.
              </p>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all shadow-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminBarcodeGenerator;

