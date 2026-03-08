import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

export default function MedicationsPage() {
  const { patients, medications, addMedication, removeMedication } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patientId: '',
    name: '',
    dosage: '',
    times: ['08:00'],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (patients.length > 0 && !form.patientId) {
      setForm(prev => ({ ...prev, patientId: patients[0].id }));
    }
  }, [patients]);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const addTimeSlot = () => {
    if (form.times.length < 6) {
      setForm(prev => ({ ...prev, times: [...prev.times, '12:00'] }));
    }
  };

  const removeTimeSlot = (index) => {
    setForm(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index),
    }));
  };

  const updateTime = (index, val) => {
    setForm(prev => {
      const newTimes = [...prev.times];
      newTimes[index] = val;
      return { ...prev, times: newTimes };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.name.trim() || !form.dosage.trim() || form.times.length === 0) return;
    
    setSaving(true);
    try {
      const patient = patients.find(p => p.id === form.patientId);
      await addMedication(
        form.patientId,
        patient?.name || 'Patient',
        form.name.trim(),
        form.dosage.trim(),
        form.times,
      );
      setForm({ patientId: patients[0]?.id || '', name: '', dosage: '', times: ['08:00'] });
      setShowForm(false);
    } catch (err) {
      console.error("Failed to save medication:", err);
      alert("Failed to save medication. Please check your connection and patient details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (patientId, medId) => {
    await removeMedication(patientId, medId);
  };

  // Flatten medications for display
  const allMeds = [];
  Object.entries(medications).forEach(([patientId, meds]) => {
    const patient = patients.find(p => p.id === patientId);
    meds.forEach(med => {
      allMeds.push({ ...med, patientId, patientName: patient?.name || 'Unknown' });
    });
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">💊 Medications</h1>
          <p className="text-white/50">Assign medications and schedule automatic reminder calls</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20"
        >
          {showForm ? '✕ Cancel' : '+ Add Medication'}
        </button>
      </header>

      {/* Add Medication Form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 mb-8 animate-in">
          <h3 className="text-lg font-semibold text-white mb-4">New Medication</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Patient</label>
                <select
                  value={form.patientId}
                  onChange={e => update('patientId', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 transition-all"
                  required
                >
                  <option value="" disabled className="bg-gray-900">Select Patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id} className="bg-gray-900">{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Medication Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="e.g. Metformin"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-purple-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Dosage</label>
                <input
                  type="text"
                  value={form.dosage}
                  onChange={e => update('dosage', e.target.value)}
                  placeholder="e.g. 500mg, 2 pills"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Time slots */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/60">Reminder Times (calls will be scheduled daily)</label>
                <button
                  type="button"
                  onClick={addTimeSlot}
                  disabled={form.times.length >= 6}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  + Add Time
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {form.times.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={t}
                      onChange={e => updateTime(i, e.target.value)}
                      required
                      className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 transition-all"
                    />
                    {form.times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(i)}
                        className="w-8 h-8 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/30 mt-2">A Twilio call will be placed at each time to remind the patient</p>
            </div>

            <button
              type="submit"
              disabled={saving || !form.patientId || !form.name.trim() || !form.dosage.trim()}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-xl transition-all disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Add Medication & Schedule Calls →'}
            </button>
          </form>
        </div>
      )}

      {/* Medications List */}
      {allMeds.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-3xl mb-4">💊</p>
          <p className="text-white/40 text-lg mb-2">No medications assigned yet</p>
          <p className="text-white/30 text-sm">Click "Add Medication" to assign one to a patient</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allMeds.map(med => (
            <div key={med.id} className="glass rounded-2xl p-5 flex items-center justify-between group">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center text-xl border border-white/10 shrink-0">
                  💊
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white">{med.name}</p>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/20">
                      {med.dosage}
                    </span>
                  </div>
                  <p className="text-sm text-white/40 mt-0.5">
                    <span className="text-white/60">{med.patientName}</span>
                    {med.time && <> · ⏰ {med.time}</>}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(med.patientId, med.id)}
                className="px-3 py-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-all opacity-0 group-hover:opacity-100"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
