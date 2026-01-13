/**
 * Team dashboard with overview of members and equity.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTeamDashboard } from '../../../services/teamService';
import { RequirePermission } from '../../../components/portal/ProtectedRoute';

export default function TeamDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const dashboard = await getTeamDashboard();
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
      <h1 className="text-2xl font-bold text-white">Team Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Team Members"
          value={data?.total_members || 0}
          subtitle={`${data?.active_members || 0} active`}
          color="cyan"
        />
        <KPICard
          title="Total Shares"
          value={data?.total_shares?.toLocaleString() || 0}
          subtitle="Issued"
          color="purple"
        />
        <KPICard
          title="Contracts"
          value={data?.total_contracts || 0}
          subtitle={`${data?.active_contracts || 0} active`}
          color="green"
        />
        <KPICard
          title="NL Residents"
          value={data?.nl_residents || 0}
          subtitle="For 30% ruling"
          color="orange"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/portal/team/members"
          className="bg-secondary rounded-lg p-6 hover:bg-gray-800 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Team Members</h3>
          <p className="text-gray-400 text-sm">Manage founders and team</p>
          <div className="mt-4 text-accent-cyan">
            View all members &rarr;
          </div>
        </Link>

        <RequirePermission permission="team.equity.view">
          <Link
            to="/portal/team/equity"
            className="bg-secondary rounded-lg p-6 hover:bg-gray-800 transition-colors"
          >
            <h3 className="text-lg font-semibold text-white mb-1">Cap Table</h3>
            <p className="text-gray-400 text-sm">Equity distribution and vesting</p>
            <div className="mt-4 text-accent-cyan">
              View cap table &rarr;
            </div>
          </Link>
        </RequirePermission>
      </div>

      {/* Team Members List */}
      {data?.members?.length > 0 && (
        <div className="bg-secondary rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Team Members</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 bg-primary rounded"
              >
                <div className="w-10 h-10 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan font-semibold">
                  {member.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white truncate">{member.name}</div>
                  <div className="text-sm text-gray-400 truncate">{member.role}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  member.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equity Distribution Preview */}
      <RequirePermission permission="team.equity.view">
        {data?.equity_distribution && (
          <div className="bg-secondary rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Equity Distribution</h2>
            <div className="space-y-3">
              {Object.entries(data.equity_distribution).map(([name, percentage]) => (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{name}</span>
                    <span className="text-white">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-cyan"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </RequirePermission>
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
