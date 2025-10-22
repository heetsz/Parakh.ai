import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Priya Sharma', role: 'Software Engineer at Google', content: 'Parakh.AI helped me ace my technical interviews. The AI feedback was incredibly detailed and helped me improve my communication skills.', rating: 5 },
  { name: 'Rahul Verma', role: 'Product Manager at Microsoft', content: 'The mock interviews felt so real! This platform gave me the confidence I needed to succeed in my actual interviews.', rating: 5 },
  { name: 'Ananya Krishnan', role: 'Data Scientist at Amazon', content: 'Best interview prep tool out there. The progress tracking feature helped me identify my weak areas and work on them systematically.', rating: 5 },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">What Our Users Say</h2>
          <p className="text-xl text-gray-600">Join thousands of successful candidates</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <Card key={i} className="bg-linear-to-br from-purple-50 to-indigo-50 border-purple-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="flex space-x-1">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{t.content}"</p>
                <div className="pt-4 border-t border-purple-200">
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  <div className="text-sm text-gray-600">{t.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
