// Regular expression to match @mentions
// Matches @ followed by word characters (letters, numbers, underscores)
// but doesn't include the @ in the capture group
export const MENTION_REGEX = /@(\w+)/g;

export interface TextPart {
  type: "text" | "mention";
  content: string;
}

export function parseTextWithMentions(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let lastIndex = 0;

  // Find all mentions in the text
  text.replace(MENTION_REGEX, (match, username, offset) => {
    // Add the text before the mention
    if (offset > lastIndex) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex, offset),
      });
    }

    // Add the mention
    parts.push({
      type: "mention",
      content: username,
    });

    lastIndex = offset + match.length;
    return match;
  });

  // Add any remaining text after the last mention
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return parts;
}
