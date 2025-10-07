import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/auth';
import { useLearningCommandStore } from '@/store/learningCommandStore';

export const TopicsSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customTopic, setCustomTopic] = useState('');

  const topics = useMemo(() => {
    const accents = [
      { color: 'text-[#6654f5]', bg: 'bg-[#6654f5]/10' },
      { color: 'text-[#ca5a8b]', bg: 'bg-[#ca5a8b]/10' },
      { color: 'text-[#f2b347]', bg: 'bg-[#f2b347]/10' },
    ];
    const items = [
      { title: 'Data Analytics & BI', description: 'Turn data into decisions with modern analytics.' },
      { title: 'AI & Automation', description: 'Automate workflows and build AI copilots for the business.' },
      { title: 'App Development', description: 'Design, build, and ship internal and external apps.' },
      { title: 'Finance & FP&A', description: 'Plan, budget, and forecast with confidence.' },
      { title: 'Marketing Analytics', description: 'Measure and scale your growth engine.' },
      { title: 'Sales Operations', description: 'Optimize pipeline, territory, and performance.' },
      { title: 'Product Management', description: 'Build and iterate customer‑centric products.' },
      { title: 'Project Management', description: 'Deliver projects on time with proven frameworks.' },
      { title: 'Customer Success', description: 'Scale onboarding, adoption, and renewals.' },
      { title: 'Supply Chain & Operations', description: 'Streamline inventory, logistics, and ops.' },
      { title: 'HR Analytics', description: 'Use people data to improve outcomes.' },
      { title: 'Industry Insights', description: 'Deep dives across finance, retail, manufacturing, and more.' },
    ];
    return items.map((t, i) => ({
      ...t,
      color: accents[i % accents.length].color,
      bgColor: accents[i % accents.length].bg,
    }));
  }, []);

  const { openWidget, setInput } = useLearningCommandStore();

  const startTopic = (topic: string) => {
    const trimmed = topic.trim();
    if (!trimmed) return;
    setInput(trimmed);
    openWidget();
  };

  return (
  <div className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-gradient-to-b from-white to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full brand-gradient-light mb-6">
            <BookOpen className="w-4 h-4 text-[#6654f5]" />
            <span className="text-sm font-medium text-[#6654f5]">Diverse Topics</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
            <span className="text-[#0b0c18]">Explore Endless</span>
          </h2>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
            <span className="text-gradient">Learning Possibilities</span>
          </h2>
          <p className="text-xl text-[#0b0c18]/70 max-w-3xl mx-auto font-light">
            Build practical, business-ready capabilities across analytics, AI, apps, and core functions.
          </p>

          {/* Quick start input */}
          <form
            onSubmit={(e) => { e.preventDefault(); startTopic(customTopic); }}
            className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="What do you want to learn for your business?"
              className="w-full sm:flex-1 px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#6654f5] bg-white text-[#0b0c18]"
            />
            <Button type="submit" className="w-full sm:w-auto brand-gradient text-white px-6">Start</Button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Video tile */}
          <div className="group relative col-span-1 sm:col-span-2 md:col-span-2 sm:row-span-2 rounded-2xl overflow-hidden shadow-lg min-w-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/videos/social_sam.mckay.edna_Network_of_nodes_connected_by_glowing_lines_ea_68369123-6a21-4b9e-8697-722a42766ab7_2.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 brand-gradient opacity-20" />
            <div className="absolute inset-0 p-6 flex items-end">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3">
                <div className="text-sm font-medium text-[#6654f5]">Inspiration</div>
                <div className="text-[#0b0c18] font-semibold">See how LearnFlow turns ideas into plans</div>
              </div>
            </div>
          </div>

          {topics.map((topic, index) => (
            <div
              key={index}
              onClick={() => startTopic(topic.title)}
              className="group relative bg-white p-6 rounded-2xl border border-border hover:shadow-xl transition-all duration-300 cursor-pointer animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`inline-flex p-3 rounded-xl ${topic.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                <div className={`h-6 w-6 rounded-md ${topic.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-[#0b0c18] mb-2">
                {topic.title}
              </h3>
              <p className="text-sm text-[#0b0c18]/70 font-light">
                {topic.description}
              </p>
              <div className="absolute inset-0 rounded-2xl brand-gradient-light opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>

        <div className="text-center mt-16 animate-fade-up" style={{ animationDelay: '0.8s' }}>
          <p className="text-[#0b0c18]/70 mb-6 text-lg font-light">
            Can't find what you're looking for? Our AI can create custom paths for any topic!
          </p>
          <Button onClick={() => startTopic(customTopic || 'Data Analytics & BI')} size="lg" className="brand-gradient text-white border-0 px-8 shadow-lg hover:opacity-90 transition-opacity">
            Start Your Learning Journey
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopicsSection;

