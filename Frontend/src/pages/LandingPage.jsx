import React from 'react';
import Navbar from '@/components/Landing/Navbar';
import Hero from '@/components/Landing/Hero';
import Features from '@/components/Landing/Features';
import Testimonials from '@/components/Landing/Testimonials';
import Footer from '@/components/Landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      {/* Demo section kept inside Hero/Features flow or could be another component if needed */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">See It In Action</h2>
            <p className="text-xl text-purple-200">Watch how Parakh.AI transforms your interview preparation</p>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="aspect-video bg-linear-to-br from-purple-800/50 to-indigo-800/50 rounded-2xl border-2 border-purple-400/50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white text-purple-900 rounded-full text-lg px-8 py-6">Watch Demo Video</div>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Land Your Dream Job?</h2>
          <p className="text-xl text-purple-200 mb-8">Start practicing with AI-powered mock interviews today</p>
          <div className="inline-block bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg rounded-full px-8 py-6 text-white">Get Started Free</div>
        </div>
      </section>

      <Footer />
    </div>
  );
}