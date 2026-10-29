import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X, Pill } from 'lucide-react'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-primary-700 p-2 rounded-lg">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary-900">MediKiosk</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-primary-700 transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-primary-700 transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-gray-700 hover:text-primary-700 transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-primary-700 transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-primary-700 transition-colors">
              Contact
            </button>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-primary-700 hover:text-primary-800 font-medium"
            >
              Staff Login
            </button>
            <button onClick={() => scrollToSection('preview')} className="btn-primary">
              Launch Kiosk
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-gray-200">
            <button onClick={() => scrollToSection('home')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              Home
            </button>
            <button onClick={() => scrollToSection('features')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              How It Works
            </button>
            <button onClick={() => scrollToSection('about')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              About
            </button>
            <button onClick={() => scrollToSection('contact')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              Contact
            </button>
            <div className="pt-3 space-y-2">
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/login');
                }}
                className="block w-full text-center px-4 py-2 text-primary-700 font-medium hover:bg-primary-50 rounded-lg"
              >
                Staff Login
              </button>
              <button onClick={() => scrollToSection('preview')} className="block w-full btn-primary">
                Launch Kiosk
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
