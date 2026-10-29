import React from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { Construction } from 'lucide-react';

function AdminPlaceholder({ title, description }) {
  return (
    <AdminLayout>
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Construction className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{description || 'This page is under development'}</p>
          <p className="text-sm text-gray-500 mt-2">Coming soon in the next update</p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminPlaceholder;
