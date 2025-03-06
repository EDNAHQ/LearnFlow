import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TopicInput from "@/components/TopicInput";
import { MainNav } from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Book, 
  BrainCircuit, 
  Lightbulb, 
  Sparkles, 
  Users, 
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Award,
  LucideGithub,
  Clock,
  LayoutGrid
} from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <MainNav />
      
      {/* Hero Section */}
      <main className="flex-1">
        <section className="container max-w-6xl mx-auto px-4 py-12 md:py-24">
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
                className="text-lg text-gray-600 mb-8"
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
                  className="border-gray-300 text-gray-800 hover:bg-gray-100"
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
              <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 p-5">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">What would you like to learn?</h3>
                  <TopicInput onSubmit={handleSubmit} loading={loading} />
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="text-sm text-gray-700 mb-2 font-medium">Popular topics</div>
                  <div className="flex flex-wrap gap-2">
                    {["Machine Learning", "JavaScript", "Quantum Physics", "Creative Writing", "Cooking"].map((topic) => (
                      <span 
                        key={topic}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-[#6D42EF] hover:text-white rounded-full text-sm cursor-pointer transition-colors text-gray-800"
                        onClick={() => handleSubmit(topic)}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -z-10 top-1/4 -right-10 w-32 h-32 rounded-full bg-[#E84393]/10 blur-2xl"></div>
              <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#6D42EF]/10 blur-2xl"></div>
            </motion.div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container max-w-6xl mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">How LearnFlow Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Our AI-powered platform transforms the way you learn by creating personalized learning experiences.</p>
            </motion.div>
            
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
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (index * 0.2), duration: 0.5 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <div className="bg-gray-50 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-medium mb-3 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-16 md:py-24">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-[#E84393] font-medium mb-2 block">WHY CHOOSE LEARNFLOW</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Transform Your Learning Journey</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                LearnFlow gives you the tools to master any subject through personalized, AI-powered learning experiences.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
              {[
                {
                  icon: <Clock className="h-6 w-6 text-[#6D42EF]" />,
                  title: "Learn Faster",
                  description: "Stop wasting time on irrelevant content. Our AI structures learning exactly for your needs."
                },
                {
                  icon: <LayoutGrid className="h-6 w-6 text-[#E84393]" />,
                  title: "Structured Approach",
                  description: "Follow a clear step-by-step path designed to build your knowledge systematically."
                },
                {
                  icon: <BarChart3 className="h-6 w-6 text-[#F5B623]" />,
                  title: "Measurable Progress",
                  description: "Track your learning journey with clear milestones and completion metrics."
                },
                {
                  icon: <Users className="h-6 w-6 text-[#6D42EF]" />,
                  title: "Learn Any Subject",
                  description: "From technical skills to creative pursuits, LearnFlow adapts to any topic you want to master."
                }
              ].map((benefit, index) => (
                <div key={index} className="flex gap-5">
                  <div className="mt-1 bg-gray-50 rounded-full p-3 border border-gray-100 h-fit">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-20 relative overflow-hidden">
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#6D42EF]/5 blur-3xl"></div>
          <div className="container max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Ready to Transform Your Learning Experience?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Start your personalized learning journey today and see the difference AI-powered education can make.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-[#6D42EF] hover:bg-[#5832d8] border-none px-8 py-6 text-lg"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Start Learning Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="mt-16 grid md:grid-cols-4 gap-5 text-center">
              {[
                { icon: <CheckCircle2 className="h-6 w-6 text-[#6D42EF] mx-auto mb-2" />, text: "No Credit Card Required" },
                { icon: <Award className="h-6 w-6 text-[#E84393] mx-auto mb-2" />, text: "High-Quality Content" },
                { icon: <BrainCircuit className="h-6 w-6 text-[#F5B623] mx-auto mb-2" />, text: "Advanced AI Technology" },
                { icon: <Users className="h-6 w-6 text-[#6D42EF] mx-auto mb-2" />, text: "Growing Community" }
              ].map((item, index) => (
                <div key={index} className="p-4">
                  {item.icon}
                  <p className="text-gray-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-[#6D42EF] rounded-lg w-10 h-10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold ml-2">LearnFlow</span>
            </div>
            
            <div className="flex space-x-6 items-center">
              <Link 
                to="/why-free" 
                className="text-gray-300 hover:text-white transition-colors flex items-center"
              >
                <span>Why is this free?</span>
              </Link>
              
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <LucideGithub className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              LearnFlow © {new Date().getFullYear()} • AI-Powered Learning Platform
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-300 text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-gray-300 text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-gray-300 text-sm">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
