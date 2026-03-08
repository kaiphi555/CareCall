// API service for communicating with the FastAPI backend

const API_BASE = 'http://localhost:8000';

export async function triggerCall({ patientName, medication, phoneNumber }) {
  const res = await fetch(`${API_BASE}/trigger-call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient_name: patientName,
      medication: medication,
      phone_number: phoneNumber,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Call failed' }));
    throw new Error(error.detail || 'Failed to trigger call');
  }

  return res.json();
}

export async function analyzeWellness({ patientName, questionsAndAnswers }) {
  const res = await fetch(`${API_BASE}/analyze-wellness`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient_name: patientName,
      questions_and_answers: questionsAndAnswers,
    }),
  });

  if (!res.ok) {
    return {
      feedback: 'Thank you for completing your check-in today!',
      alert_caretaker: false,
      alert_reason: '',
      mood_score: 5,
    };
  }

  return res.json();
}
