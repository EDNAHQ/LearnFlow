
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
      <div className="w-full max-w-3xl mx-auto px-8 py-12">
        <p className="text-xl md:text-2xl leading-relaxed text-pretty">{content}</p>
      </div>
    </motion.div>
  );
};

export default PresentationSlide;
