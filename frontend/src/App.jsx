import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import DashboardPage from './pages/DashboardPage';
import PrescriptionCreatePage from './pages/PrescriptionCreatePage';
import PrescriptionDetailPage from './pages/PrescriptionDetailPage';
import DrugCreatePage from './pages/DrugCreatePage';
import QRScannerPage from './pages/QRScannerPage';
import NotFoundPage from './pages/NotFoundPage'; 

function App() {
  return (
    <Router>
      <Navbar /> 
      
      {/* This is the updated content wrapper. 
        It uses the 'main-content' class, which has padding-top in index.css 
        to push the content down below the Navbar.
      */}
      <div className="main-content"> 
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />

          {/* Protected Routes (General Access) */}
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/prescriptions/:id" element={<ProtectedRoute roles={['doctor', 'pharmacist']}><PrescriptionDetailPage /></ProtectedRoute>} />

          {/* Doctor-Specific Routes */}
          <Route path="/prescriptions/new" element={<ProtectedRoute roles={['doctor']}><PrescriptionCreatePage /></ProtectedRoute>} />
          <Route path="/drugs/new" element={<ProtectedRoute roles={['doctor']}><DrugCreatePage /></ProtectedRoute>} />

          {/* Pharmacist-Specific Routes */}
          <Route path="/scan" element={<ProtectedRoute roles={['pharmacist']}><QRScannerPage /></ProtectedRoute>} />

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;