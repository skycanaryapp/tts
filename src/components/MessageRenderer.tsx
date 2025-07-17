import React from 'react';
import { parseAgentResponse, formatMarkdownText, getTextDirection, ProcessedText } from '../lib/textProcessor';

interface MessageRendererProps {
  text: string;
  isAgent: boolean;
  className?: string;
}

// Component to render a single text segment
const SegmentRenderer: React.FC<{ segment: ProcessedText }> = ({ segment }) => {
  const direction = getTextDirection(segment.content);
  
  switch (segment.type) {
    case 'code':
      return (
        <div className="my-3">
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto" dir="ltr">
            {segment.language && (
              <div className="text-gray-400 text-xs mb-2 font-mono">{segment.language}</div>
            )}
            <pre className="text-sm font-mono whitespace-pre-wrap">
              <code>{segment.content}</code>
            </pre>
          </div>
        </div>
      );
      
    case 'list':
      return (
        <div className="my-3">
          <ul className="space-y-2" style={{ listStyle: 'none' }}>
            {segment.items?.map((item, index) => {
              const itemDirection = getTextDirection(item);
              const isItemRTL = itemDirection === 'rtl';
              return (
                <li 
                  key={index} 
                  className={`flex items-start gap-2 ${isItemRTL ? 'flex-row-reverse' : ''}`} 
                  dir={itemDirection}
                  style={{ 
                    direction: itemDirection,
                    textAlign: isItemRTL ? 'right' : 'left',
                    unicodeBidi: 'isolate'
                  }}
                >
                  <span 
                    className={`text-orange-600 mt-1 text-sm flex-shrink-0 select-none`}
                    style={{
                      order: isItemRTL ? 1 : 0,
                      marginLeft: isItemRTL ? '8px' : '0',
                      marginRight: isItemRTL ? '0' : '8px'
                    }}
                  >
                    •
                  </span>
                  <div 
                    className="text-sm leading-relaxed flex-1" 
                    style={{ 
                      order: isItemRTL ? 0 : 1,
                      direction: itemDirection 
                    }}
                  >
                    <MessageRenderer text={item} isAgent={true} className="" />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      );
      
    case 'link':
      return (
        <a 
          href={segment.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all"
          dir="ltr"
        >
          {segment.title || segment.content}
        </a>
      );
      
    case 'markdown':
      return (
        <span 
          className="leading-relaxed"
          dir={direction}
          dangerouslySetInnerHTML={{ 
            __html: formatMarkdownText(segment.content) 
          }} 
        />
      );
      
    case 'text':
    default:
      return (
        <span className="leading-relaxed whitespace-pre-wrap" dir={direction}>
          {segment.content}
        </span>
      );
  }
};

// Main message renderer component
export const MessageRenderer: React.FC<MessageRendererProps> = ({ 
  text, 
  isAgent, 
  className = "" 
}) => {
  // Only process agent messages for advanced formatting
  if (!isAgent) {
    const direction = getTextDirection(text);
    return (
      <p className={`text-sm whitespace-pre-line leading-relaxed ${className}`} dir={direction}>
        {text}
      </p>
    );
  }

  // Parse agent response for advanced formatting
  const parsed = parseAgentResponse(text);
  
  // If no special formatting detected, render as simple text
  if (!parsed.hasFormatting) {
    const direction = getTextDirection(text);
    return (
      <p className={`text-sm whitespace-pre-line leading-relaxed ${className}`} dir={direction}>
        {text}
      </p>
    );
  }

  // Render with advanced formatting
  return (
    <div className={`text-sm ${className}`}>
      {parsed.segments.map((segment, index) => (
        <React.Fragment key={index}>
          <SegmentRenderer segment={segment} />
          {/* Add spacing between segments if needed */}
          {index < parsed.segments.length - 1 && segment.type !== 'text' && (
            <div className="h-1"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default MessageRenderer;