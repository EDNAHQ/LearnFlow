
import { MainNav } from "@/components/MainNav";
import PodcastCreator from "@/components/podcast/PodcastCreator";
import { motion } from "framer-motion";

const PodcastPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              AI Podcast Creator
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create engaging podcast conversations between two AI hosts.
              Simply write your script with "Host 1:" and "Host 2:" markers, and our AI will bring it to life.
            </p>
          </div>
          
          <PodcastCreator />
        </motion.div>
      </main>
    </div>
  );
};

export default PodcastPage;
