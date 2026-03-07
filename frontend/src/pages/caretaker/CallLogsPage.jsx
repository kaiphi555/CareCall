import { callHistory, mockPatients } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

export default function CallLogsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in">
      <h1 className="text-3xl font-bold text-white mb-2">📞 Call Logs</h1>
      <p className="text-white/50 mb-8">{callHistory.length} total calls across all patients</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-white">{callHistory.length}</p>
          <p className="text-sm text-white/40">Total Calls</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{callHistory.filter(c => c.answered).length}</p>
          <p className="text-sm text-white/40">Answered</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{callHistory.filter(c => !c.answered).length}</p>
          <p className="text-sm text-white/40">Missed</p>
        </div>
      </div>

      {/* Call list */}
      <div className="space-y-3">
        {callHistory.map(call => {
          const patient = mockPatients.find(p => p.id === call.patientId);
          return (
            <div key={call.id} className="glass rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center text-lg border border-white/10">
                  {patient?.avatar || '👤'}
                </div>
                <div>
                  <p className="font-medium text-white">{patient?.name || 'Unknown'}</p>
                  <p className="text-sm text-white/40">{call.type} · {call.date}</p>
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={call.answered ? 'taken' : 'missed'} size="sm" />
                <p className="text-xs text-white/30 mt-1 max-w-[200px] truncate">{call.response}</p>
                {call.duration !== '—' && (
                  <p className="text-xs text-white/20">{call.duration}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
