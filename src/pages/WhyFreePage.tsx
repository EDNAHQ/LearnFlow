
import React from "react";
import { MainNav } from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { 
  Book, 
  Sparkles, 
  Building, 
  Rocket, 
  BadgeCheck,
  ArrowRight, 
  Heart, 
  LucideGithub 
} from "lucide-react";
import { Link } from "react-router-dom";

const WhyFreePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <MainNav />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#6D42EF]/10 to-white py-16 md:py-24">
          <div className="container max-w-5xl mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center bg-white rounded-full px-4 py-1.5 mb-6 border border-[#6D42EF]/20">
              <Heart className="h-4 w-4 text-[#E84393] mr-2" />
              <span className="text-sm font-medium">Our Mission</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Why LearnFlow Is <span className="text-[#6D42EF]">Free</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              We believe everyone deserves access to powerful, AI-driven learning tools.
              Here's why we've made LearnFlow available at no cost to you.
            </p>
          </div>
        </section>
        
        {/* Main Content Section */}
        <section className="py-16">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-start gap-6 mb-10">
                  <div className="bg-[#6D42EF]/10 rounded-xl p-5 flex items-center justify-center">
                    <Rocket className="h-12 w-12 text-[#6D42EF]" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Our Vision for Education</h2>
                    <p className="text-gray-700 mb-4">
                      At LearnFlow, we believe that high-quality, personalized education should be accessible to everyone. 
                      By removing financial barriers, we're enabling more people to learn any subject they're passionate about.
                    </p>
                    <p className="text-gray-700">
                      Our AI-powered platform is designed to make learning more efficient, engaging, and adaptable to individual needs. 
                      We're committed to continuous improvement and expanding our offerings to support learners worldwide.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-start gap-6 mb-10">
                  <div className="bg-[#E84393]/10 rounded-xl p-5 flex items-center justify-center">
                    <Building className="h-12 w-12 text-[#E84393]" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Enterprise DNA Partnership</h2>
                    <p className="text-gray-700 mb-4">
                      LearnFlow is proudly supported by Enterprise DNA, a leading platform for learning and productivity. 
                      This partnership allows us to offer LearnFlow for free while maintaining high quality and continuous development.
                    </p>
                    <p className="text-gray-700">
                      Enterprise DNA shares our commitment to accessible education and has been instrumental in bringing 
                      LearnFlow to life with their expertise in building powerful learning applications.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-start gap-6 mb-10">
                  <div className="bg-[#F5B623]/10 rounded-xl p-5 flex items-center justify-center">
                    <Book className="h-12 w-12 text-[#F5B623]" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Supporting Our Mission</h2>
                    <p className="text-gray-700 mb-4">
                      While LearnFlow remains free, you can support our mission by subscribing to Enterprise DNA's platform. 
                      Their comprehensive courses and productivity tools will help you build amazing applications like LearnFlow 
                      and advance your skills in various domains.
                    </p>
                    <p className="text-gray-700">
                      By supporting Enterprise DNA, you're indirectly helping us continue to develop and improve LearnFlow 
                      for everyone around the world.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action Section */}
        <section className="py-16 bg-gray-50">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Support Our Mission</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Learn how to build powerful applications like LearnFlow and support our mission by subscribing to Enterprise DNA.
            </p>
            
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/3">
                  <div className="bg-[#6D42EF] rounded-xl p-6 md:p-8 text-white text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Enterprise DNA</h3>
                    <p className="text-white/80 mb-4">Unlock your potential with premium learning resources and tools</p>
                  </div>
                </div>
                
                <div className="md:w-2/3 text-left">
                  <h3 className="text-xl font-bold mb-4">What you'll get:</h3>
                  <ul className="space-y-3 mb-6">
                    {[
                      "Comprehensive courses on application development",
                      "Professional productivity tools and templates",
                      "Access to a community of experts and learners",
                      "Regular updates with cutting-edge content",
                      "Support for building your own AI-powered applications"
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <BadgeCheck className="h-5 w-5 text-[#6D42EF] mr-2 mt-0.5 shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="text-center md:text-left">
                    <Button 
                      className="bg-[#6D42EF] hover:bg-[#5832d8]"
                      size="lg"
                      onClick={() => window.open("https://enterprisedna.co", "_blank")}
                    >
                      Explore Enterprise DNA
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600">
              Want to learn more about how we're using AI to transform learning?{" "}
              <Link to="/home" className="text-[#6D42EF] font-medium">
                Return to LearnFlow
              </Link>
            </p>
          </div>
        </section>
      </main>
      
      {/* Footer */}
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
                className="text-gray-300 hover:text-white transition-colors"
              >
                Why is this free?
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

export default WhyFreePage;
