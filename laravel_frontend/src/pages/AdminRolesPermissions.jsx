import React, { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

function AdminRolesPermissions() {
  const [roles] = useState([
    {
      name: 'Administrator',
      slug: 'admin',
      permissions: {
        'Medicines': ['View', 'Create', 'Edit', 'Delete'],
        'Categories': ['View', 'Create', 'Edit', 'Delete'],
        'Orders': ['View', 'Create', 'Edit', 'Delete'],
        'Stock': ['View', 'Create', 'Edit'],
        'Reports': ['View', 'Export'],
        'Staff': ['View', 'Create', 'Edit', 'Delete'],
        'Settings': ['View', 'Edit']
      }
    },
    {
      name: 'Staff Member',
      slug: 'staff',
      permissions: {
        'Medicines': ['View'],
        'Categories': ['View'],
        'Orders': ['Create'],
        'Stock': [],
        'Reports': [],
        'Staff': [],
        'Settings': []
      }
    }
  ]);

  const allPermissions = ['View', 'Create', 'Edit', 'Delete', 'Export'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600 mt-1">Manage user roles and their permissions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <div key={role.slug} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className={`flex items-center justify-center h-12 w-12 rounded-lg ${
                  role.slug === 'admin' ? 'bg-purple-100' : 'bg-orange-100'
                } mr-4`}>
                  <Shield className={`h-6 w-6 ${
                    role.slug === 'admin' ? 'text-purple-600' : 'text-orange-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-600">{role.slug}</p>
                </div>
              </div>

              <div className="space-y-3">
                {Object.entries(role.permissions).map(([module, perms]) => (
                  <div key={module} className="border-t border-gray-100 pt-3">
                    <p className="font-medium text-gray-900 mb-2">{module}</p>
                    <div className="flex flex-wrap gap-2">
                      {allPermissions.map(perm => {
                        const hasPermission = perms.includes(perm);
                        return (
                          <span
                            key={perm}
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                              hasPermission
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {hasPermission ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {perm}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <Shield className="h-6 w-6 text-blue-600 mt-1 mr-3" />
            <div>
              <h4 className="text-lg font-bold text-blue-900 mb-2">Role System</h4>
              <p className="text-blue-800 mb-3">
                The system uses a role-based access control (RBAC) system to manage permissions.
              </p>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• <strong>Administrator</strong>: Full system access, can manage all features</li>
                <li>• <strong>Staff Member</strong>: Limited to POS and basic operations</li>
                <li>• Permissions are enforced on both frontend and backend</li>
                <li>• Role changes take effect immediately after login</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminRolesPermissions;
