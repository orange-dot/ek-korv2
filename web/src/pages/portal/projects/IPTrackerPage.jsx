/**
 * IP Assets tracker page.
 */
import { useState, useEffect } from 'react';
import { getIPAssets, createIPAsset, updateIPAsset, deleteIPAsset } from '../../../services/projectsService';
import { RequirePermission } from '../../../components/portal/ProtectedRoute';

const IP_TYPES = ['patent', 'trademark', 'copyright', 'trade_secret', 'design'];
const IP_STATUSES = ['draft', 'pending', 'filed', 'published', 'granted', 'rejected', 'expired'];

export default function IPTrackerPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getIPAssets();
      setAssets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function getEmptyForm() {
    return {
      type: 'patent',
      title: '',
      filing_number: '',
      priority_date: '',
      filing_date: '',
      status: 'draft',
      inventors: '',
      notes: '',
    };
  }

  const handleCreate = () => {
    setEditingAsset('new');
    setFormData(getEmptyForm());
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset.id);
    setFormData({
      type: asset.type,
      title: asset.title,
      filing_number: asset.filing_number || '',
      priority_date: asset.priority_date || '',
      filing_date: asset.filing_date || '',
      status: asset.status,
      inventors: asset.inventors || '',
      notes: asset.notes || '',
    });
  };

  const handleDelete = async (asset) => {
    if (!confirm(`Delete "${asset.title}"?`)) return;
    try {
      await deleteIPAsset(asset.id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAsset === 'new') {
        await createIPAsset(formData);
      } else {
        await updateIPAsset(editingAsset, formData);
      }
      setEditingAsset(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      patent: '📜',
      trademark: '™️',
      copyright: '©',
      trade_secret: '🔒',
      design: '🎨',
    };
    return icons[type] || '📄';
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-500/20 text-gray-400',
      pending: 'bg-yellow-500/20 text-yellow-400',
      filed: 'bg-blue-500/20 text-blue-400',
      published: 'bg-purple-500/20 text-purple-400',
      granted: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
      expired: 'bg-gray-500/20 text-gray-400',
    };
    return colors[status] || colors.draft;
  };

  if (loading) {
    return <div className="text-accent-cyan">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">IP Tracker</h1>
          <p className="text-gray-400">Patents, trademarks, and other intellectual property</p>
        </div>
        <RequirePermission permission="projects.ip.create">
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90"
          >
            Add IP Asset
          </button>
        </RequirePermission>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* IP Assets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <div key={asset.id} className="bg-secondary rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getTypeIcon(asset.type)}</span>
                <div>
                  <h3 className="font-semibold text-white">{asset.title}</h3>
                  <span className="text-sm text-gray-500 capitalize">{asset.type}</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(asset.status)}`}>
                {asset.status}
              </span>
            </div>

            <div className="space-y-1 text-sm">
              {asset.filing_number && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Filing #:</span>
                  <span className="text-gray-300 font-mono">{asset.filing_number}</span>
                </div>
              )}
              {asset.priority_date && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Priority:</span>
                  <span className="text-gray-300">{asset.priority_date}</span>
                </div>
              )}
              {asset.filing_date && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Filed:</span>
                  <span className="text-gray-300">{asset.filing_date}</span>
                </div>
              )}
              {asset.inventors && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Inventors:</span>
                  <span className="text-gray-300 truncate ml-2">{asset.inventors}</span>
                </div>
              )}
            </div>

            {asset.deadlines?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-xs text-gray-500 mb-1">Upcoming Deadlines:</div>
                {asset.deadlines.slice(0, 2).map((d) => (
                  <div key={d.id} className="text-sm text-orange-400">
                    {d.type}: {d.due_date}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <RequirePermission permission="projects.ip.edit">
                <button
                  onClick={() => handleEdit(asset)}
                  className="flex-1 px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                >
                  Edit
                </button>
              </RequirePermission>
              <RequirePermission permission="projects.ip.edit">
                <button
                  onClick={() => handleDelete(asset)}
                  className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                >
                  Delete
                </button>
              </RequirePermission>
            </div>
          </div>
        ))}
      </div>

      {assets.length === 0 && (
        <div className="bg-secondary rounded-lg p-8 text-center text-gray-500">
          No IP assets recorded yet
        </div>
      )}

      {/* Edit/Create Modal */}
      {editingAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingAsset === 'new' ? 'Add IP Asset' : 'Edit IP Asset'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  >
                    {IP_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  >
                    {IP_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Filing Number</label>
                <input
                  type="text"
                  value={formData.filing_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, filing_number: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Priority Date</label>
                  <input
                    type="date"
                    value={formData.priority_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority_date: e.target.value }))}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Filing Date</label>
                  <input
                    type="date"
                    value={formData.filing_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, filing_date: e.target.value }))}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Inventors</label>
                <input
                  type="text"
                  value={formData.inventors}
                  onChange={(e) => setFormData(prev => ({ ...prev, inventors: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  placeholder="Comma-separated names"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90"
                >
                  {editingAsset === 'new' ? 'Add' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
