/**
 * Projects dashboard with IP and milestone overview.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjectsDashboard } from '../../../services/projectsService';

export default function ProjectsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const dashboard = await getProjectsDashboard();
      setData(dashboard);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-accent-cyan">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Projects Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="IP Assets"
          value={data?.total_ip_assets || 0}
          subtitle={`${data?.pending_ip || 0} pending`}
          color="purple"
        />
        <KPICard
          title="Patents"
          value={data?.patents_filed || 0}
          subtitle="Filed/Pending"
          color="cyan"
        />
        <KPICard
          title="Milestones"
          value={data?.total_milestones || 0}
          subtitle={`${data?.completed_milestones || 0} completed`}
          color="green"
        />
        <KPICard
          title="IP Deadlines"
          value={data?.upcoming_ip_deadlines || 0}
          subtitle="Next 30 days"
          color="orange"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/portal/projects/ip"
          className="bg-secondary rounded-lg p-6 hover:bg-gray-800 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white mb-1">IP Tracker</h3>
          <p className="text-gray-400 text-sm">Patents, trademarks, and copyrights</p>
          <div className="mt-4 text-accent-cyan">
            Manage IP assets &rarr;
          </div>
        </Link>

        <Link
          to="/portal/projects/milestones"
          className="bg-secondary rounded-lg p-6 hover:bg-gray-800 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Milestones</h3>
          <p className="text-gray-400 text-sm">Development phases and deliverables</p>
          <div className="mt-4 text-accent-cyan">
            View timeline &rarr;
          </div>
        </Link>
      </div>

      {/* Recent IP Assets */}
      {data?.recent_ip?.length > 0 && (
        <div className="bg-secondary rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent IP Assets</h2>
          <div className="space-y-3">
            {data.recent_ip.map((ip) => (
              <div
                key={ip.id}
                className="flex items-center justify-between p-3 bg-primary rounded"
              >
                <div>
                  <div className="text-white">{ip.title}</div>
                  <div className="text-sm text-gray-400">
                    {ip.type} • {ip.filing_number || 'No filing number'}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  ip.status === 'granted' ? 'bg-green-500/20 text-green-400' :
                  ip.status === 'filed' ? 'bg-blue-500/20 text-blue-400' :
                  ip.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {ip.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Deadlines */}
      {data?.ip_deadlines?.length > 0 && (
        <div className="bg-secondary rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Upcoming IP Deadlines</h2>
          <div className="space-y-2">
            {data.ip_deadlines.map((deadline) => (
              <div
                key={deadline.id}
                className="flex items-center justify-between p-3 bg-primary rounded"
              >
                <div>
                  <div className="text-white">{deadline.type}</div>
                  <div className="text-sm text-gray-400">{deadline.ip_title}</div>
                </div>
                <div className="text-right">
                  <div className="text-white">{deadline.due_date}</div>
                  <div className={`text-sm ${
                    getDaysUntil(deadline.due_date) < 7 ? 'text-red-400' :
                    getDaysUntil(deadline.due_date) < 30 ? 'text-orange-400' :
                    'text-gray-400'
                  }`}>
                    {getDaysUntil(deadline.due_date)} days left
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, subtitle, color }) {
  const colorClasses = {
    cyan: 'border-accent-cyan/30',
    purple: 'border-purple-500/30',
    green: 'border-green-500/30',
    orange: 'border-orange-500/30',
  };

  return (
    <div className={`bg-secondary rounded-lg p-6 border-l-4 ${colorClasses[color]}`}>
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
    </div>
  );
}

function getDaysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}
