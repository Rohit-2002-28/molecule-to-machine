import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { inlineFigures, figuresForLesson } from '../src/data/inline-figures';
import { course } from '../src/lib/course';
import { renderMarkdown } from '../src/lib/markdown';
import { interleaveFigures, resolveFigurePlacements } from '../src/lib/inline-placement';
import {
  amplificationProbability, choleskyToyResidual, classifyCandidates, covarianceMeanVariance,
  determinantCounts, excitationDistance, gaussianShape, logicalErrorIllustration, morse,
  orbitalEntropy, qpeDistribution, qpeQueryCount, rawSimulationBytes, resourceCandidates,
  retainedWeight, sampleFunction, shannonEntropy, shellCounts,
} from '../src/lib/visual-models';
import { plotFor, plotFrame, pointPosition, qpePlot, seriesPath } from '../src/lib/plot-data';

describe('additive contextual placement', () => {
  it('locks the original corpus identity', () => {
    const bytes = readFileSync(new URL('../src/content/course.json', import.meta.url));
    expect(createHash('sha256').update(bytes).digest('hex')).toBe('f46926672ecadbbc96a119b09024bf5804d0eaebe5851728f469652199e8b757');
  });
  it('has 46 unique explained figures covering every lesson', () => {
    expect(inlineFigures).toHaveLength(46);
    expect(new Set(inlineFigures.map(figure => figure.id)).size).toBe(46);
    expect(new Set(inlineFigures.map(figure => figure.lesson)).size).toBe(34);
    for (const figure of inlineFigures) {
      expect(Boolean(figure.plot) !== Boolean(figure.diagram)).toBe(true);
      expect(figure.assumptions.length).toBeGreaterThan(80);
      expect(figure.takeaway.length).toBeGreaterThan(60);
      expect(figure.provenance.length).toBeGreaterThan(0);
    }
  });
  it('places every figure after a real paragraph in exactly the requested original section', async () => {
    for (const lesson of course.lessons) {
      const rendered = await renderMarkdown(lesson.body);
      const figures = figuresForLesson(lesson.number);
      const placements = resolveFigurePlacements(rendered.blocks, figures);
      expect(placements).toHaveLength(figures.length);
      for (const placement of placements) {
        expect(rendered.blocks[placement.headingIndex]?.id).toBe(placement.figure.anchor);
        expect(rendered.blocks[placement.afterIndex]?.tag).toBe('p');
      }
      const chunks = interleaveFigures(rendered.blocks, figures);
      expect(chunks.filter(chunk => chunk.kind === 'html').map(chunk => chunk.html).join('')).toBe(rendered.html);
      expect(rendered.blocks.map(block => block.html).join('')).toBe(rendered.html);
    }
  }, 20000);
  it('rejects missing, ambiguous, and overshooting anchors instead of appending silently', async () => {
    const rendered = await renderMarkdown('## First\n\nA paragraph.\n\n```txt\n## fake\n```\n\n## Second\n\nNext.');
    const sample = { ...inlineFigures[0]!, anchor: 'section-first', afterParagraph: 1 };
    expect(resolveFigurePlacements(rendered.blocks, [sample])[0]?.afterIndex).toBeGreaterThan(0);
    expect(() => resolveFigurePlacements(rendered.blocks, [{ ...sample, anchor: 'missing' }])).toThrow('expected one heading');
    expect(() => resolveFigurePlacements(rendered.blocks, [{ ...sample, afterParagraph: 2 }])).toThrow('only 1 paragraphs');
    expect(() => resolveFigurePlacements(rendered.blocks, [sample, sample])).toThrow('Duplicate');
    expect(() => resolveFigurePlacements([...rendered.blocks, ...rendered.blocks], [sample])).toThrow('found 2');
  });
});

