import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { patients } = useData();
  const profile = user;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-in">
      <h1 className="text-3xl font-bold text-white mb-8">👤 Profile</h1>

      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center text-3xl border border-white/10">
            {user?.role === 'patient' ? '👤' : '🩺'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase mt-1 ${
              user?.role === 'patient'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/20'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/20'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem label="Email" value={profile.email} />
          <InfoItem label="Phone" value={profile.phone} />
          {user?.role === 'patient' && (
            <>
              <InfoItem label="Age" value={profile.age} />
              <InfoItem label="Reminder Time" value={profile.preferredTime} />
            </>
          )}
          {user?.role === 'caretaker' && (
            <>
              <InfoItem label="Relationship" value={profile.relationship} />
              <InfoItem label="Patients" value={`${patients.length} linked`} />
            </>
          )}
        </div>

        {user?.role === 'patient' && profile.emergencyContact && (
          <>
            <hr className="border-white/5 my-6" />
            <h3 className="text-lg font-semibold text-white mb-3">🚨 Emergency Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem label="Name" value={profile.emergencyContact.name} />
              <InfoItem label="Phone" value={profile.emergencyContact.phone} />
              <InfoItem label="Relationship" value={profile.emergencyContact.relationship} />
            </div>
          </>
        )}
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
