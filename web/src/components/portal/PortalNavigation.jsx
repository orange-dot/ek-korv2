/**
 * Portal sidebar navigation with permission-based links.
 */
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RequirePermission } from './ProtectedRoute';

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2 rounded transition-colors ${
    isActive
      ? 'bg-accent-cyan/20 text-accent-cyan'
      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
  }`;

export default function PortalNavigation({ onClose }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-4 border-b border-gray-800">
        <NavLink to="/portal" className="block" onClick={onClose}>
          <h1 className="text-xl font-bold text-white">
            Elektro<span className="text-accent-cyan">kombinacija</span>
          </h1>
          <p className="text-xs text-gray-500">Founders Portal</p>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Dashboard */}
        <div>
          <NavLink to="/portal" end className={navLinkClass} onClick={onClose}>
            <DashboardIcon />
            <span>Dashboard</span>
          </NavLink>
        </div>

        {/* Finance Section */}
        <RequirePermission permission="finance.view">
          <div className="space-y-1">
            <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Finance
            </div>
            <NavLink to="/portal/finance" end className={navLinkClass} onClick={onClose}>
              <ChartIcon />
              <span>Overview</span>
            </NavLink>
            <NavLink to="/portal/finance/invoices" className={navLinkClass} onClick={onClose}>
              <InvoiceIcon />
              <span>Invoices</span>
            </NavLink>
            <NavLink to="/portal/finance/expenses" className={navLinkClass} onClick={onClose}>
              <ExpenseIcon />
              <span>Expenses</span>
            </NavLink>
            <NavLink to="/portal/finance/taxes" className={navLinkClass} onClick={onClose}>
              <TaxIcon />
              <span>Tax Deadlines</span>
            </NavLink>
          </div>
        </RequirePermission>

        {/* Projects Section */}
        <RequirePermission permission="projects.view">
          <div className="space-y-1">
            <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Projects
            </div>
            <NavLink to="/portal/projects" end className={navLinkClass} onClick={onClose}>
              <ProjectIcon />
              <span>Overview</span>
            </NavLink>
            <NavLink to="/portal/projects/ip" className={navLinkClass} onClick={onClose}>
              <PatentIcon />
              <span>IP Tracker</span>
            </NavLink>
            <NavLink to="/portal/projects/milestones" className={navLinkClass} onClick={onClose}>
              <MilestoneIcon />
              <span>Milestones</span>
            </NavLink>
          </div>
        </RequirePermission>

        {/* Team Section */}
        <RequirePermission permission="team.view">
          <div className="space-y-1">
            <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Team
            </div>
            <NavLink to="/portal/team" end className={navLinkClass} onClick={onClose}>
              <TeamIcon />
              <span>Overview</span>
            </NavLink>
            <NavLink to="/portal/team/members" className={navLinkClass} onClick={onClose}>
              <UserIcon />
              <span>Members</span>
            </NavLink>
            <RequirePermission permission="team.equity.view">
              <NavLink to="/portal/team/equity" className={navLinkClass} onClick={onClose}>
                <EquityIcon />
                <span>Cap Table</span>
              </NavLink>
            </RequirePermission>
          </div>
        </RequirePermission>

        {/* Admin Section */}
        <RequirePermission permission="iam.users.view">
          <div className="space-y-1">
            <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Administration
            </div>
            <NavLink to="/portal/admin/users" className={navLinkClass} onClick={onClose}>
              <UsersIcon />
              <span>Users</span>
            </NavLink>
            <RequirePermission permission="iam.roles.manage">
              <NavLink to="/portal/admin/roles" className={navLinkClass} onClick={onClose}>
                <RoleIcon />
                <span>Roles</span>
              </NavLink>
            </RequirePermission>
            <RequirePermission permission="iam.invites.send">
              <NavLink to="/portal/admin/invites" className={navLinkClass} onClick={onClose}>
                <InviteIcon />
                <span>Invites</span>
              </NavLink>
            </RequirePermission>
            <RequirePermission permission="iam.audit.view">
              <NavLink to="/portal/admin/audit" className={navLinkClass} onClick={onClose}>
                <AuditIcon />
                <span>Audit Log</span>
              </NavLink>
            </RequirePermission>
          </div>
        </RequirePermission>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
        >
          <LogoutIcon />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}

// Icons (simple SVG components)
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const InvoiceIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ExpenseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const TaxIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ProjectIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const PatentIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const MilestoneIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
  </svg>
);

const TeamIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EquityIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const RoleIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const InviteIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const AuditIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
