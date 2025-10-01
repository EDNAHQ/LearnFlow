import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MentalModelImage } from './types';

interface ImageCardProps {
  image: MentalModelImage;
  index: number;
  onGenerate: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  index,
  onGenerate,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 * index, duration: 0.4 }}
      className={cn(
        'rounded-xl overflow-hidden border-2 transition-all duration-300',
        image.status === 'completed'
          ? 'border-brand-primary/20'
          : image.status === 'not_generated' || image.status === 'failed'
          ? 'border-gray-200 hover:border-brand-primary/40 cursor-pointer'
          : 'border-gray-200'
      )}
      onClick={() => {
        console.log('ImageCard clicked, status:', image.status);
        if (image.status === 'not_generated' || image.status === 'failed') {
          console.log('Calling onGenerate');
          onGenerate();
        }
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-50">
        {image.status === 'completed' && image.image_url ? (
          <img
            src={image.image_url}
            alt={image.prompt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : image.status === 'generating' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="animate-pulse space-y-2">
              <div className="w-16 h-16 mx-auto">
                <svg className="animate-spin text-brand-primary" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-medium">Generating image...</p>
            </div>
          </div>
        ) : image.status === 'not_generated' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center group">
            <p className="text-sm text-gray-600 font-medium group-hover:text-brand-primary transition-colors">
              Click to Generate
            </p>
          </div>
        ) : image.status === 'failed' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 group">
            <p className="text-sm text-red-600 font-medium group-hover:text-red-700 transition-colors">
              Generation failed
            </p>
            <p className="text-xs text-red-500 mt-2 group-hover:text-red-600 transition-colors">
              Click to Retry
            </p>
            {image.error && (
              <p className="text-xs text-red-400 mt-1 px-4 text-center">
                {image.error}
              </p>
            )}
          </div>
        ) : null}
      </div>

      {/* Caption */}
      <div className="p-4 bg-white">
        <p className="text-sm text-gray-700 leading-relaxed">{image.prompt}</p>
        {image.generated_at && (
          <p className="text-xs text-gray-400 mt-2">
            Generated {new Date(image.generated_at).toLocaleTimeString()}
          </p>
        )}
      </div>
    </motion.div>
  );
};