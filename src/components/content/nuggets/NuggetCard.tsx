
import React from "react";
import { Lightbulb, Brain, Sparkles, BookOpen, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface NuggetCardProps {
  nugget: string;
  iconIndex: number;
}

const NUGGET_ICONS = [
  <Lightbulb className="w-5 h-5 mr-3 text-[#6D42EF] flex-shrink-0" />,
  <Brain className="w-5 h-5 mr-3 text-[#E84393] flex-shrink-0" />,
  <Sparkles className="w-5 h-5 mr-3 text-[#F5B623] flex-shrink-0" />,
  <BookOpen className="w-5 h-5 mr-3 text-[#6D42EF] flex-shrink-0" />,
  <Zap className="w-5 h-5 mr-3 text-[#E84393] flex-shrink-0" />
];

const NuggetCard: React.FC<NuggetCardProps> = ({ nugget, iconIndex }) => {
  // Simple card without animations for consistent display
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-white border border-gray-200 overflow-hidden shadow-md transform hover:shadow-lg min-h-[160px] flex">
        <CardContent className="p-5 flex-1 flex items-start">
          <div className="flex w-full">
            {NUGGET_ICONS[iconIndex % NUGGET_ICONS.length]}
            <p className="text-gray-800 text-base leading-relaxed">
              {nugget}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NuggetCard;
