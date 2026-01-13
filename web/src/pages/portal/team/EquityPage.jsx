/**
 * Cap table / equity management page.
 */
import { useState, useEffect } from 'react';
import { getEquity, createEquityGrant, updateEquityGrant, deleteEquityGrant, getMembers } from '../../../services/teamService';
import { RequirePermission } from '../../../components/portal/ProtectedRoute';

const SHARE_CLASSES = ['common', 'preferred_a', 'preferred_b', 'options'];

export default function EquityPage() {
  const [grants, setGrants] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingGrant, setEditingGrant] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [equityData, membersData] = await Promise.all([getEquity(), getMembers()]);
      setGrants(equityData);
      setMembers(membersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function getEmptyForm() {
    return {
      member_id: '',
      shares: '',
      share_class: 'common',
      vesting_start: '',
      vesting_months: 48,
      cliff_months: 12,
      grant_date: new Date().toISOString().split('T')[0],
    };
  }

  const handleCreate = () => {
    setEditingGrant('new');
    setFormData(getEmptyForm());
  };

  const handleEdit = (grant) => {
    setEditingGrant(grant.id);
    setFormData({
      member_id: grant.member_id,
      shares: grant.shares,
      share_class: grant.share_class,
      vesting_start: grant.vesting_start || '',
      vesting_months: grant.vesting_months || 48,
      cliff_months: grant.cliff_months || 12,
      grant_date: grant.grant_date || '',
    });
  };

  const handleDelete = async (grant) => {
    if (!confirm('Delete this equity grant?')) return;
    try {
      await deleteEquityGrant(grant.id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        member_id: parseInt(formData.member_id),
        shares: parseInt(formData.shares),
        vesting_months: parseInt(formData.vesting_months),
        cliff_months: parseInt(formData.cliff_months),
      };
      if (editingGrant === 'new') {
        await createEquityGrant(data);
      } else {
        await updateEquityGrant(editingGrant, data);
      }
      setEditingGrant(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Calculate totals
  const totalShares = grants.reduce((sum, g) => sum + (g.shares || 0), 0);
  const byClass = grants.reduce((acc, g) => {
    const cls = g.share_class || 'common';
    acc[cls] = (acc[cls] || 0) + g.shares;
    return acc;
  }, {});

  // Calculate vesting
  const calculateVested = (grant) => {
    if (!grant.vesting_start) return grant.shares;
    const start = new Date(grant.vesting_start);
    const now = new Date();
    const monthsElapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24 * 30));

    if (monthsElapsed < (grant.cliff_months || 12)) return 0;

    const vestingMonths = grant.vesting_months || 48;
    const vestedMonths = Math.min(monthsElapsed, vestingMonths);
    return Math.floor((grant.shares * vestedMonths) / vestingMonths);
  };

  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return member?.name || 'Unknown';
  };

  const getShareClassColor = (shareClass) => {
    const colors = {
      common: 'bg-blue-500/20 text-blue-400',
      preferred_a: 'bg-purple-500/20 text-purple-400',
      preferred_b: 'bg-pink-500/20 text-pink-400',
      options: 'bg-green-500/20 text-green-400',
    };
    return colors[shareClass] || colors.common;
  };

  if (loading) {
    return <div className="text-accent-cyan">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cap Table</h1>
          <p className="text-gray-400">Equity distribution and vesting schedules</p>
        </div>
        <RequirePermission permission="team.equity.manage">
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90"
          >
            Add Grant
          </button>
        </RequirePermission>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-secondary rounded-lg p-4">
          <div className="text-sm text-gray-400">Total Shares</div>
          <div className="text-2xl font-bold text-white">{totalShares.toLocaleString()}</div>
        </div>
        {Object.entries(byClass).map(([cls, count]) => (
          <div key={cls} className="bg-secondary rounded-lg p-4">
            <div className="text-sm text-gray-400 capitalize">{cls.replace('_', ' ')}</div>
            <div className="text-2xl font-bold text-white">{count.toLocaleString()}</div>
            <div className="text-xs text-gray-500">
              {totalShares > 0 ? ((count / totalShares) * 100).toFixed(1) : 0}%
            </div>
          </div>
        ))}
      </div>

      {/* Cap Table */}
      <div className="bg-secondary rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Holder</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Class</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Shares</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Vested</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">%</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Vesting</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {grants.map((grant) => {
              const vested = calculateVested(grant);
              const percentage = totalShares > 0 ? (grant.shares / totalShares) * 100 : 0;

              return (
                <tr key={grant.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan text-sm font-semibold">
                        {getMemberName(grant.member_id)?.charAt(0)}
                      </div>
                      <span className="text-white">{getMemberName(grant.member_id)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${getShareClassColor(grant.share_class)}`}>
                      {grant.share_class?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white text-right font-mono">
                    {grant.shares?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={vested < grant.shares ? 'text-yellow-400' : 'text-green-400'}>
                      {vested.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-right">
                    {percentage.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {grant.vesting_start ? (
                      <span>
                        {grant.vesting_months}mo / {grant.cliff_months}mo cliff
                        <br />
                        <span className="text-xs text-gray-500">From: {grant.vesting_start}</span>
                      </span>
                    ) : (
                      <span className="text-gray-500">No vesting</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RequirePermission permission="team.equity.manage">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(grant)}
                          className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(grant)}
                          className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </RequirePermission>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {grants.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">
            No equity grants recorded
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {editingGrant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingGrant === 'new' ? 'Add Equity Grant' : 'Edit Equity Grant'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Team Member</label>
                <select
                  value={formData.member_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, member_id: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  required
                >
                  <option value="">Select member...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Number of Shares</label>
                  <input
                    type="number"
                    value={formData.shares}
                    onChange={(e) => setFormData(prev => ({ ...prev, shares: e.target.value }))}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Share Class</label>
                  <select
                    value={formData.share_class}
                    onChange={(e) => setFormData(prev => ({ ...prev, share_class: e.target.value }))}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  >
                    {SHARE_CLASSES.map(cls => (
                      <option key={cls} value={cls}>{cls.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Grant Date</label>
                <input
                  type="date"
                  value={formData.grant_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, grant_date: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Vesting Schedule</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.vesting_start}
                      onChange={(e) => setFormData(prev => ({ ...prev, vesting_start: e.target.value }))}
                      className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Total (months)</label>
                    <input
                      type="number"
                      value={formData.vesting_months}
                      onChange={(e) => setFormData(prev => ({ ...prev, vesting_months: e.target.value }))}
                      className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Cliff (months)</label>
                    <input
                      type="number"
                      value={formData.cliff_months}
                      onChange={(e) => setFormData(prev => ({ ...prev, cliff_months: e.target.value }))}
                      className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                      min="0"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Leave vesting start empty for immediately vested shares.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGrant(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90"
                >
                  {editingGrant === 'new' ? 'Add' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
