
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TopicInput from "@/components/TopicInput";
import { MainNav } from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Book, BrainCircuit, Lightbulb, Sparkles } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (topic: string) => {
    setLoading(true);
    
    // Store the topic in sessionStorage
    sessionStorage.setItem("learn-topic", topic);
    
    // Navigate to the plan page after a short delay
    setTimeout(() => {
      navigate("/plan");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A1A] text-white">
      <MainNav />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-6"
            >
              <span className="text-[#E84393] font-medium">Powered by AI • Future of Learning</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              Master any topic with 
              <span className="text-[#6D42EF] ml-2">personalized learning</span>
            </motion.h1>
            
            <motion.p
              className="text-lg text-gray-300 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              LearnFlow uses AI to generate customized learning plans and content 
              based on any topic you want to explore. Get started in seconds!
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button 
                size="lg" 
                className="bg-[#6D42EF] hover:bg-[#5832d8] border-none px-8"
                onClick={() => navigate("/")}
              >
                Start Learning
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-gray-600 text-white hover:bg-gray-800"
                onClick={() => navigate("/projects")}
              >
                <Book className="mr-2 h-5 w-5" />
                View Projects
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            <div className="rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 p-5">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">What would you like to learn?</h3>
                <TopicInput onSubmit={handleSubmit} loading={loading} />
              </div>
              
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="text-sm text-gray-200 mb-2 font-medium">Popular topics</div>
                <div className="flex flex-wrap gap-2">
                  {["Machine Learning", "JavaScript", "Quantum Physics", "Creative Writing", "Cooking"].map((topic) => (
                    <span 
                      key={topic}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-[#6D42EF] rounded-full text-sm cursor-pointer transition-colors text-white"
                      onClick={() => handleSubmit(topic)}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -z-10 top-1/4 -right-10 w-32 h-32 rounded-full bg-[#E84393]/20 blur-2xl"></div>
            <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#6D42EF]/20 blur-2xl"></div>
          </motion.div>
        </div>
        
        {/* Features Section */}
        <motion.div 
          className="mt-24 md:mt-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">How LearnFlow Works</h2>
            <p className="text-gray-200 max-w-2xl mx-auto">Our AI-powered platform transforms the way you learn by creating personalized learning experiences.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BrainCircuit className="h-8 w-8 text-[#F5B623]" />,
                title: "AI-Generated Learning Plans",
                description: "Our AI analyzes your topic and creates a structured learning path tailored to your needs."
              },
              {
                icon: <Sparkles className="h-8 w-8 text-[#E84393]" />,
                title: "Personalized Content",
                description: "Get comprehensive, easy-to-understand content for each step of your learning journey."
              },
              {
                icon: <Lightbulb className="h-8 w-8 text-[#6D42EF]" />,
                title: "Track Your Progress",
                description: "Save and revisit your learning projects anytime, tracking your progress as you go."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
                <div className="bg-gray-800 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-200">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-12">
        <div className="container max-w-6xl mx-auto px-4 text-center text-gray-300 text-sm">
          LearnFlow © {new Date().getFullYear()} • AI-Powered Learning Platform
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
