import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { TemplateProvider } from './context/TemplateContext';
import { SearchProvider } from './context/SearchContext';

import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import TemplateDashboard from './components/TemplateDashboard';
import TemplateBuilder from './components/TemplateBuilder';
import AdminPanel from './pages/AdminPanel';
import TemplateLibrary from './pages/TemplateLibrary';
import Database from './pages/Database';
import InviteMembers from './pages/InviteMembers';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import MyProfile from './pages/MyProfile';
import AccountSettings from './pages/AccountSettings';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Main App Shell with Sidebar and TopNav
const AppShell = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <TemplateProvider>
      <SearchProvider>
        <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
        {!isAdminRoute && <Sidebar />}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: isAdminRoute ? '0' : '256px', width: isAdminRoute ? '100%' : 'calc(100% - 256px)' }}>
          <TopNav onMenuClick={() => {}} fullWidth={isAdminRoute} />
          <main style={{ flex: 1, overflowY: 'auto', marginTop: '64px', backgroundColor: 'var(--surface)' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/templates" element={<TemplateLibrary />} />
              <Route path="/templates/new" element={<TemplateBuilder />} />
              <Route path="/templates/:id/edit" element={<TemplateBuilder />} />
              <Route path="/templates/:id" element={<TemplateDashboard />} />
              <Route path="/invite" element={<InviteMembers />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/profile" element={<MyProfile />} />
              <Route path="/settings" element={<AccountSettings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
      </SearchProvider>
    </TemplateProvider>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
