import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useState, useEffect } from 'react';
import PageLoader from './components/PageLoader';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OfficerRegister from './pages/OfficerRegister';
import AuthSelection from './pages/AuthSelection';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import FarmerDashboard from './pages/farmer/Dashboard';
import SubmitClaim from './pages/farmer/SubmitClaim';
import FarmerClaims from './pages/farmer/Claims';
import FarmerWallet from './pages/farmer/Wallet';
import FarmerProfile from './pages/farmer/Profile';
import OfficerDashboard from './pages/OfficerDashboard';
import OfficerLayout from './components/OfficerLayout';
import FarmerLayout from './components/FarmerLayout';
import Funds from './pages/officer/Funds';
import Analytics from './pages/officer/Analytics';
import ClaimsList from './pages/officer/ClaimsList';
import AuditLogs from './pages/officer/AuditLogs';
import ClaimReview from './pages/ClaimReview';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

import Schemes from './pages/farmer/Schemes';
import MySchemeApplications from './pages/farmer/MySchemeApplications';
import OfficerSchemeReview from './pages/OfficerSchemeReview';

function AppContent() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <PageLoader show={loading} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth-selection" element={<AuthSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/officer/register" element={<OfficerRegister />} />

        {/* Farmer Routes */}
        <Route path="/farmer" element={
          <ProtectedRoute role="farmer">
            <FarmerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<FarmerDashboard />} />
          <Route path="submit-claim" element={<SubmitClaim />} />
          <Route path="claims" element={<FarmerClaims />} />
          <Route path="wallet" element={<FarmerWallet />} />
          <Route path="profile" element={<FarmerProfile />} />
          <Route path="schemes" element={<Schemes />} />
          <Route path="schemes/my-applications" element={<MySchemeApplications />} />
        </Route>

        {/* Officer Routes */}
        <Route path="/officer" element={
          <ProtectedRoute role="officer">
            <OfficerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<OfficerDashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="funds" element={<Funds />} />
          <Route path="claims" element={<ClaimsList />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="claims/:id" element={<ClaimReview />} />
          <Route path="schemes" element={<OfficerSchemeReview />} />
        </Route>

        {/* Catch All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
