
import { motion } from "framer-motion";

interface PresentationSlideProps {
  content: string;
  isActive: boolean;
}

const PresentationSlide = ({ content, isActive }: PresentationSlideProps) => {
  return (
    <motion.div
      className={`absolute inset-0 flex items-center justify-center transition-opacity ${
        isActive ? "opacity-100 z-10" : "opacity-0 z-0"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-4xl mx-auto px-10 py-16 bg-white rounded-xl shadow-lg">
        <p className="text-3xl leading-relaxed text-gray-800">{content}</p>
      </div>
    </motion.div>
  );
};

export default PresentationSlide;
