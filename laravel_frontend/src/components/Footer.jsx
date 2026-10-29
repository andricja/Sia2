import React from 'react'
import { Pill, Github } from 'lucide-react'

function Footer() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary-700 p-2 rounded-lg">
                <Pill className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MediKiosk</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              A modern pharmacy self-service ordering system designed to streamline medicine 
              browsing, inventory management, and transaction processing.
            </p>
            <p className="text-sm text-gray-500">
              Academic Project - Web-Based System
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => scrollToSection('home')} className="hover:text-primary-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('features')} className="hover:text-primary-400 transition-colors">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('how-it-works')} className="hover:text-primary-400 transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('about')} className="hover:text-primary-400 transition-colors">
                  About
                </button>
              </li>
            </ul>
          </div>

          {/* System */}
          <div>
            <h3 className="text-white font-bold mb-4">System</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => scrollToSection('preview')} className="hover:text-primary-400 transition-colors">
                  Launch Kiosk
                </button>
              </li>
              <li>
                <button className="hover:text-primary-400 transition-colors">
                  Staff Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('contact')} className="hover:text-primary-400 transition-colors">
                  Contact
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500">
              © {currentYear} MediKiosk. Built with Laravel & React.js
            </p>
            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-500">Technology Stack:</span>
              <div className="flex space-x-2">
                <span className="text-xs bg-gray-800 px-2 py-1 rounded">Laravel</span>
                <span className="text-xs bg-gray-800 px-2 py-1 rounded">React</span>
                <span className="text-xs bg-gray-800 px-2 py-1 rounded">MySQL</span>
                <span className="text-xs bg-gray-800 px-2 py-1 rounded">Tailwind</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
