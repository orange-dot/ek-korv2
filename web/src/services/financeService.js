/**
 * Finance service for invoices, expenses, and taxes.
 */
import api from './api';

// Dashboard
export const getFinanceDashboard = () => api.get('/finance/dashboard');

// Invoices
export const getInvoices = () => api.get('/invoices');
export const getInvoice = (id) => api.get(`/invoices/${id}`);
export const createInvoice = (data) => api.post('/invoices', data);
export const updateInvoice = (id, data) => api.put(`/invoices/${id}`, data);
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`);

// Expenses
export const getExpenses = () => api.get('/expenses');
export const getExpense = (id) => api.get(`/expenses/${id}`);
export const createExpense = (data) => api.post('/expenses', data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// Tax Deadlines
export const getTaxDeadlines = () => api.get('/taxes/deadlines');
export const updateTaxDeadline = (id, data) => api.put(`/taxes/deadlines/${id}`, data);
export const getVatSummary = () => api.get('/taxes/vat-summary');
