/**
 * Expenses management page.
 */
import { useState, useEffect } from 'react';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../../../services/financeService';
import { RequirePermission } from '../../../components/portal/ProtectedRoute';

const CATEGORIES = [
  'office', 'travel', 'software', 'hardware', 'consulting',
  'marketing', 'legal', 'accounting', 'utilities', 'other'
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function getEmptyForm() {
    return {
      date: new Date().toISOString().split('T')[0],
      category: 'office',
      amount: '',
      vat_reclaimable: '',
      description: '',
      status: 'pending',
    };
  }

  const handleCreate = () => {
    setEditingExpense('new');
    setFormData(getEmptyForm());
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense.id);
    setFormData({
      date: expense.date,
      category: expense.category,
      amount: expense.amount,
      vat_reclaimable: expense.vat_reclaimable || '',
      description: expense.description || '',
      status: expense.status,
    });
  };

  const handleDelete = async (expense) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await deleteExpense(expense.id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        vat_reclaimable: formData.vat_reclaimable ? parseFloat(formData.vat_reclaimable) : 0,
      };
      if (editingExpense === 'new') {
        await createExpense(data);
      } else {
        await updateExpense(editingExpense, data);
      }
      setEditingExpense(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount || 0);
  };

  const getCategoryColor = (category) => {
    const colors = {
      office: 'bg-blue-500/20 text-blue-400',
      travel: 'bg-green-500/20 text-green-400',
      software: 'bg-purple-500/20 text-purple-400',
      hardware: 'bg-orange-500/20 text-orange-400',
      consulting: 'bg-cyan-500/20 text-cyan-400',
      marketing: 'bg-pink-500/20 text-pink-400',
      legal: 'bg-red-500/20 text-red-400',
      accounting: 'bg-yellow-500/20 text-yellow-400',
      utilities: 'bg-gray-500/20 text-gray-400',
      other: 'bg-gray-500/20 text-gray-400',
    };
    return colors[category] || colors.other;
  };

  // Calculate totals
  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalVatReclaimable = expenses.reduce((sum, e) => sum + (e.vat_reclaimable || 0), 0);

  if (loading) {
    return <div className="text-accent-cyan">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Expenses</h1>
        <RequirePermission permission="finance.expenses.create">
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90"
          >
            Add Expense
          </button>
        </RequirePermission>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-secondary rounded-lg p-4">
          <div className="text-sm text-gray-400">Total Expenses</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="bg-secondary rounded-lg p-4">
          <div className="text-sm text-gray-400">VAT Reclaimable</div>
          <div className="text-2xl font-bold text-green-400">{formatCurrency(totalVatReclaimable)}</div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-secondary rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Description</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Amount</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">VAT</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 text-gray-400">{expense.date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(expense.category)}`}>
                    {expense.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">{expense.description || '-'}</td>
                <td className="px-4 py-3 text-white text-right">{formatCurrency(expense.amount)}</td>
                <td className="px-4 py-3 text-green-400 text-right">
                  {expense.vat_reclaimable ? formatCurrency(expense.vat_reclaimable) : '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    expense.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    expense.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {expense.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense)}
                      className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {expenses.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">
            No expenses recorded
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingExpense === 'new' ? 'Add Expense' : 'Edit Expense'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Amount (EUR)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">VAT Reclaimable</label>
                  <input
                    type="number"
                    value={formData.vat_reclaimable}
                    onChange={(e) => setFormData(prev => ({ ...prev, vat_reclaimable: e.target.value }))}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90"
                >
                  {editingExpense === 'new' ? 'Add' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
