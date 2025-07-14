import React from 'react';

interface HighlightedTextProps {
  text: string;
  searchTerms: string[];
  className?: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ 
  text, 
  searchTerms, 
  className = '' 
}) => {
  if (!searchTerms || searchTerms.length === 0 || !text) {
    return <span className={className}>{text}</span>;
  }

  // Clean and prepare search terms
  const cleanTerms = searchTerms
    .filter(term => term && term.trim().length > 0)
    .map(term => term.trim().toLowerCase());

  if (cleanTerms.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Create regex pattern to match whole words only
  const pattern = cleanTerms
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special regex characters
    .join('|');
  
  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

  // Split text by matches and create highlighted parts
  const parts = text.split(regex);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = cleanTerms.some(term => 
          part.toLowerCase() === term.toLowerCase()
        );
        
        return isMatch ? (
          <mark 
            key={index}
            className="bg-yellow-200 px-1 font-medium"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};

export default HighlightedText;