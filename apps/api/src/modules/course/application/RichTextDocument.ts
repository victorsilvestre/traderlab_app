import type {
  RichTextDocumentDto,
  RichTextMarkDto,
  RichTextNodeDto,
} from '@traderlab/contracts';

const allowedMarks = new Set<RichTextMarkDto>([
  'bold',
  'italic',
  'underline',
]);
const maximumNodes = 3000;
const maximumDepth = 12;

function safeLink(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function toRichTextDocument(value: string): RichTextDocumentDto {
  let input: unknown;
  try {
    input = JSON.parse(value);
  } catch {
    input = null;
  }

  if (
    !input ||
    typeof input !== 'object' ||
    !('type' in input) ||
    input.type !== 'doc' ||
    !('children' in input) ||
    !Array.isArray(input.children)
  ) {
    const paragraphs = value
      .split(/\r?\n\s*\r?\n/)
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text): RichTextNodeDto => ({
        type: 'paragraph',
        children: [{ type: 'text', text }],
      }));
    return { type: 'doc', children: paragraphs };
  }

  let count = 0;
  const parseNodes = (nodes: unknown[], depth: number): RichTextNodeDto[] => {
    if (depth > maximumDepth) return [];
    return nodes.flatMap((candidate) => {
      count += 1;
      if (count > maximumNodes || !candidate || typeof candidate !== 'object') {
        return [];
      }
      const node = candidate as Record<string, unknown>;
      if (node.type === 'text' && typeof node.text === 'string') {
        const marks = Array.isArray(node.marks)
          ? node.marks.filter(
              (mark): mark is RichTextMarkDto =>
                typeof mark === 'string' &&
                allowedMarks.has(mark as RichTextMarkDto),
            )
          : [];
        return [{
          type: 'text' as const,
          text: node.text.slice(0, 20000),
          ...(marks.length ? { marks } : {}),
        }];
      }
      if (node.type === 'link' && typeof node.text === 'string') {
        const href = safeLink(node.href);
        return href
          ? [{ type: 'link' as const, text: node.text.slice(0, 20000), href }]
          : [{ type: 'text' as const, text: node.text.slice(0, 20000) }];
      }
      if (!Array.isArray(node.children)) return [];
      const children = parseNodes(node.children, depth + 1);
      switch (node.type) {
        case 'paragraph':
        case 'bulletList':
        case 'orderedList':
        case 'listItem':
        case 'blockquote':
          return [{ type: node.type, children } as RichTextNodeDto];
        case 'heading':
          return [{
            type: 'heading',
            level: node.level === 3 ? 3 : 2,
            children,
          }];
        default:
          return [];
      }
    });
  };

  return { type: 'doc', children: parseNodes(input.children, 0) };
}
