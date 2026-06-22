import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-sandline bg-sand/90 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="font-display text-xl font-bold text-deep tracking-tight">
          Travel Planner<span className="text-coral">.</span>
        </Link>

        {user && (
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/dashboard" className="hover:text-coral font-medium transition-colors">
              My trips
            </Link>
            <Link
              to="/trip/new"
              className="bg-[#b58463] text-white px-4 py-2 rounded-full font-medium transition-colors"
            >
              + New trip
            </Link>
            <button onClick={logout} className="text-ink/60 font-medium hover:text-coral transition-colors">
              Log out
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
