import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Target, TrendingUp, Zap } from 'lucide-react';

const features = [
  { icon: <Sparkles className="w-6 h-6" />, title: 'AI-Powered Interviews', description: 'Experience realistic interview simulations powered by advanced AI technology' },
  { icon: <Target className="w-6 h-6" />, title: 'Real-time Feedback', description: 'Get instant feedback on your technical and behavioral responses' },
  { icon: <TrendingUp className="w-6 h-6" />, title: 'Track Your Progress', description: 'Monitor your improvement with detailed analytics and insights' },
  { icon: <Zap className="w-6 h-6" />, title: 'Voice & Video Analysis', description: 'Practice with live transcription and full-screen interview mode' },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Powerful Features</h2>
          <p className="text-xl text-gray-600">Everything you need to ace your interviews</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-linear-to-br from-purple-50 to-indigo-50 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
