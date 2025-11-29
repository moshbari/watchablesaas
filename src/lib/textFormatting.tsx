/**
 * Text formatting utility for applying highlight, bold, italic, and underline
 * to specific words/phrases in text based on comma-separated lists
 */

interface FormatConfig {
  highlight?: string; // comma-separated words to highlight (color + bold)
  highlightColor?: string; // custom color for highlighted text
  bold?: string; // comma-separated words to make bold
  italic?: string; // comma-separated words to make italic
  underline?: string; // comma-separated words to underline
}

/**
 * Parse comma-separated string into array of trimmed phrases
 */
const parseFormatList = (formatString?: string): string[] => {
  if (!formatString || !formatString.trim()) return [];
  return formatString
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
};

/**
 * Apply formatting to text based on format configuration
 * Returns JSX elements with appropriate styling
 */
export const formatText = (text: string, config: FormatConfig): React.ReactNode => {
  if (!text) return text;

  const highlightWords = parseFormatList(config.highlight);
  const boldWords = parseFormatList(config.bold);
  const italicWords = parseFormatList(config.italic);
  const underlineWords = parseFormatList(config.underline);

  // If no formatting is specified, return plain text
  if (
    highlightWords.length === 0 &&
    boldWords.length === 0 &&
    italicWords.length === 0 &&
    underlineWords.length === 0
  ) {
    return text;
  }

  // Build regex pattern that matches any of the words/phrases (case-insensitive)
  const allWords = [
    ...highlightWords,
    ...boldWords,
    ...italicWords,
    ...underlineWords
  ];

  // Escape special regex characters and sort by length (longest first) to match longer phrases first
  const escapedWords = allWords
    .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length);

  if (escapedWords.length === 0) return text;

  const pattern = new RegExp(`(${escapedWords.join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    // Check if this part matches any formatting rule
    const lowerPart = part.toLowerCase();
    
    const isHighlight = highlightWords.some(word => word.toLowerCase() === lowerPart);
    const isBold = boldWords.some(word => word.toLowerCase() === lowerPart);
    const isItalic = italicWords.some(word => word.toLowerCase() === lowerPart);
    const isUnderline = underlineWords.some(word => word.toLowerCase() === lowerPart);

    // If no formatting matches, return plain text
    if (!isHighlight && !isBold && !isItalic && !isUnderline) {
      return <span key={index}>{part}</span>;
    }

    // Build className and style based on formatting rules
    const classNames: string[] = [];
    const inlineStyle: React.CSSProperties = {};
    
    if (isHighlight) {
      classNames.push('font-bold');
      if (config.highlightColor) {
        inlineStyle.color = config.highlightColor;
      } else {
        classNames.push('text-primary');
      }
    }
    if (isBold) {
      classNames.push('font-bold');
    }
    if (isItalic) {
      classNames.push('italic');
    }
    if (isUnderline) {
      classNames.push('underline');
    }

    return (
      <span 
        key={index} 
        className={classNames.join(' ')}
        style={Object.keys(inlineStyle).length > 0 ? inlineStyle : undefined}
      >
        {part}
      </span>
    );
  });
};
