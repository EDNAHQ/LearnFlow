import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CustomPromptInputProps {
  show: boolean;
  value: string;
  isGenerating: boolean;
  title: string;
  topic: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  onCancel: () => void;
}

export const CustomPromptInput: React.FC<CustomPromptInputProps> = ({
  show,
  value,
  isGenerating,
  title,
  topic,
  onChange,
  onGenerate,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 rounded-xl p-6 border-2 border-brand-primary/20">
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900 mb-1">
                Generate a Custom Mental Model Image
              </h3>
              <p className="text-sm text-gray-600">
                Describe the visual mental model you'd like to see for "{title}"
              </p>
            </div>

            <div className="space-y-3">
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Example: "A visual diagram showing ${topic} as an interconnected system of nodes and flows..."`}
                className="min-h-[100px] resize-none"
                disabled={isGenerating}
              />

              <div className="flex gap-2 justify-end">
                <Button
                  onClick={onCancel}
                  variant="ghost"
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={onGenerate}
                  disabled={!value.trim() || isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Image'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};