/**
 * Invite acceptance page - allows new users to set up their account.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getInviteInfo, acceptInvite } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function InviteAcceptPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loadUser } = useAuth();

  const [inviteInfo, setInviteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInviteInfo();
  }, [token]);

  const loadInviteInfo = async () => {
    try {
      const info = await getInviteInfo(token);
      setInviteInfo(info);
    } catch (err) {
      setError(err.message || 'Invalid or expired invitation link.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);

    try {
      await acceptInvite(token, name, password);
      await loadUser();
      navigate('/portal', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-accent-cyan">Loading...</div>
      </div>
    );
  }

  if (!inviteInfo) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-secondary rounded-lg p-8">
            <h2 className="text-xl font-semibold text-white mb-4">Invalid Invitation</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <Link
              to="/portal/login"
              className="inline-block py-2 px-4 bg-accent-cyan text-primary font-medium rounded hover:bg-accent-cyan/90 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white">
              Elektro<span className="text-accent-cyan">kombinacija</span>
            </h1>
          </Link>
          <p className="text-gray-400 mt-2">Founders Portal</p>
        </div>

        {/* Accept Invite Form */}
        <div className="bg-secondary rounded-lg p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-2">Welcome!</h2>
          <p className="text-gray-400 mb-6">
            You've been invited to join as <span className="text-accent-cyan">{inviteInfo.role}</span>.
            Set up your account below.
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={inviteInfo.email}
                disabled
                className="w-full px-4 py-2 bg-primary/50 border border-gray-700 rounded text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm text-gray-400 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-400 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan"
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-gray-400 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-primary border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan"
                placeholder="Repeat your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 px-4 bg-accent-cyan text-primary font-medium rounded hover:bg-accent-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
