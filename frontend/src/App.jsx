import AIChat from './components/AIChat';
import GdprRequests from './pages/GdprRequests';
import AuditLog from './pages/AuditLog';
import ProfileSettings from './pages/ProfileSettings';
import NotificationWidget from './components/NotificationWidget';
import FeedbackForm from './components/FeedbackForm';
import CampaignsReport from './pages/CampaignsReport';
import CampaignsAdmin from './pages/CampaignsAdmin';
import AdminDashboard from './pages/AdminDashboard';
import Help from './pages/Help';
import Onboarding from './pages/Onboarding';
import Register from './pages/Register';
import Login from './pages/Login';
import BikeDetail from './pages/BikeDetail';
import Bikes from './pages/Bikes';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Profile from './pages/Profile';


import React, { useState } from 'react';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import posthog from 'posthog-js';
import ReactGA from 'react-ga4';
import { BrowserRouter as Router, Link, Routes, Route, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { useAuth } from './context/AuthContext';
import viteLogo from '/vite.svg';
import reactLogo from './assets/react.svg';

ReactGA.initialize('G-XXXXXXXXXX'); // TODO: nahraďte vlastním GA4 měřicím ID

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <nav className="flex flex-wrap gap-4 p-4 bg-primary-dark text-white items-center justify-between">
      <div className="flex gap-4 items-center">
        <Link to="/" className="hover:underline font-bold">Domů</Link>
        {user && <Link to="/bikes" className="hover:underline">Moje kola</Link>}
        {user && <Link to="/profile" className="hover:underline">Profil</Link>}
        {user && <Link to="/ai-chat" className="hover:underline">AI chat</Link>}
        {user && (user.role === 'admin' || user.role === 'mechanic') && <>
          <Link to="/admin" className="hover:underline">Admin dashboard</Link>
          <Link to="/admin/campaigns" className="hover:underline">Kampaně</Link>
          <Link to="/admin/campaigns-report" className="hover:underline">Přehled kampaní</Link>
          <Link to="/admin/audit-log" className="hover:underline">Audit log</Link>
          <Link to="/admin/gdpr-requests" className="hover:underline">GDPR</Link>
        </>}
        {!user && <Link to="/login" className="hover:underline">Přihlášení</Link>}
        {!user && <Link to="/register" className="hover:underline">Registrace</Link>}
      </div>
      <div className="flex items-center gap-2">
        {user && <span className="ml-2">Přihlášen: <b>{user.name}</b></span>}
        {user && <Button variant="outlined" color="inherit" size="small" onClick={handleLogout} className="ml-2">Odhlásit</Button>}
      </div>
    </nav>
  );
}

function App() {
  const [count, setCount] = useState(0)


  React.useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname + window.location.search });
    posthog.capture('$pageview');
  }, []);

  // Ukázka: zachycení klíčových akcí (doplnit do příslušných handlerů v komponentách)
  // posthog.capture('registrace', { email: ... });
  // posthog.capture('login', { email: ... });
  // posthog.capture('vytvoreni_servisni_zadosti', { ... });
  // posthog.capture('onboarding_dokonceno');
  // posthog.capture('ai_chat_dotaz', { dotaz: ... });
  // posthog.capture('export_dat');
  // posthog.capture('zobrazeni_analytiky');
  // posthog.capture('gamifikace_odmena');

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Veřejné stránky */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/help" element={<Help />} />

        {/* Uživatelské stránky (pouze pro přihlášené) */}
        <Route path="/bikes" element={
          <PrivateRoute><Bikes /></PrivateRoute>
        } />
        <Route path="/bikes/:id" element={
          <PrivateRoute><BikeDetail /></PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute><Profile /></PrivateRoute>
        } />
        <Route path="/profile/settings" element={
          <PrivateRoute><ProfileSettings /></PrivateRoute>
        } />
        <Route path="/ai-chat" element={
          <PrivateRoute><AIChat /></PrivateRoute>
        } />

        {/* Admin/technik stránky */}
        <Route path="/admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />
        <Route path="/admin/campaigns" element={
          <AdminRoute><CampaignsAdmin /></AdminRoute>
        } />
        <Route path="/admin/campaigns-report" element={
          <AdminRoute><CampaignsReport /></AdminRoute>
        } />
        <Route path="/admin/audit-log" element={
          <AdminRoute><AuditLog /></AdminRoute>
        } />
        <Route path="/admin/gdpr-requests" element={
          <AdminRoute><GdprRequests /></AdminRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App
