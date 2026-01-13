/**
 * Invites management page.
 */
import { useState, useEffect } from 'react';
import { getInvites, createInvite, deleteInvite, getRoles } from '../../../services/iamService';

export default function InvitesPage() {
  const [invites, setInvites] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', role_id: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invitesData, rolesData] = await Promise.all([getInvites(), getRoles()]);
      setInvites(invitesData);
      setRoles(rolesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const result = await createInvite({
        email: formData.email,
        role_id: parseInt(formData.role_id),
      });
      setSuccess(`Invite sent to ${formData.email}`);
      setFormData({ email: '', role_id: '' });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (invite) => {
    if (!confirm(`Revoke invite for ${invite.email}?`)) return;
    try {
      await deleteInvite(invite.id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const copyInviteLink = (invite) => {
    const link = `${window.location.origin}/portal/invite/${invite.token}`;
    navigator.clipboard.writeText(link);
    setSuccess('Invite link copied to clipboard');
    setTimeout(() => setSuccess(''), 3000);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (dateStr) => new Date(dateStr) < new Date();

  if (loading) {
    return <div className="text-accent-cyan">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Invitations</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90"
        >
          Send Invite
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Pending Invites */}
      <div className="bg-secondary rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-800">
          <h2 className="font-medium text-white">Pending Invites</h2>
        </div>
        {invites.filter(i => !i.used_at).length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No pending invitations
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Expires</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Invited By</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {invites.filter(i => !i.used_at).map((invite) => (
                <tr key={invite.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-white">{invite.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-accent-cyan/20 text-accent-cyan text-sm rounded">
                      {invite.role?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={isExpired(invite.expires_at) ? 'text-red-400' : 'text-gray-400'}>
                      {formatDate(invite.expires_at)}
                      {isExpired(invite.expires_at) && ' (Expired)'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{invite.invited_by_name}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => copyInviteLink(invite)}
                        className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => handleRevoke(invite)}
                        className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                      >
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Used Invites */}
      {invites.filter(i => i.used_at).length > 0 && (
        <div className="bg-secondary rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-800">
            <h2 className="font-medium text-white">Accepted Invites</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Accepted</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Invited By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {invites.filter(i => i.used_at).map((invite) => (
                <tr key={invite.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-white">{invite.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-sm rounded">
                      {invite.role?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(invite.used_at)}</td>
                  <td className="px-4 py-3 text-gray-400">{invite.invited_by_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Invite Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-4">Send Invitation</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, role_id: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  required
                >
                  <option value="">Select a role...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
