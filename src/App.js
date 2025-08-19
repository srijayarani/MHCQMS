import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import PatientRegistration from './pages/PatientRegistration';
import QueueManagement from './pages/QueueManagement';
import Reports from './pages/Reports';
import AppointmentPortal from './pages/AppointmentPortal';
import PatientPortal from './pages/PatientPortal';
import PatientLanding from './pages/PatientLanding';
import Login from './pages/Login';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return (
      <Box className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PatientLanding />} />
          <Route path="/appointment-portal" element={<AppointmentPortal />} />
          <Route path="/patient-portal" element={<PatientPortal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-gray-50">
      <Navbar />
      <Box className="pt-16">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patient-registration" element={<PatientRegistration />} />
          <Route path="/queue-management" element={<QueueManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/appointment-portal" element={<AppointmentPortal />} />
          <Route path="/patient-portal" element={<PatientPortal />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
