import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import Navbar from './components/Navbar';


import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import PatientDashboard from './pages/patient/PatientDashboard';
import RemindersPage from './pages/patient/RemindersPage';
import WellnessPage from './pages/patient/WellnessPage';
import ProfilePage from './pages/patient/ProfilePage';

import CaretakerDashboard from './pages/caretaker/CaretakerDashboard';
import PatientHub from './pages/caretaker/PatientHub';
import PatientStatusPage from './pages/caretaker/PatientStatusPage';
import CallLogsPage from './pages/caretaker/CallLogsPage';
import AlertsPage from './pages/caretaker/AlertsPage';
import CaretakerProfilePage from './pages/caretaker/CaretakerProfilePage';
import ScheduleCallPage from './pages/caretaker/ScheduleCallPage';
import WellnessConfigPage from './pages/caretaker/WellnessConfigPage';
import MedicationsPage from './pages/caretaker/MedicationsPage';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {user && <Navbar />}
      <main id="main-content">
        <Routes>
          {/* Public */}
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupPage />} />

          {/* Patient routes */}
          {user?.role === 'patient' && (
            <>
              <Route path="/dashboard" element={<PatientDashboard />} />
              <Route path="/reminders" element={<RemindersPage />} />
              <Route path="/wellness" element={<WellnessPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </>
          )}

          {/* Caretaker routes */}
          {user?.role === 'caretaker' && (
            <>
              <Route path="/dashboard" element={<CaretakerDashboard />} />
              <Route path="/patients" element={<PatientHub />} />
              <Route path="/patient-status" element={<PatientStatusPage />} />
              <Route path="/call-logs" element={<CallLogsPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/profile" element={<CaretakerProfilePage />} />
              <Route path="/schedule-call" element={<ScheduleCallPage />} />
              <Route path="/wellness-config" element={<WellnessConfigPage />} />
              <Route path="/medications" element={<MedicationsPage />} />
            </>
          )}

          {/* Fallback */}
          <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} />} />
        </Routes>
      </main>

    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
