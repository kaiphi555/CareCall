// ============================================================
// CareCall Mock Data — V2 (Multi-patient, Custom Wellness, Call Scheduling)
// ============================================================

export const mockPatients = [
  {
    id: 'p1',
    name: 'Margaret Johnson',
    age: 78,
    phone: '+18132605180',
    email: 'margaret.j@email.com',
    role: 'patient',
    emergencyContact: { name: 'David Johnson', phone: '(555) 876-5432', relationship: 'Son' },
    reminderPreference: 'Phone Call',
    preferredTime: '9:00 AM',
    adherencePercent: 75,
    riskLevel: 'Medium',
    lastMedication: 'Metformin 500mg — Today, 9:02 AM',
    lastCallAnswered: 'Today, 9:02 AM',
    wellnessSummary: 'Mostly good. Reported mild dizziness on Mar 5.',
    avatar: '👵',
  },
  {
    id: 'p2',
    name: 'Robert Williams',
    age: 82,
    phone: '+12393088767',
    email: 'robert.w@email.com',
    role: 'patient',
    emergencyContact: { name: 'Sarah Williams', phone: '(555) 987-6543', relationship: 'Daughter' },
    reminderPreference: 'Phone Call',
    preferredTime: '8:00 AM',
    adherencePercent: 92,
    riskLevel: 'Low',
    lastMedication: 'Amlodipine 5mg — Today, 8:05 AM',
    lastCallAnswered: 'Today, 8:05 AM',
    wellnessSummary: 'Feeling great. No concerns reported.',
    avatar: '👴',
  },
  {
    id: 'p3',
    name: 'Dorothy Chen',
    age: 75,
    phone: '+19148171885',
    email: 'dorothy.c@email.com',
    role: 'patient',
    emergencyContact: { name: 'Michael Chen', phone: '(555) 654-3210', relationship: 'Son' },
    reminderPreference: 'Both',
    preferredTime: '10:00 AM',
    adherencePercent: 58,
    riskLevel: 'High',
    lastMedication: 'Warfarin 2mg — Yesterday, 10:10 AM',
    lastCallAnswered: 'Yesterday, 10:10 AM',
    wellnessSummary: 'Missed several doses. Reported feeling tired.',
    avatar: '👵',
  },
  {
    id: 'p4',
    name: 'James Rivera',
    age: 80,
    phone: '+19543502227',
    email: 'james.r@email.com',
    role: 'patient',
    emergencyContact: { name: 'Maria Rivera', phone: '(555) 555-1234', relationship: 'Wife' },
    reminderPreference: 'Phone Call',
    preferredTime: '9:30 AM',
    adherencePercent: 70,
    riskLevel: 'Medium',
    lastMedication: 'Omeprazole 20mg — Today, 9:35 AM',
    lastCallAnswered: 'Today, 9:35 AM',
    wellnessSummary: 'Generally stable. Occasional fatigue reported.',
    avatar: '👴',
  },
  {
    id: 'p5',
    name: 'Helen Park',
    age: 77,
    phone: '+17276413786',
    email: 'helen.p@email.com',
    role: 'patient',
    emergencyContact: { name: 'Kevin Park', phone: '(555) 222-3344', relationship: 'Son' },
    reminderPreference: 'Phone Call',
    preferredTime: '8:30 AM',
    adherencePercent: 88,
    riskLevel: 'Low',
    lastMedication: 'Levothyroxine 50mcg — Today, 8:32 AM',
    lastCallAnswered: 'Today, 8:32 AM',
    wellnessSummary: 'Feeling well. No concerns.',
    avatar: '👵',
  },
];

// Default patient for Patient-side view
export const mockPatient = mockPatients[0];

export const mockCaretaker = {
  id: 'c1',
  name: 'David Johnson',
  phone: '(555) 876-5432',
  email: 'david.j@email.com',
  role: 'caretaker',
  relationship: 'Son',
  linkedPatients: ['p1', 'p2', 'p3', 'p4', 'p5'],
};

export const medications = {
  p1: [
    { id: 'm1', name: 'Metformin 500mg', time: '9:00 AM', status: 'taken', instructions: 'Take with breakfast' },
    { id: 'm2', name: 'Lisinopril 10mg', time: '12:00 PM', status: 'upcoming', instructions: 'Take with lunch' },
    { id: 'm3', name: 'Aspirin 81mg', time: '6:00 PM', status: 'upcoming', instructions: 'Take with dinner' },
    { id: 'm4', name: 'Atorvastatin 20mg', time: '9:00 PM', status: 'upcoming', instructions: 'Take before bed' },
  ],
  p2: [
    { id: 'm5', name: 'Amlodipine 5mg', time: '8:00 AM', status: 'taken', instructions: 'Take in the morning' },
    { id: 'm6', name: 'Metoprolol 25mg', time: '8:00 PM', status: 'upcoming', instructions: 'Take at night' },
  ],
  p3: [
    { id: 'm7', name: 'Warfarin 2mg', time: '10:00 AM', status: 'missed', instructions: 'Take with food' },
    { id: 'm8', name: 'Furosemide 20mg', time: '10:00 AM', status: 'missed', instructions: 'Take in morning' },
    { id: 'm9', name: 'Potassium 20mEq', time: '6:00 PM', status: 'upcoming', instructions: 'Take with dinner' },
  ],
  p4: [
    { id: 'm10', name: 'Omeprazole 20mg', time: '9:30 AM', status: 'taken', instructions: 'Take before breakfast' },
    { id: 'm11', name: 'Losartan 50mg', time: '9:00 PM', status: 'upcoming', instructions: 'Take at bedtime' },
  ],
  p5: [
    { id: 'm12', name: 'Levothyroxine 50mcg', time: '8:30 AM', status: 'taken', instructions: 'Take on empty stomach' },
    { id: 'm13', name: 'Calcium 600mg', time: '12:00 PM', status: 'upcoming', instructions: 'Take with lunch' },
  ],
};

