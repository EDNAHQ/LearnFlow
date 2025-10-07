import React from 'react';
import AILoadingState from '@/components/ai/AILoadingState';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
  const [open, setOpen] = React.useState(false);

  const canOpen = image.status === 'completed' && !!image.image_url;
  const srcWithBust = image.image_url
    ? `${image.image_url}${image.updated_at ? `?t=${encodeURIComponent(image.updated_at)}` : ''}`
    : null;

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
        } else if (canOpen) {
          setOpen(true);
        }
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-50">
        {image.status === 'completed' && srcWithBust ? (
          <img
            src={srcWithBust}
            alt={image.prompt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : image.status === 'generating' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <AILoadingState variant="animated" message="Generating image..." />
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

      {/* Lightbox Dialog for expanded view */}
      {canOpen && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-full h-[100dvh] sm:h-auto sm:max-w-4xl p-0 bg-transparent border-none shadow-none overflow-hidden">
            <div className="relative w-full h-full sm:h-auto">
              <div className="absolute inset-0 sm:static overflow-auto">
                <img
                  src={srcWithBust!}
                  alt={image.prompt}
                  className="w-full h-auto sm:rounded-xl"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
};