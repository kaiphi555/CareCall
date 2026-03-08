import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

function normalizePatient(p) {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    phone: p.phone,
    email: p.email,
    role: p.role,
    emergencyContact: p.emergency_contact,
    reminderPreference: p.reminder_preference,
    preferredTime: p.preferred_time,
    adherencePercent: p.adherence_percent ?? 100,
    riskLevel: p.risk_level ?? 'Low',
    lastMedication: p.last_medication,
    lastCallAnswered: p.last_call_answered,
    wellnessSummary: p.wellness_summary,
    avatar: p.avatar || '👤',
  };
}

export function DataProvider({ children }) {
  const { user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState({});
  const [callHistory, setCallHistory] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [adherenceData] = useState([
    { day: 'Mon', taken: 0, total: 0 },
    { day: 'Tue', taken: 0, total: 0 },
    { day: 'Wed', taken: 0, total: 0 },
    { day: 'Thu', taken: 0, total: 0 },
    { day: 'Fri', taken: 0, total: 0 },
    { day: 'Sat', taken: 0, total: 0 },
    { day: 'Sun', taken: 0, total: 0 },
  ]);

  const [wellnessQuestions, setWellnessQuestions] = useState([]);
  const [wellnessSubmissions, setWellnessSubmissions] = useState([]);
  const [alertsList, setAlertsList] = useState([]);
  const [calls, setCalls] = useState([]);

  // Load all data when user logs in
  useEffect(() => {
    if (!user) return;
    loadAllData();
  }, [user]);

  async function loadAllData() {
    try {
      // Load patients depending on role
      if (user.role === 'caretaker') {
        // Load only linked patients via caretaker_patients table
        const { data: links } = await supabase
          .from('caretaker_patients')
          .select('patient_id')
          .eq('caretaker_id', user.id);

        if (links && links.length > 0) {
          const patientIds = links.map(l => l.patient_id);
          const { data: dbPatients } = await supabase
            .from('profiles')
            .select('*')
            .in('id', patientIds);
          if (dbPatients) setPatients(dbPatients.map(normalizePatient));
        } else {
          setPatients([]);
        }
      } else {
        // Patient role — just load self
        setPatients([]);
      }

      // Load medications
      const { data: dbMeds } = await supabase
        .from('medications')
        .select('*')
        .order('created_at');
      if (dbMeds) {
        const grouped = {};
        dbMeds.forEach(m => {
          if (!grouped[m.patient_id]) grouped[m.patient_id] = [];
          grouped[m.patient_id].push({
            id: m.id,
            name: m.name,
            time: m.time,
            status: m.status,
            instructions: m.instructions,
          });
        });
        setMedications(grouped);
      }

      // Load call history
      const { data: dbCalls } = await supabase
        .from('call_history')
        .select('*')
        .order('call_date', { ascending: false });
      if (dbCalls) {
        setCallHistory(dbCalls.map(c => ({
          id: c.id,
          date: new Date(c.call_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
          type: c.type,
          answered: c.answered,
          response: c.response,
          duration: c.duration,
          patientId: c.patient_id,
        })));
      }

      // Load wellness questions
      const { data: dbQuestions } = await supabase
        .from('wellness_questions')
        .select('*')
        .order('created_at');
      if (dbQuestions) {
        setWellnessQuestions(dbQuestions.map(q => ({
          id: q.id,
          question: q.question,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        })));
      }

      // Load alerts
      const { data: dbAlerts } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });
      if (dbAlerts) {
        setAlertsList(dbAlerts.map(a => ({
          id: a.id,
          type: a.type,
          message: a.message,
          time: a.time || new Date(a.created_at).toLocaleString(),
          priority: a.priority,
          patientId: a.patient_id,
        })));
      }

      // Load scheduled calls
      const { data: dbScheduled } = await supabase
        .from('scheduled_calls')
        .select('*')
        .order('created_at', { ascending: false });
      if (dbScheduled) {
        setCalls(dbScheduled.map(c => ({
          id: c.id,
          patientId: c.patient_id,
          patientName: c.patient_name,
          date: c.date,
          time: c.time,
          purpose: c.purpose,
          status: c.status,
        })));
      }

      // Load wellness submissions
      const { data: dbSubs } = await supabase
        .from('wellness_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (dbSubs) {
        setWellnessSubmissions(dbSubs.map(s => ({
          id: s.id,
          patientId: s.patient_id,
          patientName: s.patient_name,
          answers: typeof s.answers === 'string' ? JSON.parse(s.answers) : s.answers,
          timestamp: new Date(s.created_at).toLocaleString(),
        })));
      }
    } catch (err) {
      console.warn('Supabase data load failed:', err);
    }
  }

  // Add patient by invite code (caretaker links to patient)
  const addPatientByCode = useCallback(async (code) => {
    // Find patient profile by invite code
    const { data: found, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('invite_code', code)
      .eq('role', 'patient')
      .single();

    if (error || !found) {
      throw new Error('No patient found with that code. Please check the 8-digit code and try again.');
    }

    // Check if already linked
    const { data: existing } = await supabase
      .from('caretaker_patients')
      .select('id')
      .eq('caretaker_id', user.id)
      .eq('patient_id', found.id)
      .single();

    if (existing) {
      throw new Error('This patient is already linked to your account.');
    }

    // Create link
    const { error: linkError } = await supabase
      .from('caretaker_patients')
      .insert({ caretaker_id: user.id, patient_id: found.id });

    if (linkError) throw new Error('Failed to link patient: ' + linkError.message);

    // Add to local state
    setPatients(prev => [...prev, normalizePatient(found)]);
    return normalizePatient(found);
  }, [user]);

  // Remove patient link
  const removePatient = useCallback(async (patientId) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    try {
      await supabase
        .from('caretaker_patients')
        .delete()
        .eq('caretaker_id', user.id)
        .eq('patient_id', patientId);
    } catch (_) {}
  }, [user]);

  // Submit wellness
  const submitWellness = useCallback(async (patientId, patientName, answers) => {
    const submission = {
      id: 'ws_' + Date.now(),
      patientId,
      patientName,
      answers,
      timestamp: new Date().toLocaleString(),
    };
    setWellnessSubmissions(prev => [submission, ...prev]);

    try {
      const { data } = await supabase.from('wellness_submissions').insert({
        patient_id: patientId,
        patient_name: patientName,
        answers,
      }).select().single();
      if (data) submission.id = data.id;
    } catch (_) {}

    const concerning = Object.values(answers).some(a =>
      ['Not well', 'No', 'A little dizzy', 'Yes, uncomfortable'].includes(a)
    );

    const newAlert = {
      id: 'a_' + Date.now(),
      type: concerning ? 'warning' : 'info',
      message: concerning
        ? `${patientName} reported concerning wellness responses`
        : `${patientName} completed wellness check-in`,
      time: 'Just now',
      priority: concerning ? 'high' : 'low',
      patientId,
    };

    setAlertsList(prev => [newAlert, ...prev]);

    try {
      await supabase.from('alerts').insert({
        patient_id: patientId,
        type: newAlert.type,
        message: newAlert.message,
        priority: newAlert.priority,
        time: newAlert.time,
      });
    } catch (_) {}
  }, []);

  // Add wellness question
  const addWellnessQuestion = useCallback(async (question, options) => {
    const localId = 'wq_' + Date.now();
    setWellnessQuestions(prev => [...prev, { id: localId, question, options }]);
    try {
      const { data } = await supabase.from('wellness_questions').insert({ question, options }).select().single();
      if (data) setWellnessQuestions(prev => prev.map(q => q.id === localId ? { ...q, id: data.id } : q));
    } catch (_) {}
  }, []);

  // Remove wellness question
  const removeWellnessQuestion = useCallback(async (questionId) => {
    setWellnessQuestions(prev => prev.filter(q => q.id !== questionId));
    try { await supabase.from('wellness_questions').delete().eq('id', questionId); } catch (_) {}
  }, []);

  // Schedule a call
  const scheduleCall = useCallback(async (callData) => {
    const localId = 'sc_' + Date.now();
    const newCall = { ...callData, id: localId, status: 'scheduled' };
    setCalls(prev => [...prev, newCall]);
    try {
      const { data } = await supabase.from('scheduled_calls').insert({
        patient_id: callData.patientId,
        patient_name: callData.patientName,
        date: callData.date,
        time: callData.time,
        purpose: callData.purpose,
        status: 'scheduled',
      }).select().single();
      if (data) setCalls(prev => prev.map(c => c.id === localId ? { ...c, id: data.id } : c));
    } catch (_) {}
  }, []);

  // Cancel a call
  const cancelCall = useCallback(async (callId) => {
    setCalls(prev => prev.filter(c => c.id !== callId));
    try { await supabase.from('scheduled_calls').delete().eq('id', callId); } catch (_) {}
  }, []);

  return (
    <DataContext.Provider value={{
      patients,
      medications,
      callHistory,
      reminders,
      adherenceData,
      wellnessQuestions, addWellnessQuestion, removeWellnessQuestion,
      wellnessSubmissions, submitWellness,
      alertsList,
      calls, scheduleCall, cancelCall,
      addPatientByCode, removePatient,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
