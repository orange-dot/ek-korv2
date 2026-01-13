/**
 * IAM service for user/role/invite management.
 */
import api from './api';

// Users
export const getUsers = () => api.get('/iam/users');
export const getUser = (id) => api.get(`/iam/users/${id}`);
export const createUser = (data) => api.post('/iam/users', data);
export const updateUser = (id, data) => api.put(`/iam/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/iam/users/${id}`);
export const updateUserRoles = (id, roleIds) => api.put(`/iam/users/${id}/roles`, { role_ids: roleIds });

// Roles
export const getRoles = () => api.get('/iam/roles');
export const getRole = (id) => api.get(`/iam/roles/${id}`);
export const createRole = (data) => api.post('/iam/roles', data);
export const updateRole = (id, data) => api.put(`/iam/roles/${id}`, data);
export const deleteRole = (id) => api.delete(`/iam/roles/${id}`);

// Permissions
export const getPermissions = () => api.get('/iam/permissions');

// Invites
export const getInvites = () => api.get('/iam/invites');
export const createInvite = (data) => api.post('/iam/invites', data);
export const deleteInvite = (id) => api.delete(`/iam/invites/${id}`);

// Audit Log
export const getAuditLog = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/iam/audit${query ? `?${query}` : ''}`);
};
