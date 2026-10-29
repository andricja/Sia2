import React, { useState } from 'react'
import { Search, Plus, Minus, ShoppingCart, Trash2, X } from 'lucide-react'

function SystemPreview() {
  // Demo medicines data
  const demoMedicines = [
    { id: 1, code: 'MED001', barcode: '1234567890123', name: 'Paracetamol 500mg', category: 'Pain Relief', price: 5.50, stock: 150, description: 'For fever and mild to moderate pain' },
    { id: 2, code: 'MED002', barcode: '1234567890124', name: 'Amoxicillin 500mg', category: 'Antibiotic', price: 12.00, stock: 89, description: 'Broad-spectrum antibiotic' },
    { id: 3, code: 'MED003', barcode: '1234567890125', name: 'Ibuprofen 400mg', category: 'Pain Relief', price: 8.75, stock: 120, description: 'Anti-inflammatory pain reliever' },
    { id: 4, code: 'MED004', barcode: '1234567890126', name: 'Vitamin C 500mg', category: 'Supplement', price: 6.25, stock: 200, description: 'Immune system support' },
    { id: 5, code: 'MED005', barcode: '1234567890127', name: 'Cetirizine 10mg', category: 'Antihistamine', price: 7.50, stock: 95, description: 'For allergies and hay fever' },
    { id: 6, code: 'MED006', barcode: '1234567890128', name: 'Omeprazole 20mg', category: 'Antacid', price: 15.00, stock: 75, description: 'Reduces stomach acid' },
    { id: 7, code: 'MED007', barcode: '1234567890129', name: 'Losartan 50mg', category: 'Hypertension', price: 18.50, stock: 60, description: 'Blood pressure medication' },
    { id: 8, code: 'MED008', barcode: '1234567890130', name: 'Metformin 500mg', category: 'Diabetes', price: 10.00, stock: 110, description: 'Diabetes management' },
  ]

  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)

  // Filter medicines based on search
  const filteredMedicines = demoMedicines.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Add to cart
  const addToCart = (medicine) => {
    const existingItem = cart.find(item => item.id === medicine.id)
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === medicine.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }])
    }
  }

  // Update quantity
  const updateQuantity = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  // Remove from cart
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id))
  }

  // Calculate total
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <section id="preview" className="py-20 bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Interactive System Preview
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Try the demo interface - search medicines and add them to your cart
          </p>
          <p className="text-sm text-gray-500 mt-2">
            (Demonstration data - not from a live database)
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-primary-700 text-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Medicine Catalog</h3>
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-white text-primary-700 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                View Cart
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>

            {/* Search Bar */}
            <div className="mt-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, code, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-0 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-300"
              />
            </div>
          </div>

          {/* Medicine Grid */}
          <div className="p-6">
            {filteredMedicines.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No medicines found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredMedicines.map(medicine => (
                  <div key={medicine.id} className="card hover:shadow-lg transition-shadow duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs text-gray-500 block">{medicine.code}</span>
                        <span className="text-xs text-primary-600 font-medium">{medicine.category}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        medicine.stock > 100 ? 'bg-green-100 text-green-700' :
                        medicine.stock > 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        Stock: {medicine.stock}
                      </span>
                    </div>
                    
                    <h4 className="font-bold text-gray-900 mb-2">{medicine.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{medicine.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200">
                      <span className="text-xl font-bold text-primary-700">₱{medicine.price.toFixed(2)}</span>
                      <button
                        onClick={() => addToCart(medicine)}
                        className="bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Cart Header */}
              <div className="bg-primary-700 text-white p-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold">Shopping Cart</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-primary-600 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Cart Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Your cart is empty</p>
                    <p className="text-gray-400 text-sm mt-2">Add some medicines to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.code}</p>
                          <p className="text-primary-700 font-bold mt-1">₱{item.price.toFixed(2)} each</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 bg-gray-200 hover:bg-gray-300 rounded"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 bg-primary-700 hover:bg-primary-800 text-white rounded"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="text-right min-w-[80px]">
                          <p className="font-bold text-gray-900">₱{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium text-gray-700">Subtotal ({cartItemCount} items):</span>
                    <span className="text-3xl font-bold text-primary-700">₱{cartTotal.toFixed(2)}</span>
                  </div>
                  <button className="w-full bg-primary-700 text-white py-3 rounded-lg font-bold text-lg hover:bg-primary-800 transition-colors">
                    Proceed to Checkout
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Demo mode - checkout functionality will be implemented
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default SystemPreview
