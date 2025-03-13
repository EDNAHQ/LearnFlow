
// Utility to format content with proper markdown-like rendering
export const formatContent = (text: string) => {
  const paragraphs = text.split("\n\n");
  
  return paragraphs.map((paragraph, i) => {
    // Check if this is a heading (starts with # or ##)
    if (paragraph.startsWith('# ')) {
      return (
        <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-learn-800">
          {paragraph.replace('# ', '')}
        </h2>
      );
    } else if (paragraph.startsWith('## ')) {
      return (
        <h3 key={i} className="text-xl font-semibold mt-6 mb-3 text-learn-700">
          {paragraph.replace('## ', '')}
        </h3>
      );
    } else if (paragraph.startsWith('### ')) {
      return (
        <h4 key={i} className="text-lg font-medium mt-5 mb-2 text-learn-700">
          {paragraph.replace('### ', '')}
        </h4>
      );
    } else if (paragraph.startsWith('```')) {
      // Handle code blocks
      const code = paragraph.replace(/```(.+)?\n/g, '').replace(/```$/g, '');
      return (
        <pre key={i} className="bg-gray-100 p-4 rounded-lg mb-5 overflow-x-auto border border-gray-200">
          <code className="text-sm font-mono text-gray-800 whitespace-pre">{code}</code>
        </pre>
      );
    } else if (paragraph.startsWith('- ')) {
      // Handle bullet points
      const listItems = paragraph.split('\n- ');
      return (
        <ul key={i} className="list-disc pl-6 mb-5 space-y-2">
          {listItems.map((item, j) => (
            <li key={`${i}-${j}`} className="text-pretty text-lg">
              {item.replace('- ', '')}
            </li>
          ))}
        </ul>
      );
    } else if (paragraph.startsWith('1. ')) {
      // Handle numbered lists
      const listItems = paragraph.split(/\n\d+\. /);
      return (
        <ol key={i} className="list-decimal pl-6 mb-5 space-y-2">
          {listItems.map((item, j) => (
            <li key={`${i}-${j}`} className="text-pretty text-lg">
              {j === 0 ? item.replace('1. ', '') : item}
            </li>
          ))}
        </ol>
      );
    } else if (paragraph.startsWith('> ')) {
      // Handle blockquotes
      return (
        <blockquote key={i} className="border-l-4 border-[#6D42EF] pl-4 py-1 mb-5 text-lg italic bg-gray-50 rounded-r-lg">
          {paragraph.replace('> ', '')}
        </blockquote>
      );
    } else {
      return (
        <p key={i} className="mb-5 text-lg leading-relaxed text-pretty">
          {paragraph}
        </p>
      );
    }
  });
};
