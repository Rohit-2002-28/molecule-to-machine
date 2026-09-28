import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { visit, SKIP } from 'unist-util-visit';
import type { Root as MdRoot, RootContent as MdContent } from 'mdast';
import type { Root, Element, RootContent } from 'hast';
import type { Plugin } from 'unified';

export interface Section { id: string; title: string; depth: number; text: string }
export interface RenderedLesson { html: string; title: string; sections: Section[]; plainText: string; mathErrors: string[] }

function plain(node: Root | RootContent | MdRoot | MdContent): string {
  if ('value' in node) return node.value;
  if ('children' in node) return node.children.map(child => plain(child)).join(' ');
  return '';
}

// CommonMark identifies code first so delimiter normalization never changes code examples.
export function normalizeMath(markdown: string): string {
  const tree = unified().use(remarkParse).parse(markdown);
  const protectedRanges: [number, number][] = [];
  visit(tree, node => {
    if ((node.type === 'code' || node.type === 'inlineCode') &&
        node.position?.start.offset !== undefined && node.position.end.offset !== undefined) {
      protectedRanges.push([node.position.start.offset, node.position.end.offset]);
    }
  });
  protectedRanges.sort((a, b) => a[0] - b[0]);
  function normalize(text: string): string {
    return text.replace(/(?<!\\)\\\(([\s\S]*?)(?<!\\)\\\)|(?<!\\)\\\[([\s\S]*?)(?<!\\)\\\]/gu,
      (_match: string, inline: string | undefined, display: string | undefined) =>
        inline !== undefined ? `$${inline.trim()}$` : `\n$$\n${(display ?? '').trim()}\n$$\n`);
  }
  let result = '';
  let offset = 0;
  for (const [start, end] of protectedRanges) {
    result += normalize(markdown.slice(offset, start)) + markdown.slice(start, end);
    offset = end;
  }
  return result + normalize(markdown.slice(offset));
}

export function headingSlug(title: string): string {
  const slug = title.normalize('NFKD').toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/gu, '-');
  return `section-${slug || 'heading'}`;
}

const renderCache = new Map<string, Promise<RenderedLesson>>();

export function renderMarkdown(markdown: string): Promise<RenderedLesson> {
  const cached = renderCache.get(markdown);
  if (cached) return cached;
  const result = render(markdown);
  renderCache.set(markdown, result);
  return result;
}

async function render(markdown: string): Promise<RenderedLesson> {
  let title = '';
  let plainText = '';
  const sections: Section[] = [];
  const extractTitle: Plugin<[], MdRoot> = () => tree => {
    const first = tree.children[0];
    if (first?.type === 'heading' && first.depth === 1) {
      title = plain(first).replace(/^Lesson\s+\d+\s*[-:\u2014\u2013]\s*/iu, '');
      tree.children.shift();
    }
    plainText = plain(tree);
  };
  const literalTextArguments: Plugin<[], Root> = () => tree => {
    visit(tree, 'element', node => {
      if (node.tagName !== 'code' || !Array.isArray(node.properties.className) ||
          !node.properties.className.includes('language-math')) return;
      for (const child of node.children) {
        if (child.type !== 'text') continue;
        // Source prose uses literal setting names inside TeX text groups.
        child.value = child.value.replace(/\\(text|texttt)\{([^{}]*)\}/gu,
          (_match: string, command: string, text: string) =>
            `\\${command}{${text.replace(/(?<!\\)_/gu, '\\_')}}`);
      }
    });
  };
  const annotate: Plugin<[], Root> = () => tree => {
    const counts = new Map<string, number>();
    let current: Section | undefined;
    for (const node of tree.children) {
      if (node.type === 'element' && /^h[1-6]$/u.test(node.tagName)) {
        const text = plain(node).replace(/\s+/gu, ' ').trim();
        const slug = headingSlug(text);
        const count = (counts.get(slug) ?? 0) + 1;
        counts.set(slug, count);
        const id = count === 1 ? slug : `${slug}-${count}`;
        node.properties.id = id;
        if (node.tagName === 'h1') node.tagName = 'h2';
        current = { id, title: text, depth: Number(node.tagName[1]), text: '' };
        sections.push(current);
      } else if (current) {
        current.text += ` ${plain(node)}`;
      }
    }
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'a' && typeof node.properties.href === 'string') {
        node.properties.href = node.properties.href.replace(
          /^(https:\/\/github\.com\/microsoft\/qdk-chemistry\/(?:blob|tree)\/)97a3ff4f(?:b86ebd5a2516e3548cece69127fd3555)?\//u,
          '$197a3ff4fb86ebd5a2516e3548cece69127fd3555/',
        );
        if (/^https?:\/\//u.test(node.properties.href)) node.properties.rel = ['noopener', 'noreferrer'];
      }
    });
  };
  const scrollableContent: Plugin<[], Root> = () => tree => {
    visit(tree, 'element', (node, index, parent) => {
      const isEquation = Array.isArray(node.properties.className) && node.properties.className.includes('katex-display');
      if (index === undefined || !parent || (!isEquation && node.tagName !== 'pre' && node.tagName !== 'table')) return;
      parent.children[index] = {
        type: 'element', tagName: 'div',
        properties: {
          className: ['content-scroll'], tabIndex: 0, role: 'region',
          ariaLabel: isEquation ? 'Scrollable equation' : node.tagName === 'pre' ? 'Scrollable code example' : 'Scrollable lesson table',
        },
        children: [node],
      };
      return SKIP;
    });
  };
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(extractTitle)
    .use(remarkRehype)
    .use(rehypeSanitize, {
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes,
        code: [...(defaultSchema.attributes?.code ?? []), ['className', /^language-./u, 'math-inline', 'math-display']],
      },
    })
    .use(annotate)
    .use(literalTextArguments)
    .use(rehypeKatex, { trust: false, strict: 'ignore', maxExpand: 1000 })
    .use(scrollableContent)
    .use(rehypeStringify)
    .process(normalizeMath(markdown));
  const mathErrors = file.messages.filter(message =>
    message.source === 'rehype-katex' && message.ruleId === 'parseerror').map(message =>
      `${message.message}${message.cause instanceof Error ? `: ${message.cause.message}` : ''}`);
  return { html: String(file), title, sections, plainText, mathErrors };
}
