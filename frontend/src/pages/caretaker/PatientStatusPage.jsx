import { useSearchParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import AdherenceChart from '../../components/AdherenceChart';
import { formatPhoneNumber } from '../../utils/formatters';

export default function PatientStatusPage() {
  const { patients, medications: allMeds, wellnessSubmissions } = useData();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('id');
  const patient = patientId ? patients.find(p => p.id === patientId) : patients[0];

  if (!patient) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in">
        <h1 className="text-3xl font-bold text-white mb-8">Patient Status</h1>
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-white/40 text-lg">No patient found. Add patients first.</p>
        </div>
      </div>
    );
  }

  const patientMeds = allMeds[patient.id] || [];
  
  // Find latest wellness summary from AI feedback
  const latestWellness = wellnessSubmissions
    .filter(s => s.patientId === patient.id && s.aiFeedback?.caretaker_summary)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  
  const displaySummary = latestWellness?.aiFeedback?.caretaker_summary || patient.wellnessSummary || 'No wellness data completed yet';

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <InfoItem label="Phone" value={formatPhoneNumber(patient.phone)} />
          <InfoItem label="7-Day Adherence" value={`${patient.adherencePercent}%`} />
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-5 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">✨</span>
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">AI Wellness Insight</h3>
          </div>
          <p className={latestWellness ? "text-white text-lg leading-relaxed font-medium" : "text-white/30 italic text-sm"}>
            {displaySummary}
          </p>
          {latestWellness && (
            <p className="text-[10px] text-white/30 mt-4 text-right">
              Generated {latestWellness.timestamp}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AdherenceChart patientId={patient.id} />
        
        {/* Medications */}
        <div className="glass rounded-2xl p-6 sm:p-8">
          <h3 className="text-xl font-semibold text-white mb-4">💊 Medications</h3>
          <div className="space-y-3">
            {patientMeds.length === 0 ? (
              <p className="text-white/30 text-sm">No medications assigned.</p>
            ) : (
              patientMeds.map(med => (
                <div key={med.id} className="bg-white/5 rounded-xl px-4 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">{med.name}</p>
                      <p className="text-xs text-white/40">{med.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>


      {/* Emergency contact */}
      {patient.emergencyContact && (
        <div className="bg-red-500/10 rounded-2xl p-6 sm:p-8 border border-red-500/15">
          <h3 className="text-xl font-semibold text-red-400 mb-3">🚨 Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InfoItem label="Name" value={patient.emergencyContact.name} />
            <InfoItem label="Relationship" value={patient.emergencyContact.relationship} />
            <InfoItem label="Phone" value={formatPhoneNumber(patient.emergencyContact.phone)} />
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
