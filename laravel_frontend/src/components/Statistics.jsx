import React from 'react'
import { Package, Activity, QrCode, Receipt } from 'lucide-react'

function Statistics() {
  const stats = [
    {
      icon: Package,
      label: 'Medicine Catalog',
      description: 'Comprehensive product database'
    },
    {
      icon: Activity,
      label: 'Inventory Monitoring',
      description: 'Real-time stock tracking'
    },
    {
      icon: QrCode,
      label: 'QR Code Scanning',
      description: 'Fast medicine lookup'
    },
    {
      icon: Receipt,
      label: 'Receipt Printing',
      description: 'Professional transaction records'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-xl mb-4">
                  <Icon className="h-8 w-8 text-primary-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {stat.label}
                </h3>
                <p className="text-gray-600 text-sm">
                  {stat.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Statistics
