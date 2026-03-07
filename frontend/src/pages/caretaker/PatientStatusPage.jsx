import { useSearchParams } from 'react-router-dom';
import { mockPatients, medications as allMeds, callHistory } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

export default function PatientStatusPage() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('id') || 'p1';
  const patient = mockPatients.find(p => p.id === patientId) || mockPatients[0];
  const patientMeds = allMeds[patientId] || [];
  const patientCalls = callHistory.filter(c => c.patientId === patientId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in">
      <h1 className="text-3xl font-bold text-white mb-8">Patient Status</h1>

      {/* Patient info */}
      <div className="glass rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center text-3xl border border-white/10">
            {patient.avatar}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{patient.name}</h2>
            <p className="text-white/40">Age {patient.age}</p>
          </div>
          <StatusBadge status={patient.riskLevel} size="lg" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <InfoItem label="Phone" value={patient.phone} />
          <InfoItem label="Adherence" value={`${patient.adherencePercent}%`} />
          <InfoItem label="Last Call" value={patient.lastCallAnswered} />
        </div>

        <div className="bg-white/5 rounded-xl px-4 py-3">
          <p className="text-xs text-white/40 font-medium">Wellness Summary</p>
          <p className="text-white">{patient.wellnessSummary}</p>
        </div>
      </div>

      {/* Medications */}
      <div className="glass rounded-2xl p-6 sm:p-8 mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">💊 Medications</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {patientMeds.map(med => (
            <div key={med.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
              <div>
                <p className="font-medium text-white">{med.name}</p>
                <p className="text-sm text-white/40">{med.time} · {med.instructions}</p>
              </div>
              <StatusBadge status={med.status} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent calls */}
      <div className="glass rounded-2xl p-6 sm:p-8 mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">📞 Recent Calls</h3>
        <div className="space-y-3">
          {patientCalls.slice(0, 5).map(c => (
            <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
              <div>
                <p className="font-medium text-white">{c.type}</p>
                <p className="text-sm text-white/40">{c.date}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={c.answered ? 'taken' : 'missed'} size="sm" />
                <p className="text-xs text-white/30 mt-1">{c.response}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency contact */}
      {patient.emergencyContact && (
        <div className="bg-red-500/10 rounded-2xl p-6 sm:p-8 border border-red-500/15">
          <h3 className="text-xl font-semibold text-red-400 mb-3">🚨 Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InfoItem label="Name" value={patient.emergencyContact.name} />
            <InfoItem label="Relationship" value={patient.emergencyContact.relationship} />
            <InfoItem label="Phone" value={patient.emergencyContact.phone} />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="bg-white/5 rounded-xl px-4 py-3">
      <p className="text-xs text-white/40 font-medium">{label}</p>
      <p className="text-white font-semibold">{value}</p>
    </div>
  );
}
