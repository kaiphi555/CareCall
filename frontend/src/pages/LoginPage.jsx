import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    login(email, password);
    navigate('/dashboard');
  };

  const demoLogin = (role) => {
    login(role === 'patient' ? 'margaret@email.com' : 'david@email.com', 'demo', role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#0a0515] via-[#12082a] to-[#0a0515]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <span className="text-4xl">📱</span>
          <h1 className="text-3xl font-bold text-white mt-2">CareCall</h1>
        </div>

        <div className="glass rounded-3xl p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
          <p className="text-white/40 mb-8">Log in to your account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-purple-500 text-lg transition-all"
                placeholder="you@email.com" id="login-email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-purple-500 text-lg transition-all"
                placeholder="Enter your password" id="login-password" />
            </div>
            <button type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-xl transition-all hover:-translate-y-0.5"
              id="login-submit">
              Log In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">Don't have an account?{' '}
              <Link to="/signup" className="text-purple-400 font-semibold no-underline hover:text-purple-300">Create Account</Link>
            </p>
          </div>

          <hr className="border-white/5 my-6" />

          <div className="text-center">
            <p className="text-white/30 text-sm mb-3">Quick Demo Login</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => demoLogin('patient')}
                className="px-6 py-3 bg-purple-500/10 text-purple-400 rounded-xl font-semibold text-sm hover:bg-purple-500/20 border border-purple-500/20 transition-all"
                id="demo-patient">
                👤 As Patient
              </button>
              <button onClick={() => demoLogin('caretaker')}
                className="px-6 py-3 bg-blue-500/10 text-blue-400 rounded-xl font-semibold text-sm hover:bg-blue-500/20 border border-blue-500/20 transition-all"
                id="demo-caretaker">
                🩺 As Caretaker
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
