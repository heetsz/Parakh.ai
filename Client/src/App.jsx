import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import Interviews from './pages/dashboard/Interviews';
import Progress from './pages/dashboard/Progress';
import Community from './pages/dashboard/Community';
import Gamification from './pages/dashboard/Gamification';
import StudyMaterialLeetcode from './pages/dashboard/StudyMaterialLeetcode';
import StudyMaterialStrivers from './pages/dashboard/StudyMaterialStrivers';
import Settings from './pages/dashboard/Settings';
import VerifyEmail from './pages/VerifyEmail';
import { NotificationProvider } from '@/components/ui/notification';
import Landing from './pages/Landing';

const App = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const base_url = import.meta.env.VITE_BACKEND_URL;
    const checkToken = async () => {
      try {
        const res = await axios.get(`${base_url}/me`, { withCredentials: true });
        const email = res.data?.email;
        if (email) localStorage.setItem('email', email);
        setToken(res.status === 200);
      } catch {
        setToken(false);
      }
    };
    checkToken();

    // Recheck token every hour
    const interval = setInterval(checkToken, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
        <Route
          path="/"
          element={<Landing />}
        />
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" replace /> : <Register />}
        />
          <Route path="/verify-email" element={token ? <Navigate to="/dashboard" replace /> : <VerifyEmail />} />

        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" replace />}
        >
          {/* Default to Interviews when opening dashboard */}
          <Route index element={<Navigate to="interviews" replace />} />
          <Route path="interviews" element={<Interviews />} />
          <Route path="progress" element={<Progress />} />
          <Route path="community" element={<Community />} />
          <Route path="gamification" element={<Gamification />} />
          <Route path="study-material/leetcode" element={<StudyMaterialLeetcode />} />
          <Route path="study-material/strivers-sheet" element={<StudyMaterialStrivers />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
};

export default App;
