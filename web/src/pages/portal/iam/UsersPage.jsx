/**
 * Users management page.
 */
import { useState, useEffect } from 'react';
import { getUsers, deleteUser, getRoles, updateUserRoles } from '../../../services/iamService';
import { RequirePermission } from '../../../components/portal/ProtectedRoute';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Deactivate user ${user.email}?`)) return;
    try {
      await deleteUser(user.id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditRoles = (user) => {
    setEditingUser(user);
    setSelectedRoles(user.roles?.map(r => r.id) || []);
  };

  const handleSaveRoles = async () => {
    try {
      await updateUserRoles(editingUser.id, selectedRoles);
      setEditingUser(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleRole = (roleId) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  if (loading) {
    return <div className="text-accent-cyan">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Users</h1>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-secondary rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Roles</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white">{user.name}</div>
                      {user.is_superadmin && (
                        <span className="text-xs text-yellow-400">Superadmin</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400">{user.email}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {user.roles?.map((role) => (
                      <span
                        key={role.id}
                        className="px-2 py-0.5 bg-accent-cyan/20 text-accent-cyan text-xs rounded"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.is_active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <RequirePermission permission="iam.users.update">
                      <button
                        onClick={() => handleEditRoles(user)}
                        className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                      >
                        Edit Roles
                      </button>
                    </RequirePermission>
                    <RequirePermission permission="iam.users.delete">
                      <button
                        onClick={() => handleDelete(user)}
                        className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                        disabled={user.is_superadmin}
                      >
                        Deactivate
                      </button>
                    </RequirePermission>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Roles Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-4">
              Edit Roles for {editingUser.name}
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {roles.map((role) => (
                <label
                  key={role.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                    className="w-4 h-4 text-accent-cyan rounded"
                  />
                  <div>
                    <div className="text-white">{role.name}</div>
                    {role.description && (
                      <div className="text-xs text-gray-500">{role.description}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoles}
                className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
