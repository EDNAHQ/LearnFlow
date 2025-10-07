import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { analyzeContentForPrompts, type PromptSuggestion } from '@/utils/images/imagePromptSuggestions';

interface PromptSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
  topic: string;
  stepTitle?: string;
  currentContent?: string;
}

export const PromptSuggestionsModal: React.FC<PromptSuggestionsModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
  topic,
  stepTitle,
  currentContent = ''
}) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<PromptSuggestion | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([]);
  const [detectedCategories, setDetectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const analysis = analyzeContentForPrompts(currentContent, topic, stepTitle);
      setSuggestions(analysis.suggestedPrompts);
      setDetectedCategories(analysis.detectedCategories);

      // Pre-select first non-custom suggestion
      const firstSuggestion = analysis.suggestedPrompts.find(s => s.id !== 'custom');
      if (firstSuggestion) {
        setSelectedSuggestion(firstSuggestion);
        setCustomPrompt(firstSuggestion.promptTemplate);
      }
    }
  }, [isOpen, currentContent, topic, stepTitle]);

  const handleSuggestionClick = (suggestion: PromptSuggestion) => {
    if (suggestion.id === 'custom') {
      setActiveTab('custom');
      setSelectedSuggestion(null);
      setCustomPrompt('');
    } else {
      setSelectedSuggestion(suggestion);
      setCustomPrompt(suggestion.promptTemplate);
      setActiveTab('suggestions');
    }
  };

  const handleGenerate = () => {
    const prompt = activeTab === 'custom' || !selectedSuggestion
      ? customPrompt
      : selectedSuggestion.promptTemplate;

    if (prompt.trim()) {
      onSelectPrompt(prompt);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col p-0 border-0 [&>button]:hidden w-full sm:rounded-2xl rounded-none h-[100dvh] sm:h-auto">
        {/* Header with gradient */}
        <div className="relative sticky top-0 z-10">
          <div className="absolute inset-0 brand-gradient opacity-90" />
          <DialogHeader className="relative p-5 sm:p-6 text-white">
            <DialogTitle className="text-2xl font-bold">
              Generate Mental Model Image
            </DialogTitle>
            <p className="text-white/90 mt-2">
              Choose a visualization style for <span className="font-semibold">"{stepTitle || topic}"</span>
            </p>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="suggestions">Smart Suggestions</TabsTrigger>
              <TabsTrigger value="custom">Custom Prompt</TabsTrigger>
            </TabsList>

            <TabsContent value="suggestions" className="space-y-3">
            {detectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-3">
                <span className="text-xs text-gray-500">Detected themes:</span>
                {detectedCategories.map(cat => (
                  <span key={cat} className="text-xs font-medium text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            )}

            <div className="grid gap-3 sm:gap-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`relative bg-white rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group border-l-4 ${
                    selectedSuggestion?.id === suggestion.id
                      ? 'border-l-brand-primary bg-brand-primary/5'
                      : 'border-l-brand-primary/30 hover:border-l-brand-primary'
                  }`}
                >
                  <div className="pl-2">
                    <h4 className="text-base sm:text-lg font-semibold text-[#0b0c18] group-hover:text-brand-primary transition-colors">
                      {suggestion.label}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed mt-1 mb-2">
                      {suggestion.description}
                    </p>
                    {suggestion.id !== 'custom' && (
                      <span className="inline-block text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {suggestion.category}
                      </span>
                    )}
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              ))}
            </div>

            {selectedSuggestion && selectedSuggestion.id !== 'custom' && (
              <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Preview Prompt:</h5>
                <p className="text-xs text-gray-600 italic mb-3">{selectedSuggestion.promptTemplate}</p>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Customize this prompt..."
                  className="min-h-[80px] text-sm"
                />
              </div>
            )}
          </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="bg-white rounded-xl p-4 sm:p-5">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">
                  Describe your ideal visualization:
                </h5>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={`Example: "A mind map showing ${topic} with interconnected concepts branching out from a central node, using purple and pink gradient colors..."`}
                  className="min-h-[150px] text-sm"
                  autoFocus
                />
              </div>

              <div className="bg-white rounded-xl p-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Tips for better results:</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Include specific visual elements (diagram, chart, graph, etc.)</li>
                  <li>• Mention desired style (minimalist, technical, educational, etc.)</li>
                  <li>• Specify colors (our brand: purple #6654f5, pink #ca5a8b, gold #f2b347)</li>
                  <li>• Add quality modifiers (clean, professional, modern, etc.)</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="sticky bottom-0 z-10 flex justify-between items-center p-4 sm:p-6 bg-white border-t">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </Button>
          <div className="flex gap-3">
            {activeTab === 'suggestions' && selectedSuggestion && (
              <Button
                variant="outline"
                onClick={() => {
                  setActiveTab('custom');
                  setCustomPrompt(selectedSuggestion.promptTemplate);
                }}
              >
                Customize
              </Button>
            )}
            <Button
              onClick={handleGenerate}
              disabled={!customPrompt.trim()}
              className="relative overflow-hidden group"
            >
              <div className="absolute inset-0 brand-gradient opacity-90 group-hover:opacity-100 transition-opacity" />
              <span className="relative text-white font-medium">
                Generate Image
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};