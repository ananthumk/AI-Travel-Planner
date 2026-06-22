import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-bold text-deep mb-1">Welcome back</h1>
        <p className="text-ink/60 mb-8">Log in to keep planning your trips.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border outline-0 border-sandline rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-coral"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border outline-0 border-sandline rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-coral"
            />
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#001219]  text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60"
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-sm text-ink/60 mt-6">
          New to Travel Planner?{' '}
          <Link to="/register" className="text-coral font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
