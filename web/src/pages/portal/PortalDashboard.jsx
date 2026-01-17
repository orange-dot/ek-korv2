/**
 * Portal main dashboard - shows overview based on permissions.
 */
import { useAuth } from '../../context/AuthContext';
import { RequirePermission } from '../../components/portal/ProtectedRoute';
import { Link } from 'react-router-dom';

export default function PortalDashboard() {
  const { user, hasPermission } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-400">Here's an overview of your portal.</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RequirePermission permission="finance.view">
          <DashboardCard
            title="Finance"
            description="Invoices, expenses, and tax deadlines"
            to="/portal/finance"
            color="cyan"
          />
        </RequirePermission>

        <RequirePermission permission="projects.view">
          <DashboardCard
            title="Projects"
            description="IP assets and milestones"
            to="/portal/projects"
            color="purple"
          />
        </RequirePermission>

        <RequirePermission permission="team.view">
          <DashboardCard
            title="Team"
            description="Members and equity"
            to="/portal/team"
            color="green"
          />
        </RequirePermission>

        <RequirePermission permission="iam.users.view">
          <DashboardCard
            title="Administration"
            description="Users, roles, and audit"
            to="/portal/admin/users"
            color="orange"
          />
        </RequirePermission>
      </div>

      {/* Recent Activity (placeholder) */}
      <div className="bg-secondary rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="text-gray-500 text-center py-8">
          Activity feed coming soon...
        </div>
      </div>

      {/* Role Info */}
      <div className="bg-secondary rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Your Access</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Email:</span>
            <span className="text-white">{user?.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Roles:</span>
            <div className="flex flex-wrap gap-1">
              {user?.roles?.map((role) => (
                <span
                  key={role}
                  className="px-2 py-0.5 bg-accent-cyan/20 text-accent-cyan text-sm rounded"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
          {user?.is_superadmin && (
            <div className="mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded inline-block">
              Superadmin - Full Access
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, description, to, color }) {
  const colorClasses = {
    cyan: 'border-accent-cyan/30 hover:border-accent-cyan',
    purple: 'border-purple-500/30 hover:border-purple-500',
    green: 'border-green-500/30 hover:border-green-500',
    orange: 'border-orange-500/30 hover:border-orange-500',
  };

  return (
    <Link
      to={to}
      className={`block bg-secondary rounded-lg p-6 border-2 transition-colors ${colorClasses[color]}`}
    >
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </Link>
  );
}
