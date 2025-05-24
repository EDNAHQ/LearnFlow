
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";

interface Topic {
  id: string;
  title: string;
  description: string;
}

interface RelatedTopicsSectionProps {
  currentTopic: string;
}

const RelatedTopicsSection = ({ currentTopic }: RelatedTopicsSectionProps) => {
  const navigate = useNavigate();
  
  // In a real implementation, these would come from an API based on the current topic
  // For now, let's provide some hardcoded suggestions based on common topics
  const getRelatedTopics = (topic: string): Topic[] => {
    const topicLower = topic.toLowerCase();
    
    const topicMappings: Record<string, Topic[]> = {
      "javascript": [
        { id: "1", title: "TypeScript", description: "A strongly typed programming language that builds on JavaScript" },
        { id: "2", title: "React", description: "A JavaScript library for building user interfaces" },
        { id: "3", title: "Node.js", description: "JavaScript runtime built on Chrome's V8 JavaScript engine" }
      ],
      "python": [
        { id: "4", title: "Data Science", description: "Extracting insights from data using Python tools" },
        { id: "5", title: "Machine Learning", description: "Building algorithms that learn from data" },
        { id: "6", title: "Flask", description: "A micro web framework for Python" }
      ],
      "machine learning": [
        { id: "7", title: "Deep Learning", description: "A subset of machine learning with neural networks" },
        { id: "8", title: "Data Science", description: "Extracting insights from data" },
        { id: "9", title: "Python", description: "Popular programming language for ML" }
      ],
      "react": [
        { id: "10", title: "React Native", description: "Framework for building native apps using React" },
        { id: "11", title: "Redux", description: "State management for JavaScript apps" },
        { id: "12", title: "JavaScript", description: "The foundation programming language for web development" }
      ]
    };
    
    // Check if we have a mapping for this topic
    for (const key of Object.keys(topicMappings)) {
      if (topicLower.includes(key)) {
        return topicMappings[key];
      }
    }
    
    // Default suggestions
    return [
      { id: "13", title: "JavaScript", description: "The programming language of the web" },
      { id: "14", title: "Python", description: "A versatile and beginner-friendly programming language" },
      { id: "15", title: "Data Science", description: "The art of extracting insights from data" }
    ];
  };
  
  const handleSelectTopic = (topic: string) => {
    sessionStorage.setItem("learn-topic", topic);
    navigate("/plan");
  };
  
  const relatedTopics = getRelatedTopics(currentTopic);
  
  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-xl font-bold mb-6">Continue Your Learning Journey</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relatedTopics.map((topic) => (
          <div 
            key={topic.id}
            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2">{topic.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{topic.description}</p>
            <Button
              onClick={() => handleSelectTopic(topic.title)}
              variant="outline"
              className="w-full"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Learn this
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RelatedTopicsSection;
