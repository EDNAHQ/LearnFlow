import { useState } from "react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink 
} from "@/components/ui/pagination";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Grid, List } from "lucide-react";

interface StepPaginationProps {
  currentStep: number;
  totalSteps: number;
  onNavigate: (step: number) => void;
  steps: Array<{ id: string; title: string; }>;
}

const StepPagination = ({
  currentStep,
  totalSteps,
  onNavigate,
  steps
}: StepPaginationProps) => {
  const [showAllSteps, setShowAllSteps] = useState(false);
  
  // Generate pagination numbers - show max 5 pages
  const getPaginationNumbers = () => {
    // If 7 or fewer steps, show all page numbers
    if (totalSteps <= 7) {
      return Array.from({ length: totalSteps }, (_, i) => i);
    }
    
    // Otherwise show a subset with current page in the middle when possible
    let pages = [];
    // Always show first page
    pages.push(0);
    
    // Calculate the middle range
    if (currentStep < 3) {
      // If near the start, show first 5 pages
      pages = [...pages, 1, 2, 3, 4];
    } else if (currentStep > totalSteps - 4) {
      // If near the end, show last 5 pages
      pages = [...pages, totalSteps - 5, totalSteps - 4, totalSteps - 3, totalSteps - 2, totalSteps - 1];
    } else {
      // Show 2 before and 2 after current page
      pages = [...pages, currentStep - 2, currentStep - 1, currentStep, currentStep + 1, currentStep + 2];
    }
    
    // Always show last page if not already included
    if (!pages.includes(totalSteps - 1)) {
      // Add ellipsis indication
      if (pages[pages.length - 1] !== totalSteps - 2) {
        pages.push(-1); // -1 indicates ellipsis
      }
      pages.push(totalSteps - 1);
    }
    
    // Add ellipsis after first page if needed
    if (pages[1] !== 1 && pages[1] !== -1) {
      pages = [pages[0], -1, ...pages.slice(1)];
    }
    
    return pages;
  };
  
  const pageNumbers = getPaginationNumbers();
  
  return (
    <div className="flex items-center justify-between w-full mb-4">
      <div className="flex items-center">
        <Dialog open={showAllSteps} onOpenChange={setShowAllSteps}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2 text-brand-purple gap-1 rounded-full px-4"
            >
              <Grid className="h-4 w-4" />
              <span>All Steps</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="pt-4">
              <h3 className="text-lg font-semibold mb-4">All Steps</h3>
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className={`p-3 rounded-md cursor-pointer ${currentStep === index 
                      ? 'bg-brand-purple text-white' 
                      : 'hover:bg-gray-100'}`}
                    onClick={() => {
                      onNavigate(index);
                      setShowAllSteps(false);
                    }}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-brand-purple font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{step.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="bg-[#6D42EF]/10 text-[#6D42EF] py-1.5 rounded-full font-semibold px-[20px] text-sm">
        Step {currentStep + 1} of {totalSteps}
      </div>
      
      <Pagination>
        <PaginationContent className="flex-wrap">
          <PaginationItem>
            <PaginationLink
              onClick={() => currentStep > 0 && onNavigate(currentStep - 1)}
              className={`rounded-full ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              isActive={false}
            >
              <ChevronLeft className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
          
          {pageNumbers.map((pageIndex, i) => (
            pageIndex === -1 ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <span className="px-2">...</span>
              </PaginationItem>
            ) : (
              <PaginationItem key={pageIndex}>
                <PaginationLink
                  onClick={() => onNavigate(pageIndex)}
                  isActive={currentStep === pageIndex}
                  className="rounded-full"
                >
                  {pageIndex + 1}
                </PaginationLink>
              </PaginationItem>
            )
          ))}
          
          <PaginationItem>
            <PaginationLink
              onClick={() => currentStep < totalSteps - 1 && onNavigate(currentStep + 1)}
              className={`rounded-full ${currentStep === totalSteps - 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              isActive={false}
            >
              <ChevronRight className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default StepPagination;
