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

  const features = [
    {
      icon: Users,
      title: "AI-Powered Interviews",
      description: "Practice with our intelligent interview bot that adapts to your responses and provides real-time feedback."
    },
    {
      icon: TrendingUp,
      title: "Track Your Progress",
      description: "Monitor your improvement with detailed analytics and performance metrics across all practice sessions."
    },
    {
      icon: MessageSquare,
      title: "Community Hub",
      description: "Connect with fellow learners, share resources, and collaborate on your journey to success."
    },
    {
      icon: Trophy,
      title: "Gamification",
      description: "Stay motivated with achievements, leaderboards, and rewards as you complete challenges."
    },
    {
      icon: BookOpen,
      title: "Comprehensive Study Material",
      description: "Access curated resources including LeetCode questions and Striver's Sheet for structured learning."
    },
    {
      icon: GalleryVerticalEnd,
      title: "System Design Board",
      description: "Master system design with interactive whiteboard and collaborative problem-solving tools."
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: "Personalized Learning",
      text: "AI adapts to your skill level and learning pace"
    },
    {
      icon: Zap,
      title: "Real-time Feedback",
      text: "Get instant evaluation and improvement suggestions"
    },
    {
      icon: Shield,
      title: "Industry-Ready",
      text: "Practice with real-world interview scenarios"
    }
  ];

  const stats = [
    { value: "10K+", label: "Practice Sessions" },
    { value: "5K+", label: "Active Users" },
    { value: "95%", label: "Success Rate" },
    { value: "24/7", label: "AI Availability" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <GalleryVerticalEnd className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Parakh.ai</span>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" onClick={() => navigate('/dashboard/interviews')}>
                    Dashboard
                  </Button>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden md:block">{user?.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button onClick={() => navigate('/register')}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Interview Preparation
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            {isAuthenticated ? (
              <>Welcome back, {user?.name?.split(' ')[0]}! <span className="text-primary">Keep Practicing</span></>
            ) : (
              <>Master Your Interview Skills with{' '}<span className="text-primary">AI Guidance</span></>
            )}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {isAuthenticated ? (
              "Continue your journey to ace your next technical interview with personalized AI feedback and practice."
            ) : (
              "Practice with our intelligent AI interviewer, track your progress, and join a community of learners preparing for their dream tech roles."
            )}
          </p>
          <div className="flex items-center justify-center gap-4 pt-6">
            {isAuthenticated ? (
              <>
                <Button size="lg" onClick={() => navigate('/dashboard/interviews')}>
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/dashboard/community')}>
                  Visit Community
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate('/register')}>
                  Start Practicing Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/50 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive tools and resources to prepare you for any technical interview
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Parakh.ai?</h2>
              <p className="text-muted-foreground text-lg">
                Experience the future of interview preparation
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Only show for non-authenticated users */}
      {!isAuthenticated && (
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Get Started in Minutes</h2>
              <p className="text-muted-foreground text-lg">
                Simple steps to begin your journey to interview success
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Sign Up", desc: "Create your free account in seconds" },
                { step: "02", title: "Choose Topic", desc: "Select from various interview categories" },
                { step: "03", title: "Start Practicing", desc: "Begin your AI-powered interview sessions" }
              ].map((item, index) => (
                <div key={index} className="text-center relative">
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                  )}
                  <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="border-y bg-primary/5 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {isAuthenticated ? (
              <>
                <h2 className="text-4xl font-bold">Continue Your Practice Journey</h2>
                <p className="text-xl text-muted-foreground">
                  Access all your interviews, track progress, and connect with the community
                </p>
                <div className="flex items-center justify-center gap-4 pt-6">
                  <Button size="lg" onClick={() => navigate('/dashboard/interviews')}>
                    Start New Interview
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/dashboard/progress')}>
                    View Progress
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold">Ready to Ace Your Next Interview?</h2>
                <p className="text-xl text-muted-foreground">
                  Join thousands of successful candidates who prepared with Parakh.ai
                </p>
                <div className="flex items-center justify-center gap-4 pt-6">
                  <Button size="lg" onClick={() => navigate('/register')}>
                    Start Free Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    No credit card required
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Free forever plan
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <GalleryVerticalEnd className="h-5 w-5 text-primary" />
              <span className="font-semibold">Parakh.ai</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 Parakh.ai. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;