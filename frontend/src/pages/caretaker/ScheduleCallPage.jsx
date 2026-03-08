import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { triggerCall } from '../../services/api';

export default function ScheduleCallPage() {
  const { patients, medications: allMeds, calls, scheduleCall, cancelCall } = useData();
  const [showForm, setShowForm] = useState(false);
  const [callStatus, setCallStatus] = useState({});
  const [form, setForm] = useState({
    patientId: '',
    date: '',
    time: '',
    purpose: 'Medication reminder',
  });

  // Set default patientId when patients load
  useEffect(() => {
    if (patients.length > 0 && !form.patientId) {
      setForm(prev => ({ ...prev, patientId: patients[0].id }));
    }
  }, [patients]);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === form.patientId);
    scheduleCall({
      ...form,
      patientName: patient?.name || 'Unknown',
    });
    setForm({ patientId: patients[0]?.id || '', date: '', time: '', purpose: 'Medication reminder' });
    setShowForm(false);
  };

  const handleCallNow = async (call) => {
    const patient = patients.find(p => p.id === call.patientId);
    if (!patient) return;

    // Get the first medication for this patient as the reminder subject
    const patientMeds = allMeds[call.patientId] || [];
    const medName = patientMeds.length > 0 ? patientMeds[0].name : 'your medication';

    setCallStatus(prev => ({ ...prev, [call.id]: 'calling' }));

    try {
      const result = await triggerCall({
        patientName: patient.name,
        medication: medName,
        phoneNumber: patient.phone,
      });
      setCallStatus(prev => ({ ...prev, [call.id]: 'success' }));
      console.log('Call triggered:', result);
    } catch (err) {
      setCallStatus(prev => ({ ...prev, [call.id]: 'error' }));
      console.error('Call failed:', err);
    }
  };

  const getStatusLabel = (callId, defaultStatus) => {
    const s = callStatus[callId];
    if (s === 'calling') return { text: 'Calling…', classes: 'bg-amber-500/15 text-amber-400 border-amber-500/20' };
    if (s === 'success') return { text: 'Call Sent ✓', classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' };
    if (s === 'error') return { text: 'Failed', classes: 'bg-red-500/15 text-red-400 border-red-500/20' };
    return { text: defaultStatus, classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">📞 Schedule Calls</h1>
          <p className="text-white/50">Schedule AI reminder calls for your patients via Twilio</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20"
        >
          {showForm ? '✕ Cancel' : '+ Schedule Call'}
        </button>
      </header>

      {/* Schedule form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 mb-8 animate-in">
          <h3 className="text-lg font-semibold text-white mb-4">New Scheduled Call</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Patient</label>
              <select
                value={form.patientId}
                onChange={e => update('patientId', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 transition-all"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id} className="bg-gray-900">{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Purpose</label>
              <select
                value={form.purpose}
                onChange={e => update('purpose', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 transition-all"
              >
                <option className="bg-gray-900">Medication reminder</option>
                <option className="bg-gray-900">Wellness check-in</option>
                <option className="bg-gray-900">Medication + wellness check-in</option>
                <option className="bg-gray-900">Appointment reminder</option>
                <option className="bg-gray-900">Custom call</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => update('date', e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Time</label>
              <input
                type="time"
                value={form.time}
                onChange={e => update('time', e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-xl transition-all"
              >
                Schedule Call →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Scheduled calls list */}
      <div className="space-y-3">
        {calls.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-3xl mb-4">📞</p>
            <p className="text-white/40 text-lg">No calls scheduled yet</p>
          </div>
        ) : (
          calls.map(call => {
            const status = getStatusLabel(call.id, call.status);
            return (
              <div key={call.id} className="glass rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center text-xl border border-white/10">
                    📞
                  </div>
                  <div>
                    <p className="font-semibold text-white">{call.patientName}</p>
                    <p className="text-sm text-white/40">{call.purpose}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{call.date}</p>
                    <p className="text-sm text-white/40">{call.time}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.classes}`}>
                    {status.text}
                  </span>
                  <button
                    onClick={() => handleCallNow(call)}
                    disabled={callStatus[call.id] === 'calling'}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {callStatus[call.id] === 'calling' ? '⏳' : '📞 Call Now'}
                  </button>
                  <button
                    onClick={() => cancelCall(call.id)}
                    className="px-3 py-1.5 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
