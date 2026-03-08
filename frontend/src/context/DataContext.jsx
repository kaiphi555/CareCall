import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { formatPhoneNumber } from '../utils/formatters';

const DataContext = createContext(null);

function normalizePatient(p) {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    phone: formatPhoneNumber(p.phone),
    email: p.email,
    role: p.role,
    emergencyContact: p.emergency_contact ? {
      ...p.emergency_contact,
      phone: formatPhoneNumber(p.emergency_contact.phone)
    } : null,
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
      // Determine allowed patient IDs
      let patientIds = [];
      if (user.role === 'caretaker') {
        const { data: links } = await supabase
          .from('caretaker_patients')
          .select('patient_id')
          .eq('caretaker_id', user.id);
        
        if (links && links.length > 0) {
          patientIds = links.map(l => l.patient_id);
          const { data: dbPatients } = await supabase
            .from('profiles')
            .select('*')
            .in('id', patientIds);
          if (dbPatients) setPatients(dbPatients.map(normalizePatient));
        } else {
          setPatients([]);
        }
      } else {
        patientIds = [user.id];
        setPatients([]); // Patients don't see a "patient list"
      }

      if (patientIds.length === 0) {
        setMedications({});
        setCallHistory([]);
        setWellnessSubmissions([]);
        setAlertsList([]);
        setCalls([]);
        return;
      }

      // Load medications for allowed patients
      const { data: dbMeds } = await supabase
        .from('medications')
        .select('*')
        .in('patient_id', patientIds)
        .order('created_at');
      if (dbMeds) {
        const grouped = {};
        dbMeds.forEach(m => {
          if (!grouped[m.patient_id]) grouped[m.patient_id] = [];
          grouped[m.patient_id].push({
            id: m.id,
            name: m.name,
            dosage: m.dosage || '',
            time: m.time,
            status: m.status,
            instructions: m.instructions,
          });
        });
        setMedications(grouped);
      }

      // Load call history for allowed patients
      const { data: dbCalls } = await supabase
        .from('call_history')
        .select('*')
        .in('patient_id', patientIds)
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

      // Load alerts for allowed patients
      const { data: dbAlerts } = await supabase
        .from('alerts')
        .select('*')
        .in('patient_id', patientIds)
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

      // Load scheduled calls for allowed patients
      const { data: dbScheduled } = await supabase
        .from('scheduled_calls')
        .select('*')
        .in('patient_id', patientIds)
        .order('date', { ascending: false });
      
      const mappedCalls = dbScheduled ? dbScheduled.map(c => ({
        id: c.id,
        patientId: c.patient_id,
        patientName: c.patient_name,
        date: c.date,
        time: c.time,
        purpose: c.purpose,
        status: c.status,
        medicationId: c.medication_id,
        adherenceStatus: c.adherence_status || 'pending',
        takenAt: c.taken_at
      })) : [];
      setCalls(mappedCalls);

      // Load wellness submissions for allowed patients
      const { data: dbSubs } = await supabase
        .from('wellness_submissions')
        .select('*')
        .in('patient_id', patientIds)
        .order('created_at', { ascending: false });
      if (dbSubs) {
        setWellnessSubmissions(dbSubs.map(s => ({
          id: s.id,
          patientId: s.patient_id,
          patientName: s.patient_name,
          answers: typeof s.answers === 'string' ? JSON.parse(s.answers) : s.answers,
          aiFeedback: typeof s.ai_feedback === 'string' && s.ai_feedback ? JSON.parse(s.ai_feedback) : s.ai_feedback,
          timestamp: new Date(s.created_at).toLocaleString(),
          createdAt: s.created_at,
        })));
      }

      // Load wellness questions (global)
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

      // --- Calculate 7-day Adherence Score ---
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      setPatients(prev => prev.map(patient => {
        const patientCalls = mappedCalls.filter(c => 
          c.patientId === patient.id && 
          c.date >= sevenDaysAgoStr && 
          c.date <= new Date().toISOString().split('T')[0]
        );

        const totalAssigned = patientCalls.length;
        const taken = patientCalls.filter(c => c.adherenceStatus === 'taken').length;
        
        const adherencePercent = totalAssigned > 0 
          ? Math.round((taken / totalAssigned) * 100) 
          : 100;

        return { ...patient, adherencePercent };
      }));

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

  // Submit wellness (with optional AI feedback)
  const submitWellness = useCallback(async (patientId, patientName, answers, aiFeedback = null) => {
    const submission = {
      id: 'ws_' + Date.now(),
      patientId,
      patientName,
      answers,
      timestamp: new Date().toLocaleString(),
      createdAt: new Date().toISOString(),
      aiFeedback: aiFeedback || null,
    };
    setWellnessSubmissions(prev => [submission, ...prev]);

    try {
      const { data } = await supabase.from('wellness_submissions').insert({
        patient_id: patientId,
        patient_name: patientName,
        answers,
        ai_feedback: aiFeedback,
      }).select().single();
      if (data) submission.id = data.id;
    } catch (_) {}

    // Use AI feedback for alert decision if available; otherwise fallback
    const alertFromAI = aiFeedback?.alert_caretaker;
    const concerning = alertFromAI !== undefined ? alertFromAI :
      Object.values(answers).some(a =>
        ['Not well', 'No', 'A little dizzy', 'Yes, uncomfortable'].includes(a)
      );

    const alertMessage = aiFeedback?.alert_reason
      ? `⚠️ ${patientName}: ${aiFeedback.alert_reason}`
      : concerning
        ? `${patientName} reported concerning wellness responses`
        : `${patientName} completed wellness check-in`;

    const newAlert = {
      id: 'a_' + Date.now(),
      type: concerning ? 'warning' : 'info',
      message: alertMessage,
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

  // Add medication (with recurring scheduled calls)
  const addMedication = useCallback(async (patientId, patientName, name, dosage, times) => {
    // times is an array of time strings like ["08:00", "14:00", "20:00"]
    const localId = 'med_' + Date.now();
    const newMed = { id: localId, name, dosage, time: times.join(', '), status: 'upcoming', instructions: '' };
    setMedications(prev => {
      const copy = { ...prev };
      if (!copy[patientId]) copy[patientId] = [];
      copy[patientId] = [...copy[patientId], newMed];
      return copy;
    });

    try {
      // Insert medication
      const { data: medData, error: medError } = await supabase.from('medications').insert({
        patient_id: patientId,
        name,
        dosage,
        time: times.join(', '),
        status: 'upcoming',
      }).select().single();

      if (medError) {
        console.error('Supabase error inserting medication:', medError);
        throw medError;
      }

      const medId = medData?.id || localId;
      if (medData) {
        setMedications(prev => {
          const copy = { ...prev };
          copy[patientId] = (copy[patientId] || []).map(m => m.id === localId ? { ...m, id: medId } : m);
          return copy;
        });
      }

      // Schedule a recurring call for each dose time
      const today = new Date().toISOString().split('T')[0];
      const newCalls = [];

      for (const t of times) {
        const { data: callData, error: callError } = await supabase.from('scheduled_calls').insert({
          patient_id: patientId,
          patient_name: patientName,
          date: today,
          time: t,
          purpose: `Take ${dosage} of ${name}`,
          status: 'scheduled',
          medication_id: medId,
          recurring: true,
        }).select().single();
        
        if (callError) {
          console.error('Supabase error inserting scheduled call:', callError);
        }
        if (callData) {
          newCalls.push({
            id: callData.id,
            patientId: callData.patient_id,
            patientName: callData.patient_name,
            date: callData.date,
            time: callData.time,
            purpose: callData.purpose,
            status: callData.status,
            medicationId: callData.medication_id,
            adherenceStatus: 'pending'
          });
        }
      }

      if (newCalls.length > 0) {
        setCalls(prev => [...prev, ...newCalls]);
      }
    } catch (err) {
      console.error('Failed to add medication:', err);
    }
  }, []);

  // Remove medication (cascading deletes scheduled calls via FK)
  const removeMedication = useCallback(async (patientId, medId) => {
    setMedications(prev => {
      const copy = { ...prev };
      copy[patientId] = (copy[patientId] || []).filter(m => m.id !== medId);
      return copy;
    });
    try {
      await supabase.from('medications').delete().eq('id', medId);
    } catch (_) {}
  }, []);

  // Update medication adherence (Manual button)
  const updateAdherence = useCallback(async (callId, status) => {
    const timestamp = new Date().toISOString();
    
    // Optimistic update
    setCalls(prev => prev.map(c => 
      c.id === callId ? { ...c, adherenceStatus: status, takenAt: status === 'taken' ? timestamp : null } : c
    ));

    try {
      await supabase
        .from('scheduled_calls')
        .update({ 
          adherence_status: status,
          taken_at: status === 'taken' ? timestamp : null
        })
        .eq('id', callId);
    } catch (err) {
      console.error('Failed to update medication adherence:', err);
      // Revert if error
      loadAllData();
    }
  }, []);

  return (
    <DataContext.Provider value={{
      patients,
      medications, addMedication, removeMedication,
      updateAdherence,
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
