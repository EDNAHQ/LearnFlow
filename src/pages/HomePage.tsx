
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TopicInput from "@/components/TopicInput";
import { MainNav } from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
  const { user } = useAuth();

  const handleSubmit = (topic: string) => {
    setLoading(true);
    
    // Store the topic in sessionStorage
    sessionStorage.setItem("learn-topic", topic);
    
    // Navigate to the plan page after a short delay
    setTimeout(() => {
      navigate("/plan");
    }, 1000);
  };

  const handleStartLearning = () => {
    // If user is logged in, scroll to the topic input
    if (user) {
      // Scroll to the topic input section
      const topicInput = document.getElementById('topic-input-section');
      if (topicInput) {
        topicInput.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If not logged in, navigate to auth page
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed -z-10 top-0 right-0 w-1/2 h-1/2 bg-brand-purple/5 rounded-full blur-3xl"></div>
      <div className="fixed -z-10 bottom-0 left-0 w-1/3 h-1/3 bg-brand-pink/5 rounded-full blur-3xl"></div>
      
      <MainNav />
      
      {/* Hero Section */}
      <main className="flex-1 relative">
        {/* Decorative Pattern - Top */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-xl"></div>
        
        <section className="container max-w-6xl mx-auto px-4 py-12 md:py-24 relative">
          {/* Circuit Pattern */}
          <div className="absolute top-1/4 left-0 w-full h-full opacity-5 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
              <path d="M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63" 
                    stroke="#6D42EF" strokeWidth="100" fill="none" />
            </svg>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="relative z-10"
            >
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-6"
              >
                <span className="bg-brand-pink/10 text-brand-pink px-4 py-1 rounded-full font-medium inline-block">Powered by AI • Future of Learning</span>
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-gray-800 via-gray-900 to-brand-purple bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.7 }}
              >
                Master any topic with 
                <span className="text-brand-purple ml-2">personalized learning</span>
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
                  className="brand-btn-primary shadow-brand px-8 hover:translate-y-[-2px] transition-all"
                  onClick={handleStartLearning}
                >
                  Start Learning
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-300 text-gray-800 hover:bg-gray-100 hover:border-gray-400 transition-all"
                  onClick={() => navigate("/projects")}
                >
                  <Book className="mr-2 h-5 w-5" />
                  View Projects
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              id="topic-input-section"
            >
              <div className="rounded-2xl overflow-hidden bg-gray-50/80 backdrop-blur-sm border border-gray-200 shadow-subtle p-6 hover:shadow-brand transition-shadow duration-500">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">What would you like to learn?</h3>
                  <TopicInput onSubmit={handleSubmit} loading={loading} />
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="text-sm text-gray-700 mb-2 font-medium">Popular topics</div>
                  <div className="flex flex-wrap gap-2">
                    {["Machine Learning", "JavaScript", "Quantum Physics", "Creative Writing", "Cooking"].map((topic) => (
                      <span 
                        key={topic}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-brand-purple hover:text-white rounded-full text-sm cursor-pointer transition-colors text-gray-800 hover:shadow-sm"
                        onClick={() => handleSubmit(topic)}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -z-10 top-1/4 -right-10 w-32 h-32 rounded-full bg-brand-pink/10 blur-2xl"></div>
              <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 rounded-full bg-brand-purple/10 blur-2xl"></div>
              
              {/* Floating particles */}
              <motion.div 
                className="absolute -right-4 top-10 w-4 h-4 rounded-full bg-brand-gold/30"
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <motion.div 
                className="absolute left-10 bottom-10 w-3 h-3 rounded-full bg-brand-purple/30"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </motion.div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 md:py-24 bg-gray-50 relative overflow-hidden">
          {/* Decorative Pattern - Rings */}
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
              <circle cx="400" cy="400" r="200" fill="none" stroke="#6D42EF" strokeWidth="20" />
              <circle cx="400" cy="400" r="300" fill="none" stroke="#E84393" strokeWidth="15" />
              <circle cx="400" cy="400" r="400" fill="none" stroke="#F5B623" strokeWidth="10" />
            </svg>
          </div>
          
          <div className="container max-w-6xl mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">How LearnFlow Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Our AI-powered platform transforms the way you learn by creating personalized learning experiences.</p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
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
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (index * 0.2), duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors shadow-sm hover:shadow-lg hover:translate-y-[-5px] transition-all duration-300"
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
        <section className="py-16 md:py-24 relative">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSJyZ2JhKDEyOCwxMjgsMTI4LDAuMSkiPjxwYXRoIGQ9Ik0wIDBoNDBNMCA0MGg0ME00MCAwdjQwTTAgMHY0MCIgc3Ryb2tlPSJyZ2JhKDEyOCwxMjgsMTI4LDAuMikiIHN0cm9rZS13aWR0aD0iMSIvPjwvZz48L3N2Zz4=')]"></div>
          
          <div className="container max-w-6xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <span className="bg-brand-pink/10 text-brand-pink px-4 py-1 rounded-full font-medium inline-block mb-2">WHY CHOOSE LEARNFLOW</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Transform Your Learning Journey</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                LearnFlow gives you the tools to master any subject through personalized, AI-powered learning experiences.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
              {[
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
              ].map((benefit, index) => (
                <motion.div 
                  key={index} 
                  className="flex gap-5"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 * index, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="mt-1 bg-gray-50 rounded-full p-3 border border-gray-100 h-fit shadow-sm">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-20 relative overflow-hidden">
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand-purple/5 blur-3xl"></div>
          <div className="container max-w-5xl mx-auto px-4 text-center relative z-10">
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
                {[
                  { icon: <CheckCircle2 className="h-6 w-6 text-brand-purple mx-auto mb-2" />, text: "No Credit Card Required" },
                  { icon: <Award className="h-6 w-6 text-brand-pink mx-auto mb-2" />, text: "High-Quality Content" },
                  { icon: <BrainCircuit className="h-6 w-6 text-brand-gold mx-auto mb-2" />, text: "Advanced AI Technology" },
                  { icon: <Users className="h-6 w-6 text-brand-purple mx-auto mb-2" />, text: "Growing Community" }
                ].map((item, index) => (
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
      </main>
      
      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-12 relative overflow-hidden">
        {/* Footer pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="url(#grid)" />
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 0 10 L 40 10 M 10 0 L 10 40" 
                      stroke="#fff" strokeWidth="0.5" fill="none" />
              </pattern>
            </defs>
          </svg>
        </div>
        
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-brand-purple rounded-lg w-10 h-10 flex items-center justify-center shadow-lg">
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
