import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// Normalize a raw Supabase profile row to camelCase for components
function normalizeProfile(data) {
  if (!data) return null;
  return {
    id: data.id,
    role: data.role,
    name: data.name,
    phone: data.phone,
    email: data.email,
    age: data.age,
    avatar: data.avatar || '👤',
    emergencyContact: data.emergency_contact,
    reminderPreference: data.reminder_preference,
    preferredTime: data.preferred_time,
    relationship: data.relationship,
    adherencePercent: data.adherence_percent ?? 100,
    riskLevel: data.risk_level ?? 'Low',
    lastMedication: data.last_medication,
    lastCallAnswered: data.last_call_answered,
    wellnessSummary: data.wellness_summary,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from Supabase
  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        console.error('fetchProfile error:', error.message);
        return null;
      }
      if (data) {
        const normalized = normalizeProfile(data);
        setProfile(normalized);
        return normalized;
      }
    } catch (err) {
      console.error('fetchProfile failed:', err);
    }
    return null;
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    let mounted = true;

    // Add a safety timeout — never stay on "Loading..." forever
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth init timed out, proceeding without session');
        setLoading(false);
      }
    }, 5000);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('getSession failed:', err);
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign up with email/password + create profile
  const signup = useCallback(async (formData, role) => {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });
    if (error) throw error;

    const profileData = {
      id: data.user.id,
      role,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      age: formData.age ? parseInt(formData.age) : null,
      avatar: role === 'patient' ? '👴' : '🩺',
      reminder_preference: formData.reminderType || 'Phone Call',
      preferred_time: formData.preferredTime || '09:00 AM',
      relationship: formData.relationship || null,
      adherence_percent: 100,
      risk_level: 'Low',
    };

    if (role === 'patient' && formData.emergencyName) {
      profileData.emergency_contact = {
        name: formData.emergencyName,
        phone: formData.emergencyPhone,
        relationship: 'Family',
      };
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileData);
    if (profileError) console.error('Profile insert error:', profileError);

    setProfile(normalizeProfile(profileData));
    return data.user;
  }, []);

  // Log in with email/password
  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    const prof = await fetchProfile(data.user.id);
    return prof;
  }, [fetchProfile]);

  // Log out
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  // Combined user for components
  const combinedUser = profile ? { ...profile, role: profile.role } : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0515]">
        <div className="text-white/50 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user: combinedUser,
      supabaseUser: user,
      profile,
      login,
      signup,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
