import React, { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  Database, Download, Upload, HardDrive, AlertTriangle, 
  CheckCircle, RefreshCw, Trash2
} from 'lucide-react';

function AdminBackupMaintenance() {
  const [backups] = useState([
    {
      id: 1,
      filename: 'medikiosk_backup_2026-10-18_14-30.sql',
      size: '2.5 MB',
      created_at: '2026-10-18 14:30:00',
      type: 'manual'
    },
    {
      id: 2,
      filename: 'medikiosk_backup_2026-10-17_00-00.sql',
      size: '2.4 MB',
      created_at: '2026-10-17 00:00:00',
      type: 'automatic'
    },
    {
      id: 3,
      filename: 'medikiosk_backup_2026-10-16_00-00.sql',
      size: '2.3 MB',
      created_at: '2026-10-16 00:00:00',
      type: 'automatic'
    }
  ]);

  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateBackup = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess('Database backup created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }, 2000);
  };

  const handleDownloadBackup = (backup) => {
    setSuccess(`Downloading ${backup.filename}...`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteBackup = (backup) => {
    if (window.confirm(`Delete backup ${backup.filename}?`)) {
      setSuccess('Backup deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleOptimizeDatabase = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess('Database optimized successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }, 2000);
  };

  const handleClearCache = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess('Cache cleared successfully!');
      setTimeout(() => setSuccess(''), 2000);
    }, 1000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup & Maintenance</h1>
          <p className="text-gray-600 mt-1">Database backup and system maintenance tools</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={handleCreateBackup}
            disabled={loading}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-primary-300 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 mb-4 mx-auto">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Create Backup</h3>
            <p className="text-sm text-gray-600">Generate new database backup</p>
          </button>

          <button
            onClick={handleOptimizeDatabase}
            disabled={loading}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-primary-300 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 mb-4 mx-auto">
              <RefreshCw className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Optimize Database</h3>
            <p className="text-sm text-gray-600">Improve database performance</p>
          </button>

          <button
            onClick={handleClearCache}
            disabled={loading}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-primary-300 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-orange-100 mb-4 mx-auto">
              <Trash2 className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Clear Cache</h3>
            <p className="text-sm text-gray-600">Clear system cache files</p>
          </button>
        </div>

        {/* Database Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100 mr-4">
              <HardDrive className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Database Information</h3>
              <p className="text-sm text-gray-600">Current database statistics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-600 mb-1">Database Type</p>
              <p className="text-xl font-bold text-gray-900">SQLite</p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600 mb-1">Database Size</p>
              <p className="text-xl font-bold text-gray-900">2.5 MB</p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-gray-600 mb-1">Last Backup</p>
              <p className="text-xl font-bold text-gray-900">Today</p>
            </div>
          </div>
        </div>

        {/* Backup History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Backup History</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filename</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {backup.filename}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{backup.size}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        backup.type === 'manual' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {backup.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{backup.created_at}</td>
                    <td className="px-6 py-4 text-right text-sm space-x-3">
                      <button
                        onClick={() => handleDownloadBackup(backup)}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(backup)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Automatic Backup Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Automatic Backup Settings</h3>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-primary-700 focus:ring-primary-500"
              />
              <span className="ml-3 text-gray-900">Enable automatic daily backups</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Time
              </label>
              <select className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option value="00:00">12:00 AM (Midnight)</option>
                <option value="02:00">2:00 AM</option>
                <option value="04:00">4:00 AM</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keep backups for
              </label>
              <select className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => {
                setSuccess('Backup settings saved!');
                setTimeout(() => setSuccess(''), 3000);
              }}
              className="flex items-center px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-bold text-yellow-900 mb-2">Important Notes</h4>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• Always create a backup before major system updates</li>
                <li>• Store backup files in a secure location</li>
                <li>• Test backup restoration regularly</li>
                <li>• Automatic backups run daily at scheduled time</li>
                <li>• Old backups are automatically deleted based on retention policy</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Restore Backup */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-red-100 mr-4">
              <Upload className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Restore Database</h3>
              <p className="text-sm text-gray-600">Restore from backup file</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ Warning: Restoring a backup will overwrite all current data. This action cannot be undone.
            </p>
          </div>

          <input
            type="file"
            accept=".sql"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200"
          />

          <button
            className="mt-4 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            onClick={() => {
              if (window.confirm('Are you sure you want to restore from backup? This will overwrite all current data!')) {
                setSuccess('Database restoration initiated...');
                setTimeout(() => setSuccess(''), 3000);
              }
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Restore from Backup
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminBackupMaintenance;
