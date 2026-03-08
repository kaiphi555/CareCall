import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('role'); // 'role' | 'form'
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', age: '', phone: '', email: '', password: '',
    emergencyName: '', emergencyPhone: '',
    reminderType: 'Phone Call', preferredTime: '09:00',
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup(form, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#0a0515] via-[#12082a] to-[#0a0515]">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <span className="text-4xl">📱</span>
            <h1 className="text-3xl font-bold text-white mt-2">CareCall</h1>
          </div>
          <div className="glass rounded-3xl p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Create Your Account</h2>
            <p className="text-white/40 mb-8 text-center">Choose your role to get started</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setRole('patient'); setStep('form'); }}
                className="group p-8 rounded-2xl bg-white/5 border-2 border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-center"
                id="role-patient"
              >
                <span className="text-5xl block mb-4">👤</span>
                <span className="text-lg font-bold text-white block mb-1">I am a Patient</span>
                <span className="text-sm text-white/40 block">I want to receive medication reminders</span>
              </button>
              <button
                onClick={() => { setRole('caretaker'); setStep('form'); }}
                className="group p-8 rounded-2xl bg-white/5 border-2 border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-center"
                id="role-caretaker"
              >
                <span className="text-5xl block mb-4">🩺</span>
                <span className="text-lg font-bold text-white block mb-1">I am a Caretaker</span>
                <span className="text-sm text-white/40 block">I want to monitor a loved one</span>
              </button>
            </div>
          </div>
          <p className="text-center mt-6 text-white/40 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 font-semibold no-underline hover:text-purple-300">Log In</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#0a0515] via-[#12082a] to-[#0a0515]">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <span className="text-4xl">📱</span>
          <h1 className="text-3xl font-bold text-white mt-2">CareCall</h1>
        </div>
        <div className="glass rounded-3xl p-8 sm:p-10">
          <button onClick={() => setStep('role')} className="text-sm text-purple-400 hover:text-purple-300 mb-4">
            ← Choose different role
          </button>
          <h2 className="text-2xl font-bold text-white mb-1">
            {role === 'patient' ? 'Patient Sign Up' : 'Caretaker Sign Up'}
          </h2>
          <p className="text-white/40 mb-6">
            {role === 'patient' ? 'Set up your medication reminder account' : 'Set up your account to monitor a loved one'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Full Name" required value={form.name} onChange={v => update('name', v)} placeholder={role === 'patient' ? 'Margaret Johnson' : 'David Johnson'} />
            {role === 'patient' && (
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Age" required type="number" value={form.age} onChange={v => update('age', v)} placeholder="78" />
                <InputField label="Phone Number" required type="tel" value={form.phone} onChange={v => update('phone', v)} placeholder="+18135551234" />
              </div>
            )}
            {role === 'caretaker' && (
              <InputField label="Phone Number" required type="tel" value={form.phone} onChange={v => update('phone', v)} placeholder="+18135551234" />
            )}
            <InputField label="Email" required type="email" value={form.email} onChange={v => update('email', v)} placeholder="you@email.com" />
            <InputField label="Password" required type="password" value={form.password} onChange={v => update('password', v)} placeholder="Min 6 characters" />

            <hr className="border-white/5 my-4" />

            {role === 'patient' && (
              <>
                <p className="text-sm font-semibold text-white/60">Emergency Contact</p>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Contact Name" value={form.emergencyName} onChange={v => update('emergencyName', v)} placeholder="David Johnson" />
                  <InputField label="Contact Phone" value={form.emergencyPhone} onChange={v => update('emergencyPhone', v)} placeholder="+18135559876" />
                </div>
                <p className="text-sm font-semibold text-white/60">Reminder Preferences</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/40 mb-2">Reminder Type</label>
                    <select value={form.reminderType} onChange={e => update('reminderType', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 transition-all">
                      <option className="bg-gray-900">Phone Call</option>
                      <option className="bg-gray-900">SMS</option>
                      <option className="bg-gray-900">Both</option>
                    </select>
                  </div>
                  <InputField label="Preferred Time" type="time" value={form.preferredTime} onChange={v => update('preferredTime', v)} />
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mt-2">
                  <p className="text-sm text-purple-300 font-medium">📋 After signing up, you'll receive a unique <strong>8-digit code</strong> to share with your caretaker so they can link to your account.</p>
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-xl mt-4 transition-all hover:-translate-y-0.5 disabled:opacity-50">
              {loading ? 'Creating Account…' : `Create ${role === 'patient' ? 'Patient' : 'Caretaker'} Account`}
            </button>
          </form>
          <p className="text-center mt-6 text-white/40 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 font-semibold no-underline hover:text-purple-300">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, required, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/60 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-purple-500 transition-all"
        placeholder={placeholder} required={required}
      />
    </div>
  );
}
