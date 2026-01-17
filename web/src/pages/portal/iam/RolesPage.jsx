/**
 * Roles management page.
 */
import { useState, useEffect } from 'react';
import { getRoles, getPermissions, createRole, updateRole, deleteRole } from '../../../services/iamService';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', permission_ids: [] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, permsData] = await Promise.all([getRoles(), getPermissions()]);
      setRoles(rolesData);
      setPermissions(permsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRole('new');
    setFormData({ name: '', description: '', permission_ids: [] });
  };

  const handleEdit = (role) => {
    setEditingRole(role.id);
    setFormData({
      name: role.name,
      description: role.description || '',
      permission_ids: role.permissions?.map(p => p.id) || [],
    });
  };

  const handleDelete = async (role) => {
    if (role.is_system) {
      alert('System roles cannot be deleted.');
      return;
    }
    if (!confirm(`Delete role "${role.name}"?`)) return;
    try {
      await deleteRole(role.id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole === 'new') {
        await createRole(formData);
      } else {
        await updateRole(editingRole, formData);
      }
      setEditingRole(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const togglePermission = (permId) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permId)
        ? prev.permission_ids.filter(id => id !== permId)
        : [...prev.permission_ids, permId],
    }));
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const resource = perm.resource || 'other';
    if (!acc[resource]) acc[resource] = [];
    acc[resource].push(perm);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-accent-cyan">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Roles</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90"
        >
          Create Role
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Roles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <div key={role.id} className="bg-secondary rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-white">{role.name}</h3>
                {role.is_system && (
                  <span className="text-xs text-gray-500">System Role</span>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(role)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <EditIcon />
                </button>
                {!role.is_system && (
                  <button
                    onClick={() => handleDelete(role)}
                    className="p-1 text-gray-400 hover:text-red-400"
                  >
                    <DeleteIcon />
                  </button>
                )}
              </div>
            </div>
            {role.description && (
              <p className="text-sm text-gray-400 mb-3">{role.description}</p>
            )}
            <div className="text-sm text-gray-500">
              {role.permissions?.length || 0} permissions
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {editingRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingRole === 'new' ? 'Create Role' : 'Edit Role'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Permissions</label>
                <div className="space-y-4 max-h-60 overflow-y-auto bg-primary rounded p-3">
                  {Object.entries(groupedPermissions).map(([resource, perms]) => (
                    <div key={resource}>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        {resource}
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {perms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-2 p-1 hover:bg-gray-800 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permission_ids.includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              className="w-4 h-4 text-accent-cyan rounded"
                            />
                            <span className="text-sm text-gray-300">{perm.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90"
                >
                  {editingRole === 'new' ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
