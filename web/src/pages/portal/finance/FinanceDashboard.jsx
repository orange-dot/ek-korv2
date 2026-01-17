/**
 * Finance dashboard with KPIs.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFinanceDashboard } from '../../../services/financeService';

export default function FinanceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const dashboard = await getFinanceDashboard();
      setData(dashboard);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount || 0);
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
      <h1 className="text-2xl font-bold text-white">Finance Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(data?.total_revenue)}
          subtitle="All invoices"
          color="cyan"
        />
        <KPICard
          title="Outstanding"
          value={formatCurrency(data?.outstanding)}
          subtitle={`${data?.pending_invoices || 0} pending invoices`}
          color="yellow"
        />
        <KPICard
          title="Total Expenses"
          value={formatCurrency(data?.total_expenses)}
          subtitle="This period"
          color="red"
        />
        <KPICard
          title="VAT Due"
          value={formatCurrency(data?.vat_due)}
          subtitle="Reclaimable included"
          color="purple"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/portal/finance/invoices"
          className="bg-secondary rounded-lg p-6 hover:bg-gray-800 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Invoices</h3>
          <p className="text-gray-400 text-sm">Create and manage invoices</p>
          <div className="mt-4 text-accent-cyan">
            {data?.total_invoices || 0} total &rarr;
          </div>
        </Link>

        <Link
          to="/portal/finance/expenses"
          className="bg-secondary rounded-lg p-6 hover:bg-gray-800 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Expenses</h3>
          <p className="text-gray-400 text-sm">Track business expenses</p>
          <div className="mt-4 text-accent-cyan">
            {data?.total_expense_count || 0} recorded &rarr;
          </div>
        </Link>

        <Link
          to="/portal/finance/taxes"
          className="bg-secondary rounded-lg p-6 hover:bg-gray-800 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Tax Deadlines</h3>
          <p className="text-gray-400 text-sm">Dutch B.V. compliance</p>
          <div className="mt-4 text-accent-cyan">
            {data?.upcoming_deadlines || 0} upcoming &rarr;
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-secondary rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Invoices</h2>
        {data?.recent_invoices?.length > 0 ? (
          <div className="space-y-2">
            {data.recent_invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 bg-primary rounded"
              >
                <div>
                  <div className="text-white">{invoice.number}</div>
                  <div className="text-sm text-gray-400">{invoice.client_name}</div>
                </div>
                <div className="text-right">
                  <div className="text-white">{formatCurrency(invoice.total)}</div>
                  <div className={`text-sm ${
                    invoice.status === 'paid' ? 'text-green-400' :
                    invoice.status === 'sent' ? 'text-yellow-400' :
                    'text-gray-400'
                  }`}>
                    {invoice.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No invoices yet</p>
        )}
      </div>
    </div>
  );
}

function KPICard({ title, value, subtitle, color }) {
  const colorClasses = {
    cyan: 'border-accent-cyan/30',
    yellow: 'border-yellow-500/30',
    red: 'border-red-500/30',
    purple: 'border-purple-500/30',
  };

  return (
    <div className={`bg-secondary rounded-lg p-6 border-l-4 ${colorClasses[color]}`}>
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
    </div>
  );
}
