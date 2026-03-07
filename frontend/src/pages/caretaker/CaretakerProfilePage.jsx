import { mockCaretaker } from '../../data/mockData';

export default function CaretakerProfilePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-in">
      <h1 className="text-3xl font-bold text-white mb-8">👤 Profile</h1>
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center text-3xl border border-white/10">
            🩺
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{mockCaretaker.name}</h2>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/20 mt-1">
              Caretaker
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem label="Email" value={mockCaretaker.email} />
          <InfoItem label="Phone" value={mockCaretaker.phone} />
          <InfoItem label="Relationship" value={mockCaretaker.relationship} />
          <InfoItem label="Linked Patients" value={`${mockCaretaker.linkedPatients.length} patients`} />
        </div>
      </div>
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
