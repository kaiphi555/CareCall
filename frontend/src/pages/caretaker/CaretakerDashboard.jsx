import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import AdherenceChart from '../../components/AdherenceChart';
import { Link } from 'react-router-dom';

export default function CaretakerDashboard() {
  const { patients, alertsList, wellnessSubmissions, calls } = useData();
  const { user } = useAuth();

  const totalPatients = patients.length;
  const highRiskCount = patients.filter(p => p.riskLevel === 'High').length;
  const avgAdherence = totalPatients > 0
    ? Math.round(patients.reduce((s, p) => s + (p.adherencePercent || 0), 0) / totalPatients)
    : 0;
  const activeAlerts = alertsList.filter(a => a.priority === 'high').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in">
      <header className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          {user?.name ? `Welcome, ${user.name.split(' ')[0]}` : 'Caretaker Dashboard'}
        </h1>
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
            {patients.map(p => (
              <Link
                key={p.id}
                to={`/patient-status?id=${p.id}`}
                className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 no-underline hover:bg-white/[0.08] transition-all block"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.avatar}</span>
                  <div>
                    <p className="font-medium text-white">{p.name}</p>
                    <p className="text-sm text-white/40">7-Day Adherence: {p.adherencePercent || 0}%</p>
                  </div>
                </div>
                <StatusBadge status={p.riskLevel} size="sm" />
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <DailyMedsPanel patients={patients} calls={calls} />
          <AdherenceChart />
        </div>
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
            <div className="space-y-4">
              {wellnessSubmissions.slice(0, 3).map(sub => {
                const ai = sub.aiFeedback;
                return (
                  <div key={sub.id} className="bg-white/5 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-white text-sm">{sub.patientName}</p>
                      <p className="text-xs text-white/30">{sub.timestamp}</p>
                    </div>
                    {ai?.caretaker_summary ? (
                      <p className="text-xs text-white/60 leading-relaxed">{ai.caretaker_summary}</p>
                    ) : (
                      <p className="text-xs text-white/40">{Object.values(sub.answers).join(' · ')}</p>
                    )}
                    {ai?.alert_caretaker && (
                      <p className="text-xs text-amber-400 font-medium mt-1.5">
                        🔔 {ai.alert_reason}
                      </p>
                    )}
                    {ai?.observations?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {ai.observations.slice(0, 3).map((obs, i) => (
                          <span key={i} className="text-[11px] text-white/40 bg-white/5 rounded-lg px-2 py-0.5">{obs}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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

function DailyMedsPanel({ patients, calls }) {
  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Today's Medication Status</h3>
      <div className="space-y-4">
        {patients.length === 0 ? (
          <p className="text-white/30 text-sm">No patients linked yet.</p>
        ) : (
          patients.map(p => {
            const todayCalls = calls.filter(c => c.patientId === p.id && c.date === todayStr);
            const taken = todayCalls.filter(c => c.adherenceStatus === 'taken').length;
            const total = todayCalls.length;
            const percent = total > 0 ? (taken / total) * 100 : 0;

            return (
              <div key={p.id} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-white">{p.name}</span>
                  <span className="text-white/50">{taken}/{total} doses taken</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      percent === 100 ? 'bg-emerald-500' : percent > 0 ? 'bg-purple-500' : 'bg-white/10'
                    }`}
                    style={{ width: `${percent || 0}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
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
