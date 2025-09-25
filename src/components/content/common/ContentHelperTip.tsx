import { Sparkles } from "lucide-react";
import { AI_STYLES } from "@/components/ai";
import { cn } from "@/lib/utils";

const ContentHelperTip = () => {
  return (
    <div className="mt-8 flex items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-4">
      <Sparkles className={cn("h-4 w-4", AI_STYLES.text.accent)} />
      <p>
        <span className="font-medium">AI Insights:</span> Click on any question prompt <span className={cn("underline cursor-pointer", AI_STYLES.text.primary)}>like this?</span> throughout the content to get AI explanations.
      </p>
    </div>
  );
};

export default ContentHelperTip;


