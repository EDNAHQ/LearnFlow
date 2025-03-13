
import { useTheme } from "next-themes";

// Utility to format content with proper markdown-like rendering
export const formatContent = (text: string) => {
  const paragraphs = text.split("\n\n");
  
  return paragraphs.map((paragraph, i) => {
    // Handle headings with stronger visual hierarchy and color
    if (paragraph.startsWith('# ')) {
      return (
        <h2 key={i} className="text-2xl font-bold mt-10 mb-4 text-gradient-purple relative pb-2 border-b border-brand-purple/20">
          {paragraph.replace('# ', '')}
        </h2>
      );
    } else if (paragraph.startsWith('## ')) {
      return (
        <h3 key={i} className="text-xl font-semibold mt-8 mb-3 text-brand-purple relative pb-1">
          {paragraph.replace('## ', '')}
        </h3>
      );
    } else if (paragraph.startsWith('### ')) {
      return (
        <h4 key={i} className="text-lg font-medium mt-6 mb-2 text-brand-purple/90">
          {paragraph.replace('### ', '')}
        </h4>
      );
    } 
    
    // Enhanced code block formatting
    else if (paragraph.startsWith('```')) {
      const codeType = paragraph.match(/```([a-z]*)/)?.[1] || '';
      const code = paragraph.replace(/```([a-z]*\n)?/g, '').replace(/```$/g, '');
      
      return (
        <div key={i} className="relative mb-8 mt-6">
          <div className="absolute -top-3 left-3 px-3 py-0.5 bg-brand-dark text-xs font-semibold text-white rounded-t-md border-t border-l border-r border-brand-purple/30">
            {codeType ? codeType.toUpperCase() : 'CODE'}
          </div>
          <pre className="bg-[#1A1A1A] p-6 pt-7 rounded-lg overflow-x-auto border border-brand-purple/30 shadow-lg text-white">
            <code className="text-sm font-mono leading-relaxed">
              {code}
            </code>
          </pre>
        </div>
      );
    } 
    
    // Improved list styling with better indentation and bullets
    else if (paragraph.startsWith('- ')) {
      const listItems = paragraph.split('\n- ');
      return (
        <ul key={i} className="list-none pl-0 my-6 space-y-3">
          {listItems.map((item, j) => (
            <li key={`${i}-${j}`} className="flex items-start gap-3 text-lg">
              <span className="inline-block h-6 w-6 rounded-full bg-brand-purple/10 flex-shrink-0 flex items-center justify-center text-brand-purple mt-0.5">•</span>
              <span className="text-pretty">
                {item.replace('- ', '')}
              </span>
            </li>
          ))}
        </ul>
      );
    } 
    
    // Enhanced numbered list styling
    else if (paragraph.startsWith('1. ')) {
      const listItems = paragraph.split(/\n\d+\. /);
      return (
        <ol key={i} className="list-none pl-0 my-6 space-y-3 counter-reset">
          {listItems.map((item, j) => (
            <li key={`${i}-${j}`} className="flex items-start gap-3 text-lg">
              <span className="inline-block h-6 w-6 rounded-full bg-brand-purple/10 flex-shrink-0 flex items-center justify-center text-brand-purple font-semibold text-sm">
                {j + 1}
              </span>
              <span className="text-pretty">
                {j === 0 ? item.replace('1. ', '') : item}
              </span>
            </li>
          ))}
        </ol>
      );
    } 
    
    // Enhanced blockquote styling
    else if (paragraph.startsWith('> ')) {
      return (
        <blockquote key={i} className="border-l-4 border-brand-purple pl-4 py-3 my-6 text-lg italic bg-brand-purple/5 rounded-r-lg shadow-sm relative">
          <div className="absolute -top-2 -left-2 opacity-20 text-4xl text-brand-purple">"</div>
          <div className="relative z-10">
            {paragraph.replace('> ', '')}
          </div>
        </blockquote>
      );
    } 
    
    // Enhanced bold text styling
    else if (paragraph.includes('**') && paragraph.split('**').length > 2) {
      const segments = paragraph.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="my-5 text-lg leading-relaxed text-pretty">
          {segments.map((segment, j) => {
            if (segment.startsWith('**') && segment.endsWith('**')) {
              // Bold text with more emphasis
              return (
                <strong key={`${i}-${j}`} className="font-semibold text-brand-purple">
                  {segment.replace(/^\*\*|\*\*$/g, '')}
                </strong>
              );
            }
            return <span key={`${i}-${j}`}>{segment}</span>;
          })}
        </p>
      );
    } 
    
    // Enhanced inline code styling
    else if (paragraph.includes('`') && paragraph.split('`').length > 2) {
      const segments = paragraph.split(/(`.*?`)/g);
      return (
        <p key={i} className="my-5 text-lg leading-relaxed text-pretty">
          {segments.map((segment, j) => {
            if (segment.startsWith('`') && segment.endsWith('`')) {
              // Inline code with better styling
              return (
                <code key={`${i}-${j}`} className="px-1.5 py-0.5 rounded bg-gray-800 font-mono text-brand-pink text-sm">
                  {segment.replace(/^`|`$/g, '')}
                </code>
              );
            }
            return <span key={`${i}-${j}`}>{segment}</span>;
          })}
        </p>
      );
    } else {
      // Regular paragraphs with better spacing
      return (
        <p key={i} className="my-5 text-lg leading-relaxed text-pretty">
          {paragraph}
        </p>
      );
    }
  });
};
