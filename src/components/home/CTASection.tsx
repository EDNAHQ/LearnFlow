
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Award, BrainCircuit, Users } from "lucide-react";

const highlights = [
  { icon: <CheckCircle2 className="h-6 w-6 text-brand-purple mx-auto mb-2" />, text: "No Credit Card Required" },
  { icon: <Award className="h-6 w-6 text-brand-pink mx-auto mb-2" />, text: "High-Quality Content" },
  { icon: <BrainCircuit className="h-6 w-6 text-brand-gold mx-auto mb-2" />, text: "Advanced AI Technology" },
  { icon: <Users className="h-6 w-6 text-brand-purple mx-auto mb-2" />, text: "Growing Community" }
];

const CTASection = () => {
  return (
    <section className="w-full py-16 md:py-20 relative overflow-hidden">
      <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand-purple/5 blur-3xl"></div>
      <div className="container text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm rounded-2xl p-10 border border-gray-100 shadow-brand"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start your personalized learning journey today and see the difference AI-powered education can make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-brand-purple hover:bg-brand-purple/90 border-none px-8 py-6 text-lg shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Start Learning Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="mt-16 grid md:grid-cols-4 gap-5 text-center">
            {highlights.map((item, index) => (
              <motion.div 
                key={index} 
                className="p-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                viewport={{ once: true }}
              >
                {item.icon}
                <p className="text-gray-600">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
