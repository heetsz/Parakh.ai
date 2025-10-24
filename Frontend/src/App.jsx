import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/landingpage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import axios from 'axios';

const App = () => {
  const [tokenValid, setTokenValid] = useState(null); // null = loading, true/false = result

useEffect(() => {
  const base_url = import.meta.env.VITE_BACKEND_URL;

  const checkToken = async () => {
    try {
      const res = await axios.get(`${base_url}/me`, { withCredentials: true });
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
        <Route path="/" element={tokenValid ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={tokenValid ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={tokenValid ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/dashboard" element={tokenValid ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
