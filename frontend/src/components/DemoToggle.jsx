import { useAuth } from '../context/AuthContext';

export default function DemoToggle() {
  const { user, switchRole } = useAuth();

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-black/50 backdrop-blur-xl rounded-full shadow-2xl border border-white/10 p-1.5 pl-4">
      <span className="text-sm font-medium text-white/40 whitespace-nowrap">Demo:</span>
      <button
        onClick={() => switchRole('patient')}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
          user.role === 'patient'
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
            : 'text-white/40 hover:bg-white/5'
        }`}
        aria-pressed={user.role === 'patient'}
        aria-label="View as Patient"
      >
        👤 Patient
      </button>
      <button
        onClick={() => switchRole('caretaker')}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
          user.role === 'caretaker'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
            : 'text-white/40 hover:bg-white/5'
        }`}
        aria-pressed={user.role === 'caretaker'}
        aria-label="View as Caretaker"
      >
        🩺 Caretaker
      </button>
    </div>
  );
}
