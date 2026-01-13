/**
 * Projects service for IP assets and milestones.
 */
import api from './api';

// Dashboard
export const getProjectsDashboard = () => api.get('/projects/dashboard');

// IP Assets
export const getIPAssets = () => api.get('/ip-assets');
export const getIPAsset = (id) => api.get(`/ip-assets/${id}`);
export const createIPAsset = (data) => api.post('/ip-assets', data);
export const updateIPAsset = (id, data) => api.put(`/ip-assets/${id}`, data);
export const deleteIPAsset = (id) => api.delete(`/ip-assets/${id}`);

// Milestones
export const getMilestones = () => api.get('/milestones');
export const getMilestone = (id) => api.get(`/milestones/${id}`);
export const createMilestone = (data) => api.post('/milestones', data);
export const updateMilestone = (id, data) => api.put(`/milestones/${id}`, data);
export const deleteMilestone = (id) => api.delete(`/milestones/${id}`);
