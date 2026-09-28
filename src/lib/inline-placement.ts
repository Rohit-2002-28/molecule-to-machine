import type { HtmlBlock } from './markdown';
import type { InlineFigure } from '../data/inline-figures';

export type LessonChunk = { kind: 'html'; html: string } | { kind: 'figure'; figure: InlineFigure };
export interface FigurePlacement { figure: InlineFigure; headingIndex: number; afterIndex: number }

export function resolveFigurePlacements(blocks: HtmlBlock[], figures: InlineFigure[]): FigurePlacement[] {
  const ids = new Set<string>();
  return figures.map(figure => {
    if (ids.has(figure.id)) throw new Error(`Duplicate inline figure id: ${figure.id}.`);
    ids.add(figure.id);
    const headings = blocks.flatMap((block, index) =>
      block.id === figure.anchor && /^h[1-6]$/u.test(block.tag ?? '') ? [index] : []);
    if (headings.length !== 1) {
      throw new Error(`Figure ${figure.id}: expected one heading ${figure.anchor}, found ${headings.length}.`);
    }
    if (!Number.isInteger(figure.afterParagraph) || figure.afterParagraph < 1) {
      throw new Error(`Figure ${figure.id}: afterParagraph must be a positive integer.`);
    }
    const headingIndex = headings[0]!;
    let paragraphs = 0;
    for (let index = headingIndex + 1; index < blocks.length; index++) {
      const block = blocks[index]!;
      if (/^h[1-6]$/u.test(block.tag ?? '')) break;
      if (block.tag === 'p') paragraphs++;
      if (paragraphs === figure.afterParagraph) return { figure, headingIndex, afterIndex: index };
    }
    throw new Error(`Figure ${figure.id}: section ${figure.anchor} has only ${paragraphs} paragraphs; cannot insert after ${figure.afterParagraph}.`);
  }).sort((a, b) => a.afterIndex - b.afterIndex);
}

export function interleaveFigures(blocks: HtmlBlock[], figures: InlineFigure[]): LessonChunk[] {
  const placements = resolveFigurePlacements(blocks, figures);
  const result: LessonChunk[] = [];
  let offset = 0;
  for (const placement of placements) {
    const html = blocks.slice(offset, placement.afterIndex + 1).map(block => block.html).join('');
    if (html) result.push({ kind: 'html', html });
    result.push({ kind: 'figure', figure: placement.figure });
    offset = placement.afterIndex + 1;
  }
  const remaining = blocks.slice(offset).map(block => block.html).join('');
  if (remaining) result.push({ kind: 'html', html: remaining });
  return result;
}
