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
