import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Star, Play } from 'lucide-react';

export default function Hero() {
  return (
  <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-white">
              The Intelligent Solution for
              <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Interview Preparation</span>
            </h1>
            <p className="text-xl text-purple-200">
              Master your interview skills with AI-powered mock interviews. Get real-time feedback and track your progress to land your dream job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg rounded-full">
                Get Started Free
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white bg-transparent hover:bg-white/10 text-lg rounded-full">
                Watch Demo
              </Button>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-purple-200">Based on 100+ reviews</span>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-purple-400/30" style={{ height: '600px' }}>
              <iframe 
                src='https://my.spline.design/nexbotrobotcharacterconcept-qhEBuPNx56pVQ61PXN0cpozq/' 
                frameBorder='0' 
                width='100%' 
                height='100%'
                className="rounded-2xl"
                title="3D Robot Model"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
