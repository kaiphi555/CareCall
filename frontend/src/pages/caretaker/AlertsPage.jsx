import { useData } from '../../context/DataContext';
import { mockPatients } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

export default function AlertsPage() {
  const { alertsList } = useData();

  const high = alertsList.filter(a => a.priority === 'high');
  const medium = alertsList.filter(a => a.priority === 'medium');
  const low = alertsList.filter(a => a.priority === 'low');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in">
      <h1 className="text-3xl font-bold text-white mb-2">🔔 Alerts</h1>
      <p className="text-white/50 mb-8">{alertsList.length} total alerts</p>

      {high.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-red-400 mb-3">High Priority</h2>
          <div className="space-y-3">
            {high.map(a => <AlertCard key={a.id} alert={a} />)}
          </div>
        </section>
      )}

      {medium.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-amber-400 mb-3">Medium Priority</h2>
          <div className="space-y-3">
            {medium.map(a => <AlertCard key={a.id} alert={a} />)}
          </div>
        </section>
      )}

      {low.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-blue-400 mb-3">Low Priority</h2>
          <div className="space-y-3">
            {low.map(a => <AlertCard key={a.id} alert={a} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function AlertCard({ alert }) {
  const patient = mockPatients.find(p => p.id === alert.patientId);
  const borderColor = {
    high: 'border-l-red-500 bg-red-500/5',
    medium: 'border-l-amber-500 bg-amber-500/5',
    low: 'border-l-blue-500 bg-blue-500/5',
  }[alert.priority] || 'border-l-blue-500 bg-blue-500/5';

  return (
    <div className={`border-l-4 rounded-xl px-5 py-4 ${borderColor}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-white">{alert.message}</p>
          <p className="text-sm text-white/30 mt-1">
            {patient?.name && <span className="text-white/40">{patient.name} · </span>}
            {alert.time}
          </p>
        </div>
        <StatusBadge status={alert.priority} size="sm" />
      </div>
    </div>
  );
}
