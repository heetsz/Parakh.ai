import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';

import Interviews from './pages/dashboard/Interviews';
import InterviewLive from './pages/dashboard/InterviewLive';

import Progress from './pages/dashboard/Progress';
import InterviewProgress from './pages/dashboard/InterviewProgress';
import OAProgress from './pages/dashboard/OAProgress';
import Community from './pages/dashboard/Community';

import Settings from './pages/dashboard/Settings';

import VerifyEmail from './pages/VerifyEmail';
import Landing from './pages/Landing';

import { NotificationProvider } from '@/components/ui/notification';
import { Spinner } from '@/components/ui/spinner';

import SystemDesignBoard from './pages/dashboard/SystemDesignBoard';
import OAPrep from './pages/dashboard/OAPrep'; // kept from quiz branch

const AnimatedRoutes = ({ token }) => {
  return (
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        <Route
          path="/verify-email"
          element={token ? <Navigate to="/dashboard" replace /> : <VerifyEmail />}
        />

        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" replace />}
        >
          {/* Default route */}
          <Route index element={<Navigate to="interviews" replace />} />

          {/* Interview Routes */}
          <Route path="interviews" element={<Interviews />} />
          <Route path="interviews/live/:id" element={<InterviewLive />} />

          {/* Other Pages */}
          <Route path="progress" element={<Progress />} />
          <Route path="progress/interview" element={<InterviewProgress />} />
          <Route path="progress/oa" element={<OAProgress />} />
          <Route path="community" element={<Community />} />

          {/* Additional Modules */}
          <Route path="oa-prep" element={<OAPrep />} />
          <Route path="system-design" element={<SystemDesignBoard />} />

          {/* Settings */}
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
  );
};

const App = () => {
  const [token, setToken] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const base_url = import.meta.env.VITE_BACKEND_URL;

    const checkToken = async () => {
      try {
        const res = await axios.get(`${base_url}/me`, { withCredentials: true });
        const username = res.data?.username;
        if (username) localStorage.setItem('username', username);
        setToken(res.status === 200);
      } catch {
        setToken(false);
      } finally {
        setAuthChecked(true);
      }
    };

    checkToken();

    // Recheck token every hour
    const interval = setInterval(checkToken, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationProvider>
      <div style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
        {!authChecked ? (
          <div className="flex h-screen items-center justify-center">
            <Spinner className="size-6 text-white" />
          </div>
        ) : (
          <BrowserRouter>
            <AnimatedRoutes token={token} />
          </BrowserRouter>
        )}
      </div>
    </NotificationProvider>
  );
};

export default App;
