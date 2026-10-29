import React, { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  Settings, Building, Mail, Bell, Globe, Save, CheckCircle, AlertCircle 
} from 'lucide-react';

function AdminSystemSettings() {
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({
    // Company Info
    company_name: 'MediKiosk Pharmacy',
    company_address: '123 Main Street, City, Country',
    company_phone: '+63 917 123 4567',
    company_email: 'info@medikiosk.com',
    
    // System Settings
    currency: 'PHP',
    timezone: 'Asia/Manila',
    date_format: 'MM/DD/YYYY',
    low_stock_threshold: '50',
    
    // Notifications
    email_notifications: true,
    sms_notifications: false,
    low_stock_alerts: true,
    expiry_alerts: true,
    
    // Email Settings
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: ''
  });

  const handleSave = (section) => {
    setSuccess(`${section} settings saved successfully!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure system preferences and settings</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        {/* Company Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 mr-4">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Company Information</h3>
              <p className="text-sm text-gray-600">Business details and contact information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({...settings, company_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="text"
                value={settings.company_phone}
                onChange={(e) => setSettings({...settings, company_phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={settings.company_address}
                onChange={(e) => setSettings({...settings, company_address: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={settings.company_email}
                onChange={(e) => setSettings({...settings, company_email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => handleSave('Company')}
              className="flex items-center px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Company Info
            </button>
          </div>
        </div>

        {/* System Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 mr-4">
              <Globe className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">System Configuration</h3>
              <p className="text-sm text-gray-600">Regional and operational settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="PHP">PHP (₱)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="Asia/Manila">Asia/Manila</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
              <select
                value={settings.date_format}
                onChange={(e) => setSettings({...settings, date_format: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
              <input
                type="number"
                value={settings.low_stock_threshold}
                onChange={(e) => setSettings({...settings, low_stock_threshold: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => handleSave('System')}
              className="flex items-center px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Save System Settings
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100 mr-4">
              <Bell className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Notification Settings</h3>
              <p className="text-sm text-gray-600">Manage alerts and notifications</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.email_notifications}
                onChange={(e) => setSettings({...settings, email_notifications: e.target.checked})}
                className="rounded border-gray-300 text-primary-700 focus:ring-primary-500"
              />
              <span className="ml-3 text-gray-900">Enable Email Notifications</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.sms_notifications}
                onChange={(e) => setSettings({...settings, sms_notifications: e.target.checked})}
                className="rounded border-gray-300 text-primary-700 focus:ring-primary-500"
              />
              <span className="ml-3 text-gray-900">Enable SMS Notifications</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.low_stock_alerts}
                onChange={(e) => setSettings({...settings, low_stock_alerts: e.target.checked})}
                className="rounded border-gray-300 text-primary-700 focus:ring-primary-500"
              />
              <span className="ml-3 text-gray-900">Low Stock Alerts</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.expiry_alerts}
                onChange={(e) => setSettings({...settings, expiry_alerts: e.target.checked})}
                className="rounded border-gray-300 text-primary-700 focus:ring-primary-500"
              />
              <span className="ml-3 text-gray-900">Medicine Expiry Alerts</span>
            </label>
          </div>

          <div className="mt-4">
            <button
              onClick={() => handleSave('Notification')}
              className="flex items-center px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Notification Settings
            </button>
          </div>
        </div>

        {/* Email Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-orange-100 mr-4">
              <Mail className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Email Configuration</h3>
              <p className="text-sm text-gray-600">SMTP settings for sending emails</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
              <input
                type="text"
                value={settings.smtp_host}
                onChange={(e) => setSettings({...settings, smtp_host: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
              <input
                type="text"
                value={settings.smtp_port}
                onChange={(e) => setSettings({...settings, smtp_port: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
              <input
                type="text"
                value={settings.smtp_username}
                onChange={(e) => setSettings({...settings, smtp_username: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="your-email@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
              <input
                type="password"
                value={settings.smtp_password}
                onChange={(e) => setSettings({...settings, smtp_password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => handleSave('Email')}
              className="flex items-center px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Email Settings
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminSystemSettings;
