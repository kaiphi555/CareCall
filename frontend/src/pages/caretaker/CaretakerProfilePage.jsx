import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatPhoneNumber } from '../../utils/formatters';

export default function CaretakerProfilePage() {
  const { user, updateProfile } = useAuth();
  const { patients } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-in">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">👤 Profile</h1>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={saving}
          className={`px-6 py-2 rounded-xl font-semibold transition-all ${
            isEditing 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </header>

      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center text-3xl border border-white/10">
            🩺
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user?.name || 'Caretaker'}</h2>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/20 mt-1">
              Caretaker
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EditableInfoItem 
            label="Name" 
            value={formData.name} 
            isEditing={isEditing} 
            onChange={val => setFormData(prev => ({ ...prev, name: val }))} 
          />
          <EditableInfoItem 
            label="Email" 
            value={formData.email} 
            isEditing={isEditing} 
            onChange={val => setFormData(prev => ({ ...prev, email: val }))} 
            type="email"
          />
          <EditableInfoItem 
            label="Phone" 
            value={isEditing ? formData.phone : formatPhoneNumber(formData.phone)} 
            isEditing={isEditing} 
            onChange={val => setFormData(prev => ({ ...prev, phone: val }))} 
          />
          <div className="bg-white/5 rounded-xl px-4 py-3 opacity-60">
            <p className="text-xs text-white/40 font-medium">Linked Patients</p>
            <p className="text-white font-semibold">{patients.length} patients</p>
          </div>
        </div>

        {isEditing && (
          <button 
            onClick={() => {
              setIsEditing(false);
              setFormData({ name: user.name, email: user.email, phone: user.phone });
            }}
            className="mt-6 text-sm text-white/40 hover:text-white transition-colors"
          >
            Cancel and discard changes
          </button>
        )}
      </div>
    </div>
  );
}

function EditableInfoItem({ label, value, isEditing, onChange, type = 'text' }) {
  return (
    <div className="bg-white/5 rounded-xl px-4 py-3">
      <p className="text-xs text-white/40 font-medium mb-1">{label}</p>
      {isEditing ? (
        <input 
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-transparent text-white font-semibold outline-none border-b border-purple-500/30 focus:border-purple-500 transition-all py-0.5"
        />
      ) : (
        <p className="text-white font-semibold">{value}</p>
      )}
    </div>
  );
}
