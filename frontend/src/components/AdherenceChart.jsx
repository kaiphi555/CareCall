import { useData } from '../context/DataContext';

export default function AdherenceChart() {
  const { adherenceData } = useData();

  if (!adherenceData || adherenceData.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Weekly Medication Adherence</h3>
        <p className="text-white/30 text-sm py-8 text-center">No adherence data yet.</p>
      </div>
    );
  }

  const maxTotal = Math.max(...adherenceData.map(d => d.total), 1); // min 1 to prevent div-by-zero

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Weekly Medication Adherence</h3>
      <div className="flex items-end justify-between gap-3 h-48">
        {adherenceData.map((d) => {
          const height = maxTotal > 0 ? (d.taken / maxTotal) * 100 : 0;
          const missed = d.total - d.taken;
          return (
            <div key={d.day} className="flex flex-col items-center flex-1 h-full justify-end">
              <div className="text-xs font-medium text-white/40 mb-1">
                {d.taken}/{d.total}
              </div>
              <div className="w-full flex flex-col items-center flex-1 justify-end">
                {missed > 0 && (
                  <div
                    className="w-8 sm:w-10 rounded-t-lg bg-red-500/20 border border-red-500/20"
                    style={{ height: `${((missed) / maxTotal) * 100}%` }}
                    title={`${missed} missed`}
                  />
                )}
                <div
                  className="w-8 sm:w-10 rounded-t-lg bg-gradient-to-t from-purple-600 to-blue-500"
                  style={{ height: `${height}%`, borderRadius: missed > 0 ? '0' : '0.5rem 0.5rem 0 0' }}
                  title={`${d.taken} taken`}
                />
              </div>
              <div className="text-sm font-medium text-white/40 mt-2">{d.day}</div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-4 text-sm text-white/40">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-purple-600 to-blue-500" /> Taken
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/20" /> Missed
        </div>
      </div>
    </div>
  );
}
