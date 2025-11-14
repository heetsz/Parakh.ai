import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
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
  ArrowRight,
  LogOut
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
    <div className="min-h-screen" style={{ fontFamily: "'Oswald', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/logo.png" alt="Parakh.ai" className="h-24     w-auto" />
            </div>
            <div className="flex items-center gap-4 mb-15">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => navigate('/dashboard/interviews')}>
                    Dashboard
                  </Button>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-white hidden md:block">{user?.name}</span>
                  </div>
                  <Button variant="ghost" className="text-white hover:bg-white/10" size="icon" onClick={handleLogout} title="Logout">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => navigate('/login')}>
                    Log In
                  </Button>
                  <Button className="bg-white text-purple-600 hover:bg-white/90 rounded-full px-8 py-2 font-medium" onClick={() => navigate('/register')}>
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
                <>Welcome back, {user?.name?.split(' ')[0]}! <span className="block mt-1">Keep Practicing</span></>
              ) : (
                <>Master Your Interview Skills <span className="block mt-1">With AI</span></>
              )}
            </h1>
            <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-xl">
              {isAuthenticated ? (
                "Continue your journey to ace your next technical interview with personalized AI feedback and practice."
              ) : (
                "Ace your next technical interview with AI-powered mock interviews, real-time feedback, and personalized practice sessions designed to boost your confidence."
              )}
            </p>
            <div className="flex items-center gap-3 pt-4">
              {isAuthenticated ? (
                <>
                  <Button size="lg" className="btn-modern-purple" onClick={() => navigate('/dashboard/interviews')}>
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" className="btn-modern-hollow" onClick={() => navigate('/dashboard/community')}>
                    Visit Community
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" className="btn-modern-purple" onClick={() => navigate('/register')}>
                    Start Practicing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" className="btn-modern-hollow" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;