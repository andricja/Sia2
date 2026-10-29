import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import { 
  Package, Search, Plus, Edit, Eye, X, Save, AlertCircle, TrendingUp, Calendar, Download, Clock,
  ChevronUp, ChevronDown, ChevronsUpDown, TrendingDown, Filter, User, FileText, Archive, CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

function AdminMedicines() {
  const { token, user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [stockAdjustment, setStockAdjustment] = useState('+0');
  const [expiryDate, setExpiryDate] = useState('');
  const [activeTab, setActiveTab] = useState('medicines'); // 'medicines', 'categories', 'expiry', or 'movements'
  const [expiryRecords, setExpiryRecords] = useState([]);
  const [filteredExpiryRecords, setFilteredExpiryRecords] = useState([]);
  const [expirySearchTerm, setExpirySearchTerm] = useState('');
  const [expiryFilterStatus, setExpiryFilterStatus] = useState('all');

  // Categories states
  const [categories, setCategories] = useState([]);
  const [success, setSuccess] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  // Archive modal state
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [medicineToArchive, setMedicineToArchive] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Archive expiry batch modal state
  const [showArchiveBatchModal, setShowArchiveBatchModal] = useState(false);
  const [batchToArchive, setBatchToArchive] = useState(null);

  // Category delete modal state
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteCategoryError, setDeleteCategoryError] = useState('');

  // Pagination & Sorting for Medicines
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Pagination & Sorting for Expiry Records
  const [expiryCurrentPage, setExpiryCurrentPage] = useState(1);
  const [expiryItemsPerPage, setExpiryItemsPerPage] = useState(10);
  const [expirySortField, setExpirySortField] = useState('expiry_date');
  const [expirySortDirection, setExpirySortDirection] = useState('asc');

  // Stock Movements states
  const [movements, setMovements] = useState([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementsSearchTerm, setMovementsSearchTerm] = useState('');
  const [movementsFilterType, setMovementsFilterType] = useState('all');
  const [movementsFilterDate, setMovementsFilterDate] = useState('');
  const [chartTimePeriod, setChartTimePeriod] = useState('week'); // 'today', 'week', 'month', 'year', 'custom'
  const [chartCustomStartDate, setChartCustomStartDate] = useState('');
  const [chartCustomEndDate, setChartCustomEndDate] = useState('');
  
  // Pagination & Sorting for Stock Movements
  const [movementsCurrentPage, setMovementsCurrentPage] = useState(1);
  const [movementsItemsPerPage, setMovementsItemsPerPage] = useState(10);
  const [movementsSortField, setMovementsSortField] = useState('created_at');
  const [movementsSortDirection, setMovementsSortDirection] = useState('desc');

  const [formData, setFormData] = useState({
    medicine_code: '',
    barcode: '',
    name: '',
    description: '',
    category: '',
    price: '',
    stock_quantity: '',
    reorder_level: 50,
    expiry_date: ''
  });

  // Generate unique barcode
  const generateBarcode = () => {
    // Generate a unique 13-digit barcode (EAN-13 style)
    const timestamp = Date.now().toString().slice(-10); // Last 10 digits of timestamp
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 3 random digits
    const barcode = timestamp + random;
    
    setFormData({...formData, barcode: barcode});
  };

  // Auto-generate medicine code if not exists
  const generateMedicineCode = () => {
    const prefix = 'MED';
    const timestamp = Date.now().toString().slice(-6);
    const code = prefix + timestamp;
    
    setFormData({...formData, medicine_code: code});
  };

  useEffect(() => {
    fetchMedicines();
    fetchCategories();
    fetchExpiryRecords();
    fetchMovements();
  }, []);

  useEffect(() => {
    filterMedicines();
  }, [searchTerm, categoryFilter, medicines]);

  useEffect(() => {
    filterExpiryRecords();
  }, [expirySearchTerm, expiryFilterStatus, expiryRecords]);

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

  const fetchCategories = async () => {
    try {
      const response = await api.request('/categories');
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategorySave = async () => {
    if (!categoryFormData.name.trim()) {
      setError('Category name is required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSaving(true);
    try {
      if (categoryModalMode === 'add') {
        await api.request('/categories', {
          method: 'POST',
          body: categoryFormData
        });
        setSuccess('Category created successfully');
      } else {
        await api.request(`/categories/${selectedCategory.id}`, {
          method: 'PUT',
          body: categoryFormData
        });
        setSuccess('Category updated successfully');
      }
      await fetchCategories();
      await fetchMedicines();
      setShowCategoryModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save category');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await api.request(`/categories/${categoryToDelete.id}`, { method: 'DELETE' });
      await fetchCategories();
      setSuccess('Category deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      setShowDeleteCategoryModal(false);
      setCategoryToDelete(null);
      setDeleteCategoryError('');
    } catch (err) {
      setError('Failed to delete category');
      setTimeout(() => setError(''), 3000);
      setShowDeleteCategoryModal(false);
      setCategoryToDelete(null);
      setDeleteCategoryError('');
    }
  };

  const fetchExpiryRecords = async () => {
    try {
      const expiryResponse = await api.request('/expiry-records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const records = expiryResponse.data || [];
      const recordsArray = Array.isArray(records) ? records : [];
      
      // If no real records, use mock data
      if (recordsArray.length === 0 && medicines.length > 0) {
        const mockRecords = generateMockExpiryData();
        setExpiryRecords(mockRecords);
      } else {
        setExpiryRecords(recordsArray);
      }
    } catch (error) {
      console.log('Using mock expiry data');
      const mockRecords = generateMockExpiryData();
      setExpiryRecords(mockRecords);
    }
  };

  const generateMockExpiryData = () => {
    if (!medicines || medicines.length === 0) return [];
    
    const mockRecords = [];
    const today = new Date();
    const sampleMedicines = medicines.slice(0, Math.min(10, medicines.length));
    
    sampleMedicines.forEach((medicine) => {
      const numRecords = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numRecords; i++) {
        const daysOffset = [-30, -10, 5, 15, 45, 90, 180, 365];
        const randomDays = daysOffset[Math.floor(Math.random() * daysOffset.length)];
        const expiryDate = new Date(today);
        expiryDate.setDate(today.getDate() + randomDays);
        
        const addedDaysAgo = Math.floor(Math.random() * 60) + 1;
        const addedDate = new Date(today);
        addedDate.setDate(today.getDate() - addedDaysAgo);
        
        mockRecords.push({
          id: mockRecords.length + 1,
          medicine_id: medicine.id,
          quantity: Math.floor(Math.random() * 100) + 10,
          expiry_date: expiryDate.toISOString().split('T')[0],
          added_date: addedDate.toISOString().split('T')[0]
        });
      }
    });
    
    return mockRecords;
  };

  const fetchMovements = async () => {
    setMovementsLoading(true);
    try {
      const response = await api.request('/stock-movements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.success && response.data) {
        const movementsData = response.data.data || response.data;
        setMovements(Array.isArray(movementsData) ? movementsData : []);
      } else if (Array.isArray(response.data)) {
        setMovements(response.data);
      } else {
        setMovements([]);
      }
    } catch (err) {
      console.error('Error fetching movements:', err);
      setMovements([]);
    } finally {
      setMovementsLoading(false);
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
  };

  // Sort and paginate medicines
  const sortedMedicines = [...filteredMedicines].sort((a, b) => {
    let aValue, bValue;
    switch (sortField) {
      case 'name':
        aValue = a.name || '';
        bValue = b.name || '';
        break;
      case 'code':
        aValue = a.medicine_code || '';
        bValue = b.medicine_code || '';
        break;
      case 'category':
        aValue = a.category || '';
        bValue = b.category || '';
        break;
      case 'price':
        aValue = parseFloat(a.price) || 0;
        bValue = parseFloat(b.price) || 0;
        break;
      case 'stock':
        aValue = a.stock_quantity || 0;
        bValue = b.stock_quantity || 0;
        break;
      default:
        return 0;
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalMedicinesPages = Math.ceil(sortedMedicines.length / itemsPerPage);
  const medicinesStartIndex = (currentPage - 1) * itemsPerPage;
  const medicinesEndIndex = medicinesStartIndex + itemsPerPage;
  const paginatedMedicines = sortedMedicines.slice(medicinesStartIndex, medicinesEndIndex);

  const handleMedicineSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filterExpiryRecords = () => {
    let filtered = expiryRecords;

    if (expirySearchTerm) {
      filtered = filtered.filter(record => {
        const medicine = medicines.find(m => m.id === record.medicine_id);
        return medicine?.name.toLowerCase().includes(expirySearchTerm.toLowerCase()) ||
               medicine?.medicine_code.toLowerCase().includes(expirySearchTerm.toLowerCase());
      });
    }

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (expiryFilterStatus !== 'all') {
      filtered = filtered.filter(record => {
        const expiryDate = new Date(record.expiry_date);
        
        if (expiryFilterStatus === 'expired') {
          return expiryDate < today;
        } else if (expiryFilterStatus === 'expiring') {
          return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
        } else if (expiryFilterStatus === 'valid') {
          return expiryDate > thirtyDaysFromNow;
        }
        return true;
      });
    }

    setFilteredExpiryRecords(filtered);
  };

  // Sort and paginate expiry records
  const sortedExpiryRecords = [...filteredExpiryRecords].sort((a, b) => {
    let aValue, bValue;
    switch (expirySortField) {
      case 'medicine':
        const aMed = medicines.find(m => m.id === a.medicine_id);
        const bMed = medicines.find(m => m.id === b.medicine_id);
        aValue = aMed?.name || '';
        bValue = bMed?.name || '';
        break;
      case 'quantity':
        aValue = a.quantity || 0;
        bValue = b.quantity || 0;
        break;
      case 'expiry_date':
        aValue = new Date(a.expiry_date);
        bValue = new Date(b.expiry_date);
        break;
      case 'added_date':
        aValue = new Date(a.added_date);
        bValue = new Date(b.added_date);
        break;
      default:
        return 0;
    }
    if (aValue < bValue) return expirySortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return expirySortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalExpiryPages = Math.ceil(sortedExpiryRecords.length / expiryItemsPerPage);
  const expiryStartIndex = (expiryCurrentPage - 1) * expiryItemsPerPage;
  const expiryEndIndex = expiryStartIndex + expiryItemsPerPage;
  const paginatedExpiryRecords = sortedExpiryRecords.slice(expiryStartIndex, expiryEndIndex);

  const handleExpirySort = (field) => {
    if (expirySortField === field) {
      setExpirySortDirection(expirySortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setExpirySortField(field);
      setExpirySortDirection('asc');
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    setExpiryCurrentPage(1);
  }, [expirySearchTerm, expiryFilterStatus]);

  // Stock Movements filtering, sorting, and pagination
  const filteredMovements = (Array.isArray(movements) ? movements : []).filter(movement => {
    const matchesSearch = !movementsSearchTerm || 
      movement.medicine?.name.toLowerCase().includes(movementsSearchTerm.toLowerCase()) ||
      movement.medicine?.medicine_code.toLowerCase().includes(movementsSearchTerm.toLowerCase()) ||
      movement.user?.name.toLowerCase().includes(movementsSearchTerm.toLowerCase());
    
    const matchesType = movementsFilterType === 'all' || movement.movement_type === movementsFilterType;
    
    const matchesDate = !movementsFilterDate || 
      new Date(movement.created_at).toISOString().split('T')[0] === movementsFilterDate;
    
    // Time period filter for chart sync
    let matchesTimePeriod = true;
    const movementDate = new Date(movement.created_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (chartTimePeriod === 'today') {
      const todayStart = new Date(today);
      matchesTimePeriod = movementDate >= todayStart;
    } else if (chartTimePeriod === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 6);
      matchesTimePeriod = movementDate >= weekAgo;
    } else if (chartTimePeriod === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setDate(today.getDate() - 29);
      matchesTimePeriod = movementDate >= monthAgo;
    } else if (chartTimePeriod === 'year') {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(today.getFullYear() - 1);
      matchesTimePeriod = movementDate >= yearAgo;
    } else if (chartTimePeriod === 'custom' && chartCustomStartDate && chartCustomEndDate) {
      const start = new Date(chartCustomStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(chartCustomEndDate);
      end.setHours(23, 59, 59, 999);
      matchesTimePeriod = movementDate >= start && movementDate <= end;
    }
    
    return matchesSearch && matchesType && matchesDate && matchesTimePeriod;
  });

  const sortedMovements = [...filteredMovements].sort((a, b) => {
    let aValue, bValue;
    switch (movementsSortField) {
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
    if (aValue < bValue) return movementsSortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return movementsSortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalMovementsPages = Math.ceil(sortedMovements.length / movementsItemsPerPage);
  const movementsStartIndex = (movementsCurrentPage - 1) * movementsItemsPerPage;
  const movementsEndIndex = movementsStartIndex + movementsItemsPerPage;
  const paginatedMovements = sortedMovements.slice(movementsStartIndex, movementsEndIndex);

  const handleMovementsSort = (field) => {
    if (movementsSortField === field) {
      setMovementsSortDirection(movementsSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setMovementsSortField(field);
      setMovementsSortDirection('asc');
    }
  };

  useEffect(() => {
    setMovementsCurrentPage(1);
  }, [movementsSearchTerm, movementsFilterType, movementsFilterDate]);

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

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (expiry < today) {
      return {
        label: 'Expired',
        color: 'text-red-700',
        bg: 'bg-red-100',
        days: daysUntilExpiry
      };
    } else if (expiry <= thirtyDaysFromNow) {
      return {
        label: 'Expiring Soon',
        color: 'text-orange-700',
        bg: 'bg-orange-100',
        days: daysUntilExpiry
      };
    } else {
      return {
        label: 'Valid',
        color: 'text-green-700',
        bg: 'bg-green-100',
        days: daysUntilExpiry
      };
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Out of Stock' };
    if (stock < 50) return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Low Stock' };
    return { color: 'text-green-600', bg: 'bg-green-100', label: 'In Stock' };
  };

  const fillMockData = () => {
    const mockMedicines = [
      {
        medicine_code: 'MED-011',
        barcode: '8901234567890',
        name: 'Ibuprofen 400mg',
        description: 'Nonsteroidal anti-inflammatory drug (NSAID) for pain relief',
        category: 'Pain Relief',
        price: '95.00',
        stock_quantity: '200',
        reorder_level: 50,
        expiry_date: '2027-12-31'
      },
      {
        medicine_code: 'MED-012',
        barcode: '8901234567891',
        name: 'Omeprazole 20mg',
        description: 'Proton pump inhibitor for acid reflux and heartburn',
        category: 'Digestive Health',
        price: '180.00',
        stock_quantity: '150',
        reorder_level: 50,
        expiry_date: '2027-10-15'
      },
      {
        medicine_code: 'MED-013',
        barcode: '8901234567892',
        name: 'Loratadine 10mg',
        description: 'Antihistamine for allergies and hay fever',
        category: 'Allergy & Sinus',
        price: '110.00',
        stock_quantity: '180',
        reorder_level: 50,
        expiry_date: '2027-09-30'
      },
      {
        medicine_code: 'MED-014',
        barcode: '8901234567893',
        name: 'Mefenamic Acid 500mg',
        description: 'Pain reliever for menstrual cramps and inflammation',
        category: 'Pain Relief',
        price: '130.00',
        stock_quantity: '100',
        reorder_level: 50,
        expiry_date: '2028-01-20'
      },
      {
        medicine_code: 'MED-015',
        barcode: '8901234567894',
        name: 'Biogesic 500mg',
        description: 'Paracetamol brand for fever and mild to moderate pain',
        category: 'Pain Relief',
        price: '85.00',
        stock_quantity: '300',
        reorder_level: 50,
        expiry_date: '2027-11-11'
      }
    ];
    
    return mockMedicines[Math.floor(Math.random() * mockMedicines.length)];
  };

  const openAddModal = (useMockData = false) => {
    setModalMode('add');
    
    if (useMockData) {
      const mockData = fillMockData();
      setFormData(mockData);
    } else {
      setFormData({
        medicine_code: '',
        barcode: '',
        name: '',
        description: '',
        category: '',
        price: '',
        stock_quantity: '',
        reorder_level: 50,
        expiry_date: ''
      });
    }
    
    setError('');
    setShowModal(true);
  };

  const openEditModal = (medicine) => {
    setModalMode('edit');
    setSelectedMedicine(medicine);
    setFormData({
      medicine_code: medicine.medicine_code || '',
      barcode: medicine.barcode || '',
      name: medicine.name || '',
      description: medicine.description || '',
      category: medicine.category || '',
      price: medicine.price || '',
      stock_quantity: medicine.stock_quantity || '',
      reorder_level: medicine.reorder_level || 50,
      expiry_date: medicine.expiry_date || ''
    });
    setError('');
    setShowModal(true);
  };

  const openViewModal = (medicine) => {
    setModalMode('view');
    setSelectedMedicine(medicine);
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);

    // Validation
    if (!formData.name || !formData.category || !formData.price) {
      setError('Please fill in all required fields');
      setSaving(false);
      return;
    }

    try {
      if (modalMode === 'add') {
        const response = await api.createMedicine(formData);
        
        // Create stock movement record if initial stock is added
        const initialStock = parseInt(formData.stock_quantity) || 0;
        if (initialStock > 0 && response.data) {
          try {
            await api.request('/stock-movements', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                medicine_id: response.data.id,
                movement_type: 'received',
                quantity_change: initialStock,
                reason: 'Initial Stock - New Medicine Added',
                notes: `New medicine "${formData.name}" added to inventory with initial stock`
              })
            });
          } catch (movementError) {
            console.error('Failed to create stock movement:', movementError);
            // Don't fail the whole operation if stock movement fails
          }
        }
      } else if (modalMode === 'edit') {
        await api.updateMedicine(selectedMedicine.id, formData);
      }

      await fetchMedicines();
      setShowModal(false);
      setError('');
    } catch (error) {
      setError(error.message || 'Failed to save medicine');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (medicine) => {
    setMedicineToArchive(medicine);
    setShowArchiveModal(true);
  };

  const confirmArchive = async () => {
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
      
      // This will be implemented when backend supports archiving
      // await api.archiveMedicine(medicineToArchive.id);
    } catch (error) {
      console.error('Archive error:', error);
      setError(error.message || 'Failed to archive medicine');
      setShowArchiveModal(false);
    } finally {
      setMedicineToArchive(null);
    }
  };

  const handleArchiveBatch = (record, medicine) => {
    setBatchToArchive({ record, medicine });
    setShowArchiveBatchModal(true);
  };

  const confirmArchiveBatch = async () => {
    if (!batchToArchive) return;

    const { record, medicine } = batchToArchive;

    try {
      // Create stock movement record for archived batch
      // The StockMovement API will automatically update the medicine stock
      await api.request('/stock-movements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          medicine_id: medicine.id,
          movement_type: 'expired',
          quantity_change: -record.quantity,
          reason: 'Batch Archived - Expired/Damaged Stock',
          notes: `Batch archived: ${record.quantity} units expiring on ${new Date(record.expiry_date).toLocaleDateString()}`
        })
      });

      // Add to archived batches in localStorage
      const archivedBatches = JSON.parse(localStorage.getItem('archivedExpiryBatches') || '[]');
      const archivedBatch = {
        ...record,
        medicine_name: medicine.name,
        medicine_code: medicine.medicine_code,
        category: medicine.category,
        archived_at: new Date().toISOString(),
        archived_by: user?.name || 'Admin User',
        type: 'expiry_batch'
      };
      archivedBatches.push(archivedBatch);
      localStorage.setItem('archivedExpiryBatches', JSON.stringify(archivedBatches));

      // Remove from expiry records
      const updatedRecords = expiryRecords.filter(r => r.id !== record.id);
      setExpiryRecords(updatedRecords);
      
      // Update filtered records
      const updatedFiltered = updatedRecords.filter(expiryRecord => {
        const med = medicines.find(m => m.id === expiryRecord.medicine_id);
        const matchesSearch = !expirySearchTerm || 
          med?.name.toLowerCase().includes(expirySearchTerm.toLowerCase()) ||
          med?.medicine_code.toLowerCase().includes(expirySearchTerm.toLowerCase());

        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        const expiryDate = new Date(expiryRecord.expiry_date);

        let matchesStatus = true;
        if (expiryFilterStatus === 'expired') {
          matchesStatus = expiryDate < today;
        } else if (expiryFilterStatus === 'expiring') {
          matchesStatus = expiryDate >= today && expiryDate <= thirtyDaysFromNow;
        } else if (expiryFilterStatus === 'valid') {
          matchesStatus = expiryDate > thirtyDaysFromNow;
        }

        return matchesSearch && matchesStatus;
      });
      setFilteredExpiryRecords(updatedFiltered);

      // Refresh medicines list to show updated stock
      await fetchMedicines();

      setSuccessMessage(`Batch of ${record.quantity} units of "${medicine.name}" archived successfully! Stock reduced by ${record.quantity} units.`);
      setShowArchiveBatchModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Archive batch error:', error);
      setError(error.message || 'Failed to archive batch');
      setShowArchiveBatchModal(false);
    } finally {
      setBatchToArchive(null);
    }
  };

  const handleAdjustStock = (medicine) => {
    setSelectedMedicine(medicine);
    setStockAdjustment('+0');
    setExpiryDate('');
    setError('');
    setShowStockModal(true);
  };


  const handleStockAdjustmentSave = async () => {
    const currentStock = selectedMedicine.stock_quantity;
    const trimmed = stockAdjustment.trim();
    let newStock;
    let quantityAdded = 0;

    if (trimmed.startsWith('+')) {
      quantityAdded = parseInt(trimmed.substring(1));
      newStock = currentStock + quantityAdded;
    } else if (trimmed.startsWith('-')) {
      quantityAdded = -parseInt(trimmed.substring(1));
      newStock = currentStock + quantityAdded;
    } else {
      quantityAdded = parseInt(trimmed) - currentStock;
      newStock = parseInt(trimmed);
    }

    if (isNaN(newStock) || newStock < 0) {
      setError('Invalid adjustment value. Stock cannot be negative.');
      return;
    }

    if (!expiryDate && quantityAdded > 0) {
      setError('Please enter expiry date for new stock.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Don't update medicine stock here - the StockMovement API will do it automatically
      // when we create the movement record below

      // Create stock movement record (this will also update the stock automatically)
      const movementType = quantityAdded > 0 ? 'received' : 'adjustment';
      const reason = quantityAdded > 0 
        ? 'Stock Added - Manual Restock' 
        : quantityAdded < 0 
          ? 'Stock Reduced - Manual Adjustment'
          : 'Stock Adjusted - Manual Correction';
      
      await api.request('/stock-movements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          medicine_id: selectedMedicine.id,
          movement_type: movementType,
          quantity_change: quantityAdded,
          reason: reason,
          notes: `Manual stock adjustment from Medicine Management`
        })
      });

      // Create expiry record if adding stock
      if (quantityAdded > 0 && expiryDate) {
        await api.request('/expiry-records', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            medicine_id: selectedMedicine.id,
            quantity: quantityAdded,
            expiry_date: expiryDate,
            added_date: new Date().toISOString().split('T')[0]
          })
        });
      }

      await fetchMedicines();
      await fetchExpiryRecords();
      await fetchMovements();
      setShowStockModal(false);
      setStockAdjustment('+0');
      setExpiryDate('');
      setActiveTab('expiry'); // Switch to expiry tab to see the new record
    } catch (error) {
      setError(error.message || 'Failed to adjust stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header - Medipulse Style */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent mb-1">
              Medicine Management
            </h1>
            <p className="text-gray-600 font-medium">Manage medicines and track expiry dates</p>
          </div>
          {activeTab === 'medicines' && (
            <button
              onClick={() => openAddModal(false)}
              className="flex items-center px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Medicine
            </button>
          )}
        </div>

        {/* Tabs - Medipulse Style */}
        <div className="bg-white rounded-2xl border-2 border-black p-2 shadow-sm">
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('medicines')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'medicines'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center">
                <Package className="h-5 w-5 mr-2" />
                Medicines Catalog
              </div>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'categories'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center">
                <Filter className="h-5 w-5 mr-2" />
                Categories
              </div>
            </button>
            <button
              onClick={() => setActiveTab('expiry')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'expiry'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center">
                <Calendar className="h-5 w-5 mr-2" />
                Expiration Management
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('movements');
                if (movements.length === 0) fetchMovements();
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'movements'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Stock Movements
              </div>
            </button>
          </nav>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-green-800 text-sm font-medium">{success}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Medicines Tab Content */}
        {activeTab === 'medicines' && (
        <>
          {/* Summary Cards - Medipulse Style Compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-soft border-2 border-black p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-4 w-4 text-primary-600" />
                </div>
              </div>
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Total Medicines</p>
              <p className="text-2xl font-bold text-gray-900">{medicines.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-soft border-2 border-black p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Filter className="h-4 w-4 text-secondary-600" />
                </div>
              </div>
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Categories</p>
              <p className="text-2xl font-bold text-secondary-600">{categories.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-soft border-2 border-black p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
              </div>
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">
                {medicines.filter(m => m.stock_quantity < 50 && m.stock_quantity > 0).length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-soft border-2 border-black p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Archive className="h-4 w-4 text-red-600" />
                </div>
              </div>
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {medicines.filter(m => m.stock_quantity === 0).length}
              </p>
            </div>
          </div>

          {/* Medicines Table with Filters - No Gap */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-soft border-2 border-black p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading medicines...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-soft border-2 border-black overflow-hidden">
              {/* Filters inside table container */}
              <div className="bg-gray-50 p-5 border-b-2 border-black">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, code, or barcode..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium bg-white transition-all"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      onClick={() => handleMedicineSort('name')}
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
                      onClick={() => handleMedicineSort('code')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Code
                        {sortField === 'code' ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
                    <th 
                      onClick={() => handleMedicineSort('category')}
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
                      onClick={() => handleMedicineSort('price')}
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
                    <th 
                      onClick={() => handleMedicineSort('stock')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Stock
                        {sortField === 'stock' ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedMedicines.map((medicine) => {
                    const stockStatus = getStockStatus(medicine.stock_quantity);
                    return (
                      <tr key={medicine.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                          <div className="text-sm text-gray-500">{medicine.description?.substring(0, 40)}...</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{medicine.medicine_code}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{medicine.barcode || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{medicine.category}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ₱{parseFloat(medicine.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{medicine.stock_quantity}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm space-x-2">
                          <button
                            onClick={() => openViewModal(medicine)}
                            className="text-blue-600 hover:text-blue-900 inline-block"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleAdjustStock(medicine)}
                            className="text-green-600 hover:text-green-900 inline-block"
                            title="Adjust Stock"
                          >
                            <TrendingUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(medicine)}
                            className="text-primary-600 hover:text-primary-900 inline-block"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleArchive(medicine)}
                            className="text-orange-600 hover:text-orange-900 inline-block"
                            title="Archive"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredMedicines.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm || categoryFilter ? 'No medicines found matching your criteria' : 'No medicines in catalog'}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {sortedMedicines.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-medium">{medicinesStartIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(medicinesEndIndex, sortedMedicines.length)}</span> of{' '}
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
                    {Array.from({ length: totalMedicinesPages }, (_, i) => i + 1)
                      .filter(page => {
                        return page === 1 || 
                               page === totalMedicinesPages || 
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
                    disabled={currentPage === totalMedicinesPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalMedicinesPages)}
                    disabled={currentPage === totalMedicinesPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        </>
        )}

        {/* Categories Tab Content */}
        {activeTab === 'categories' && (
        <>
          {/* Categories Header with Add Button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Medicine Categories</h3>
              <p className="text-gray-600">Manage product categories</p>
            </div>
            <button
              onClick={() => {
                setCategoryModalMode('add');
                setCategoryFormData({ name: '', description: '', is_active: true });
                setShowCategoryModal(true);
              }}
              className="flex items-center px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Category
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const categoryMedicines = medicines.filter(m => m.category === category.name);
              return (
                <div key={category.id} className="bg-white rounded-xl shadow-soft border-2 border-black p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{category.name}</h4>
                      <p className="text-sm text-gray-600">{category.description || 'No description'}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      category.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {category.is_active !== false ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-gray-600">
                      <Package className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">{categoryMedicines.length} medicines</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCategoryModalMode('edit');
                          setSelectedCategory(category);
                          setCategoryFormData({
                            name: category.name,
                            description: category.description || '',
                            is_active: category.is_active !== false
                          });
                          setShowCategoryModal(true);
                        }}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          const medicineCount = categoryMedicines.length;
                          if (medicineCount > 0) {
                            setCategoryToDelete(category);
                            setDeleteCategoryError(`Cannot delete category "${category.name}" because it has ${medicineCount} medicine(s) assigned to it.`);
                            setShowDeleteCategoryModal(true);
                          } else {
                            setCategoryToDelete(category);
                            setDeleteCategoryError('');
                            setShowDeleteCategoryModal(true);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {categories.length === 0 && (
            <div className="bg-white rounded-xl shadow-soft border-2 border-black p-12 text-center">
              <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-4">Create your first category to organize medicines</p>
              <button
                onClick={() => {
                  setCategoryModalMode('add');
                  setCategoryFormData({ name: '', description: '', is_active: true });
                  setShowCategoryModal(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </button>
            </div>
          )}
        </>
        )}

        {/* Expiration Management Tab Content */}
        {activeTab === 'expiry' && (
        <>
          {/* Expiry Statistics - Medipulse Style Compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-soft border-2 border-black p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-4 w-4 text-primary-600" />
                </div>
              </div>
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Total Records</p>
              <h3 className="text-2xl font-bold text-gray-900">{expiryRecords.length}</h3>
            </div>

            <div className="bg-white rounded-xl shadow-soft border-2 border-black p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
              </div>
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Expired</p>
              <h3 className="text-2xl font-bold text-red-600">
                {expiryRecords.filter(r => new Date(r.expiry_date) < new Date()).length}
              </h3>
            </div>

            <div className="bg-white rounded-xl shadow-soft border-2 border-black p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
              </div>
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Expiring Soon</p>
              <h3 className="text-2xl font-bold text-orange-600">
                {expiryRecords.filter(r => {
                  const expiry = new Date(r.expiry_date);
                  const today = new Date();
                  const thirtyDays = new Date();
                  thirtyDays.setDate(today.getDate() + 30);
                  return expiry >= today && expiry <= thirtyDays;
                }).length}
              </h3>
            </div>

            <div className="bg-white rounded-xl shadow-soft border-2 border-black p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-4 w-4 text-accent-600" />
                </div>
              </div>
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Valid Stock</p>
              <h3 className="text-2xl font-bold text-accent-600">
                {expiryRecords.filter(r => {
                  const expiry = new Date(r.expiry_date);
                  const thirtyDays = new Date();
                  thirtyDays.setDate(new Date().getDate() + 30);
                  return expiry > thirtyDays;
                }).length}
              </h3>
            </div>
          </div>

          {/* Expiry Filters - Medipulse Style */}
          <div className="bg-white rounded-2xl border-2 border-black shadow-soft p-5">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by medicine name or code..."
                  value={expirySearchTerm}
                  onChange={(e) => setExpirySearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
                />
              </div>
              <select
                value={expiryFilterStatus}
                onChange={(e) => setExpiryFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium bg-white transition-all"
              >
                <option value="all">All Status</option>
                <option value="expired">Expired</option>
                <option value="expiring">Expiring Soon (30 days)</option>
                <option value="valid">Valid</option>
              </select>
            </div>
          </div>

          {/* Expiry Records Table - Medipulse Style */}
          <div className="bg-white rounded-2xl shadow-soft border-2 border-black overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      onClick={() => handleExpirySort('medicine')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Medicine
                        {expirySortField === 'medicine' ? (
                          expirySortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th 
                      onClick={() => handleExpirySort('quantity')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Quantity
                        {expirySortField === 'quantity' ? (
                          expirySortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleExpirySort('expiry_date')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Expiry Date
                        {expirySortField === 'expiry_date' ? (
                          expirySortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleExpirySort('added_date')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Added Date
                        {expirySortField === 'added_date' ? (
                          expirySortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Until Expiry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedExpiryRecords.map((record) => {
                    const medicine = medicines.find(m => m.id === record.medicine_id) || {};
                    const status = getExpiryStatus(record.expiry_date);
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{medicine.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{medicine.category}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{medicine.medicine_code}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{record.quantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(record.expiry_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(record.added_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${status.color}`}>
                            {status.days > 0 ? `${status.days} days` : `${Math.abs(status.days)} days ago`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleArchiveBatch(record, medicine)}
                            className="text-orange-600 hover:text-orange-900 inline-block"
                            title="Archive This Batch"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredExpiryRecords.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {expirySearchTerm || expiryFilterStatus !== 'all' 
                      ? 'No expiry records found matching your criteria' 
                      : 'No expiry records yet. Add stock with expiry dates to track them here.'}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {sortedExpiryRecords.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-medium">{expiryStartIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(expiryEndIndex, sortedExpiryRecords.length)}</span> of{' '}
                    <span className="font-medium">{sortedExpiryRecords.length}</span> results
                  </span>
                  
                  <select
                    value={expiryItemsPerPage}
                    onChange={(e) => {
                      setExpiryItemsPerPage(Number(e.target.value));
                      setExpiryCurrentPage(1);
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
                    onClick={() => setExpiryCurrentPage(1)}
                    disabled={expiryCurrentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setExpiryCurrentPage(expiryCurrentPage - 1)}
                    disabled={expiryCurrentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalExpiryPages }, (_, i) => i + 1)
                      .filter(page => {
                        return page === 1 || 
                               page === totalExpiryPages || 
                               (page >= expiryCurrentPage - 1 && page <= expiryCurrentPage + 1);
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => setExpiryCurrentPage(page)}
                            className={`px-3 py-1 rounded-lg text-sm ${
                              expiryCurrentPage === page
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
                    onClick={() => setExpiryCurrentPage(expiryCurrentPage + 1)}
                    disabled={expiryCurrentPage === totalExpiryPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setExpiryCurrentPage(totalExpiryPages)}
                    disabled={expiryCurrentPage === totalExpiryPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Stock Movements Tab Content */}
      {activeTab === 'movements' && (
        <>
          {/* Stock Movements Chart */}
          {!movementsLoading && filteredMovements.length > 0 && (
            <div className="bg-white rounded-2xl shadow-soft border-2 border-black p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Stock Movement Trends</h3>
                  <p className="text-sm text-gray-500">
                    {chartTimePeriod === 'today' && 'Today\'s activity'}
                    {chartTimePeriod === 'week' && 'Last 7 days activity'}
                    {chartTimePeriod === 'month' && 'Last 30 days activity'}
                    {chartTimePeriod === 'year' && 'Last 12 months activity'}
                    {chartTimePeriod === 'custom' && 'Custom date range'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Time Period Buttons */}
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setChartTimePeriod('today')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                        chartTimePeriod === 'today'
                          ? 'bg-white text-primary-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setChartTimePeriod('week')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                        chartTimePeriod === 'week'
                          ? 'bg-white text-primary-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setChartTimePeriod('month')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                        chartTimePeriod === 'month'
                          ? 'bg-white text-primary-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setChartTimePeriod('year')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                        chartTimePeriod === 'year'
                          ? 'bg-white text-primary-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Year
                    </button>
                    <button
                      onClick={() => setChartTimePeriod('custom')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                        chartTimePeriod === 'custom'
                          ? 'bg-white text-primary-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-2.5 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
              </div>
              
              {/* Custom Date Range Inputs */}
              {chartTimePeriod === 'custom' && (
                <div className="flex gap-3 mb-4 items-center">
                  <input
                    type="date"
                    value={chartCustomStartDate}
                    onChange={(e) => setChartCustomStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Start Date"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={chartCustomEndDate}
                    onChange={(e) => setChartCustomEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="End Date"
                  />
                </div>
              )}
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={(() => {
                  const chartData = [];
                  let daysToShow = 7;
                  let dateFormat = { month: 'short', day: 'numeric' };
                  let groupByMonth = false;
                  
                  // Determine date range based on selected period
                  if (chartTimePeriod === 'today') {
                    daysToShow = 1;
                  } else if (chartTimePeriod === 'week') {
                    daysToShow = 7;
                  } else if (chartTimePeriod === 'month') {
                    daysToShow = 30;
                  } else if (chartTimePeriod === 'year') {
                    daysToShow = 365;
                    groupByMonth = true;
                    dateFormat = { month: 'short', year: 'numeric' };
                  } else if (chartTimePeriod === 'custom' && chartCustomStartDate && chartCustomEndDate) {
                    const start = new Date(chartCustomStartDate);
                    const end = new Date(chartCustomEndDate);
                    daysToShow = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                  }
                  
                  if (groupByMonth) {
                    // Group by month for year view
                    for (let i = 11; i >= 0; i--) {
                      const date = new Date();
                      date.setMonth(date.getMonth() - i);
                      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                      
                      const monthMovements = movements.filter(m => {
                        const movementDate = new Date(m.created_at);
                        return movementDate >= monthStart && movementDate <= monthEnd;
                      });
                      
                      const received = monthMovements.filter(m => m.movement_type === 'received')
                        .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0);
                      const sold = monthMovements.filter(m => m.movement_type === 'sale')
                        .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0);
                      const adjusted = monthMovements.filter(m => ['adjustment', 'damaged', 'expired', 'returned'].includes(m.movement_type))
                        .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0);
                      
                      chartData.push({
                        date: date.toLocaleDateString('en-US', dateFormat),
                        Received: received,
                        Sold: sold,
                        Adjusted: adjusted,
                        Total: monthMovements.length
                      });
                    }
                  } else {
                    // Group by day
                    for (let i = daysToShow - 1; i >= 0; i--) {
                      const date = new Date();
                      if (chartTimePeriod === 'custom' && chartCustomStartDate) {
                        date.setTime(new Date(chartCustomStartDate).getTime());
                        date.setDate(date.getDate() + (daysToShow - 1 - i));
                      } else {
                        date.setDate(date.getDate() - i);
                      }
                      const dateStr = date.toISOString().split('T')[0];
                      
                      const dayMovements = movements.filter(m => 
                        new Date(m.created_at).toISOString().split('T')[0] === dateStr
                      );
                      
                      const received = dayMovements.filter(m => m.movement_type === 'received')
                        .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0);
                      const sold = dayMovements.filter(m => m.movement_type === 'sale')
                        .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0);
                      const adjusted = dayMovements.filter(m => ['adjustment', 'damaged', 'expired', 'returned'].includes(m.movement_type))
                        .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0);
                      
                      chartData.push({
                        date: chartTimePeriod === 'today' 
                          ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                          : date.toLocaleDateString('en-US', dateFormat),
                        Received: received,
                        Sold: sold,
                        Adjusted: adjusted,
                        Total: dayMovements.length
                      });
                    }
                  }
                  
                  return chartData;
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Received" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 5 }} />
                  <Line type="monotone" dataKey="Sold" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 5 }} />
                  <Line type="monotone" dataKey="Adjusted" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Movements Table with Integrated Filters */}
          {movementsLoading ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border-2 border-black">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
              <p className="mt-4 text-gray-600">Loading stock movements...</p>
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border-2 border-black">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stock movements found</h3>
              <p className="text-gray-600">
                {movementsSearchTerm || movementsFilterType !== 'all' || movementsFilterDate
                  ? 'Try adjusting your filters'
                  : 'Stock movements will appear here when inventory is adjusted'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border-2 border-black overflow-hidden">
              {/* Filters integrated in table header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex gap-3 items-center">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search medicine, code, or user..."
                        value={movementsSearchTerm}
                        onChange={(e) => setMovementsSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                      />
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div className="w-44">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                      <select
                        value={movementsFilterType}
                        onChange={(e) => setMovementsFilterType(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none text-sm bg-white"
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

                  {/* Clear Filters Button */}
                  <button
                    onClick={() => {
                      setMovementsSearchTerm('');
                      setMovementsFilterType('all');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white text-sm font-medium whitespace-nowrap transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th 
                        onClick={() => handleMovementsSort('created_at')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          Date & Time
                          {movementsSortField === 'created_at' ? (
                            movementsSortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleMovementsSort('medicine')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          Medicine
                          {movementsSortField === 'medicine' ? (
                            movementsSortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleMovementsSort('type')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          Type
                          {movementsSortField === 'type' ? (
                            movementsSortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleMovementsSort('quantity')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          Quantity Change
                          {movementsSortField === 'quantity' ? (
                            movementsSortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock Level
                      </th>
                      <th 
                        onClick={() => handleMovementsSort('user')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          User
                          {movementsSortField === 'user' ? (
                            movementsSortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
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
                      Showing <span className="font-medium">{movementsStartIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(movementsEndIndex, sortedMovements.length)}</span> of{' '}
                      <span className="font-medium">{sortedMovements.length}</span> results
                    </span>
                    
                    <select
                      value={movementsItemsPerPage}
                      onChange={(e) => {
                        setMovementsItemsPerPage(Number(e.target.value));
                        setMovementsCurrentPage(1);
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
                      onClick={() => setMovementsCurrentPage(1)}
                      disabled={movementsCurrentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      First
                    </button>
                    <button
                      onClick={() => setMovementsCurrentPage(movementsCurrentPage - 1)}
                      disabled={movementsCurrentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalMovementsPages }, (_, i) => i + 1)
                        .filter(page => {
                          return page === 1 || 
                                 page === totalMovementsPages || 
                                 (page >= movementsCurrentPage - 1 && page <= movementsCurrentPage + 1);
                        })
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-gray-500">...</span>
                            )}
                            <button
                              onClick={() => setMovementsCurrentPage(page)}
                              className={`px-3 py-1 rounded-lg text-sm ${
                                movementsCurrentPage === page
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
                      onClick={() => setMovementsCurrentPage(movementsCurrentPage + 1)}
                      disabled={movementsCurrentPage === totalMovementsPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setMovementsCurrentPage(totalMovementsPages)}
                      disabled={movementsCurrentPage === totalMovementsPages}
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
          {!movementsLoading && filteredMovements.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Total: {movements.length} stock movements 
              {(movementsSearchTerm || movementsFilterType !== 'all' || movementsFilterDate) && ` (${filteredMovements.length} filtered)`}
            </div>
          )}
        </>
      )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && modalMode !== 'view' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Add New Medicine' : 'Edit Medicine'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medicine Code *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.medicine_code}
                      onChange={(e) => setFormData({...formData, medicine_code: e.target.value})}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="MED001"
                    />
                    <button
                      type="button"
                      onClick={generateMedicineCode}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                    >
                      Auto Gen
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode (Auto-generated)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Type or generate"
                    />
                    <button
                      type="button"
                      onClick={generateBarcode}
                      className="px-3 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg text-sm font-semibold transition-all shadow-md whitespace-nowrap"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Click "Generate" for new unique barcode</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Paracetamol 500mg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Medicine description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₱) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity {modalMode === 'edit' && <span className="text-gray-500 text-xs">(View only - use Adjust Stock)</span>}
                  </label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 ${
                      modalMode === 'edit' ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="0"
                    readOnly={modalMode === 'edit'}
                  />
                  {modalMode === 'edit' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Use the "Adjust Stock" button in the table to modify stock quantity
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({...formData, reorder_level: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Medicine'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showModal && modalMode === 'view' && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Medicine Details</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Medicine Code</p>
                  <p className="font-medium text-gray-900">{selectedMedicine.medicine_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Barcode</p>
                  <p className="font-medium text-gray-900">{selectedMedicine.barcode || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-bold text-lg text-gray-900">{selectedMedicine.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-900">{selectedMedicine.description || 'No description'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium text-gray-900">{selectedMedicine.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-bold text-gray-900">₱{parseFloat(selectedMedicine.price).toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Stock Quantity</p>
                  <p className="font-bold text-2xl text-gray-900">{selectedMedicine.stock_quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stock Status</p>
                  {(() => {
                    const status = getStockStatus(selectedMedicine.stock_quantity);
                    return (
                      <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {selectedMedicine.expiry_date && (
                <div>
                  <p className="text-sm text-gray-600">Expiry Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedMedicine.expiry_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setTimeout(() => openEditModal(selectedMedicine), 100);
                }}
                className="flex-1 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Medicine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showStockModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Adjust Stock</h3>
              <button onClick={() => setShowStockModal(false)} className="text-gray-400 hover:text-gray-600">
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
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Medicine</p>
                <p className="font-bold text-lg text-gray-900">{selectedMedicine.name}</p>
                <p className="text-sm text-gray-500 mt-2">Current Stock</p>
                <p className="text-3xl font-bold text-primary-700">{selectedMedicine.stock_quantity}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Adjustment *
                </label>
                <input
                  type="text"
                  value={stockAdjustment}
                  onChange={(e) => setStockAdjustment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-lg font-mono"
                  placeholder="+0"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use + for addition, - for subtraction, or enter exact quantity
                </p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Examples: <span className="font-mono bg-gray-100 px-2 py-1 rounded">+50</span>, <span className="font-mono bg-gray-100 px-2 py-1 rounded">-20</span>, <span className="font-mono bg-gray-100 px-2 py-1 rounded">100</span></p>
                </div>
              </div>

              {/* Expiry Date - only show when adding stock */}
              {(() => {
                const trimmed = stockAdjustment.trim();
                let isAdding = false;
                if (trimmed.startsWith('+') && parseInt(trimmed.substring(1)) > 0) {
                  isAdding = true;
                } else if (!trimmed.startsWith('-') && !trimmed.startsWith('+')) {
                  const exact = parseInt(trimmed);
                  if (!isNaN(exact) && exact > selectedMedicine.stock_quantity) {
                    isAdding = true;
                  }
                }

                if (isAdding) {
                  return (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date * <span className="text-red-600">(Required when adding stock)</span>
                      </label>
                      <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Enter the expiry date for the new stock being added
                      </p>
                    </div>
                  );
                }
              })()}

              {/* Preview new stock */}
              {(() => {
                const trimmed = stockAdjustment.trim();
                let newStock;
                if (trimmed.startsWith('+')) {
                  newStock = selectedMedicine.stock_quantity + parseInt(trimmed.substring(1) || 0);
                } else if (trimmed.startsWith('-')) {
                  newStock = selectedMedicine.stock_quantity - parseInt(trimmed.substring(1) || 0);
                } else {
                  newStock = parseInt(trimmed || 0);
                }

                if (!isNaN(newStock)) {
                  return (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 mb-1">New Stock Will Be</p>
                      <p className={`text-3xl font-bold ${newStock < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {newStock}
                      </p>
                      {newStock < 0 && (
                        <p className="text-xs text-red-600 mt-1">⚠️ Stock cannot be negative</p>
                      )}
                    </div>
                  );
                }
              })()}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowStockModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStockAdjustmentSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}
      
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
      
      {/* Archive Batch Confirmation Modal */}
      {showArchiveBatchModal && batchToArchive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-4">
                <Archive className="h-8 w-8 text-orange-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Archive Expiry Batch?</h3>
              <p className="text-gray-600 mb-2">
                Archive <span className="font-semibold">{batchToArchive.record.quantity} units</span> of{' '}
                <span className="font-semibold">"{batchToArchive.medicine.name}"</span>?
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Expiry Date: <span className="font-medium">{new Date(batchToArchive.record.expiry_date).toLocaleDateString()}</span>
              </p>
              <p className="text-sm text-gray-500 mb-1">
                This batch will be removed from the expiration list.
              </p>
              <p className="text-sm font-semibold text-orange-600 mb-6">
                ⚠️ Stock will be reduced by {batchToArchive.record.quantity} units
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowArchiveBatchModal(false);
                    setBatchToArchive(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmArchiveBatch}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl font-semibold transition-all shadow-lg"
                >
                  Archive Batch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Add/Edit Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {categoryModalMode === 'add' ? 'Add Category' : 'Edit Category'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Pain Relief"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Category description..."
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="categoryActive"
                  checked={categoryFormData.is_active}
                  onChange={(e) => setCategoryFormData({...categoryFormData, is_active: e.target.checked})}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="categoryActive" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCategorySave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {saving ? 'Saving...' : categoryModalMode === 'add' ? 'Add Category' : 'Update Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Delete Confirmation Modal */}
      {showDeleteCategoryModal && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start mb-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                deleteCategoryError ? 'bg-orange-100' : 'bg-red-100'
              }`}>
                <AlertCircle className={`h-6 w-6 ${deleteCategoryError ? 'text-orange-600' : 'text-red-600'}`} />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {deleteCategoryError ? 'Cannot Delete Category' : 'Delete Category'}
                </h3>
                <p className="text-sm text-gray-600">
                  {deleteCategoryError || `Are you sure you want to delete "${categoryToDelete.name}"? This action cannot be undone.`}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteCategoryModal(false);
                  setCategoryToDelete(null);
                  setDeleteCategoryError('');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                {deleteCategoryError ? 'OK' : 'Cancel'}
              </button>
              {!deleteCategoryError && (
                <button
                  onClick={handleCategoryDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminMedicines;


