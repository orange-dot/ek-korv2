import { useState, useEffect } from 'react';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';

// Default values - can be overridden via props
const DEFAULT_PASSWORD = 'technocore';
const DEFAULT_STORAGE_KEY = 'ek_unlocked';

export default function PasswordGate({
  children,
  password: correctPassword = DEFAULT_PASSWORD,
  storageKey = DEFAULT_STORAGE_KEY,
  title = 'Protected Content'
}) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check if already unlocked on mount
  useEffect(() => {
    const unlocked = localStorage.getItem(storageKey);
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
    setIsLoading(false);
  }, [storageKey]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password === correctPassword) {
      localStorage.setItem(storageKey, 'true');
      setIsUnlocked(true);
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(storageKey);
    setIsUnlocked(false);
    setPassword('');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
          className="fixed top-4 right-4 z-50 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 bg-white/80 backdrop-blur border border-slate-200 rounded-lg transition-colors"
        >
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">ELEKTROKOMBINACIJA</h1>
          <p className="text-slate-500 mt-1">{title}</p>
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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
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
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              <span>Access</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            This content is confidential and intended for authorized recipients only.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          &copy; 2026 Elektrokombinacija. All rights reserved.
        </p>
      </div>
    </div>
  );
}
