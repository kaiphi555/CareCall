import { createContext, useContext, useState, useCallback } from 'react';
import { defaultWellnessQuestions, alerts as defaultAlerts, scheduledCalls as defaultScheduledCalls } from '../data/mockData';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  // Wellness questions — caretaker can customize
  const [wellnessQuestions, setWellnessQuestions] = useState(defaultWellnessQuestions);

  // Wellness submissions from patients
  const [wellnessSubmissions, setWellnessSubmissions] = useState([]);

  // Alerts — includes wellness alerts
  const [alertsList, setAlertsList] = useState(defaultAlerts);

  // Scheduled calls
  const [calls, setCalls] = useState(defaultScheduledCalls);

  // Submit wellness responses (patient side)
  const submitWellness = useCallback((patientId, patientName, answers) => {
    const submission = {
      id: 'ws_' + Date.now(),
      patientId,
      patientName,
      answers,
      timestamp: new Date().toLocaleString(),
    };
    setWellnessSubmissions(prev => [submission, ...prev]);

    // Generate alert for caretaker
    const newAlert = {
      id: 'a_' + Date.now(),
      type: 'info',
      message: `${patientName} completed wellness check-in`,
      time: 'Just now',
      priority: 'low',
      patientId,
      wellnessSubmissionId: submission.id,
    };

    // Check for concerning answers
    const concerning = Object.values(answers).some(a =>
      ['Not well', 'No', 'A little dizzy', 'Yes, uncomfortable'].includes(a)
    );
    if (concerning) {
      newAlert.type = 'warning';
      newAlert.message = `${patientName} reported concerning wellness responses`;
      newAlert.priority = 'high';
    }

    setAlertsList(prev => [newAlert, ...prev]);
  }, []);

  // Add custom wellness question
  const addWellnessQuestion = useCallback((question, options) => {
    setWellnessQuestions(prev => [
      ...prev,
      { id: 'wq_' + Date.now(), question, options },
    ]);
  }, []);

  // Remove wellness question
  const removeWellnessQuestion = useCallback((questionId) => {
    setWellnessQuestions(prev => prev.filter(q => q.id !== questionId));
  }, []);

  // Schedule a call
  const scheduleCall = useCallback((callData) => {
    setCalls(prev => [
      ...prev,
      { ...callData, id: 'sc_' + Date.now(), status: 'scheduled' },
    ]);
  }, []);

  // Cancel a call
  const cancelCall = useCallback((callId) => {
    setCalls(prev => prev.filter(c => c.id !== callId));
  }, []);

  return (
    <DataContext.Provider value={{
      wellnessQuestions, addWellnessQuestion, removeWellnessQuestion,
      wellnessSubmissions, submitWellness,
      alertsList,
      calls, scheduleCall, cancelCall,
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
