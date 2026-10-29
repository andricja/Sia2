import React from 'react'
import { Search, Info, ShoppingBag, CheckCircle, CreditCard } from 'lucide-react'

function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Browse or Scan Medicine',
      description: 'Use the search function or scan a QR code to find the medicine you need.',
      status: 'Implemented'
    },
    {
      icon: Info,
      title: 'Review Information',
      description: 'View detailed medicine information including price, description, and current availability.',
      status: 'Implemented'
    },
    {
      icon: ShoppingBag,
      title: 'Add to Cart',
      description: 'Select the quantity you need and add items to your shopping cart.',
      status: 'Implemented'
    },
    {
      icon: CheckCircle,
      title: 'Review Order',
      description: 'Check your order summary, verify quantities, and review the total amount.',
      status: 'Implemented'
    },
    {
      icon: CreditCard,
      title: 'Complete Transaction',
      description: 'Proceed to staff confirmation or payment (integration planned), then receive your receipt.',
      status: 'Planned'
    }
  ]

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple 5-step process for a seamless pharmacy experience
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" style={{ top: '60px' }}></div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative">
                  <div className="flex flex-col items-center text-center">
                    {/* Step Number */}
                    <div className="relative z-10 w-16 h-16 bg-primary-700 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4 shadow-lg">
                      {index + 1}
                    </div>
                    
                    {/* Icon */}
                    <div className="w-14 h-14 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-7 w-7 text-primary-700" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {step.description}
                    </p>
                    
                    {/* Status Badge */}
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      step.status === 'Implemented' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Note */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-3xl mx-auto">
          <p className="text-blue-900 text-sm">
            <strong>Note:</strong> Payment gateway integration is planned for future implementation. 
            Currently, transactions can be completed through staff confirmation workflow.
          </p>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
