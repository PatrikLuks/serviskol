import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react'
import Button from '@mui/material/Button';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Bikes from './pages/Bikes';
import BikeDetail from './pages/BikeDetail';
import Onboarding from './pages/Onboarding';
import Help from './pages/Help';
import AdminDashboard from './pages/AdminDashboard';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import FeedbackForm from './components/FeedbackForm';
import NotificationWidget from './components/NotificationWidget';
import ProfileSettings from './pages/ProfileSettings';
import AuditLog from './pages/AuditLog';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <nav className="flex gap-4 p-4 bg-primary-dark text-white items-center">
      <Link to="/" className="hover:underline">Domů</Link>
      {user && <Link to="/bikes" className="hover:underline">Moje kola</Link>}
      {!user && <Link to="/login" className="hover:underline">Přihlášení</Link>}
      {!user && <Link to="/register" className="hover:underline">Registrace</Link>}
      {user && <span className="ml-4">Přihlášen: <b>{user.name}</b></span>}
      {user && <Button variant="outlined" color="inherit" size="small" onClick={handleLogout} className="ml-2">Odhlásit</Button>}
    </nav>
  );
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="text-4xl font-bold mb-6">Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-white">
        <p className="mb-4">Toto je ukázka zeleného layoutu s TailwindCSS a MUI.</p>
        <Button variant="contained" color="success">
          MUI tlačítko
        </Button>
        <div className="mt-8 p-4 bg-primary-light rounded shadow">
          <span className="text-primary-dark font-semibold">Tailwind zelená komponenta</span>
        </div>
      </div>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/bikes" element={
          <PrivateRoute>
            <Bikes />
          </PrivateRoute>
        } />
        <Route path="/bikes/:id" element={
          <PrivateRoute>
            <BikeDetail />
          </PrivateRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/help" element={<Help />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/notifications" element={<NotificationWidget />} />
        <Route path="/profile/settings" element={<ProfileSettings />} />
        <Route path="/admin/audit-log" element={<AuditLog />} />
      </Routes>
    </Router>
  );
}

export default App
