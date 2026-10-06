import { Fragment, type ReactNode } from 'react';
import type { RichTextNodeDto } from '@traderlab/contracts';

function renderText(
  text: string,
  marks: Array<'bold' | 'italic' | 'underline'> | undefined,
): ReactNode {
  let content: ReactNode = text;
  for (const mark of marks ?? []) {
    if (mark === 'bold') content = <strong>{content}</strong>;
    if (mark === 'italic') content = <em>{content}</em>;
    if (mark === 'underline') content = <u>{content}</u>;
  }
  return content;
}

function renderNode(node: RichTextNodeDto, key: string): ReactNode {
  if (node.type === 'text') {
    return <Fragment key={key}>{renderText(node.text, node.marks)}</Fragment>;
  }
  if (node.type === 'link') {
    return (
      <a href={node.href} key={key} target="_blank" rel="noreferrer">
        {node.text}
      </a>
    );
  }

  const children = node.children.map((child, index) =>
    renderNode(child, `${key}-${index}`),
  );
  switch (node.type) {
    case 'paragraph':
      return <p key={key}>{children}</p>;
    case 'heading':
      return node.level === 2 ? (
        <h2 key={key}>{children}</h2>
      ) : (
        <h3 key={key}>{children}</h3>
      );
    case 'bulletList':
      return <ul key={key}>{children}</ul>;
    case 'orderedList':
      return <ol key={key}>{children}</ol>;
    case 'listItem':
      return <li key={key}>{children}</li>;
    case 'blockquote':
      return <blockquote key={key}>{children}</blockquote>;
  }
}

export function RichTextRenderer({
  document,
}: {
  document: { children: RichTextNodeDto[] };
}) {
  return <>{document.children.map((node, index) => renderNode(node, `${index}`))}</>;
}
