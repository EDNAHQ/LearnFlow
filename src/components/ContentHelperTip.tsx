
import { QuestionMarkCircle } from "lucide-react";

const ContentHelperTip = () => {
  return (
    <div className="mt-8 flex items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-4">
      <QuestionMarkCircle className="h-4 w-4 text-[#E84393]" />
      <p>
        <span className="font-medium">AI Insights:</span> Click on any question prompt <span className="text-[#6D42EF] underline cursor-pointer">like this?</span> throughout the content to get AI explanations.
      </p>
    </div>
  );
};

export default ContentHelperTip;
