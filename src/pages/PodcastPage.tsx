
import { MainNav } from "@/components/navigation";
import { motion } from "framer-motion";
import { Music } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PodcastPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      
      <main className="container max-w-6xl mx-auto px-4 py-8 sm:py-10 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              AI Podcast Creator
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI podcast feature is currently under development. We're working to bring you an enhanced experience soon!
            </p>
          </div>
          
          <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 md:p-10 text-center">
            <Music className="h-16 w-16 mx-auto text-brand-purple opacity-70 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're enhancing our AI Podcast Creator to deliver a more reliable and feature-rich experience. 
              Check back soon to create engaging podcast conversations between AI hosts.
            </p>
            
            <Alert className="bg-brand-purple/10 border-brand-purple text-left max-w-2xl mx-auto">
              <AlertTitle className="text-brand-purple">Under Development</AlertTitle>
              <AlertDescription className="text-gray-700">
                Our team is working on integrating improved AI models and audio generation capabilities. 
                We appreciate your patience as we build something amazing for you!
              </AlertDescription>
            </Alert>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PodcastPage;
