import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import SimulationPage from './pages/SimulationPage';
import LADeliveryPage from './pages/LADeliveryPage';
import SimulatorDemoPage from './pages/SimulatorDemoPage';
import HAXDemoPage from './pages/HAXDemoPage';
import InvestorPitchPage from './pages/InvestorPitchPage';

// Documentation pages (public)
import DocsPage from './pages/DocsPage';
import SelfHealingPage from './pages/docs/SelfHealingPage';
import ArchitecturePage from './pages/docs/ArchitecturePage';
import V2GConceptPage from './pages/docs/V2GConceptPage';
import RojOverviewPage from './pages/docs/RojOverviewPage';
import CompetitionPage from './pages/docs/CompetitionPage';
import SmallBatteryPage from './pages/docs/SmallBatteryPage';
import EkKorPage from './pages/docs/EkKorPage';

// Portal pages
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/portal/ProtectedRoute';
import LoginPage from './pages/portal/LoginPage';
import InviteAcceptPage from './pages/portal/InviteAcceptPage';
import PortalLayout from './pages/portal/PortalLayout';
import PortalDashboard from './pages/portal/PortalDashboard';
// Portal - IAM
import UsersPage from './pages/portal/iam/UsersPage';
import RolesPage from './pages/portal/iam/RolesPage';
import InvitesPage from './pages/portal/iam/InvitesPage';
import AuditLogPage from './pages/portal/iam/AuditLogPage';
// Portal - Finance
import FinanceDashboard from './pages/portal/finance/FinanceDashboard';
import InvoicesPage from './pages/portal/finance/InvoicesPage';
import ExpensesPage from './pages/portal/finance/ExpensesPage';
import TaxDeadlinesPage from './pages/portal/finance/TaxDeadlinesPage';
// Portal - Projects
import ProjectsDashboard from './pages/portal/projects/ProjectsDashboard';
import IPTrackerPage from './pages/portal/projects/IPTrackerPage';
import MilestonesPage from './pages/portal/projects/MilestonesPage';
// Portal - Team
import TeamDashboard from './pages/portal/team/TeamDashboard';
import MembersPage from './pages/portal/team/MembersPage';
import EquityPage from './pages/portal/team/EquityPage';

function App() {
  return (
    <AuthProvider>
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-primary">
            <Navbar />
            <main>
              <HomePage />
            </main>
            <Footer />
          </div>
        }
      />
      <Route path="/simulation" element={<SimulationPage />} />
      <Route path="/la-demo" element={<LADeliveryPage />} />
      <Route path="/la-delivery" element={<LADeliveryPage />} />
      <Route path="/gv-demo" element={<LADeliveryPage />} />
      <Route path="/simulator-demo" element={<SimulatorDemoPage />} />
      <Route path="/hax-demo" element={<HAXDemoPage />} />
      <Route path="/pitch" element={<InvestorPitchPage />} />

      {/* Public documentation */}
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/docs/self-healing" element={<SelfHealingPage />} />
      <Route path="/docs/architecture" element={<ArchitecturePage />} />
      <Route path="/docs/v2g-concept" element={<V2GConceptPage />} />
      <Route path="/docs/roj-overview" element={<RojOverviewPage />} />
      <Route path="/docs/competition" element={<CompetitionPage />} />
      <Route path="/docs/small-battery" element={<SmallBatteryPage />} />
      <Route path="/docs/ek-kor" element={<EkKorPage />} />

      {/* Portal routes */}
      <Route path="/portal/login" element={<LoginPage />} />
      <Route path="/portal/invite/:token" element={<InviteAcceptPage />} />

      {/* Protected portal routes */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute>
            <PortalLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PortalDashboard />} />

        {/* Finance */}
        <Route path="finance" element={<ProtectedRoute permission="finance.view"><FinanceDashboard /></ProtectedRoute>} />
        <Route path="finance/invoices" element={<ProtectedRoute permission="finance.view"><InvoicesPage /></ProtectedRoute>} />
        <Route path="finance/expenses" element={<ProtectedRoute permission="finance.view"><ExpensesPage /></ProtectedRoute>} />
        <Route path="finance/taxes" element={<ProtectedRoute permission="finance.view"><TaxDeadlinesPage /></ProtectedRoute>} />

        {/* Projects */}
        <Route path="projects" element={<ProtectedRoute permission="projects.view"><ProjectsDashboard /></ProtectedRoute>} />
        <Route path="projects/ip" element={<ProtectedRoute permission="projects.view"><IPTrackerPage /></ProtectedRoute>} />
        <Route path="projects/milestones" element={<ProtectedRoute permission="projects.view"><MilestonesPage /></ProtectedRoute>} />

        {/* Team */}
        <Route path="team" element={<ProtectedRoute permission="team.view"><TeamDashboard /></ProtectedRoute>} />
        <Route path="team/members" element={<ProtectedRoute permission="team.view"><MembersPage /></ProtectedRoute>} />
        <Route path="team/equity" element={<ProtectedRoute permission="team.equity.view"><EquityPage /></ProtectedRoute>} />

        {/* Admin / IAM */}
        <Route path="admin/users" element={<ProtectedRoute permission="iam.users.view"><UsersPage /></ProtectedRoute>} />
        <Route path="admin/roles" element={<ProtectedRoute permission="iam.roles.manage"><RolesPage /></ProtectedRoute>} />
        <Route path="admin/invites" element={<ProtectedRoute permission="iam.invites.send"><InvitesPage /></ProtectedRoute>} />
        <Route path="admin/audit" element={<ProtectedRoute permission="iam.audit.view"><AuditLogPage /></ProtectedRoute>} />
      </Route>
    </Routes>
    </AuthProvider>
  );
}

export default App;
