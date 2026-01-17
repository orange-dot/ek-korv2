/**
 * Team service for members, equity, and contracts.
 */
import api from './api';

// Dashboard
export const getTeamDashboard = () => api.get('/team/dashboard');

// Members
export const getMembers = () => api.get('/team/members');
export const getMember = (id) => api.get(`/team/members/${id}`);
export const createMember = (data) => api.post('/team/members', data);
export const updateMember = (id, data) => api.put(`/team/members/${id}`, data);
export const deleteMember = (id) => api.delete(`/team/members/${id}`);

// Equity / Cap Table
export const getEquity = () => api.get('/team/equity');
export const createEquityGrant = (data) => api.post('/team/equity', data);
export const updateEquityGrant = (id, data) => api.put(`/team/equity/${id}`, data);
export const deleteEquityGrant = (id) => api.delete(`/team/equity/${id}`);

// Contracts
export const getContracts = () => api.get('/team/contracts');
export const createContract = (data) => api.post('/team/contracts', data);
export const updateContract = (id, data) => api.put(`/team/contracts/${id}`, data);
export const deleteContract = (id) => api.delete(`/team/contracts/${id}`);
