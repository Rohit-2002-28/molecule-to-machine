import { describe, expect, it, vi } from 'vitest';
import { normalizeMath, renderMarkdown } from '../src/lib/markdown';
import { emptyProgress, gradeAnswers, loadProgress, parseProgress, saveProgress, toggleLesson } from '../src/lib/progress';
import { searchCourse } from '../src/lib/search';

describe('safe Markdown and math', () => {
  it('normalizes math outside fenced, indented, and inline code only', () => {
    const source = 'Text \\(x^2\\).\n\n\\[\nx+y\n\\]\n\n`\\(code\\)`\n\n```python\nx = "\\\\(untouched\\\\)"\n```\n\n    \\[indented\\]\n';
    const result = normalizeMath(source);
    expect(result).toContain('$x^2$');
    expect(result).toContain('$$\nx+y\n$$');
    expect(result).toContain('`\\(code\\)`');
    expect(result).toContain('x = "\\\\(untouched\\\\)"');
    expect(result).toContain('    \\[indented\\]');
  });
  it('renders math and GFM without executing HTML or unsafe URLs', async () => {
    const rendered = await renderMarkdown('# Lesson 1 — Example\n\n## A heading\n\n\\(x^2\\)\n\n<script>alert(1)</script>\n\n[bad](javascript:alert%281%29)\n\n| A | B |\n| - | - |\n| 1 | 2 |');
    expect(rendered.title).toBe('Example');
    expect(rendered.html).toContain('class="katex"');
    expect(rendered.html).toContain('<math');
    expect(rendered.html).toContain('<table>');
    expect(rendered.html).toContain('class="content-scroll" tabindex="0" role="region"');
    expect(rendered.html).not.toContain('<script>');
    expect(rendered.html).not.toContain('javascript:');
    expect(rendered.mathErrors).toEqual([]);
    expect(rendered.sections[0]?.id).toBe('section-a-heading');
  });
  it('gives duplicate headings stable safe anchors and surfaces bad math', async () => {
    const rendered = await renderMarkdown('## Same\n\nFirst\n\n## Same\n\n\\(\\notacommand{x}\\)');
    expect(rendered.sections.map(section => section.id)).toEqual(['section-same', 'section-same-2']);
    expect(rendered.mathErrors.length).toBeGreaterThan(0);
  });
  it('renders literal setting names in TeX text groups without rewriting subscripts or code', async () => {
    const rendered = await renderMarkdown('\\(x_i / \\texttt{num_bins} + \\text{total\\_shots}\\)\n\n`\\texttt{code_name}`');
    expect(rendered.mathErrors).toEqual([]);
    expect(rendered.html).toContain('num_bins');
    expect(rendered.html).toContain('code_name');
    expect(rendered.html).toContain('<msub>');
  });
});

describe('independent local progress', () => {
  it('does not confuse completed reading with a check attempt', () => {
    const state = emptyProgress();
    state.quizzes['1'] = { answers: [0, 2, 1], submitted: true };
    expect(parseProgress(state).completed).toEqual([]);
    expect(toggleLesson([1, 2], 1)).toEqual([2]);
    expect(gradeAnswers([0, 2, -1], [0, 1, 2])).toEqual({ score: 1, total: 3, complete: false });
    expect(() => gradeAnswers([], [])).toThrow();
  });
  it('rejects corrupted state, invalid routes, and unsafe numbers', () => {
    expect(() => parseProgress({ ...emptyProgress(), completed: [35] })).toThrow();
    expect(() => parseProgress({ ...emptyProgress(), lastPlace: { lesson: 1, anchor: 'javascript:alert(1)' } })).toThrow();
    expect(() => parseProgress({ ...emptyProgress(), quizzes: { '1': { answers: [100], submitted: true } } })).toThrow();
    expect(() => toggleLesson([], NaN)).toThrow();
  });
  it('reports unavailable or blocked storage explicitly', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const broken = { getItem: () => '{bad', setItem: () => { throw new Error('quota'); }, removeItem: () => {} };
    expect(loadProgress(null).persistent).toBe(false);
    expect(loadProgress(broken).message).toContain('could not be read');
    expect(saveProgress(broken, emptyProgress()).message).toContain('could not save');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('full-text search', () => {
  const documents = [
    { number: 1, lesson: 'Question', title: 'Accuracy', text: 'Use milliHartree accuracy, not a device failure probability.', href: '/one/' },
    { number: 20, lesson: 'Measurement', title: 'Shots', text: 'Grouped measurements introduce covariance.', href: '/twenty/' },
  ];
  it('finds body-only terms, combines words, and handles empty/no results', () => {
    expect(searchCourse(documents, 'COVARIANCE')[0]?.number).toBe(20);
    expect(searchCourse(documents, 'accuracy failure')[0]?.number).toBe(1);
    expect(searchCourse(documents, '   ')).toEqual([]);
    expect(searchCourse(documents, 'unknowable')).toEqual([]);
  });
});
