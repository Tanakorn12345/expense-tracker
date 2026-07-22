import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import History from './pages/History';
import Savings from './pages/Savings';
import CoPayCalculator from './pages/CoPayCalculator';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserTransactions from './pages/AdminUserTransactions';
import AdminAds from './pages/AdminAds';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/auth.css';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-transaction" element={<AddTransaction />} />
        <Route path="/history" element={<History />} />
        <Route path="/savings" element={<Savings />} />
        <Route path="/calculator" element={<CoPayCalculator />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/ads" element={<AdminAds />} />
        <Route path="/admin/users/:id" element={<AdminUserTransactions />} />
          {/* Redirect unknown routes to dashboard or login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
