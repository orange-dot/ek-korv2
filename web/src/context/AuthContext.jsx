/**
 * Authentication context for managing user state and permissions.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isAuthenticated, clearTokens } from '../services/api';
import { getCurrentUser, login as loginService, logout as logoutService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on mount
  useEffect(() => {
    if (isAuthenticated()) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      setPermissions(userData.permissions || []);
      setError(null);
    } catch (e) {
      console.error('Failed to load user:', e);
      clearTokens();
      setUser(null);
      setPermissions([]);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      await loginService(email, password);
      await loadUser();
      return true;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } finally {
      setUser(null);
      setPermissions([]);
    }
  };

  /**
   * Check if user has a specific permission.
   * Supports wildcards: "*" matches all, "finance.*" matches finance.anything
   */
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    if (user.is_superadmin) return true;
    if (permissions.includes('*')) return true;
    if (permissions.includes(permission)) return true;

    // Check wildcards
    const parts = permission.split('.');
    for (let i = 0; i < parts.length; i++) {
      const wildcard = parts.slice(0, i + 1).join('.') + '.*';
      if (permissions.includes(wildcard)) return true;
    }

    // Check action wildcards (e.g., "*.view")
    if (permissions.includes(`*.${parts[parts.length - 1]}`)) return true;

    return false;
  }, [user, permissions]);

  /**
   * Check if user has any of the given permissions.
   */
  const hasAnyPermission = useCallback((perms) => {
    return perms.some(p => hasPermission(p));
  }, [hasPermission]);

  /**
   * Check if user has all of the given permissions.
   */
  const hasAllPermissions = useCallback((perms) => {
    return perms.every(p => hasPermission(p));
  }, [hasPermission]);

  const value = {
    user,
    permissions,
    loading,
    error,
    isAuthenticated: !!user,
    isSuperadmin: user?.is_superadmin || false,
    login,
    logout,
    loadUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
