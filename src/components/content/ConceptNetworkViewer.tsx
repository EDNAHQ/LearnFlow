
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface ConceptNode {
  id: string;
  term: string;
  definition: string;
  relatedConcepts?: string[];
}

interface ConceptNetworkViewerProps {
  concepts: ConceptNode[];
  onConceptClick: (concept: string) => void;
  currentTopic: string;
}

const ConceptNetworkViewer = ({ 
  concepts, 
  onConceptClick,
  currentTopic
}: ConceptNetworkViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Skip rendering if no concepts
  if (!concepts || concepts.length === 0) {
    return null;
  }
  
  useEffect(() => {
    const renderNetwork = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate positions based on a circle
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 0.7;
      
      // Position for the main topic in the center
      const nodes: {
        x: number;
        y: number;
        term: string;
        isTopic?: boolean;
      }[] = [
        { x: centerX, y: centerY, term: currentTopic, isTopic: true }
      ];
      
      // Position concepts around the circle
      const angleStep = (2 * Math.PI) / concepts.length;
      concepts.forEach((concept, index) => {
        const angle = index * angleStep;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        nodes.push({
          x,
          y,
          term: concept.term
        });
      });
      
      // Draw connections from center to each concept
      ctx.strokeStyle = 'rgba(109, 66, 239, 0.3)';
      ctx.lineWidth = 2;
      
      for (let i = 1; i < nodes.length; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(nodes[i].x, nodes[i].y);
        ctx.stroke();
      }
      
      // Draw concept relationships
      ctx.strokeStyle = 'rgba(232, 67, 147, 0.2)';
      ctx.lineWidth = 1;
      
      concepts.forEach((concept, i) => {
        if (concept.relatedConcepts && concept.relatedConcepts.length > 0) {
          concept.relatedConcepts.forEach(relatedTerm => {
            const relatedIndex = concepts.findIndex(c => 
              c.term.toLowerCase() === relatedTerm.toLowerCase()
            );
            
            if (relatedIndex !== -1 && relatedIndex !== i) {
              ctx.beginPath();
              ctx.moveTo(nodes[i+1].x, nodes[i+1].y);
              ctx.lineTo(nodes[relatedIndex+1].x, nodes[relatedIndex+1].y);
              ctx.stroke();
            }
          });
        }
      });
      
      // Draw nodes
      nodes.forEach(node => {
        // Draw circle
        ctx.beginPath();
        ctx.fillStyle = node.isTopic 
          ? 'rgba(109, 66, 239, 0.8)' 
          : 'rgba(232, 67, 147, 0.6)';
        ctx.arc(node.x, node.y, node.isTopic ? 40 : 30, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw text
        ctx.font = node.isTopic ? 'bold 14px Arial' : '12px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Wrap text if needed
        const maxWidth = node.isTopic ? 70 : 50;
        const words = node.term.split(' ');
        let line = '';
        let lineHeight = node.isTopic ? 16 : 14;
        let y = node.y - (words.length > 1 ? lineHeight / 2 : 0);
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, node.x, y);
            line = words[n] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, node.x, y);
      });
    };
    
    renderNetwork();
    
    // Re-render on window resize
    window.addEventListener('resize', renderNetwork);
    return () => window.removeEventListener('resize', renderNetwork);
  }, [concepts, currentTopic]);
  
  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-brand-purple mb-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-[#E84393]" />
        Concept Map
      </h3>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <canvas 
          ref={canvasRef} 
          className="w-full h-[300px]"
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {concepts.map((concept) => (
          <Button
            key={concept.id}
            variant="outline"
            size="sm"
            className="bg-white hover:bg-purple-50 border-purple-200"
            onClick={() => onConceptClick(concept.term)}
          >
            {concept.term}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ConceptNetworkViewer;
