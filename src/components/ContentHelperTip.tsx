
import { Sparkles } from "lucide-react";

const ContentHelperTip = () => {
  return (
    <div className="mt-8 flex items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-4">
      <Sparkles className="h-4 w-4 text-[#E84393]" />
      <p>
        <span className="font-medium">AI Insights:</span> Select any text to see the AI insights button. Works on all devices including mobile and tablets.
      </p>
    </div>
  );
};

export default ContentHelperTip;
