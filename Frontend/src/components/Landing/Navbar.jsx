import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Sparkles, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // smooth scroll helper
  const handleNavClick = (e, id) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-purple-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-linear-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Parakh.AI</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="text-white hover:text-purple-300 transition-colors">Home</a>
            <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="text-white hover:text-purple-300 transition-colors">Features</a>
            <a href="#demo" onClick={(e) => handleNavClick(e, 'demo')} className="text-white hover:text-purple-300 transition-colors">Demo</a>
            <a href="#testimonials" onClick={(e) => handleNavClick(e, 'testimonials')} className="text-white hover:text-purple-300 transition-colors">Testimonials</a>
            <Button variant="ghost" className="text-white hover:text-purple-300 hover:bg-purple-800 rounded-full">
              Login
            </Button>
            <Button className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full">
              Sign Up
            </Button>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isMenuOpen && (
            <div className="md:hidden py-4 space-y-3">
            <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="block text-white hover:text-purple-300 transition-colors">Home</a>
            <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="block text-white hover:text-purple-300 transition-colors">Features</a>
            <a href="#demo" onClick={(e) => handleNavClick(e, 'demo')} className="block text-white hover:text-purple-300 transition-colors">Demo</a>
            <a href="#testimonials" onClick={(e) => handleNavClick(e, 'testimonials')} className="block text-white hover:text-purple-300 transition-colors">Testimonials</a>
            <Button variant="ghost" className="w-full text-white hover:bg-purple-800 rounded-full">Login</Button>
            <Button className="w-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full">Sign Up</Button>
          </div>
        )}
      </div>
    </nav>
  );
}
