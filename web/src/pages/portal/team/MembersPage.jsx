/**
 * Team members management page.
 */
import { useState, useEffect } from 'react';
import { getMembers, createMember, updateMember, deleteMember } from '../../../services/teamService';
import { RequirePermission } from '../../../components/portal/ProtectedRoute';

const ROLES = ['founder', 'cto', 'developer', 'advisor', 'contractor', 'other'];
const STATUSES = ['active', 'inactive', 'former'];
const RESIDENCIES = ['nl', 'de', 'rs', 'other'];

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getMembers();
      setMembers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function getEmptyForm() {
    return {
      name: '',
      role: 'developer',
      email: '',
      start_date: '',
      status: 'active',
      residency: 'other',
      notes: '',
    };
  }

  const handleCreate = () => {
    setEditingMember('new');
    setFormData(getEmptyForm());
  };

  const handleEdit = (member) => {
    setEditingMember(member.id);
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email || '',
      start_date: member.start_date || '',
      status: member.status,
      residency: member.residency || 'other',
      notes: member.notes || '',
    });
  };

  const handleDelete = async (member) => {
    if (!confirm(`Remove ${member.name} from team?`)) return;
    try {
      await deleteMember(member.id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember === 'new') {
        await createMember(formData);
      } else {
        await updateMember(editingMember, formData);
      }
      setEditingMember(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      founder: 'bg-purple-500/20 text-purple-400',
      cto: 'bg-cyan-500/20 text-cyan-400',
      developer: 'bg-blue-500/20 text-blue-400',
      advisor: 'bg-yellow-500/20 text-yellow-400',
      contractor: 'bg-orange-500/20 text-orange-400',
      other: 'bg-gray-500/20 text-gray-400',
    };
    return colors[role] || colors.other;
  };

  const getResidencyLabel = (residency) => {
    const labels = { nl: 'Netherlands', de: 'Germany', rs: 'Serbia', other: 'Other' };
    return labels[residency] || residency;
  };

  if (loading) {
    return <div className="text-accent-cyan">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Members</h1>
          <p className="text-gray-400">Founders, employees, and contractors</p>
        </div>
        <RequirePermission permission="team.members.manage">
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90"
          >
            Add Member
          </button>
        </RequirePermission>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Members Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <div key={member.id} className="bg-secondary rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan text-lg font-semibold">
                {member.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{member.name}</h3>
                <span className={`inline-block px-2 py-0.5 rounded text-xs ${getRoleColor(member.role)}`}>
                  {member.role}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs ${
                member.status === 'active' ? 'bg-green-500/20 text-green-400' :
                member.status === 'inactive' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {member.status}
              </span>
            </div>

            <div className="space-y-1 text-sm">
              {member.email && (
                <div className="flex items-center gap-2 text-gray-400">
                  <EmailIcon />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
              {member.start_date && (
                <div className="flex items-center gap-2 text-gray-400">
                  <CalendarIcon />
                  <span>Started: {member.start_date}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-400">
                <LocationIcon />
                <span>{getResidencyLabel(member.residency)}</span>
              </div>
            </div>

            {member.notes && (
              <p className="text-sm text-gray-500 mt-3 border-t border-gray-700 pt-3">
                {member.notes}
              </p>
            )}

            <div className="flex gap-2 mt-4">
              <RequirePermission permission="team.members.manage">
                <button
                  onClick={() => handleEdit(member)}
                  className="flex-1 px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(member)}
                  className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                >
                  Remove
                </button>
              </RequirePermission>
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="bg-secondary rounded-lg p-8 text-center text-gray-500">
          No team members added yet
        </div>
      )}

      {/* Edit/Create Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingMember === 'new' ? 'Add Team Member' : 'Edit Team Member'}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  >
                    {ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
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
                    {STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Residency</label>
                  <select
                    value={formData.residency}
                    onChange={(e) => setFormData(prev => ({ ...prev, residency: e.target.value }))}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  >
                    {RESIDENCIES.map(r => (
                      <option key={r} value={r}>{getResidencyLabel(r)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90"
                >
                  {editingMember === 'new' ? 'Add' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const EmailIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
