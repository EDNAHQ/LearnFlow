
// Utility to format content with proper markdown-like rendering
export const formatContent = (text: string) => {
  const paragraphs = text.split("\n\n");
  
  return paragraphs.map((paragraph, i) => {
    // Check if this is a heading (starts with # or ##)
    if (paragraph.startsWith('# ')) {
      return (
        <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-brand-purple">
          {paragraph.replace('# ', '')}
        </h2>
      );
    } else if (paragraph.startsWith('## ')) {
      return (
        <h3 key={i} className="text-xl font-semibold mt-6 mb-3 text-brand-purple/90">
          {paragraph.replace('## ', '')}
        </h3>
      );
    } else if (paragraph.startsWith('### ')) {
      return (
        <h4 key={i} className="text-lg font-medium mt-5 mb-2 text-brand-purple/80">
          {paragraph.replace('### ', '')}
        </h4>
      );
    } else if (paragraph.startsWith('```')) {
      // Handle code blocks with enhanced styling
      const code = paragraph.replace(/```(.+)?\n/g, '').replace(/```$/g, '');
      return (
        <pre key={i} className="bg-gray-900 p-5 rounded-lg mb-5 overflow-x-auto border border-brand-purple/20 shadow-md">
          <code className="text-sm font-mono text-gray-100 whitespace-pre">{code}</code>
        </pre>
      );
    } else if (paragraph.startsWith('- ')) {
      // Handle bullet points with better styling
      const listItems = paragraph.split('\n- ');
      return (
        <ul key={i} className="list-disc pl-6 mb-5 space-y-2 marker:text-brand-purple">
          {listItems.map((item, j) => (
            <li key={`${i}-${j}`} className="text-pretty text-lg">
              {item.replace('- ', '')}
            </li>
          ))}
        </ul>
      );
    } else if (paragraph.startsWith('1. ')) {
      // Handle numbered lists with better styling
      const listItems = paragraph.split(/\n\d+\. /);
      return (
        <ol key={i} className="list-decimal pl-6 mb-5 space-y-2 marker:text-brand-purple">
          {listItems.map((item, j) => (
            <li key={`${i}-${j}`} className="text-pretty text-lg">
              {j === 0 ? item.replace('1. ', '') : item}
            </li>
          ))}
        </ol>
      );
    } else if (paragraph.startsWith('> ')) {
      // Handle blockquotes with enhanced styling
      return (
        <blockquote key={i} className="border-l-4 border-brand-purple pl-4 py-2 mb-5 text-lg italic bg-brand-purple/5 rounded-r-lg shadow-sm">
          {paragraph.replace('> ', '')}
        </blockquote>
      );
    } else if (paragraph.includes('**') && paragraph.split('**').length > 2) {
      // Handle paragraphs with bold text
      const segments = paragraph.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-5 text-lg leading-relaxed text-pretty">
          {segments.map((segment, j) => {
            if (segment.startsWith('**') && segment.endsWith('**')) {
              // Bold text
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
    } else if (paragraph.includes('`') && paragraph.split('`').length > 2) {
      // Handle paragraphs with inline code
      const segments = paragraph.split(/(`.*?`)/g);
      return (
        <p key={i} className="mb-5 text-lg leading-relaxed text-pretty">
          {segments.map((segment, j) => {
            if (segment.startsWith('`') && segment.endsWith('`')) {
              // Inline code
              return (
                <code key={`${i}-${j}`} className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-brand-pink border border-gray-200">
                  {segment.replace(/^`|`$/g, '')}
                </code>
              );
            }
            return <span key={`${i}-${j}`}>{segment}</span>;
          })}
        </p>
      );
    } else {
      // Regular paragraphs with better styling
      return (
        <p key={i} className="mb-5 text-lg leading-relaxed text-pretty">
          {paragraph}
        </p>
      );
    }
  });
};
