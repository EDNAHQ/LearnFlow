
import { Tab } from "@headlessui/react";
import { FileText, Presentation, Headphones } from "lucide-react";
import ContentSection from "./ContentSection";
import PresentationView from "./presentation/PresentationView";
import PodcastCreator from "./podcast/PodcastCreator";
import { useContentMode } from "@/hooks/useContentMode";

interface ContentDisplayProps {
  title: string;
  content: string;
  index: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
}

const ContentDisplay = ({ title, content, index, detailedContent, pathId, topic }: ContentDisplayProps) => {
  const { contentMode, setContentMode } = useContentMode();

  return (
    <div className="w-full max-w-[860px] mx-auto">
      <Tab.Group selectedIndex={contentMode} onChange={setContentMode}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-4">
          <Tab
            className={({ selected }) => `
              w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              flex items-center justify-center
              ${
                selected
                  ? 'bg-white shadow text-[#6D42EF]'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-700'
              }
            `}
          >
            <FileText className="w-4 h-4 mr-2" />
            Text
          </Tab>
          <Tab
            className={({ selected }) => `
              w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              flex items-center justify-center
              ${
                selected
                  ? 'bg-white shadow text-[#6D42EF]'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-700'
              }
            `}
          >
            <Presentation className="w-4 h-4 mr-2" />
            Slides
          </Tab>
          <Tab
            className={({ selected }) => `
              w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              flex items-center justify-center
              ${
                selected
                  ? 'bg-white shadow text-[#6D42EF]'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-700'
              }
            `}
          >
            <Headphones className="w-4 h-4 mr-2" />
            Podcast
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <ContentSection 
              title={title}
              content={content}
              index={index}
              detailedContent={detailedContent}
              pathId={pathId}
              topic={topic}
            />
          </Tab.Panel>
          <Tab.Panel>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden w-full max-w-[860px] mx-auto">
              <PresentationView 
                title={title} 
                content={detailedContent || content.split(":")[1] || ""} 
              />
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 w-full max-w-[860px] mx-auto">
              <PodcastCreator 
                title={title} 
                content={detailedContent || content.split(":")[1] || ""} 
                pathId={pathId}
                stepId={content.split(":")[0]}
                topic={topic || ""}
              />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default ContentDisplay;
