import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Public Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'

// Admin Pages
import AdminDashboard from './pages/AdminDashboard'
import AdminMedicines from './pages/AdminMedicines'
// import AdminStockMovements from './pages/AdminStockMovements' // Now integrated in Medicine Management
import AdminTransactions from './pages/AdminTransactions'
import AdminReports from './pages/AdminReports'
import AdminStaffAccounts from './pages/AdminStaffAccounts'
import AdminBarcodeGenerator from './pages/AdminBarcodeGenerator'
import AdminSettings from './pages/AdminSettings'

// Staff Pages
import StaffPOS from './pages/StaffPOS'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/medicines" element={<ProtectedRoute><AdminMedicines /></ProtectedRoute>} />
          {/* <Route path="/admin/stock-movements" element={<ProtectedRoute><AdminStockMovements /></ProtectedRoute>} /> */}
          {/* Stock Movements now integrated as a tab in Medicine Management */}
          <Route path="/admin/transactions" element={<ProtectedRoute><AdminTransactions /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/staff" element={<ProtectedRoute><AdminStaffAccounts /></ProtectedRoute>} />
          <Route path="/admin/barcodes" element={<ProtectedRoute><AdminBarcodeGenerator /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />

          {/* Protected Staff Routes */}
          <Route path="/staff/pos" element={<ProtectedRoute><StaffPOS /></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
