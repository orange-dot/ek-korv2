/**
 * Authentication service.
 */
import api, { setTokens, clearTokens, getRefreshToken } from './api';

/**
 * Login with email and password.
 */
export async function login(email, password) {
  const data = await api.post('/auth/login', { email, password });
  setTokens(data.access_token, data.refresh_token);
  return data;
}

/**
 * Logout current user.
 */
export async function logout() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await api.post('/auth/logout', { refresh_token: refreshToken });
    } catch (e) {
      console.warn('Logout request failed:', e);
    }
  }
  clearTokens();
}

/**
 * Get current user info.
 */
export async function getCurrentUser() {
  return api.get('/auth/me');
}

/**
 * Change password.
 */
export async function changePassword(currentPassword, newPassword) {
  return api.post('/auth/password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
}

/**
 * Get invite info (public).
 */
export async function getInviteInfo(token) {
  const response = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/invite/${token}`);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Invalid invite');
  }
  return response.json();
}

/**
 * Accept invite and create account.
 */
export async function acceptInvite(token, name, password) {
  const response = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/invite/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to accept invite');
  }

  const data = await response.json();
  setTokens(data.access_token, data.refresh_token);
  return data;
}
