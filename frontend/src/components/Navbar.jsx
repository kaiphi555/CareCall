import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const patientLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/reminders', label: 'Reminders', icon: '💊' },
  { to: '/wellness', label: 'Wellness', icon: '❤️' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

const caretakerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/patients', label: 'Patients', icon: '👥' },
  { to: '/schedule-call', label: 'Schedule', icon: '📞' },
  { to: '/wellness-config', label: 'Wellness', icon: '❤️' },
  { to: '/call-logs', label: 'Calls', icon: '📋' },
  { to: '/alerts', label: 'Alerts', icon: '🔔' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const links = user.role === 'patient' ? patientLinks : caretakerLinks;

  return (
    <nav className="bg-black/30 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40" aria-label="Main navigation">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2 no-underline">
            <span className="text-2xl">📱</span>
            <span className="text-xl font-bold text-white">CareCall</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium no-underline transition-all ${
                  location.pathname === link.to
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                }`}
                aria-current={location.pathname === link.to ? 'page' : undefined}
              >
                <span aria-hidden="true">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Role badge + logout */}
          <div className="hidden md:flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
              user.role === 'patient'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/20'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/20'
            }`}>
              {user.role}
            </span>
            <button
              onClick={async () => { await logout(); navigate('/'); }}
              className="px-3 py-2 text-sm font-medium text-white/40 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-all"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap no-underline transition-all ${
                location.pathname === link.to
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5'
              }`}
              aria-current={location.pathname === link.to ? 'page' : undefined}
            >
              <span aria-hidden="true">{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <button
            onClick={async () => { await logout(); navigate('/'); }}
            className="ml-auto px-3 py-2 text-sm font-medium text-white/40 hover:text-red-400 rounded-xl hover:bg-red-500/10 whitespace-nowrap transition-all"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
