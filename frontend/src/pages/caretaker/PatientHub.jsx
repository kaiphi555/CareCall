import { useState } from 'react';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { Link } from 'react-router-dom';

export default function PatientHub() {
  const { patients, alertsList, callHistory, addPatientByCode, removePatient } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addCode, setAddCode] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  const handleAddPatient = async (e) => {
    e.preventDefault();
    const code = addCode.trim();
    if (!code) return;
    if (code.length !== 8 || !/^\d{8}$/.test(code)) {
      setAddError('Please enter a valid 8-digit code.');
      return;
    }
    setAddLoading(true);
    setAddError('');
    setAddSuccess('');
    try {
      const p = await addPatientByCode(code);
      setAddSuccess(`✓ ${p.name} has been added!`);
      setAddCode('');
      setTimeout(() => { setShowAddModal(false); setAddSuccess(''); }, 1500);
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-in">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Patients</h1>
          <p className="text-white/50">{patients.length} patient{patients.length !== 1 ? 's' : ''} under your care</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20"
        >
          + Add Patient
        </button>
      </header>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="glass rounded-2xl p-8 w-full max-w-md mx-4 animate-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-2">Add a Patient</h2>
            <p className="text-white/40 text-sm mb-6">Enter the patient's 8-digit invite code</p>

            {addError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{addError}</div>
            )}
            {addSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">{addSuccess}</div>
            )}

            <form onSubmit={handleAddPatient} className="space-y-4">
              <input
                type="text"
                value={addCode}
                onChange={e => {
                  // Only allow digits, max 8 chars
                  const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setAddCode(val);
                }}
                placeholder="12345678"
                className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-purple-500 text-2xl text-center tracking-[0.5em] font-mono transition-all"
                required
                autoFocus
                maxLength={8}
                inputMode="numeric"
              />
              <p className="text-xs text-white/30 text-center">Ask your patient for their invite code from their profile page</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading || addCode.length !== 8}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  {addLoading ? 'Linking…' : 'Link Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient cards */}
      {patients.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-3xl mb-4">👥</p>
          <p className="text-white/40 text-lg mb-2">No patients linked yet</p>
          <p className="text-white/30 text-sm">Click "Add Patient" and enter their 8-digit invite code</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map(patient => {
            const patientAlerts = alertsList.filter(a => a.patientId === patient.id && a.priority === 'high');
            const patientCalls = (callHistory || []).filter(c => c.patientId === patient.id);
            const answeredCalls = patientCalls.filter(c => c.answered).length;

            return (
              <div key={patient.id} className="glass rounded-2xl p-6 group relative">
                <button
                  onClick={() => removePatient(patient.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  title="Remove patient"
                >
                  ✕
                </button>

                <Link to={`/patient-status?id=${patient.id}`} className="no-underline block">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center text-3xl border border-white/10">
                      {patient.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                        {patient.name}
                      </h3>
                      <p className="text-white/40 text-sm">{patient.age ? `Age ${patient.age}` : patient.email}</p>
                    </div>
                    <StatusBadge status={patient.riskLevel} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/5 rounded-xl px-3 py-2.5">
                      <p className="text-xs text-white/40">Adherence</p>
                      <p className="text-lg font-bold text-white">{patient.adherencePercent}%</p>
                    </div>
                    <div className="bg-white/5 rounded-xl px-3 py-2.5">
                      <p className="text-xs text-white/40">Calls Answered</p>
                      <p className="text-lg font-bold text-white">{answeredCalls}/{patientCalls.length}</p>
                    </div>
                  </div>

                  {patient.wellnessSummary && (
                    <p className="text-sm text-white/40 line-clamp-2">{patient.wellnessSummary}</p>
                  )}

                  {patientAlerts.length > 0 && (
                    <div className="mt-3 px-3 py-2 bg-red-500/10 rounded-xl border border-red-500/20">
                      <p className="text-sm text-red-400 font-medium">
                        ⚠️ {patientAlerts.length} high-priority alert{patientAlerts.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
