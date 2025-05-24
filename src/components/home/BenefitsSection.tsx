
import React from "react";
import { motion } from "framer-motion";
import { Clock, LayoutGrid, BarChart3, Users } from "lucide-react";

const benefits = [
  {
    icon: <Clock className="h-6 w-6 text-brand-purple" />,
    title: "Learn Faster",
    description: "Stop wasting time on irrelevant content. Our AI structures learning exactly for your needs."
  },
  {
    icon: <LayoutGrid className="h-6 w-6 text-brand-pink" />,
    title: "Structured Approach",
    description: "Follow a clear step-by-step path designed to build your knowledge systematically."
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-brand-gold" />,
    title: "Measurable Progress",
    description: "Track your learning journey with clear milestones and completion metrics."
  },
  {
    icon: <Users className="h-6 w-6 text-brand-purple" />,
    title: "Learn Any Subject",
    description: "From technical skills to creative pursuits, LearnFlow adapts to any topic you want to master."
  }
];

const BenefitsSection = () => {
  return (
    <section className="w-full py-24 relative">
      {/* Clean, subtle background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSJyZ2JhKDEyOCwxMjgsMTI4LDAuMSkiPjxwYXRoIGQ9Ik0wIDBoNDBNMCA0MGg0ME00MCAwdjQwTTAgMHY0MCIgc3Ryb2tlPSJyZ2JhKDEyOCwxMjgsMTI4LDAuMikiIHN0cm9rZS13aWR0aD0iMSIvPjwvZz48L3N2Zz4=')]"></div>
      
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <span className="bg-brand-purple/10 text-brand-purple px-4 py-1.5 rounded-full font-medium inline-block mb-3 text-sm">WHY CHOOSE US</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Transform Your Learning Journey</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            LearnFlow gives you the tools to master any subject through personalized, AI-powered learning experiences.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index} 
              className="flex gap-5"
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 * index, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="mt-1 bg-gray-50 rounded-full p-3.5 border border-gray-100 h-fit shadow-sm">
                {benefit.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
