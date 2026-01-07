import { useState, useEffect } from 'react';
import { Lock, ArrowRight, AlertCircle, Users, Briefcase } from 'lucide-react';
import { ACCESS_TIERS } from '../config/accessTiers';

/**
 * PasswordGate Component
 *
 * Protects content with client-side password authentication.
 * Supports both tier-based config and legacy props for backward compatibility.
 *
 * Usage with tier:
 *   <PasswordGate tier={ACCESS_TIERS.PARTNER}>
 *     <ProtectedContent />
 *   </PasswordGate>
 *
 * Usage with legacy props:
 *   <PasswordGate password="secret" storageKey="my_key" title="My Portal">
 *     <ProtectedContent />
 *   </PasswordGate>
 */
export default function PasswordGate({
  children,
  tier = null,
  // Legacy props (used if tier is not provided)
  password: legacyPassword,
  storageKey: legacyStorageKey,
  title: legacyTitle,
}) {
  // Resolve config from tier or legacy props
  const config = tier ? {
    password: tier.password,
    storageKey: tier.storageKey,
    title: tier.title,
    description: tier.description,
    name: tier.name,
  } : {
    password: legacyPassword || 'technocore',
    storageKey: legacyStorageKey || 'ek_unlocked',
    title: legacyTitle || 'Protected Content',
    description: null,
    name: 'legacy',
  };

  // If no password required (PUBLIC tier), render children directly
  if (!config.password) {
    return <>{children}</>;
  }

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check if already unlocked on mount
  useEffect(() => {
    const unlocked = localStorage.getItem(config.storageKey);
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
    setIsLoading(false);
  }, [config.storageKey]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password === config.password) {
      localStorage.setItem(config.storageKey, 'true');
      setIsUnlocked(true);
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(config.storageKey);
    setIsUnlocked(false);
    setPassword('');
  };

  // Get icon based on tier
  const TierIcon = config.name === 'investor' ? Briefcase :
                   config.name === 'partner' ? Users : Lock;

  // Get color scheme based on tier
  const colorScheme = config.name === 'investor'
    ? { bg: 'bg-amber-600', hover: 'hover:bg-amber-700', ring: 'focus:ring-amber-500', accent: 'text-amber-600' }
    : config.name === 'partner'
    ? { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', ring: 'focus:ring-emerald-500', accent: 'text-emerald-600' }
    : { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', ring: 'focus:ring-blue-500', accent: 'text-blue-600' };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className={`w-8 h-8 border-2 ${colorScheme.accent} border-t-transparent rounded-full animate-spin`} />
      </div>
    );
  }

  // If unlocked, show children with logout option
  if (isUnlocked) {
    return (
      <div className="relative">
        {/* Logout button in corner */}
        <button
          onClick={handleLogout}
          className="fixed top-4 right-4 z-50 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 bg-white/80 backdrop-blur border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Lock className="w-3 h-3" />
          Lock
        </button>
        {children}
      </div>
    );
  }

  // Password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${colorScheme.bg} rounded-2xl mb-4`}>
            <TierIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">ELEKTROKOMBINACIJA</h1>
          <p className="text-slate-500 mt-1">{config.title}</p>
          {config.description && (
            <p className="text-slate-400 text-sm mt-2">{config.description}</p>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Enter access password
            </label>

            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ${colorScheme.ring} focus:border-transparent text-slate-900 placeholder-slate-400`}
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 mt-3 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 ${colorScheme.bg} ${colorScheme.hover} text-white font-medium rounded-xl transition-colors`}
            >
              <span>Access</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            This content is confidential and intended for authorized recipients only.
          </p>
        </div>

        {/* Tier indicator */}
        {config.name !== 'legacy' && (
          <div className="flex justify-center mt-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${colorScheme.bg} text-white text-xs font-medium rounded-full`}>
              <TierIcon className="w-3 h-3" />
              {config.name.charAt(0).toUpperCase() + config.name.slice(1)} Access
            </span>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          &copy; 2026 Elektrokombinacija. All rights reserved.
        </p>
      </div>
    </div>
  );
}

// Re-export ACCESS_TIERS for convenience
export { ACCESS_TIERS };
