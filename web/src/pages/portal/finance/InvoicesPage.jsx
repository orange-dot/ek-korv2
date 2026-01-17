/**
 * Invoices management page.
 */
import { useState, useEffect } from 'react';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from '../../../services/financeService';
import { RequirePermission } from '../../../components/portal/ProtectedRoute';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getInvoices();
      setInvoices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function getEmptyForm() {
    return {
      number: '',
      date: new Date().toISOString().split('T')[0],
      due_date: '',
      client_name: '',
      client_kvk: '',
      client_vat: '',
      client_address: '',
      status: 'draft',
      payment_reference: '',
      iban: '',
      notes: '',
      items: [{ description: '', quantity: 1, unit_price: 0, vat_rate: 21 }],
    };
  }

  const handleCreate = () => {
    setEditingInvoice('new');
    setFormData(getEmptyForm());
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice.id);
    setFormData({
      number: invoice.number,
      date: invoice.date,
      due_date: invoice.due_date,
      client_name: invoice.client_name,
      client_kvk: invoice.client_kvk || '',
      client_vat: invoice.client_vat || '',
      client_address: invoice.client_address || '',
      status: invoice.status,
      payment_reference: invoice.payment_reference || '',
      iban: invoice.iban || '',
      notes: invoice.notes || '',
      items: invoice.items?.length > 0 ? invoice.items : [{ description: '', quantity: 1, unit_price: 0, vat_rate: 21 }],
    });
  };

  const handleDelete = async (invoice) => {
    if (!confirm(`Delete invoice ${invoice.number}?`)) return;
    try {
      await deleteInvoice(invoice.id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInvoice === 'new') {
        await createInvoice(formData);
      } else {
        await updateInvoice(editingInvoice, formData);
      }
      setEditingInvoice(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0, vat_rate: 21 }],
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400';
      case 'sent': return 'bg-blue-500/20 text-blue-400';
      case 'overdue': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return <div className="text-accent-cyan">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Invoices</h1>
        <RequirePermission permission="finance.invoices.create">
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90"
          >
            Create Invoice
          </button>
        </RequirePermission>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-secondary rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Number</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Client</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Total</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 text-white font-mono">{invoice.number}</td>
                <td className="px-4 py-3 text-gray-300">{invoice.client_name}</td>
                <td className="px-4 py-3 text-gray-400">{invoice.date}</td>
                <td className="px-4 py-3 text-white text-right">{formatCurrency(invoice.total)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <RequirePermission permission="finance.invoices.edit">
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                      >
                        Edit
                      </button>
                    </RequirePermission>
                    <RequirePermission permission="finance.invoices.edit">
                      <button
                        onClick={() => handleDelete(invoice)}
                        className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                      >
                        Delete
                      </button>
                    </RequirePermission>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">
            No invoices yet
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {editingInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingInvoice === 'new' ? 'Create Invoice' : 'Edit Invoice'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                    required
                  />
                </div>
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
                  <label className="block text-sm text-gray-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
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
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              {/* Client Info */}
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Client Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Client Name</label>
                    <input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                      className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">KvK Number</label>
                    <input
                      type="text"
                      value={formData.client_kvk}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_kvk: e.target.value }))}
                      className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">VAT Number</label>
                    <input
                      type="text"
                      value={formData.client_vat}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_vat: e.target.value }))}
                      className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Address</label>
                    <input
                      type="text"
                      value={formData.client_address}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_address: e.target.value }))}
                      className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-400">Line Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm text-accent-cyan hover:text-accent-cyan/80"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-full px-3 py-2 bg-primary border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-accent-cyan"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                          placeholder="Qty"
                          className="w-full px-3 py-2 bg-primary border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-accent-cyan"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                          placeholder="Price"
                          className="w-full px-3 py-2 bg-primary border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-accent-cyan"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={item.vat_rate}
                          onChange={(e) => updateItem(index, 'vat_rate', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-primary border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-accent-cyan"
                        >
                          <option value={21}>21%</option>
                          <option value={9}>9%</option>
                          <option value={0}>0%</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-gray-400 hover:text-red-400"
                          disabled={formData.items.length === 1}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">IBAN</label>
                    <input
                      type="text"
                      value={formData.iban}
                      onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                      className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Payment Reference</label>
                    <input
                      type="text"
                      value={formData.payment_reference}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_reference: e.target.value }))}
                      className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingInvoice(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-cyan text-primary rounded hover:bg-accent-cyan/90"
                >
                  {editingInvoice === 'new' ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
