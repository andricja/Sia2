import React, { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { FileText, User, Calendar, Filter, Download } from 'lucide-react';

function AdminAuditLogs() {
  const [logs] = useState([
    {
      id: 1,
      user: 'Admin User',
      action: 'Created Medicine',
      details: 'Added "Paracetamol 500mg" to inventory',
      timestamp: '2026-10-18 14:30:25',
      type: 'create'
    },
    {
      id: 2,
      user: 'Staff User',
      action: 'Created Order',
      details: 'Order #ORD-12345 - Total: ₱550.00',
      timestamp: '2026-10-18 14:15:10',
      type: 'create'
    },
    {
      id: 3,
      user: 'Admin User',
      action: 'Updated Medicine',
      details: 'Changed stock of "Amoxicillin 500mg" from 30 to 50',
      timestamp: '2026-10-18 13:45:00',
      type: 'update'
    },
    {
      id: 4,
      user: 'Admin User',
      action: 'Deleted Medicine',
      details: 'Removed "Expired Medicine XYZ"',
      timestamp: '2026-10-18 12:20:15',
      type: 'delete'
    },
    {
      id: 5,
      user: 'Staff User',
      action: 'Login',
      details: 'Successful login from 192.168.1.100',
      timestamp: '2026-10-18 09:00:00',
      type: 'auth'
    }
  ]);

  const [filterType, setFilterType] = useState('all');

  const filteredLogs = filterType === 'all' 
    ? logs 
    : logs.filter(log => log.type === filterType);

  const getActionColor = (type) => {
    switch(type) {
      case 'create': return 'bg-green-100 text-green-700';
      case 'update': return 'bg-blue-100 text-blue-700';
      case 'delete': return 'bg-red-100 text-red-700';
      case 'auth': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const exportLogs = () => {
    const csv = [
      'Timestamp,User,Action,Details',
      ...filteredLogs.map(log => 
        `"${log.timestamp}","${log.user}","${log.action}","${log.details}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-1">System activity and security logs</p>
          </div>
          <button
            onClick={exportLogs}
            className="flex items-center px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Export Logs
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{logs.length}</h3>
            <p className="text-sm text-gray-600">Total Logs</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
            <h3 className="text-3xl font-bold text-green-600 mb-1">
              {logs.filter(l => l.type === 'create').length}
            </h3>
            <p className="text-sm text-gray-600">Created</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
            <h3 className="text-3xl font-bold text-blue-600 mb-1">
              {logs.filter(l => l.type === 'update').length}
            </h3>
            <p className="text-sm text-gray-600">Updated</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
            <h3 className="text-3xl font-bold text-red-600 mb-1">
              {logs.filter(l => l.type === 'delete').length}
            </h3>
            <p className="text-sm text-gray-600">Deleted</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="auth">Authentication</option>
            </select>
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getActionColor(log.type)}`}>
                        {log.action}
                      </span>
                      <span className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-1" />
                        {log.user}
                      </span>
                      <span className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {log.timestamp}
                      </span>
                    </div>
                    <p className="text-gray-900">{log.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Audit logs are stored for 90 days. Critical actions are permanently logged for compliance purposes.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminAuditLogs;