describe('analytical scientific illustrations', () => {
  it('has the stated Morse minimum, asymptote, slope, force, and curvature', () => {
    expect(morse(1)).toEqual({ energy: -1, slope: 0, force: -0, curvature: 8 });
    expect(morse(.6).energy).toBeCloseTo(.5019505674, 9);
    expect(morse(1.35).energy).toBeCloseTo(-.7465736436, 9);
    expect(morse(1.35).slope).toBeCloseTo(.9999533594, 9);
    expect(morse(4).energy).toBeCloseTo(-.00495136014, 9);
    expect(morse(20).energy).toBeCloseTo(0, 12);
    for (const x of [.6, .9, 1, 1.35, 2, 4]) {
      const h = 1e-5;
      expect(morse(x).slope).toBeCloseTo((morse(x + h).energy - morse(x - h).energy) / (2 * h), 6);
      expect(morse(x).curvature).toBeCloseTo((morse(x + h).slope - morse(x - h).slope) / (2 * h), 6);
      expect(morse(x).force).toBe(-morse(x).slope);
    }
    expect(() => morse(NaN)).toThrow();
    expect(() => morse(1, 0)).toThrow();
  });
  it('uses bounded shapes and exact shell counts', () => {
    expect(gaussianShape(0, 4)).toBe(1);
    expect(gaussianShape(2, 4)).toBeLessThan(gaussianShape(2, .5));
    expect(shellCounts(2)).toEqual({ spherical: 5, cartesian: 6 });
    expect(shellCounts(4)).toEqual({ spherical: 9, cartesian: 15 });
    expect(() => gaussianShape(1, -1)).toThrow();
    expect(() => shellCounts(1.5)).toThrow();
  });
  it('specifies physical local probabilities and entropy in nats at the limits', () => {
    expect(orbitalEntropy(0).entropy).toBe(0);
    expect(orbitalEntropy(1).entropy).toBeCloseTo(Math.log(4), 12);
    for (const t of [0, .2, .5, 1]) {
      expect(orbitalEntropy(t).probabilities.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1);
    }
    expect(() => shannonEntropy([.5, .6])).toThrow();
    expect(() => shannonEntropy([-.2, 1.2])).toThrow();
    expect(() => orbitalEntropy(1.1)).toThrow();
  });
  it('distinguishes determinant sectors and structural coupling permission', () => {
    expect(determinantCounts(6)).toEqual({ all: 924n, fixed: 400n });
    expect(excitationDistance('111000', '000111')).toBe(3);
    expect(excitationDistance('111000', '110100')).toBe(1);
    expect(() => excitationDistance('100', '111')).toThrow();
    expect(() => determinantCounts(5)).toThrow();
  });
  it('bounds the exact rank residual and retained support mass', () => {
    expect(choleskyToyResidual(0)).toBe(1);
    expect(choleskyToyResidual(4)).toBe(0);
    expect(choleskyToyResidual(1)).toBeGreaterThan(choleskyToyResidual(2));
    expect(retainedWeight([.55, .25, .12, .06, .02], 3)).toBeCloseTo(.92);
    expect(retainedWeight([.55, .25, .12, .06, .02], 5)).toBeCloseTo(1);
    expect(() => choleskyToyResidual(5)).toThrow();
  });
  it('accounts for covariance rather than assuming shared shots are independent terms', () => {
    expect(covarianceMeanVariance(1, 100)).toEqual({ sum: .04, difference: 0, diagonalOnly: .02 });
    expect(covarianceMeanVariance(-1, 100).sum).toBe(0);
    expect(covarianceMeanVariance(0, 100).sum).toBe(.02);
    expect(() => covarianceMeanVariance(1.1, 100)).toThrow();
    expect(() => covarianceMeanVariance(0, 0)).toThrow();
  });
  it('normalizes finite QPE distributions including exact-grid singularities and phase wrap', () => {
    for (const bits of [1, 2, 3, 5, 8]) {
      for (const phase of [0, .25, .3, .999, 1]) {
        const probabilities = qpeDistribution(phase, bits);
        expect(probabilities.reduce((sum, p) => sum + p.y, 0)).toBeCloseTo(1, 10);
        expect(probabilities.every(p => Number.isFinite(p.y) && p.y >= 0 && p.y <= 1 + 1e-12)).toBe(true);
      }
    }
    expect(qpeDistribution(.25, 3)[2]?.y).toBeCloseTo(1, 12);
    expect(qpeDistribution(1, 3)[0]?.y).toBeCloseTo(1, 12);
    expect(qpeDistribution(.3, 3).filter(p => p.y > 1e-3).length).toBeGreaterThan(1);
    expect(() => qpeDistribution(.2, 0)).toThrow();
    expect(() => qpeDistribution(NaN, 3)).toThrow();
  });
  it('models ideal amplification as an oscillation and handles p=0 and p=1', () => {
    expect(amplificationProbability(.1, 0)).toBeCloseTo(.1);
    expect(amplificationProbability(.1, 2)).toBeGreaterThan(.99);
    expect(amplificationProbability(.1, 4)).toBeLessThan(.1);
    expect(amplificationProbability(0, 10)).toBe(0);
    expect(amplificationProbability(1, 10)).toBeCloseTo(1);
    expect(() => amplificationProbability(.5, .5)).toThrow();
  });
  it('counts raw arrays and the complete fixed-U power scope correctly', () => {
    expect(rawSimulationBytes(30)).toBe(16 * 2 ** 30);
    expect(rawSimulationBytes(15, true)).toBe(rawSimulationBytes(30));
    expect(qpeQueryCount(3)).toEqual({ largest: 4, total: 7 });
    expect(qpeQueryCount(5)).toEqual({ largest: 16, total: 31 });
    expect(qpeQueryCount(8)).toEqual({ largest: 128, total: 255 });
    expect(() => rawSimulationBytes(-1)).toThrow();
    expect(() => qpeQueryCount(0)).toThrow();
  });
  it('restricts the phenomenological error model to its stated below-threshold domain', () => {
    expect(logicalErrorIllustration(3, .1)).toBeCloseTo(.001);
    expect(logicalErrorIllustration(5, .1)).toBeCloseTo(.0001);
    expect(logicalErrorIllustration(5, .5)).toBeGreaterThan(logicalErrorIllustration(5, .1));
    expect(() => logicalErrorIllustration(4, .1)).toThrow();
    expect(() => logicalErrorIllustration(3, 1.1)).toThrow();
  });
  it('separates Pareto dominance from feasibility under explicit budgets', () => {
    const candidates = classifyCandidates(resourceCandidates, 600000, 2.5);
    expect(candidates.filter(p => p.dominated).map(p => p.name)).toEqual(['C']);
    expect(candidates.filter(p => p.feasible).map(p => p.name)).toEqual(['B']);
    expect(classifyCandidates(resourceCandidates, 300000, 2.5).filter(p => p.feasible)).toEqual([]);
    expect(() => classifyCandidates(resourceCandidates, Infinity, 2)).toThrow();
  });
});

