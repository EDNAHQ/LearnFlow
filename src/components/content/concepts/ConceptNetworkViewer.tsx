
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import ConceptDetailPopup from "./ConceptDetailPopup";
import { AI_STYLES } from "@/components/ai";
import { cn } from "@/lib/utils";

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
  const [selectedConcept, setSelectedConcept] = useState<ConceptNode | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  // Skip rendering if no concepts
  if (!concepts || concepts.length === 0) {
    return null;
  }
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const renderNetwork = () => {
      // Set canvas dimensions
      canvas.width = canvas.offsetWidth;
      canvas.height = Math.max(400, canvas.offsetHeight);
      
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
        id?: string;
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
          term: concept.term,
          id: concept.id
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
        // Determine if this node is hovered
        const isHovered = node.term === hoveredNode;
        
        // Draw circle with hover effect
        ctx.beginPath();
        ctx.fillStyle = node.isTopic 
          ? 'rgba(109, 66, 239, 0.8)' 
          : isHovered 
            ? 'rgba(232, 67, 147, 0.8)' 
            : 'rgba(232, 67, 147, 0.6)';
        
        const nodeSize = node.isTopic ? 50 : isHovered ? 40 : 35;
        ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw text
        ctx.font = node.isTopic ? 'bold 16px Arial' : '14px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Wrap text if needed
        const maxWidth = node.isTopic ? 85 : 60;
        const words = node.term.split(' ');
        let line = '';
        let lineHeight = node.isTopic ? 18 : 16;
        let y = node.y - (words.length > 1 ? lineHeight / 2 * (words.length - 1) : 0);
        
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
    
    // Handle mouse move to detect hovering over nodes
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 0.7;
      
      // Check if mouse is over any node
      let hoveredTerm: string | null = null;
      
      // Check the center node (topic)
      const distToCenter = Math.sqrt(
        Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
      );
      
      if (distToCenter <= 50) { // Topic node radius
        hoveredTerm = currentTopic;
      } else {
        // Check other nodes
        const angleStep = (2 * Math.PI) / concepts.length;
        concepts.forEach((concept, index) => {
          const angle = index * angleStep;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          
          const distToConcept = Math.sqrt(
            Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2)
          );
          
          if (distToConcept <= 35) { // Concept node radius
            hoveredTerm = concept.term;
          }
        });
      }
      
      // Update hovered node if changed
      if (hoveredTerm !== hoveredNode) {
        setHoveredNode(hoveredTerm);
        renderNetwork();
        
        // Change cursor to pointer if hovering over a node
        canvas.style.cursor = hoveredTerm ? 'pointer' : 'default';
      }
    };
    
    // Handle click to select a concept
    const handleClick = (e: MouseEvent) => {
      if (hoveredNode && hoveredNode !== currentTopic) {
        const clickedConcept = concepts.find(c => c.term === hoveredNode);
        if (clickedConcept) {
          setSelectedConcept(clickedConcept);
          setIsPopupOpen(true);
        }
      }
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    
    // Re-render on window resize
    window.addEventListener('resize', renderNetwork);
    
    return () => {
      window.removeEventListener('resize', renderNetwork);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [concepts, currentTopic, hoveredNode]);
  
  return (
    <div className="mt-4">
      <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", AI_STYLES.text.primary)}>
        <Sparkles className={cn("h-5 w-5", AI_STYLES.text.accent)} />
        Concept Map
      </h3>

      <div className={cn(AI_STYLES.backgrounds.surface, "rounded-lg p-4 mb-4", AI_STYLES.borders.default)}>
        <div className="text-xs text-gray-500 mb-2">
          Click on any concept to learn more about it
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-[400px]"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {concepts.map((concept) => (
          <Button
            key={concept.id}
            variant="outline"
            size="sm"
            className={cn(AI_STYLES.backgrounds.hover, AI_STYLES.borders.default, AI_STYLES.borders.hover)}
            onClick={() => {
              setSelectedConcept(concept);
              setIsPopupOpen(true);
            }}
          >
            {concept.term}
          </Button>
        ))}
      </div>
      
      {/* Concept Detail Popup */}
      <ConceptDetailPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        concept={selectedConcept}
        topic={currentTopic}
      />
    </div>
  );
};

export default ConceptNetworkViewer;
