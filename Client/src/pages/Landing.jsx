import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Zap, 
  Award,
  ChevronRight,
  CheckCircle,
  Sparkles,
  Code,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Interviews",
      description: "Practice with advanced AI that adapts to your skill level and provides real-time feedback"
    },
    {
      icon: TrendingUp,
      title: "Track Your Progress",
      description: "Comprehensive analytics to monitor your improvement across multiple dimensions"
    },
    {
      icon: Target,
      title: "Personalized Learning",
      description: "Get customized recommendations based on your strengths and areas for improvement"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with peers, share experiences, and learn from the community"
    },
    {
      icon: Code,
      title: "Technical Excellence",
      description: "Master data structures, algorithms, and system design with guided practice"
    },
    {
      icon: Award,
      title: "Gamification",
      description: "Earn achievements, unlock rewards, and stay motivated throughout your journey"
    }
  ];

  const stats = [
    { number: "10K+", label: "Practice Interviews" },
    { number: "95%", label: "Success Rate" },
    { number: "500+", label: "Active Users" },
    { number: "4.9/5", label: "User Rating" }
  ];

  const benefits = [
    "Real-time AI feedback on communication and technical skills",
    "Detailed performance analytics with actionable insights",
    "Industry-standard interview questions across all difficulty levels",
    "Voice-based interviews for realistic practice",
    "Progress tracking with beautiful visualizations",
    "Community-driven learning and support"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Parakh.ai
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="text-gray-300 hover:text-white hover:bg-gray-800"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Interview Preparation Platform</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              Master Your
              <span className="block bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Interview Skills
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Practice with AI, track your progress, and land your dream job. 
              Get real-time feedback, personalized insights, and comprehensive analytics.
            </p>
            
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button 
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white text-lg px-8 py-6 h-auto"
              >
                Start Practicing Free
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white text-lg px-8 py-6 h-auto"
              >
                Sign In
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">Powerful Features</h2>
            <p className="text-xl text-gray-400">Everything you need to ace your interviews</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">
                Why Choose
                <span className="block bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Parakh.ai?
                </span>
              </h2>
              <p className="text-xl text-gray-400">
                We combine cutting-edge AI technology with proven interview techniques to help you succeed.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button 
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white mt-8"
              >
                Get Started Now
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 blur-3xl"></div>
              <Card className="relative bg-gray-800/50 border-gray-700 overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">AI Interview</div>
                      <div className="text-lg font-semibold">Live Session</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700/50">
                      <span className="text-gray-300">Communication</span>
                      <span className="text-green-400 font-semibold">85%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700/50">
                      <span className="text-gray-300">Technical Skills</span>
                      <span className="text-blue-400 font-semibold">92%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700/50">
                      <span className="text-gray-300">Problem Solving</span>
                      <span className="text-purple-400 font-semibold">88%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <BarChart3 className="w-4 h-4" />
                    <span>Real-time performance tracking</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-900/20 to-blue-900/20 border-y border-gray-800">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl text-gray-400">
            Join thousands of successful candidates who improved their skills with Parakh.ai
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white text-lg px-8 py-6 h-auto"
            >
              Start Your Free Trial
              <Zap className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-green-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Parakh.ai
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 Parakh.ai. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <button className="hover:text-white transition-colors">Terms of Service</button>
              <button className="hover:text-white transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;