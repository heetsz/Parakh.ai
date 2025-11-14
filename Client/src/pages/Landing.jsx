import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Users,
  TrendingUp,
  MessageSquare,
  Trophy,
  BookOpen,
  Code,
  GalleryVerticalEnd,
  CheckCircle,
  Sparkles,
  Target,
  Zap,
  Shield,
  ArrowRight
} from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

const Landing = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/me`, {
        withCredentials: true
      });
      setIsAuthenticated(true);
      setUser(response.data);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('username');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="min-h-screen"
      style={{ fontFamily: "'Oswald', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/mainlogo.png" alt="Parakh.ai" className="h-16 mt-2 w-auto object-contain" />
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Button 
                    className="bg-[#DFFF00] text-black hover:bg-[#c7e600] font-medium transition-colors" 
                    onClick={() => navigate('/dashboard/interviews')}
                  >
                    Dashboard
                  </Button>
                  <div className="relative group">
                    <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-white/20 hover:ring-[#DFFF00] transition-all">
                      <AvatarImage src={user?.image} alt={user?.name} />
                      <AvatarFallback className="bg-white/10 text-white font-semibold">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:bg-white/10 border border-gray-400/30"
                    onClick={() => {
                      navigate('/login');
                      setTimeout(() => window.location.reload(), 100);
                    }}
                  >
                    Log In
                  </Button>
                  <Button
                    className="bg-[#DFFF00] text-black hover:bg-[#c7e600] font-medium transition-colors"
                    onClick={() => {
                      navigate('/register');
                      setTimeout(() => window.location.reload(), 100);
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video */}
      <section className="hero-with-video">
        {/* Video Container */}
        <div className="video-container">
          <video autoPlay loop muted playsInline>
            <source src="/bgvideo.mp4" type="video/mp4" />
          </video>
          <div className="video-fade-overlay"></div>
        </div>

        {/* Hero Content */}
        <div className="hero-content-wrapper container mx-auto px-6 py-24 md:py-32 flex items-center min-h-screen">
          <div className="max-w-2xl ml-0 md:ml-8 lg:ml-16 space-y-5">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              {isAuthenticated ? (
                <>
                  Welcome back, <span className="bg-linear-to-r from-[#DFFF00] to-[#c7e600] bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>
                  <span className="block mt-1">Keep Practicing</span>
                </>
              ) : (
                <>
                  Master Your <span className="bg-linear-to-r from-[#DFFF00] to-[#c7e600] bg-clip-text text-transparent">Interview Skills</span> With <span className="bg-linear-to-r from-[#DFFF00] to-white bg-clip-text text-transparent">AI</span>
                </>
              )}
            </h1>
            <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-xl">
              {isAuthenticated ? (
                "Continue your journey to ace your next technical interview with personalized AI feedback and practice."
              ) : (
                <>
                  Ace your next technical interview with <span className="text-[#DFFF00] font-medium">AI-powered</span> mock interviews, real-time feedback, and personalized practice sessions designed to boost your confidence.
                </>
              )}
            </p>
            <div className="flex items-center gap-3 pt-4">
              {isAuthenticated ? (
                <>
                  <Button
                    size="lg"
                    className="bg-[#DFFF00] text-black hover:bg-[#c7e600] font-medium transition-colors"
                    onClick={() => navigate('/dashboard/interviews')}
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    className="bg-transparent text-gray-300 border border-gray-400/30 hover:bg-white/10 transition-colors"
                    onClick={() => navigate('/dashboard/community')}
                  >
                    Visit Community
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="bg-[#DFFF00] text-black hover:bg-[#c7e600] font-medium transition-colors"
                    onClick={() => navigate('/register')}
                  >
                    Start Practicing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    className="bg-transparent text-gray-300 border border-gray-400/30 hover:bg-white/10 transition-colors"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Landing;