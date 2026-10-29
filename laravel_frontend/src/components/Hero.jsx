import React from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'

function Hero() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="home" className="bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/20 py-20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-items-center gap-12 lg:gap-16">
          {/* Left Content */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-100 to-purple-100 text-primary-800 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-primary-200/50">
              <Sparkles className="h-4 w-4" />
              <span>Modern Pharmacy Solution</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Smart Pharmacy<br />
              Self-Service<br />
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">Ordering System</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl font-medium">
              Browse medicines, check availability, and prepare your pharmacy order through a simple 
              self-service experience designed for faster and more organized transactions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button onClick={() => scrollToSection('preview')} className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 inline-flex items-center justify-center">
                Explore Medicines
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold border-2 border-primary-600 hover:bg-primary-50 transition-all shadow-sm hover:shadow-md">
                Learn How It Works
              </button>
            </div>
          </div>

          {/* Right Visual - Pharmacy Dashboard Mockup */}
          <div className="relative">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/60">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Pharmacy Kiosk</h3>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>

              {/* Medicine Cards Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { name: 'Paracetamol', code: 'MED001', price: '₱5.50', stock: 150 },
                  { name: 'Amoxicillin', code: 'MED002', price: '₱12.00', stock: 89 },
                  { name: 'Ibuprofen', code: 'MED003', price: '₱8.75', stock: 120 },
                  { name: 'Vitamin C', code: 'MED004', price: '₱6.25', stock: 200 }
                ].map((med, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3 border border-gray-200/60 hover:shadow-md transition-all duration-200">
                    <div className="text-xs text-gray-500 font-medium mb-1">{med.code}</div>
                    <div className="font-semibold text-sm text-gray-900 mb-2">{med.name}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary-700 font-bold text-sm">{med.price}</span>
                      <span className="text-xs text-gray-500 font-medium">Stock: {med.stock}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Bar */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-4 text-white shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs opacity-90 font-medium">Cart Total</div>
                    <div className="text-xl font-bold">₱32.50</div>
                  </div>
                  <button className="bg-white text-primary-700 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary-50 transition-all shadow-sm">
                    View Cart (3)
                  </button>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white px-5 py-2.5 rounded-full shadow-xl font-semibold text-sm animate-pulse">
                Live Demo
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
