/**
 * Milestones timeline page.
 */
import { useState, useEffect } from 'react';
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from '../../../services/projectsService';
import { RequirePermission } from '../../../components/portal/ProtectedRoute';

const STATUSES = ['planned', 'in_progress', 'completed', 'delayed'];

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getMilestones();
      setMilestones(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function getEmptyForm() {
    return {
      phase: 1,
      title: '',
      description: '',
      target_date: '',
      status: 'planned',
      deliverables: '',
    };
  }

  const handleCreate = () => {
    setEditingMilestone('new');
    setFormData(getEmptyForm());
  };

  const handleEdit = (milestone) => {
    setEditingMilestone(milestone.id);
    setFormData({
      phase: milestone.phase,
      title: milestone.title,
      description: milestone.description || '',
      target_date: milestone.target_date || '',
      status: milestone.status,
      deliverables: milestone.deliverables || '',
    });
  };

  const handleDelete = async (milestone) => {
    if (!confirm(`Delete "${milestone.title}"?`)) return;
    try {
      await deleteMilestone(milestone.id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (milestone, newStatus) => {
    try {
      await updateMilestone(milestone.id, {
        ...milestone,
        status: newStatus,
        completed_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null,
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMilestone === 'new') {
        await createMilestone(formData);
      } else {
        await updateMilestone(editingMilestone, formData);
      }
      setEditingMilestone(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planned: 'bg-gray-500/20 text-gray-400 border-gray-500',
      in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500',
      completed: 'bg-green-500/20 text-green-400 border-green-500',
      delayed: 'bg-red-500/20 text-red-400 border-red-500',
    };
    return colors[status] || colors.planned;
  };

  const getStatusDot = (status) => {
    const colors = {
      planned: 'bg-gray-500',
      in_progress: 'bg-blue-500',
      completed: 'bg-green-500',
      delayed: 'bg-red-500',
    };
    return colors[status] || colors.planned;
  };

  // Group by phase
  const byPhase = milestones.reduce((acc, m) => {
    if (!acc[m.phase]) acc[m.phase] = [];
    acc[m.phase].push(m);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-accent-cyan">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Milestones</h1>
          <p className="text-gray-400">Development timeline and deliverables</p>
        </div>
        <RequirePermission permission="projects.milestones.manage">
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90"
          >
            Add Milestone
          </button>
        </RequirePermission>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Progress Summary */}
      <div className="bg-secondary rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">Overall Progress</span>
          <span className="text-white">
            {milestones.filter(m => m.status === 'completed').length} / {milestones.length} completed
          </span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-cyan transition-all"
            style={{
              width: `${milestones.length > 0
                ? (milestones.filter(m => m.status === 'completed').length / milestones.length) * 100
                : 0}%`
            }}
          />
        </div>
      </div>

      {/* Timeline View */}
      <div className="space-y-8">
        {Object.entries(byPhase)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([phase, phaseMilestones]) => (
            <div key={phase} className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan font-bold">
                  {phase}
                </div>
                <h2 className="text-lg font-semibold text-white">Phase {phase}</h2>
              </div>

              <div className="ml-5 pl-8 border-l-2 border-gray-700 space-y-4">
                {phaseMilestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="relative bg-secondary rounded-lg p-4"
                  >
                    {/* Timeline dot */}
                    <div className={`absolute -left-[41px] w-4 h-4 rounded-full ${getStatusDot(milestone.status)}`} />

                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{milestone.title}</h3>
                        {milestone.target_date && (
                          <span className="text-sm text-gray-500">
                            Target: {milestone.target_date}
                            {milestone.completed_date && ` • Completed: ${milestone.completed_date}`}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(milestone.status)}`}>
                        {milestone.status.replace('_', ' ')}
                      </span>
                    </div>

                    {milestone.description && (
                      <p className="text-gray-400 text-sm mb-3">{milestone.description}</p>
                    )}

                    {milestone.deliverables && (
                      <div className="text-sm">
                        <span className="text-gray-500">Deliverables: </span>
                        <span className="text-gray-400">{milestone.deliverables}</span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <RequirePermission permission="projects.milestones.manage">
                        {milestone.status !== 'completed' && (
                          <select
                            value={milestone.status}
                            onChange={(e) => handleStatusChange(milestone, e.target.value)}
                            className="px-3 py-1 text-sm bg-primary border border-gray-700 rounded text-white"
                          >
                            {STATUSES.map(s => (
                              <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                          </select>
                        )}
                        <button
                          onClick={() => handleEdit(milestone)}
                          className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(milestone)}
                          className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                        >
                          Delete
                        </button>
                      </RequirePermission>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {milestones.length === 0 && (
        <div className="bg-secondary rounded-lg p-8 text-center text-gray-500">
          No milestones defined yet
        </div>
      )}

      {/* Edit/Create Modal */}
      {editingMilestone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingMilestone === 'new' ? 'Add Milestone' : 'Edit Milestone'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phase</label>
                  <input
                    type="number"
                    value={formData.phase}
                    onChange={(e) => setFormData(prev => ({ ...prev, phase: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
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
                <label className="block text-sm text-gray-400 mb-1">Target Date</label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Deliverables</label>
                <input
                  type="text"
                  value={formData.deliverables}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliverables: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  placeholder="Comma-separated list"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMilestone(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90"
                >
                  {editingMilestone === 'new' ? 'Add' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
