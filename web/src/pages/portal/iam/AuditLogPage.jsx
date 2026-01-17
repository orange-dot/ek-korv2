/**
 * Audit log viewer page.
 */
import { useState, useEffect } from 'react';
import { getAuditLog } from '../../../services/iamService';

export default function AuditLogPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    action: '',
    user_id: '',
    limit: 50,
  });
  const [expandedEntry, setExpandedEntry] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.action) params.action = filters.action;
      if (filters.user_id) params.user_id = filters.user_id;
      if (filters.limit) params.limit = filters.limit;
      const data = await getAuditLog(params);
      setEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionColor = (action) => {
    if (action.includes('delete') || action.includes('revoke')) return 'text-red-400';
    if (action.includes('create') || action.includes('accept')) return 'text-green-400';
    if (action.includes('update') || action.includes('change')) return 'text-yellow-400';
    if (action.includes('login') || action.includes('logout')) return 'text-blue-400';
    return 'text-gray-400';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  if (loading) {
    return <div className="text-accent-cyan">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <form onSubmit={handleSearch} className="bg-secondary rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-gray-400 mb-1">Action Filter</label>
            <input
              type="text"
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
              placeholder="e.g., user.login, invoice.create"
            />
          </div>
          <div className="w-32">
            <label className="block text-sm text-gray-400 mb-1">Limit</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: e.target.value }))}
              className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90"
          >
            Search
          </button>
        </div>
      </form>

      {/* Log Entries */}
      <div className="bg-secondary rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Time</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Action</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Resource</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">IP</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {entries.map((entry) => (
              <>
                <tr key={entry.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-gray-400 text-sm whitespace-nowrap">
                    {formatDate(entry.created_at)}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {entry.user_name || 'System'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-sm ${getActionColor(entry.action)}`}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {entry.resource_type && (
                      <span>
                        {entry.resource_type}
                        {entry.resource_id && `#${entry.resource_id}`}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm font-mono">
                    {entry.ip_address || '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {(entry.old_value || entry.new_value) && (
                      <button
                        onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        {expandedEntry === entry.id ? 'Hide' : 'Show'}
                      </button>
                    )}
                  </td>
                </tr>
                {expandedEntry === entry.id && (
                  <tr className="bg-gray-800/50">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        {entry.old_value && (
                          <div>
                            <div className="text-xs font-semibold text-gray-500 mb-1">Previous Value</div>
                            <pre className="text-sm text-gray-400 bg-primary p-2 rounded overflow-x-auto">
                              {JSON.stringify(JSON.parse(entry.old_value), null, 2)}
                            </pre>
                          </div>
                        )}
                        {entry.new_value && (
                          <div>
                            <div className="text-xs font-semibold text-gray-500 mb-1">New Value</div>
                            <pre className="text-sm text-gray-400 bg-primary p-2 rounded overflow-x-auto">
                              {JSON.stringify(JSON.parse(entry.new_value), null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                      {entry.user_agent && (
                        <div className="mt-2 text-xs text-gray-500">
                          User Agent: {entry.user_agent}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">
            No audit log entries found
          </div>
        )}
      </div>
    </div>
  );
}
