/**
 * Tax deadlines page for Dutch B.V. compliance.
 */
import { useState, useEffect } from 'react';
import { getTaxDeadlines, updateTaxDeadline } from '../../../services/financeService';
import { RequirePermission } from '../../../components/portal/ProtectedRoute';

export default function TaxDeadlinesPage() {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getTaxDeadlines();
      setDeadlines(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (deadline, newStatus) => {
    try {
      await updateTaxDeadline(deadline.id, {
        status: newStatus,
        filed_date: newStatus === 'filed' ? new Date().toISOString().split('T')[0] : null,
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExtensionRequest = async (deadline) => {
    try {
      await updateTaxDeadline(deadline.id, {
        extension_requested: true,
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntil = (dateStr) => {
    const days = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getUrgencyColor = (dateStr, status) => {
    if (status === 'filed') return 'border-green-500/30';
    const days = getDaysUntil(dateStr);
    if (days < 0) return 'border-red-500/50 bg-red-500/5';
    if (days < 14) return 'border-orange-500/50 bg-orange-500/5';
    if (days < 30) return 'border-yellow-500/30';
    return 'border-gray-700';
  };

  const getTypeLabel = (type) => {
    const labels = {
      'vat_q1': 'VAT Q1',
      'vat_q2': 'VAT Q2',
      'vat_q3': 'VAT Q3',
      'vat_q4': 'VAT Q4',
      'corporate_tax': 'Corporate Tax (VPB)',
      'annual_accounts': 'Annual Accounts (KvK)',
      'wage_tax': 'Wage Tax',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      filed: 'bg-green-500/20 text-green-400',
      overdue: 'bg-red-500/20 text-red-400',
    };
    return styles[status] || styles.pending;
  };

  // Group by year
  const byYear = deadlines.reduce((acc, d) => {
    if (!acc[d.year]) acc[d.year] = [];
    acc[d.year].push(d);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-accent-cyan">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tax Deadlines</h1>
          <p className="text-gray-400">Dutch B.V. compliance calendar</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Upcoming Alert */}
      {deadlines.some(d => getDaysUntil(d.due_date) < 14 && d.status === 'pending') && (
        <div className="bg-orange-500/20 border border-orange-500 text-orange-400 px-4 py-3 rounded">
          You have upcoming deadlines within 14 days. Please review and file accordingly.
        </div>
      )}

      {/* Deadlines by Year */}
      {Object.entries(byYear)
        .sort(([a], [b]) => parseInt(b) - parseInt(a))
        .map(([year, yearDeadlines]) => (
          <div key={year} className="space-y-3">
            <h2 className="text-lg font-semibold text-white">{year}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {yearDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className={`bg-secondary rounded-lg p-4 border-l-4 ${getUrgencyColor(deadline.due_date, deadline.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{getTypeLabel(deadline.type)}</h3>
                      <div className="text-sm text-gray-400 mt-1">
                        Due: {formatDate(deadline.due_date)}
                        {deadline.status === 'pending' && (
                          <span className={`ml-2 ${
                            getDaysUntil(deadline.due_date) < 0 ? 'text-red-400' :
                            getDaysUntil(deadline.due_date) < 14 ? 'text-orange-400' :
                            'text-gray-500'
                          }`}>
                            ({getDaysUntil(deadline.due_date) < 0
                              ? `${Math.abs(getDaysUntil(deadline.due_date))} days overdue`
                              : `${getDaysUntil(deadline.due_date)} days left`})
                          </span>
                        )}
                      </div>
                      {deadline.filed_date && (
                        <div className="text-sm text-green-400 mt-1">
                          Filed: {formatDate(deadline.filed_date)}
                        </div>
                      )}
                      {deadline.extension_requested && (
                        <div className="text-sm text-blue-400 mt-1">
                          Extension requested
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(deadline.status)}`}>
                      {deadline.status}
                    </span>
                  </div>

                  {deadline.notes && (
                    <p className="text-sm text-gray-500 mt-2">{deadline.notes}</p>
                  )}

                  {/* Actions */}
                  <RequirePermission permission="finance.taxes.manage">
                    {deadline.status === 'pending' && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleStatusChange(deadline, 'filed')}
                          className="px-3 py-1 text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded"
                        >
                          Mark as Filed
                        </button>
                        {!deadline.extension_requested && (
                          <button
                            onClick={() => handleExtensionRequest(deadline)}
                            className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded"
                          >
                            Request Extension
                          </button>
                        )}
                      </div>
                    )}
                  </RequirePermission>
                </div>
              ))}
            </div>
          </div>
        ))}

      {/* Info Box */}
      <div className="bg-secondary rounded-lg p-6">
        <h3 className="font-semibold text-white mb-3">Dutch B.V. Tax Calendar</h3>
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div>
            <h4 className="text-gray-400 mb-2">VAT (BTW)</h4>
            <ul className="space-y-1 text-gray-500">
              <li>Q1: Due April 30</li>
              <li>Q2: Due July 31</li>
              <li>Q3: Due October 31</li>
              <li>Q4: Due January 31 (next year)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-400 mb-2">Corporate Tax (VPB)</h4>
            <ul className="space-y-1 text-gray-500">
              <li>Declaration due: June 1 (+ 5mo extension)</li>
              <li>Payment: per assessment</li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-400 mb-2">Annual Accounts (KvK)</h4>
            <ul className="space-y-1 text-gray-500">
              <li>Small B.V.: Within 13 months after year-end</li>
              <li>Typically by December 31</li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-400 mb-2">Extensions</h4>
            <ul className="space-y-1 text-gray-500">
              <li>VPB: Up to 5 months extension available</li>
              <li>Annual accounts: Shareholders may grant extension</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
