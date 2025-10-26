import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/landingpage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Interviews from './pages/Interviews';
import Progress from './pages/Progress';
import axios from 'axios';

const App = () => {
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    const base_url = import.meta.env.VITE_BACKEND_URL;

    const checkToken = async () => {
      try {
        const res = await axios.get(`${base_url}/me`, { withCredentials: true });
        const email = res.data?.email;
        if (email) localStorage.setItem('email', email);
        setTokenValid(res.status === 200);
      } catch {
        setTokenValid(false);
      }
    };

    checkToken();
    const interval = setInterval(checkToken, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (tokenValid === null) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={tokenValid ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={tokenValid ? <Navigate to="/dashboard" replace /> : <Register />} />

        <Route path="/dashboard" element={tokenValid ? <Dashboard /> : <Navigate to="/login" replace />}>
          {/* index acts as default path */}
          <Route index element={<Navigate to="interviews" replace />} />   
          <Route path="interviews" element={<Interviews />} />
          <Route path="progress" element={<Progress />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
