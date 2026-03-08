import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';

export default function RemindersPage() {
  const { reminders } = useData();
  const today = reminders.filter(r => r.date === 'Today');
  const upcoming = reminders.filter(r => r.date !== 'Today');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-in">
      <h1 className="text-3xl font-bold text-white mb-8">💊 Reminders</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">Today</h2>
        <div className="space-y-3">
          {today.map(r => (
            <div key={r.id} className="glass rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {r.type === 'medication' ? '💊' : r.type === 'appointment' ? '🏥' : '🚶'}
                </span>
                <div>
                  <p className="font-semibold text-white text-lg">{r.title}</p>
                  <p className="text-white/40">{r.time}</p>
                </div>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      </section>

      {upcoming.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map(r => (
              <div key={r.id} className="glass rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {r.type === 'medication' ? '💊' : '🏥'}
                  </span>
                  <div>
                    <p className="font-semibold text-white text-lg">{r.title}</p>
                    <p className="text-white/40">{r.date} · {r.time}</p>
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
