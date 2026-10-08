'use client';

import { useRef, useState, type MouseEvent } from 'react';
import type {
  RichTextDocumentDto,
  RichTextMarkDto,
  RichTextNodeDto,
} from '@traderlab/contracts';
import styles from './RichTextEditor.module.css';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character] ?? character;
  });
}

function safeHref(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function inlineHtml(node: RichTextNodeDto): string {
  if (node.type === 'text') {
    let html = escapeHtml(node.text).replace(/\n/g, '<br>');
    for (const mark of node.marks ?? []) {
      const tag = mark === 'bold' ? 'strong' : mark === 'italic' ? 'em' : 'u';
      html = `<${tag}>${html}</${tag}>`;
    }
    return html;
  }
  if (node.type === 'link') {
    const href = safeHref(node.href);
    return href
      ? `<a href="${escapeHtml(href)}">${escapeHtml(node.text)}</a>`
      : escapeHtml(node.text);
  }
  return '';
}

function blockHtml(node: RichTextNodeDto): string {
  if (node.type === 'text' || node.type === 'link') return inlineHtml(node);
  const children = node.children
    .map((child) =>
      child.type === 'paragraph' ||
      child.type === 'heading' ||
      child.type === 'bulletList' ||
      child.type === 'orderedList' ||
      child.type === 'blockquote' ||
      child.type === 'listItem'
        ? blockHtml(child)
        : inlineHtml(child),
    )
    .join('');
  switch (node.type) {
    case 'paragraph':
      return `<p>${children || '<br>'}</p>`;
    case 'heading':
      return `<h${node.level}>${children || '<br>'}</h${node.level}>`;
    case 'bulletList':
      return `<ul>${children}</ul>`;
    case 'orderedList':
      return `<ol>${children}</ol>`;
    case 'listItem':
      return `<li>${children}</li>`;
    case 'blockquote':
      return `<blockquote>${children}</blockquote>`;
  }
}

function documentHtml(document: RichTextDocumentDto) {
  return document.children.map(blockHtml).join('');
}

function initialDocument(value: string): RichTextDocumentDto {
  try {
    const parsed = JSON.parse(value) as RichTextDocumentDto;
    if (parsed?.type === 'doc' && Array.isArray(parsed.children)) return parsed;
  } catch {
    // Conteúdos anteriores eram texto simples.
  }
  return {
    type: 'doc',
    children: value
      .split(/\r?\n/)
      .filter((line) => line.length > 0)
      .map((line) => ({
        type: 'paragraph' as const,
        children: [{ type: 'text' as const, text: line }],
      })),
  };
}

function parseInline(
  node: Node,
  marks: RichTextMarkDto[] = [],
): RichTextNodeDto[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? '';
    return text
      ? [{ type: 'text', text, ...(marks.length ? { marks } : {}) }]
      : [];
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return [];
  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();
  if (tag === 'br') return [{ type: 'text', text: '\n' }];
  if (tag === 'a') {
    const href = safeHref(element.getAttribute('href') ?? '');
    const text = element.textContent ?? '';
    return href && text
      ? [{ type: 'link', text, href }]
      : parseChildren(element, marks);
  }
  const nextMarks = [...marks];
  if ((tag === 'b' || tag === 'strong') && !nextMarks.includes('bold'))
    nextMarks.push('bold');
  if ((tag === 'i' || tag === 'em') && !nextMarks.includes('italic'))
    nextMarks.push('italic');
  if (tag === 'u' && !nextMarks.includes('underline'))
    nextMarks.push('underline');
  return parseChildren(element, nextMarks);
}

function parseChildren(element: ParentNode, marks: RichTextMarkDto[] = []) {
  return Array.from(element.childNodes).flatMap((child) =>
    parseInline(child, marks),
  );
}

function parseBlocks(element: ParentNode): RichTextNodeDto[] {
  const result: RichTextNodeDto[] = [];
  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent ?? '';
      if (text.trim())
        result.push({ type: 'paragraph', children: [{ type: 'text', text }] });
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const block = child as HTMLElement;
    const tag = block.tagName.toLowerCase();
    const children = parseChildren(block);
    if (tag === 'h2' || tag === 'h3') {
      result.push({ type: 'heading', level: tag === 'h2' ? 2 : 3, children });
    } else if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(block.children)
        .filter((item) => item.tagName.toLowerCase() === 'li')
        .map((item) => ({
          type: 'listItem' as const,
          children: parseChildren(item),
        }));
      result.push({
        type: tag === 'ul' ? 'bulletList' : 'orderedList',
        children: items,
      });
    } else if (tag === 'blockquote') {
      result.push({ type: 'blockquote', children });
    } else if (tag === 'p' || tag === 'div' || tag === 'li') {
      if (children.length) result.push({ type: 'paragraph', children });
    } else {
      const inline = parseInline(block);
      if (inline.length) result.push({ type: 'paragraph', children: inline });
    }
  }
  return result;
}

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const content = initialDocument(value);
  const [initialHtml] = useState(() => documentHtml(content));

  function format(
    event: MouseEvent<HTMLButtonElement>,
    command: string,
    value?: string,
  ) {
    event.preventDefault();
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(
        JSON.stringify({
          type: 'doc',
          children: parseBlocks(editorRef.current),
        }),
      );
    }
  }

  function handleInput() {
    if (!editorRef.current) return;
    onChange(
      JSON.stringify({ type: 'doc', children: parseBlocks(editorRef.current) }),
    );
  }

  return (
    <div className={styles.editor}>
      <div
        className={styles.toolbar}
        role="toolbar"
        aria-label="Formatação do conteúdo da aula"
      >
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => format(event, 'formatBlock', 'P')}
          aria-label="Parágrafo"
          title="Parágrafo"
        >
          ¶
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => format(event, 'formatBlock', 'H2')}
          aria-label="Título"
          title="Título"
        >
          H2
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => format(event, 'formatBlock', 'H3')}
          aria-label="Subtítulo"
          title="Subtítulo"
        >
          H3
        </button>
        <span aria-hidden="true" />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => format(event, 'bold')}
          aria-label="Negrito"
          title="Negrito"
        >
          <strong>N</strong>
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => format(event, 'italic')}
          aria-label="Itálico"
          title="Itálico"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => format(event, 'underline')}
          aria-label="Sublinhado"
          title="Sublinhado"
        >
          <u>S</u>
        </button>
      </div>
      <div
        ref={editorRef}
        id="lesson-body-editor"
        className={styles.content}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Conteúdo da aula"
        aria-multiline="true"
        data-placeholder="Escreva o conteúdo da aula. Selecione um trecho para aplicar a formatação."
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: initialHtml }}
      />
    </div>
  );
}
