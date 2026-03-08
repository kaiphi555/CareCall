import { useData } from '../context/DataContext';

export default function AdherenceChart({ patientId }) {
  const { adherenceData, calls } = useData();

  let chartData = adherenceData;

  if (patientId && calls) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      last7Days.push({
        fullDate: d.toISOString().split('T')[0],
        day: days[d.getDay()],
        taken: 0,
        total: 1 // Default to 1 to show empty bar if no calls scheduled, but we filter later
      });
    }

    const patientCalls = calls.filter(c => c.patientId === patientId);
    
    chartData = last7Days.map(dayObj => {
      const dayCalls = patientCalls.filter(c => c.date === dayObj.fullDate);
      const taken = dayCalls.filter(c => c.adherenceStatus === 'taken').length;
      return {
        day: dayObj.day,
        taken: taken,
        total: dayCalls.length
      };
    });
  }

  if (!chartData || chartData.length === 0 || chartData.every(d => d.total === 0)) {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Weekly Medication Adherence</h3>
        <p className="text-white/30 text-sm py-8 text-center">No medication history for this period.</p>
      </div>
    );
  }

  const maxTotal = Math.max(...chartData.map(d => d.total), 1);

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Weekly Medication Adherence</h3>
      <div className="flex items-end justify-between gap-3 h-48">
        {chartData.map((d, i) => {
          const height = d.total > 0 ? (d.taken / maxTotal) * 100 : 0;
          const missedHeight = d.total > 0 ? ((d.total - d.taken) / maxTotal) * 100 : 0;
          
          return (
            <div key={`${d.day}-${i}`} className="flex flex-col items-center flex-1 h-full justify-end">
              <div className="text-[10px] font-medium text-white/40 mb-1">
                {d.total > 0 ? `${d.taken}/${d.total}` : '—'}
              </div>
              <div className="w-full flex flex-col items-center flex-1 justify-end">
                {missedHeight > 0 && (
                  <div
                    className="w-full max-w-[40px] rounded-t-sm bg-red-500/20 border-x border-t border-red-500/20"
                    style={{ height: `${missedHeight}%` }}
                  />
                )}
                <div
                  className="w-full max-w-[40px] rounded-t-sm bg-gradient-to-t from-purple-600 to-blue-500 shadow-lg shadow-purple-500/10"
                  style={{ 
                    height: `${height}%`, 
                    borderRadius: (d.total - d.taken) > 0 ? '0' : '4px 4px 0 0' 
                  }}
                />
              </div>
              <div className="text-xs font-medium text-white/40 mt-2">{d.day}</div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-6 text-xs text-white/30">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-gradient-to-t from-purple-600 to-blue-500" /> Taken
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-red-500/20 border border-red-500/20" /> Missed
        </div>
      </div>
    </div>
  );
}