export const reminders = [
  { id: 'r1', type: 'medication', title: 'Metformin 500mg', time: '9:00 AM', date: 'Today', status: 'completed' },
  { id: 'r2', type: 'medication', title: 'Lisinopril 10mg', time: '12:00 PM', date: 'Today', status: 'upcoming' },
  { id: 'r3', type: 'medication', title: 'Aspirin 81mg', time: '6:00 PM', date: 'Today', status: 'upcoming' },
  { id: 'r4', type: 'appointment', title: 'Dr. Smith — Checkup', time: '2:30 PM', date: 'Mar 10', status: 'upcoming' },
  { id: 'r5', type: 'medication', title: 'Atorvastatin 20mg', time: '9:00 PM', date: 'Today', status: 'upcoming' },
  { id: 'r6', type: 'routine', title: 'Evening walk', time: '5:00 PM', date: 'Today', status: 'upcoming' },
];

export const callHistory = [
  { id: 'cl1', date: 'Mar 7, 9:02 AM', type: 'Medication Reminder', answered: true, response: 'Confirmed — took Metformin', duration: '1m 12s', patientId: 'p1' },
  { id: 'cl2', date: 'Mar 6, 9:01 AM', type: 'Medication Reminder', answered: true, response: 'Confirmed — took Metformin', duration: '0m 58s', patientId: 'p1' },
  { id: 'cl3', date: 'Mar 6, 12:00 PM', type: 'Medication Reminder', answered: false, response: 'No answer — missed', duration: '—', patientId: 'p1' },
  { id: 'cl4', date: 'Mar 5, 9:00 AM', type: 'Medication Reminder', answered: true, response: 'Confirmed — took Metformin', duration: '1m 05s', patientId: 'p1' },
  { id: 'cl5', date: 'Mar 5, 4:00 PM', type: 'Wellness Check-in', answered: true, response: 'Feeling good, ate lunch', duration: '2m 30s', patientId: 'p1' },
  { id: 'cl6', date: 'Mar 7, 8:05 AM', type: 'Medication Reminder', answered: true, response: 'Confirmed — took Amlodipine', duration: '0m 45s', patientId: 'p2' },
  { id: 'cl7', date: 'Mar 6, 10:00 AM', type: 'Medication Reminder', answered: false, response: 'No answer — missed', duration: '—', patientId: 'p3' },
  { id: 'cl8', date: 'Mar 5, 10:00 AM', type: 'Medication Reminder', answered: false, response: 'No answer — missed', duration: '—', patientId: 'p3' },
];

export const defaultWellnessQuestions = [
  { id: 'w1', question: 'How are you feeling today?', options: ['Great', 'Good', 'Okay', 'Not well'] },
  { id: 'w2', question: 'Did you eat breakfast?', options: ['Yes', 'No', 'A little'] },
  { id: 'w3', question: 'Are you feeling dizzy or uncomfortable?', options: ['No', 'A little dizzy', 'Yes, uncomfortable'] },
  { id: 'w4', question: 'Did you sleep well last night?', options: ['Yes', 'Somewhat', 'No'] },
];

export const alerts = [
  { id: 'a1', type: 'warning', message: 'Margaret missed 2 medication reminders this week', time: '2 hours ago', priority: 'high', patientId: 'p1' },
  { id: 'a2', type: 'info', message: 'Margaret reported feeling dizzy on Mar 5', time: '2 days ago', priority: 'medium', patientId: 'p1' },
  { id: 'a3', type: 'danger', message: 'Dorothy — no answer on 2 consecutive calls', time: '1 day ago', priority: 'high', patientId: 'p3' },
  { id: 'a4', type: 'warning', message: 'Dorothy overdue for morning medication', time: '5 hours ago', priority: 'high', patientId: 'p3' },
  { id: 'a5', type: 'info', message: 'Robert completed all reminders today', time: '1 hour ago', priority: 'low', patientId: 'p2' },
];

export const adherenceData = [
  { day: 'Mon', taken: 3, total: 4 },
  { day: 'Tue', taken: 4, total: 4 },
  { day: 'Wed', taken: 2, total: 4 },
  { day: 'Thu', taken: 4, total: 4 },
  { day: 'Fri', taken: 3, total: 4 },
  { day: 'Sat', taken: 4, total: 4 },
  { day: 'Sun', taken: 1, total: 4 },
];

export const scheduledCalls = [
  { id: 'sc1', patientId: 'p1', patientName: 'Margaret Johnson', date: '2026-03-08', time: '09:00', purpose: 'Morning medication reminder', status: 'scheduled' },
  { id: 'sc2', patientId: 'p1', patientName: 'Margaret Johnson', date: '2026-03-08', time: '12:00', purpose: 'Afternoon medication reminder', status: 'scheduled' },
  { id: 'sc3', patientId: 'p3', patientName: 'Dorothy Chen', date: '2026-03-08', time: '10:00', purpose: 'Medication + wellness check-in', status: 'scheduled' },
];
