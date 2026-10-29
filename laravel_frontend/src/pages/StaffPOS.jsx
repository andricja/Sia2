import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, X, 
  Package, AlertCircle, Check, LogOut, Pill, QrCode
} from 'lucide-react';

function StaffPOS() {
  const { token, user, logout } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showClearCartModal, setShowClearCartModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanSuccess, setScanSuccess] = useState(false);
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('cash'); // always 'cash'
  const [amountReceived, setAmountReceived] = useState('');
  const [showPaymentComplete, setShowPaymentComplete] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    fetchMedicines();
    fetchCategories();
  }, []);

  // Auto-focus barcode input on mount and after any action
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Refocus barcode input after cart changes or any interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      if (barcodeInputRef.current && !showCheckout && !showPaymentComplete && !showClearCartModal && !showLogoutModal) {
        barcodeInputRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [cart, showCheckout, showPaymentComplete, showClearCartModal, showLogoutModal]);

  // Global click handler to refocus barcode input
  useEffect(() => {
    const handleGlobalClick = () => {
      setTimeout(() => {
        if (barcodeInputRef.current && !showCheckout && !showPaymentComplete && !showClearCartModal && !showLogoutModal) {
          barcodeInputRef.current.focus();
        }
      }, 50);
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [showCheckout, showPaymentComplete, showClearCartModal, showLogoutModal]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await api.request('/medicines');
      if (response.success) {
        setMedicines(response.data);
      }
    } catch (err) {
      setError('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.request('/categories');
      if (response.success) {
        setCategories(response.data.filter(cat => cat.is_active));
      }
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const addToCart = (medicine) => {
    const existingItem = cart.find(item => item.id === medicine.id);
    
    if (existingItem) {
      if (existingItem.quantity >= medicine.stock_quantity) {
        alert('Not enough stock available');
        setTimeout(() => barcodeInputRef.current?.focus(), 100);
        return;
      }
      setCart(cart.map(item =>
        item.id === medicine.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
    setSuccess('Added to cart');
    setTimeout(() => {
      setSuccess('');
      barcodeInputRef.current?.focus();
    }, 2000);
  };

  const handleBarcodeScanned = (e) => {
    e.preventDefault();
    
    if (!barcodeInput.trim()) return;
    
    // Find medicine by barcode first (exact match)
    const medicineByBarcode = medicines.find(m => 
      m.barcode && m.barcode.toLowerCase() === barcodeInput.toLowerCase()
    );
    
    if (medicineByBarcode) {
      if (medicineByBarcode.stock_quantity === 0) {
        setError('Medicine is out of stock');
        setTimeout(() => setError(''), 3000);
        setBarcodeInput('');
        setSearchTerm('');
      } else {
        addToCart(medicineByBarcode);
        setScanSuccess(true);
        setTimeout(() => setScanSuccess(false), 1000);
        setBarcodeInput('');
        setSearchTerm(''); // Clear search term to show all items
      }
      setTimeout(() => barcodeInputRef.current?.focus(), 50);
    } else {
      // If no barcode match, keep it as search filter (already synced via onChange)
      setScanSuccess(false);
    }
  };

  const updateQuantity = (medicineId, newQuantity) => {
    const medicine = medicines.find(m => m.id === medicineId);
    
    if (newQuantity > medicine.stock_quantity) {
      alert('Not enough stock available');
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    setCart(cart.map(item =>
      item.id === medicineId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (medicineId) => {
    setCart(cart.filter(item => item.id !== medicineId));
  };

  const clearCart = () => {
    setShowClearCartModal(true);
  };

  const confirmClearCart = () => {
    setCart([]);
    setShowClearCartModal(false);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    setShowCheckout(true);
  };

  const handleQuickAmount = (amount) => {
    if (amount === 'exact') {
      setAmountReceived(getCartTotal().toString());
    } else {
      setAmountReceived(amount.toString());
    }
  };

  const handleNumpadClick = (value) => {
    if (value === 'clear') {
      setAmountReceived('');
    } else if (value === 'backspace') {
      setAmountReceived(amountReceived.slice(0, -1));
    } else {
      setAmountReceived(amountReceived + value);
    }
  };

  const calculateChange = () => {
    const received = parseFloat(amountReceived) || 0;
    const total = getCartTotal();
    return received - total;
  };

  const handleProceedPayment = async () => {
    const received = parseFloat(amountReceived) || 0;
    const total = getCartTotal();
    
    if (received < total) {
      setError('Amount received is less than total');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const change = calculateChange();
      const orderData = {
        customer_name: 'Walk-in Customer',
        customer_email: null,
        customer_phone: '09000000000',
        items: cart.map(item => ({
          medicine_id: parseInt(item.id),
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.price)
        })),
        total_amount: parseFloat(total.toFixed(2)),
        status: 'confirmed',
        payment_status: 'paid'
      };

      console.log('Sending order data:', orderData);

      const response = await api.request('/orders', {
        method: 'POST',
        body: orderData
      });

      console.log('Order response:', response);

      if (response.success) {
        // Create completed order with payment details
        const orderWithPayment = {
          ...response.data,
          amountReceived: received,
          change: change,
          paymentMethod: 'cash'
        };
        
        setCompletedOrder(orderWithPayment);
        setShowCheckout(false);
        setShowPaymentComplete(true);
        
        fetchMedicines();
      }
    } catch (err) {
      console.error('Payment error:', err);
      
      // Show more detailed error message
      if (err.errors) {
        const errorMessages = Object.entries(err.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        setError(`Validation errors:\n${errorMessages}`);
      } else {
        setError(err.message || 'Failed to create order');
      }
      
      setTimeout(() => setError(''), 8000);
    } finally {
      setProcessing(false);
    }
  };

  const handlePayableClick = async () => {
    setProcessing(true);
    setError('');

    try {
      const orderData = {
        customer_name: 'Walk-in Customer',
        customer_email: null,
        customer_phone: '09000000000',
        items: cart.map(item => ({
          medicine_id: parseInt(item.id),
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.price)
        })),
        total_amount: parseFloat(getCartTotal().toFixed(2)),
        status: 'confirmed',
        payment_status: 'paid'
      };

      console.log('Sending order data:', orderData);

      const response = await api.request('/orders', {
        method: 'POST',
        body: orderData
      });

      console.log('Order response:', response);

      if (response.success) {
        // Update the completed order with real order number
        setCompletedOrder({
          ...completedOrder,
          order_number: response.data.order_number
        });
        
        // Close modal and reset
        setShowPaymentComplete(false);
        setShowCart(false);
        setCart([]);
        setAmountReceived('');
        
        setSuccess('Payment completed successfully!');
        setTimeout(() => setSuccess(''), 3000);
        
        fetchMedicines();
      }
    } catch (err) {
      console.error('Payment error:', err);
      
      // Show more detailed error message
      if (err.errors) {
        const errorMessages = Object.entries(err.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        setError(`Validation errors:\n${errorMessages}`);
      } else {
        setError(err.message || 'Failed to create order');
      }
      
      setTimeout(() => setError(''), 8000);
    } finally {
      setProcessing(false);
    }
  };

  const handleNewEntry = () => {
    setCart([]);
    setAmountReceived('');
    setPaymentMethod('cash');
    setShowPaymentComplete(false);
    setShowCart(false);
    setCompletedOrder(null);
    setSuccess('');
  };

  const handlePrintReceipt = () => {
    if (!completedOrder) return;
    
    printReceipt(completedOrder);
  };

  const printReceipt = (orderData) => {
    const printWindow = window.open('', '', 'height=600,width=400');
    const orderDate = new Date().toLocaleString();
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order #${orderData.order_number}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            max-width: 400px;
            margin: 20px auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0;
            font-size: 12px;
          }
          .order-info {
            margin-bottom: 20px;
            font-size: 12px;
          }
          .items {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
            margin: 20px 0;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-size: 14px;
          }
          .item-name {
            flex: 1;
          }
          .item-qty {
            width: 60px;
            text-align: center;
          }
          .item-price {
            width: 80px;
            text-align: right;
          }
          .total-section {
            font-size: 14px;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #000;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .total {
            font-size: 18px;
            font-weight: bold;
            border-top: 2px solid #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px dashed #000;
            font-size: 12px;
          }
          @media print {
            body {
              margin: 0;
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 MediKiosk</h1>
          <p>Pharmacy Management System</p>
          <p>Thank you for your purchase!</p>
        </div>
        
        <div class="order-info">
          <p><strong>Order #:</strong> ${orderData.order_number}</p>
          <p><strong>Date:</strong> ${orderDate}</p>
          <p><strong>Cashier:</strong> ${user?.name || 'Staff'}</p>
          <p><strong>Payment:</strong> Cash</p>
        </div>
        
        <div class="items">
          <div class="item" style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
            <div class="item-name">ITEM</div>
            <div class="item-qty">QTY</div>
            <div class="item-price">PRICE</div>
          </div>
          ${cart.map(item => `
            <div class="item">
              <div class="item-name">${item.name}</div>
              <div class="item-qty">x${item.quantity}</div>
              <div class="item-price">₱${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₱${getCartTotal().toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Amount Received:</span>
            <span>₱${orderData.amountReceived.toFixed(2)}</span>
          </div>
          <div class="total-row" style="font-weight: bold;">
            <span>Change:</span>
            <span>₱${orderData.change.toFixed(2)}</span>
          </div>
          <div class="total total-row">
            <span>TOTAL:</span>
            <span>₱${getCartTotal().toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>*** OFFICIAL RECEIPT ***</p>
          <p>Please keep this receipt for your records</p>
          <p>MediKiosk Pharmacy</p>
          <p>Thank you! Come again!</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getStockBadgeColor = (stock) => {
    if (stock === 0) return 'bg-red-100 text-red-700';
    if (stock < 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = !searchTerm || 
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.medicine_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (medicine.barcode && medicine.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex h-screen overflow-hidden">
      {/* Left Section - Products */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary-700 p-2 rounded-lg">
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">MediKiosk</h1>
                  <p className="text-xs text-gray-500">Pharmacy Management System</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>

            {/* Search and Scan */}
            <div className="mb-4">
              <form onSubmit={handleBarcodeScanned} className="relative">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBarcodeInput(value);
                    setSearchTerm(value); // Update search in real-time
                  }}
                  placeholder="Scan SKU or search items..."
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:outline-none transition-all text-sm ${
                    scanSuccess 
                      ? 'border-green-500 ring-2 ring-green-200 bg-green-50' 
                      : 'border-gray-300 focus:ring-slate-500 focus:border-transparent'
                  }`}
                />
                <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  📷
                </button>
              </form>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-6 border-b border-gray-200">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`pb-2 text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'text-slate-800 border-b-2 border-slate-800'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`pb-2 text-sm font-medium transition-colors ${
                    selectedCategory === cat.name
                      ? 'text-slate-800 border-b-2 border-slate-800'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="px-6">
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <Check className="h-5 w-5 mr-2" />
              {success}
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
              <p className="mt-4 text-gray-600">Loading medicines...</p>
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {/* Category Sections */}
              {[...new Set(filteredMedicines.map(m => m.category))].map(category => {
                const categoryMedicines = filteredMedicines.filter(m => m.category === category);
                
                return (
                  <div key={category} className="mb-8">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                      {category}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {categoryMedicines.map((medicine) => (
                        <div key={medicine.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex flex-col h-full">
                            <div className="flex-1 mb-3">
                              <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                                {medicine.name}
                              </h3>
                              <p className="text-xs text-gray-500 mb-2">
                                {medicine.description ? medicine.description.substring(0, 30) + '...' : medicine.medicine_code}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xl font-bold text-gray-900">
                                  ₱{parseFloat(medicine.price).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Stock: {medicine.stock_quantity}
                                </p>
                              </div>
                              <button
                                onClick={() => addToCart(medicine)}
                                disabled={medicine.stock_quantity === 0}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                  medicine.stock_quantity === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-slate-800 text-white hover:bg-slate-900'
                                }`}
                              >
                                <Plus className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar - Cart (Always Visible & Fixed) */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-screen sticky top-0">
        {/* Cart Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">CART</h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 mb-0.5">{item.name}</h4>
                      <p className="text-xs text-gray-500">
                        ₱{parseFloat(item.price).toFixed(2)} / {item.medicine_code}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-600 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-50 rounded-l-lg"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-50 rounded-r-lg"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-gray-900">
                        ₱{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-white">
            {/* Totals */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">TOTAL</span>
                <span className="font-semibold">₱{getCartTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-bold text-sm transition-colors"
              >
                FINALIZE SALE
              </button>
              <button
                onClick={clearCart}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <h2 className="text-xl font-bold text-gray-900">Payment</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Order Summary */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Order Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 max-h-48 overflow-y-auto">
                    <div className="space-y-1.5">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {item.name} x {item.quantity}
                          </span>
                          <span className="font-medium">₱{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xl font-bold pt-3 border-t-2 border-gray-300">
                    <span>Total:</span>
                    <span className="text-primary-700">₱{getCartTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Right Side - Amount Input & Numpad */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Quick Amount</h3>
                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {[10, 20, 50, 100, 200, 500, 1000, 'exact'].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleQuickAmount(amount)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-xs transition-colors"
                      >
                        {amount === 'exact' ? 'Exact' : `₱${amount}`}
                      </button>
                    ))}
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">Amount Received</h3>
                  <div className="mb-3">
                    <input
                      type="text"
                      value={amountReceived}
                      readOnly
                      className="w-full text-2xl font-bold text-right px-3 py-3 border-2 border-gray-300 rounded-lg bg-white"
                      placeholder="0.00"
                    />
                  </div>

                  {amountReceived && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Change:</span>
                        <span className="text-2xl font-bold text-green-600">
                          ₱{calculateChange() >= 0 ? calculateChange().toFixed(2) : '0.00'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Numpad */}
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleNumpadClick(num.toString())}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-lg transition-colors"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={() => handleNumpadClick('clear')}
                      className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold text-sm transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => handleNumpadClick('0')}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-lg transition-colors"
                    >
                      0
                    </button>
                    <button
                      onClick={() => handleNumpadClick('backspace')}
                      className="px-4 py-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg font-semibold text-sm transition-colors"
                    >
                      ⌫
                    </button>
                  </div>

                  {/* Proceed Button */}
                  <button
                    onClick={handleProceedPayment}
                    disabled={processing || !amountReceived || calculateChange() < 0}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {processing ? 'Processing...' : 'Proceed Payment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Complete Modal */}
      {showPaymentComplete && completedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">Order #{completedOrder.order_number}</p>
            </div>

            {/* Payment Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold">₱{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Received:</span>
                  <span className="font-semibold">₱{completedOrder.amountReceived.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600 font-semibold">Change:</span>
                  <span className="font-bold text-green-600 text-lg">₱{completedOrder.change.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold">Cash</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleNewEntry}
                disabled={processing}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📝 New Entry
              </button>
              
              <button
                onClick={handlePrintReceipt}
                disabled={processing}
                className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🧾 Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Modal */}
      {showClearCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Clear Cart?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to clear all items from the cart? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearCartModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearCart}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all shadow-lg"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-4">
                <LogOut className="h-8 w-8 text-orange-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Logout?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to logout? Any unsaved changes will be lost.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl font-semibold transition-all shadow-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffPOS;
