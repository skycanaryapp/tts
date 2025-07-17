// Text processing and rendering utilities for AI agent responses

export interface ProcessedText {
  type: 'text' | 'markdown' | 'code' | 'list' | 'link';
  content: string;
  language?: string;
  items?: string[];
  url?: string;
  title?: string;
}

export interface ParsedMessage {
  segments: ProcessedText[];
  hasFormatting: boolean;
}

// Parse and process agent response text
export function parseAgentResponse(text: string): ParsedMessage {
  const segments: ProcessedText[] = [];
  let hasFormatting = false;

  // Split text by code blocks first
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  const parts = text.split(codeBlockRegex);
  
  for (let i = 0; i < parts.length; i += 3) {
    const textPart = parts[i];
    const language = parts[i + 1];
    const codePart = parts[i + 2];

    // Process regular text part
    if (textPart && textPart.trim()) {
      const textSegments = processTextSegment(textPart);
      segments.push(...textSegments);
      if (textSegments.some(seg => seg.type !== 'text')) {
        hasFormatting = true;
      }
    }

    // Process code block
    if (codePart !== undefined) {
      segments.push({
        type: 'code',
        content: codePart.trim(),
        language: language || 'text'
      });
      hasFormatting = true;
    }
  }

  return { segments, hasFormatting };
}

// Process a text segment for markdown-like formatting
function processTextSegment(text: string): ProcessedText[] {
  const segments: ProcessedText[] = [];
  
  // Check for lists - including bullet points with • character
  const lines = text.split('\n');
  let currentList: string[] = [];
  let currentText = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if line is a list item (starts with •, -, *, or number.)
    const isListItem = /^(\d+\.\s+|[-*•]\s+)/.test(line);
    
    if (isListItem) {
      // If we have accumulated text, add it as a segment
      if (currentText.trim()) {
        segments.push(...processSimpleFormatting(currentText.trim()));
        currentText = '';
      }
      
      // Extract the list item content (remove bullet/number)
      const itemContent = line.replace(/^(\d+\.\s+|[-*•]\s+)/, '').trim();
      currentList.push(itemContent);
    } else {
      // If we have accumulated list items, add them as a list segment
      if (currentList.length > 0) {
        segments.push({
          type: 'list',
          content: '',
          items: currentList
        });
        currentList = [];
      }
      
      // Add line to current text
      if (line) {
        currentText += (currentText ? '\n' : '') + line;
      } else if (currentText) {
        // Empty line - process accumulated text
        segments.push(...processSimpleFormatting(currentText.trim()));
        currentText = '';
      }
    }
  }
  
  // Handle remaining content
  if (currentList.length > 0) {
    segments.push({
      type: 'list',
      content: '',
      items: currentList
    });
  }
  
  if (currentText.trim()) {
    segments.push(...processSimpleFormatting(currentText.trim()));
  }
  
  return segments;
}

// Process simple markdown formatting (bold, italic, links)
function processSimpleFormatting(text: string): ProcessedText[] {
  // Check for URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urlMatches = text.match(urlRegex);
  
  if (urlMatches) {
    const segments: ProcessedText[] = [];
    let lastIndex = 0;
    
    urlMatches.forEach(url => {
      const urlIndex = text.indexOf(url, lastIndex);
      
      // Add text before URL
      if (urlIndex > lastIndex) {
        const beforeUrl = text.substring(lastIndex, urlIndex);
        if (beforeUrl.trim()) {
          segments.push({
            type: 'text',
            content: beforeUrl
          });
        }
      }
      
      // Add URL as link
      segments.push({
        type: 'link',
        content: url,
        url,
        title: url
      });
      
      lastIndex = urlIndex + url.length;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText.trim()) {
        segments.push({
          type: 'text',
          content: remainingText
        });
      }
    }
    
    return segments;
  }
  
  // Check for markdown-style formatting (more comprehensive)
  const hasMarkdown = /\*\*.*?\*\*|\*(?!\s).*?(?<!\s)\*|__.*?__|_(?!\s).*?(?<!\s)_|`.*?`/.test(text);
  
  if (hasMarkdown) {
    return [{
      type: 'markdown',
      content: text
    }];
  }
  
  return [{
    type: 'text',
    content: text
  }];
}

// Format text with basic markdown-like styling
export function formatMarkdownText(text: string): string {
  return text
    // Bold: **text** or __text__ (improved to handle Arabic and mixed content)
    .replace(/\*\*((?:[^*]|\*(?!\*))+?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/__((?:[^_]|_(?!_))+?)__/g, '<strong class="font-bold">$1</strong>')
    // Italic: *text* or _text_ (avoid conflicts with bold)
    .replace(/\*([^*]+?)\*/g, '<em class="italic">$1</em>')
    .replace(/_([^_]+?)_/g, '<em class="italic">$1</em>')
    // Inline code: `code`
    .replace(/`([^`]+?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
}

// Clean and prepare text for display
export function cleanText(text: string): string {
  return text
    .trim()
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
}

// Detect if text contains Arabic content
export function hasArabicContent(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicRegex.test(text);
}

// Apply appropriate text direction based on content
export function getTextDirection(text: string): 'rtl' | 'ltr' {
  return hasArabicContent(text) ? 'rtl' : 'ltr';
}