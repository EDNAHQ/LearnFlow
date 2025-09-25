import React from 'react';
import { Star, Quote } from 'lucide-react';

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Tech Corp",
      content: "LearnFlow transformed how I approach learning new technologies. The AI-generated paths are incredibly intuitive and saved me months of self-study time.",
      rating: 5,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
      name: "Michael Rodriguez",
      role: "Data Scientist",
      company: "Analytics Pro",
      content: "The personalized learning paths helped me transition from traditional analytics to machine learning. The progression was perfect for my pace.",
      rating: 5,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
    },
    {
      name: "Emily Johnson",
      role: "Product Manager",
      company: "StartupX",
      content: "As a PM, I needed to understand technical concepts quickly. LearnFlow's adaptive learning made complex topics accessible and engaging.",
      rating: 5,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"
    }
  ];

  return (
    <div className="py-32 px-6 bg-[#0b0c18] relative overflow-hidden">

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
            <Star className="w-4 h-4 text-[#f2b347]" />
            <span className="text-sm font-medium text-white">Success Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Loved by <span className="text-gradient">50,000+ Learners</span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto font-light">
            Join thousands who have accelerated their learning journey with our AI-powered platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-[#6654f5] mb-4" />

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#f2b347] text-[#f2b347]" />
                ))}
              </div>

              <p className="text-white/80 font-light mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full bg-white/10"
                />
                <div>
                  <div className="font-medium text-white">{testimonial.name}</div>
                  <div className="text-sm text-white/60">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-gradient mb-2">98%</div>
            <div className="text-white/60">Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gradient mb-2">4.9/5</div>
            <div className="text-white/60">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gradient mb-2">3x</div>
            <div className="text-white/60">Faster Learning</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gradient mb-2">24/7</div>
            <div className="text-white/60">AI Support</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;

