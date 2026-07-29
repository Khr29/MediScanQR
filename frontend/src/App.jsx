import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';

// Public Pages
import PublicVerify from './pages/PublicVerify';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientManagement from './pages/doctor/PatientManagement';
import CreatePrescription from './pages/doctor/CreatePrescription';
import PrescriptionHistory from './pages/doctor/PrescriptionHistory';
import DoctorAnalytics from './pages/doctor/DoctorAnalytics';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import MyPrescriptions from './pages/patient/MyPrescriptions';
import PrescriptionDetail from './pages/patient/PrescriptionDetail';
import MedicineHistory from './pages/patient/MedicineHistory';
import PatientProfile from './pages/patient/PatientProfile';

// Pharmacy Pages
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import ScanPrescription from './pages/pharmacy/ScanPrescription';
import DispensePortal from './pages/pharmacy/DispensePortal';
import ScanHistory from './pages/pharmacy/ScanHistory';
import PrescriptionViewer from "./pages/pharmacy/PrescriptionViewer";
import InvalidQRCode from "./pages/pharmacy/InvalidQRCode";

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorApprovals from './pages/admin/DoctorApprovals';
import PharmacyApprovals from './pages/admin/PharmacyApprovals';
import AuditLogs from './pages/admin/AuditLogs';
import SystemAnalytics from './pages/admin/SystemAnalytics';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify/:id" element={<PublicVerify />} />

            {/* Doctor Routes */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['DOCTOR']}>
                    <DoctorDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/patients"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['DOCTOR']}>
                    <PatientManagement />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/create-prescription"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['DOCTOR']}>
                    <CreatePrescription />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/history"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['DOCTOR']}>
                    <PrescriptionHistory />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/analytics"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['DOCTOR']}>
                    <DoctorAnalytics />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* Patient Routes */}
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['PATIENT']}>
                    <PatientDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/prescriptions"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['PATIENT']}>
                    <MyPrescriptions />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/prescription/:id"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['PATIENT']}>
                    <PrescriptionDetail />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/history"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['PATIENT']}>
                    <MedicineHistory />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/profile"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['PATIENT']}>
                    <PatientProfile />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* Pharmacy Routes */}
            <Route
              path="/pharmacy/dashboard"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['PHARMACY']}>
                    <PharmacyDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pharmacy/scan"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['PHARMACY']}>
                    <ScanPrescription />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pharmacy/dispense/:id"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['PHARMACY']}>
                    <DispensePortal />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pharmacy/history"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['PHARMACY']}>
                    <ScanHistory />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pharmacy/invalid-qr"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['PHARMACY']}>
                    <InvalidQRCode />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />


            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/doctor-approvals"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <DoctorApprovals />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pharmacy-approvals"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <PharmacyApprovals />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AuditLogs />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="/pharmacy/history/:id"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={["PHARMACY"]}>
                    <PrescriptionViewer />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <SystemAnalytics />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;