describe('bounded responsive plotting', () => {
  it('does not hide nonfinite or out-of-range analytical data', () => {
    for (const figure of inlineFigures.filter(figure => figure.plot)) {
      const spec = plotFor(figure.plot!);
      for (const item of spec.series) {
        for (const point of item.points) {
          expect(point.x, figure.id).toBeGreaterThanOrEqual(spec.x.min - 1e-12);
          expect(point.x, figure.id).toBeLessThanOrEqual(spec.x.max + 1e-12);
          expect(point.y, figure.id).toBeGreaterThanOrEqual(spec.y.min - 1e-12);
          expect(point.y, figure.id).toBeLessThanOrEqual(spec.y.max + 1e-12);
          for (const compact of [false, true]) {
            const position = pointPosition(point, spec, plotFrame(compact));
            expect(Number.isFinite(position.x) && Number.isFinite(position.y), figure.id).toBe(true);
            expect(seriesPath(item, spec, plotFrame(compact))).not.toMatch(/NaN|Infinity/);
          }
        }
      }
    }
  });
  it('bounds dynamic precision and rejects invalid sampling', () => {
    for (const bits of [2, 3, 4, 5]) expect(qpePlot(bits).series[0]?.points.length).toBe(2 ** bits);
    expect(() => sampleFunction(() => NaN, 0, 1)).toThrow();
    expect(() => sampleFunction(x => x, 1, 0)).toThrow();
  });
});
