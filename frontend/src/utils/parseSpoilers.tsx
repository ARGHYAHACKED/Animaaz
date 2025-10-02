import React from 'react';
import Spoiler from '../components/Community/Spoiler';

// Parses [spoiler]...[/spoiler] tags and returns an array of React nodes
export function parseSpoilers(text: string): React.ReactNode[] {
  if (!text) return [];
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  const spoilerRegex = /\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = spoilerRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    result.push(
      <Spoiler key={key++}>{match[1]}</Spoiler>
    );
    lastIndex = spoilerRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  return result;
}
