
import React from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Sparkles, Lightbulb } from "lucide-react";

const features = [
  {
    icon: <BrainCircuit className="h-8 w-8 text-brand-gold" />,
    title: "AI-Generated Learning Plans",
    description: "Our AI analyzes your topic and creates a structured learning path tailored to your needs."
  },
  {
    icon: <Sparkles className="h-8 w-8 text-brand-pink" />,
    title: "Personalized Content",
    description: "Get comprehensive, easy-to-understand content for each step of your learning journey."
  },
  {
    icon: <Lightbulb className="h-8 w-8 text-brand-purple" />,
    title: "Track Your Progress",
    description: "Save and revisit your learning projects anytime, tracking your progress as you go."
  }
];

const FeaturesSection = () => {
  return (
    <section className="w-full py-24 bg-gray-50 relative overflow-hidden">
      {/* Clean background with no decorative elements */}
      
      <div className="container relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-brand-purple font-medium text-sm tracking-wider uppercase mb-3 block">How It Works</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Learn Faster with AI</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Our AI-powered platform transforms the way you learn by creating personalized learning experiences.</p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (index * 0.2), duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-100 rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
