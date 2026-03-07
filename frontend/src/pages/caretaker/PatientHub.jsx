import { useState } from 'react';
import { mockPatients, mockCaretaker, callHistory } from '../../data/mockData';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { Link } from 'react-router-dom';

export default function PatientHub() {
  const { alertsList } = useData();
  const linkedPatients = mockPatients.filter(p =>
    mockCaretaker.linkedPatients.includes(p.id)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Patients</h1>
        <p className="text-white/50">{linkedPatients.length} patients under your care</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {linkedPatients.map(patient => {
          const patientAlerts = alertsList.filter(a => a.patientId === patient.id && a.priority === 'high');
          const patientCalls = callHistory.filter(c => c.patientId === patient.id);
          const answeredCalls = patientCalls.filter(c => c.answered).length;

          return (
            <Link
              key={patient.id}
              to={`/patient-status?id=${patient.id}`}
              className="glass rounded-2xl p-6 hover:bg-white/[0.08] transition-all group no-underline block"
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center text-3xl border border-white/10">
                  {patient.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                    {patient.name}
                  </h3>
                  <p className="text-white/40 text-sm">Age {patient.age}</p>
                </div>
                <StatusBadge status={patient.riskLevel} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-xl px-3 py-2.5">
                  <p className="text-xs text-white/40">Adherence</p>
                  <p className="text-lg font-bold text-white">{patient.adherencePercent}%</p>
                </div>
                <div className="bg-white/5 rounded-xl px-3 py-2.5">
                  <p className="text-xs text-white/40">Calls Answered</p>
                  <p className="text-lg font-bold text-white">{answeredCalls}/{patientCalls.length}</p>
                </div>
              </div>

              {/* Wellness summary */}
              <p className="text-sm text-white/40 line-clamp-2">{patient.wellnessSummary}</p>

              {/* Alerts */}
              {patientAlerts.length > 0 && (
                <div className="mt-3 px-3 py-2 bg-red-500/10 rounded-xl border border-red-500/20">
                  <p className="text-sm text-red-400 font-medium">
                    ⚠️ {patientAlerts.length} high-priority alert{patientAlerts.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </Link>
          );
        })}

        {/* Add patient card */}
        <button className="glass rounded-2xl p-6 border-2 border-dashed border-white/10 hover:border-purple-500/30 hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center min-h-[240px] group">
          <div className="w-14 h-14 rounded-full bg-white/5 group-hover:bg-purple-500/10 flex items-center justify-center text-3xl text-white/30 group-hover:text-purple-400 transition-all mb-3">
            +
          </div>
          <p className="text-white/30 group-hover:text-purple-400 font-medium transition-colors">Add Patient</p>
        </button>
      </div>
    </div>
  );
}
