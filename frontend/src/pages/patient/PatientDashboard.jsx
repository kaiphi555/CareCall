import { useState } from 'react';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { medications, reminders, callHistory } = useData();

  const patientMeds = medications[user?.id] || medications['p1'] || [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in">
      <header className="mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Good morning, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-lg text-white/50 mt-1">Here's your health summary for today.</p>
      </header>

      <TodaysReminder meds={patientMeds} />
      <QuickWellness />
      <UpcomingSchedule reminders={reminders} />
      <CallHistorySection callHistory={callHistory} userId={user?.id} />
      <EmergencyContactCard user={user} />
    </div>
  );
}

function TodaysReminder({ meds }) {
  const nextMed = meds.find(m => m.status === 'upcoming') || meds[0];
  const takenCount = meds.filter(m => m.status === 'taken').length;

  if (!nextMed) {
    return (
      <section className="glass rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-4">💊 Today's Reminders</h2>
        <p className="text-white/40">No medications configured yet.</p>
      </section>
    );
  }

  return (
    <section className="glass rounded-2xl p-6 sm:p-8" aria-labelledby="todays-reminder">
      <h2 id="todays-reminder" className="text-xl font-bold text-white mb-4">💊 Today's Reminders</h2>
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-5 mb-4 border border-white/5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-white/40 font-medium">Next Medication</p>
            <p className="text-2xl font-bold text-white mt-1">{nextMed.name}</p>
            <p className="text-lg text-purple-400 font-semibold">{nextMed.time}</p>
            <p className="text-sm text-white/40 mt-1">{nextMed.instructions}</p>
          </div>
          <StatusBadge status={nextMed.status} size="lg" />
        </div>
      </div>
      <p className="text-sm text-white/40 mb-3">{takenCount} of {meds.length} medications taken today</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {meds.map(med => (
          <div key={med.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
            <div>
              <p className="font-medium text-white">{med.name}</p>
              <p className="text-sm text-white/40">{med.time}</p>
            </div>
            <StatusBadge status={med.status} size="sm" />
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickWellness() {
  return (
    <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-6 sm:p-8 border border-white/5" aria-labelledby="wellness-quick">
      <h2 id="wellness-quick" className="text-xl font-bold text-white mb-2">❤️ Wellness Check-In</h2>
      <p className="text-white/50 mb-4">Take a minute to tell us how you're feeling today.</p>
      <a
        href="/wellness"
        className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl no-underline shadow-lg shadow-purple-500/20 hover:shadow-xl transition-all hover:-translate-y-0.5"
      >
        Start Check-In →
      </a>
    </section>
  );
}

function UpcomingSchedule({ reminders }) {
  return (
    <section className="glass rounded-2xl p-6 sm:p-8" aria-labelledby="upcoming-schedule">
      <h2 id="upcoming-schedule" className="text-xl font-bold text-white mb-4">📅 Upcoming Schedule</h2>
      <div className="space-y-3">
        {reminders.map(r => (
          <div key={r.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">
                {r.type === 'medication' ? '💊' : r.type === 'appointment' ? '🏥' : '🚶'}
              </span>
              <div>
                <p className="font-medium text-white">{r.title}</p>
                <p className="text-sm text-white/40">{r.date} · {r.time}</p>
              </div>
            </div>
            <StatusBadge status={r.status} size="sm" />
          </div>
        ))}
      </div>
    </section>
  );
}

function CallHistorySection({ callHistory, userId }) {
  const recent = callHistory.filter(c => c.patientId === userId || c.patientId === 'p1').slice(0, 4);

  return (
    <section className="glass rounded-2xl p-6 sm:p-8" aria-labelledby="call-history">
      <h2 id="call-history" className="text-xl font-bold text-white mb-4">📞 Recent Calls</h2>
      <div className="space-y-3">
        {recent.map(c => (
          <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
            <div>
              <p className="font-medium text-white">{c.type}</p>
              <p className="text-sm text-white/40">{c.date}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                c.answered ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
              }`}>
                {c.answered ? '✅ Answered' : '❌ Missed'}
              </span>
              <p className="text-xs text-white/30 mt-1">{c.response}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmergencyContactCard({ user }) {
  const emergencyContact = user?.emergencyContact || user?.emergency_contact;
  if (!emergencyContact) return null;

  return (
    <section className="bg-red-500/10 rounded-2xl p-6 sm:p-8 border border-red-500/15" aria-labelledby="emergency-contact">
      <h2 id="emergency-contact" className="text-xl font-bold text-red-400 mb-3">🚨 Emergency Contact</h2>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center text-2xl border border-red-500/20">
          👤
        </div>
        <div>
          <p className="text-lg font-bold text-white">{emergencyContact.name}</p>
          <p className="text-white/40">{emergencyContact.relationship}</p>
          <a href={`tel:${emergencyContact.phone}`} className="text-lg font-semibold text-red-400 no-underline hover:text-red-300">
            📞 {emergencyContact.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
