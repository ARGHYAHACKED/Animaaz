// Utility to parse content for hashtags and spoilers
import React from 'react';
import Spoiler from '../components/Spoiler';

// Returns an array of React nodes with hashtags and spoilers parsed
export function parseContent(content: string, onTagClick?: (tag: string) => void): React.ReactNode[] {
  if (!content) return [];
  // Regex for [spoiler]...[/spoiler]
  const spoilerRegex = /\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi;
  // Regex for hashtags
  const hashtagRegex = /#([\w\d_\-]+)/g;

  let nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let contentToParse = content;
  let idx = 0;

  // First, split by spoilers
  while ((match = spoilerRegex.exec(contentToParse)) !== null) {
    if (match.index > lastIndex) {
      // Parse hashtags in the non-spoiler part
      nodes = nodes.concat(parseHashtags(contentToParse.slice(lastIndex, match.index), onTagClick, idx++));
    }
    nodes.push(
      <Spoiler key={`spoiler-${idx++}`}>{parseHashtags(match[1], onTagClick, idx++)}</Spoiler>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < contentToParse.length) {
    nodes = nodes.concat(parseHashtags(contentToParse.slice(lastIndex), onTagClick, idx++));
  }
  return nodes;
}

function parseHashtags(text: string, onTagClick?: (tag: string) => void, keyPrefix: number = 0): React.ReactNode[] {
  const hashtagRegex = /#([\w\d_\-]+)/g;
  let nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;
  while ((match = hashtagRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const tag = match[1];
    nodes.push(
      <span
        key={`tag-${keyPrefix}-${idx++}`}
        className="text-green-600 dark:text-green-400 font-semibold cursor-pointer hover:underline"
        onClick={onTagClick ? () => onTagClick(tag) : undefined}
      >
        #{tag}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}
