import React from 'react'
import { 
  Package, QrCode, Keyboard, ShoppingCart, 
  BarChart3, Clock, FileText, Users 
} from 'lucide-react'

function Features() {
  const features = [
    {
      icon: Package,
      title: 'Medicine Catalog',
      description: 'Browse through a comprehensive database of medicines with detailed information, pricing, and availability status.'
    },
    {
      icon: QrCode,
      title: 'QR Code Scanning',
      description: 'Quickly scan medicine QR codes or barcodes for instant product lookup and information display.'
    },
    {
      icon: Keyboard,
      title: 'Manual Medicine Code Entry',
      description: 'Alternative manual entry option for medicine codes when scanning is not available.'
    },
    {
      icon: ShoppingCart,
      title: 'Shopping Cart & Order Total',
      description: 'Add multiple medicines to cart, adjust quantities, and view real-time order totals before checkout.'
    },
    {
      icon: BarChart3,
      title: 'Inventory Management',
      description: 'Staff dashboard for monitoring stock levels, updating inventory, and managing medicine information.'
    },
    {
      icon: Clock,
      title: 'Transaction History',
      description: 'Complete record of all orders and transactions for tracking and reporting purposes.'
    },
    {
      icon: FileText,
      title: 'Receipt Generation',
      description: 'Automated receipt generation with order details, totals, and transaction information.'
    },
    {
      icon: Users,
      title: 'Staff Dashboard',
      description: 'Secure staff portal for order management, inventory updates, and system administration.'
    }
  ]

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need for efficient pharmacy self-service operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="card hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Features
