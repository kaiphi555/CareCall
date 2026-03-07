import { mockPatients, callHistory, medications as allMeds, adherenceData } from '../../data/mockData';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import AdherenceChart from '../../components/AdherenceChart';
import { Link } from 'react-router-dom';

export default function CaretakerDashboard() {
  const { alertsList, wellnessSubmissions } = useData();

  const totalPatients = mockPatients.length;
  const highRiskCount = mockPatients.filter(p => p.riskLevel === 'High').length;
  const avgAdherence = Math.round(mockPatients.reduce((s, p) => s + p.adherencePercent, 0) / totalPatients);
  const activeAlerts = alertsList.filter(a => a.priority === 'high').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in">
      <header className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Caretaker Dashboard</h1>
        <p className="text-white/50 mt-1">Monitoring {totalPatients} patients</p>
      </header>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Avg Adherence" value={`${avgAdherence}%`} icon="📊" gradient="from-purple-500/20 to-blue-500/20" />
        <StatCard label="Patients" value={totalPatients} icon="👥" gradient="from-blue-500/20 to-cyan-500/20" />
        <StatCard label="High Risk" value={highRiskCount} icon="⚠️" gradient="from-red-500/20 to-pink-500/20" />
        <StatCard label="Active Alerts" value={activeAlerts} icon="🔔" gradient="from-amber-500/20 to-orange-500/20" />
      </div>

      {/* Patient list + adherence chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Patients</h3>
            <Link to="/patients" className="text-sm text-purple-400 no-underline hover:text-purple-300">View all →</Link>
          </div>
          <div className="space-y-3">
            {mockPatients.map(p => (
              <Link
                key={p.id}
                to={`/patient-status?id=${p.id}`}
                className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 no-underline hover:bg-white/[0.08] transition-all block"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.avatar}</span>
                  <div>
                    <p className="font-medium text-white">{p.name}</p>
                    <p className="text-sm text-white/40">Adherence: {p.adherencePercent}%</p>
                  </div>
                </div>
                <StatusBadge status={p.riskLevel} size="sm" />
              </Link>
            ))}
          </div>
        </div>
        <AdherenceChart />
      </div>

      {/* Recent wellness submissions + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Wellness</h3>
            <Link to="/wellness-config" className="text-sm text-purple-400 no-underline hover:text-purple-300">Manage →</Link>
          </div>
          {wellnessSubmissions.length === 0 ? (
            <p className="text-white/30 text-sm py-4">No submissions yet. Patient wellness responses will appear here.</p>
          ) : (
            <div className="space-y-3">
              {wellnessSubmissions.slice(0, 3).map(sub => (
                <div key={sub.id} className="bg-white/5 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-white text-sm">{sub.patientName}</p>
                    <p className="text-xs text-white/30">{sub.timestamp}</p>
                  </div>
                  <p className="text-xs text-white/40">
                    {Object.values(sub.answers).join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
            <Link to="/alerts" className="text-sm text-purple-400 no-underline hover:text-purple-300">View all →</Link>
          </div>
          <div className="space-y-2">
            {alertsList.filter(a => a.priority === 'high').slice(0, 4).map(a => {
              const colors = {
                warning: 'border-l-amber-500 bg-amber-500/5',
                danger: 'border-l-red-500 bg-red-500/5',
                info: 'border-l-blue-500 bg-blue-500/5',
              };
              return (
                <div key={a.id} className={`border-l-4 rounded-xl px-4 py-3 ${colors[a.type] || colors.info}`}>
                  <p className="text-sm font-medium text-white">{a.message}</p>
                  <p className="text-xs text-white/30 mt-1">{a.time}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/schedule-call" className="glass rounded-2xl p-6 text-center no-underline hover:bg-white/[0.08] transition-all group block">
          <span className="text-3xl block mb-2">📞</span>
          <p className="font-semibold text-white group-hover:text-purple-300 transition-colors">Schedule Call</p>
          <p className="text-xs text-white/30 mt-1">Via Twilio</p>
        </Link>
        <Link to="/wellness-config" className="glass rounded-2xl p-6 text-center no-underline hover:bg-white/[0.08] transition-all group block">
          <span className="text-3xl block mb-2">❤️</span>
          <p className="font-semibold text-white group-hover:text-purple-300 transition-colors">Wellness Config</p>
          <p className="text-xs text-white/30 mt-1">Custom questions</p>
        </Link>
        <Link to="/patients" className="glass rounded-2xl p-6 text-center no-underline hover:bg-white/[0.08] transition-all group block">
          <span className="text-3xl block mb-2">👥</span>
          <p className="font-semibold text-white group-hover:text-purple-300 transition-colors">Patient Hub</p>
          <p className="text-xs text-white/30 mt-1">All patients</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, gradient }) {
  return (
    <div className={`rounded-2xl p-5 bg-gradient-to-br ${gradient} border border-white/5`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white/50">{label}</span>
        <span className="text-xl" aria-hidden="true">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
