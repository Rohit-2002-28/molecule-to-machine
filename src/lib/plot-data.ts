import type { PlotKind } from '../data/inline-figures';
import {
  amplificationProbability, choleskyToyResidual, determinantCounts, gaussianShape,
  interference, logicalErrorIllustration, morse, orbitalEntropy, qpeDistribution,
  qpeQueryCount, rawSimulationBytes, resourceCandidates, retainedWeight,
  sampleFunction, shellCounts, shotUncertainty, covarianceMeanVariance, type Point,
} from './visual-models';

export interface Tick { value: number; label: string }
export interface Axis { min: number; max: number; label: string; ticks: Tick[]; scale?: 'log' }
export interface Series {
  name: string;
  points: Point[];
  tone: 'primary' | 'comparison' | 'muted';
  mode: 'line' | 'points' | 'bars';
  dashed?: boolean;
  barWidth?: number;
  offset?: number;
}
export interface PlotSpec {
  x: Axis;
  y: Axis;
  series: Series[];
  reference?: { axis: 'x' | 'y'; value: number; label: string }[];
  cursor?: Point;
  annotations?: { label: string; point: Point; labelAt: Point }[];
}
const ticks = (values: number[]): Tick[] => values.map(value => ({ value, label: String(value) }));
const axis = (min: number, max: number, label: string, values: number[], log = false): Axis =>
  ({ min, max, label, ticks: ticks(values), ...(log ? { scale: 'log' as const } : {}) });
const series = (name: string, points: Point[], tone: Series['tone'] = 'primary', mode: Series['mode'] = 'line'): Series =>
  ({ name, points, tone, mode, ...(tone === 'comparison' && mode === 'line' ? { dashed: true } : {}) });
const curve = (name: string, fn: (x: number) => number, start: number, end: number, tone: Series['tone'] = 'primary') =>
  series(name, sampleFunction(fn, start, end), tone);
const values = (numbers: number[]) => numbers.map((y, x) => ({ x, y }));
const logAxis = (min: number, max: number, label: string, exponents: number[]): Axis => ({
  min, max, label, scale: 'log',
  ticks: exponents.map(exponent => ({ value: 10 ** exponent, label: exponent === 0 ? '1' : `10${exponent.toString().replace(/-/gu, '⁻').replace(/\d/gu, digit => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(digit)]!)}` })),
});
const phaseTicks = [{ value: 0, label: '0' }, { value: Math.PI / 2, label: 'π/2' }, { value: Math.PI, label: 'π' }, { value: 3 * Math.PI / 2, label: '3π/2' }, { value: 2 * Math.PI, label: '2π' }];

export function qpePlot(bits = 3): PlotSpec {
  return {
    x: axis(-.13, 1, 'Readout phase y / 2ᵐ (turns)', [0, .25, .5, .75, 1]),
    y: axis(0, 1, 'Ideal probability of this bin', [0, .25, .5, .75, 1]),
    series: [{ ...series('Eigenphase 0.3 turns', qpeDistribution(.3, bits), 'primary', 'bars'), barWidth: .8 / 2 ** bits }],
    reference: [{ axis: 'x', value: .3, label: 'True eigenphase: 0.3 turns' }],
  };
}

export function plotFor(kind: PlotKind): PlotSpec {
  switch (kind) {
    case 'morse': return {
      x: axis(.55, 4, 'Separation x = R/Rₑ (dimensionless)', [.6, 1, 2, 3, 4]),
      y: axis(-1.2, 1.5, 'Relative energy E/Dₑ (dimensionless)', [-1, 0, 1]),
      series: [curve('Morse relative energy', x => morse(x).energy, .55, 4),
        series('Equilibrium minimum (1, −1)', [{ x: 1, y: -1 }], 'comparison', 'points')],
      reference: [{ axis: 'y', value: 0, label: 'Dissociation reference: E/Dₑ = 0' }],
      cursor: { x: 1.35, y: morse(1.35).energy },
      annotations: [
        { label: 'Repulsion', point: { x: .6, y: morse(.6).energy }, labelAt: { x: 1.2, y: .95 } },
        { label: 'Stretching', point: { x: 2.25, y: morse(2.25).energy }, labelAt: { x: 2.2, y: -.7 } },
        { label: 'Dissociation', point: { x: 3.5, y: 0 }, labelAt: { x: 2.2, y: .35 } },
      ],
    };
    case 'phase-energy': return {
      x: { ...axis(0, 2 * Math.PI, 'Relative phase φ (radians)', []), ticks: phaseTicks },
      y: axis(-1.25, -.75, 'Toy energy expectation (Eh)', [-1.2, -1, -.8]),
      series: [curve('Equal-weight coherent state', phi => -1 - .2 * Math.cos(phi), 0, 2 * Math.PI)],
      reference: [{ axis: 'y', value: -1, label: 'Either determinant alone: −1 Eh' }],
    };
    case 'gaussians': return {
      x: axis(-3, 3, 'Position relative to center (arbitrary length)', [-3, -1.5, 0, 1.5, 3]),
      y: axis(0, 1.05, 'Unnormalized shape g(x)', [0, .25, .5, .75, 1]),
      series: [curve('Diffuse, α = 0.5', x => gaussianShape(x, .5), -3, 3), curve('Tight, α = 4', x => gaussianShape(x, 4), -3, 3, 'comparison')],
    };
    case 'shells': return {
      x: { ...axis(-.5, 4.5, 'Angular momentum shell', []), ticks: ['s', 'p', 'd', 'f', 'g'].map((label, value) => ({ value, label })) },
      y: axis(0, 16, 'Functions per shell (count)', [0, 3, 6, 9, 12, 15]),
      series: [
        { ...series('Spherical: 2ℓ + 1', Array.from({ length: 5 }, (_, x) => ({ x, y: shellCounts(x).spherical })), 'primary', 'bars'), barWidth: .28, offset: -.17 },
        { ...series('Cartesian: (ℓ + 1)(ℓ + 2)/2', Array.from({ length: 5 }, (_, x) => ({ x, y: shellCounts(x).cartesian })), 'comparison', 'bars'), barWidth: .28, offset: .17 },
      ],
    };
    case 'hf-ledger': return {
      x: { ...axis(-.6, 2.6, 'Energy accounting convention', []), ticks: [{ value: 0, label: '2F' }, { value: 1, label: 'Electronic' }, { value: 2, label: 'Total' }] },
      y: axis(-1.8, .1, 'Toy energy (Eh)', [-1.5, -1, -.5, 0]),
      series: [{ ...series('Section’s HF teaching values', values([-1.2, -1.6, -1.5]), 'primary', 'bars'), barWidth: .55 }],
    };
    case 'convergence': return {
      x: axis(0, 10, 'Synthetic iteration k', [0, 2, 4, 6, 8, 10]),
      y: logAxis(1e-10, 1, 'Normalized diagnostic magnitude (log scale)', [-9, -6, -3, 0]),
      series: [series('Energy-change magnitude', Array.from({ length: 11 }, (_, x) => ({ x, y: 10 ** (-2 - .7 * x) }))),
        series('Stationarity residual', Array.from({ length: 11 }, (_, x) => ({ x, y: 10 ** (-1 - .25 * x) * (1 + .3 * Math.sin(x)) })), 'comparison')],
    };
    case 'saddle': return {
      x: axis(-2, 2, 'Orbital-rotation displacement (arbitrary)', [-2, -1, 0, 1, 2]),
      y: axis(-.25, .85, 'Energy change from stationary point (arbitrary)', [-.2, 0, .4, .8]),
      series: [curve('Along u: +0.2u²', x => .2 * x ** 2, -2, 2), curve('Along v: −0.05v²', x => -.05 * x ** 2, -2, 2, 'comparison')],
      reference: [{ axis: 'y', value: 0, label: 'Stationary energy reference' }],
    };
    case 'force': return {
      x: axis(.75, 3.5, 'Separation x = R/Rₑ (dimensionless)', [1, 1.5, 2, 2.5, 3]),
      y: axis(-4.5, 4.5, 'Slope d(E/Dₑ)/dx and force F/(Dₑ/Rₑ)', [-4, -2, 0, 2, 4]),
      series: [curve('Energy slope', x => morse(x).slope, .75, 3.5), curve('Normalized force = −slope', x => morse(x).force, .75, 3.5, 'comparison')],
      reference: [{ axis: 'x', value: 1, label: 'Equilibrium: slope = force = 0' }],
    };
    case 'reaction': return {
      x: axis(-1.4, 1.4, 'Synthetic reaction coordinate q (arbitrary)', [-1, -.5, 0, .5, 1]),
      y: axis(0, 1.15, 'Relative energy (arbitrary units)', [0, .25, .5, .75, 1]),
      series: [curve('Profile (q² − 1)²', x => (x ** 2 - 1) ** 2, -1.4, 1.4),
        series('Minima and barrier', [{ x: -1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }], 'comparison', 'points')],
    };
    case 'occupations': return {
      x: { ...axis(-.5, 1.5, 'Same 1-RDM in two coordinate bases', []), ticks: [{ value: 0, label: 'Original' }, { value: 1, label: 'Natural' }] },
      y: axis(0, 2, 'Spin-traced occupation (electrons)', [0, .5, 1, 1.5, 2]),
      series: [
        { ...series('First orbital', values([1, 1.3]), 'primary', 'bars'), barWidth: .25, offset: -.15 },
        { ...series('Second orbital', values([1, .7]), 'comparison', 'bars'), barWidth: .25, offset: .15 },
      ],
    };
    case 'determinants': return {
      x: axis(2, 12, 'Spatial orbitals M, half-filled (even)', [2, 4, 6, 8, 10, 12]),
      y: logAxis(1, 1e7, 'Determinants (count, log scale)', [0, 2, 4, 6]),
      series: [series('All fixed-electron determinants', [2, 4, 6, 8, 10, 12].map(x => ({ x, y: Number(determinantCounts(x).all) }))),
        series('Fixed alpha/beta counts', [2, 4, 6, 8, 10, 12].map(x => ({ x, y: Number(determinantCounts(x).fixed) })), 'comparison')],
    };
    case 'entropy': return {
      x: axis(0, 1, 'Probability-mixing parameter t', [0, .25, .5, .75, 1]),
      y: { ...axis(0, 1.5, 'Single-orbital entropy (nats)', [0, .5, 1]), ticks: [...ticks([0, .5, 1]), { value: Math.log(4), label: 'ln 4' }] },
      series: [curve('−Σ p ln p for the declared path', t => orbitalEntropy(t).entropy, 0, 1)],
      reference: [{ axis: 'y', value: Math.log(4), label: 'Four equiprobable outcomes: ln 4' }],
    };
    case 'rank-error': return {
      x: axis(0, 4, 'Retained Cholesky columns r', [0, 1, 2, 3, 4]),
      y: axis(0, 1.05, 'Relative Frobenius residual (dimensionless)', [0, .25, .5, .75, 1]),
      series: [series('Diagonal PSD toy residual', Array.from({ length: 5 }, (_, x) => ({ x, y: choleskyToyResidual(x) })))],
    };
    case 'factor-storage': return {
      x: axis(4, 40, 'Orbital count K', [4, 12, 20, 28, 40]),
      y: logAxis(.0001, 32, 'Raw storage (MiB, log scale)', [-4, -3, -2, -1, 0, 1]),
      series: [curve('Dense: 8K⁴ bytes', k => 8 * k ** 4 / 2 ** 20, 4, 40), curve('Factors at chosen r = K: 8K³ bytes', k => 8 * k ** 3 / 2 ** 20, 4, 40, 'comparison')],
    };
    case 'interference': return {
      x: { ...axis(0, 2 * Math.PI, 'Relative phase φ (radians)', []), ticks: phaseTicks },
      y: axis(0, 1, 'Ideal outcome probability', [0, .25, .5, .75, 1]),
      series: [curve('Measure 0: cos²(φ/2)', x => interference(x).p0, 0, 2 * Math.PI), curve('Measure 1: sin²(φ/2)', x => interference(x).p1, 0, 2 * Math.PI, 'comparison')],
    };
    case 'bell': return {
      x: { ...axis(-.5, 2.5, 'Measured Pauli observable', []), ticks: [{ value: 0, label: 'Z₀' }, { value: 1, label: 'Z₀Z₁' }, { value: 2, label: 'X₀X₁' }] },
      y: axis(0, 1.1, 'Expectation value', [0, .25, .5, .75, 1]),
      series: [
        { ...series('Coherent Bell state', values([0, 1, 1]), 'primary', 'bars'), barWidth: .28, offset: -.17 },
        { ...series('Incoherent 00/11 mixture', values([0, 1, 0]), 'comparison', 'bars'), barWidth: .28, offset: .17 },
      ],
    };
    case 'sectors': return {
      x: { ...axis(-.5, 1.5, 'Selected symmetry eigenvalue s', []), ticks: [{ value: 0, label: 's = −1' }, { value: 1, label: 's = +1' }] },
      y: axis(-1.2, 1.2, 'Toy eigenenergy (arbitrary units)', [-1, -.5, 0, .5, 1]),
      series: [series('Lower eigenvalue', [-1, 1].map((s, x) => ({ x, y: -Math.hypot(.6 + s * .4, .3) })), 'primary', 'points'),
        series('Upper eigenvalue', [-1, 1].map((s, x) => ({ x, y: Math.hypot(.6 + s * .4, .3) })), 'comparison', 'points')],
      reference: [{ axis: 'y', value: 0, label: 'Zero of the toy Hamiltonian' }],
    };
    case 'support': return {
      x: axis(1, 5, 'Largest-weight determinants kept (count)', [1, 2, 3, 4, 5]),
      y: axis(0, 1, 'Retained mass / fidelity to original vector', [0, .25, .5, .75, 1]),
      series: [series('Cumulative chosen weights', [1, 2, 3, 4, 5].map(x => ({ x, y: retainedWeight([.55, .25, .12, .06, .02], x) })))],
    };
    case 'trotter': return {
      x: axis(1, 64, 'Number of time slices N (log scale)', [1, 4, 16, 64], true),
      y: logAxis(1 / 4096, 1, 'Normalized asymptotic error guide (log scale)', [-3, -2, -1, 0]),
      series: [curve('First-order guide: 1/N', n => 1 / n, 1, 64), curve('Second-order guide: 1/N²', n => 1 / n ** 2, 1, 64, 'comparison')],
    };
    case 'walk-phases': return {
      x: axis(-1, 1, 'Normalized eigenenergy μ = E/λ', [-1, -.5, 0, .5, 1]),
      y: { ...axis(-3.3, 3.3, 'Walk eigenphase (radians)', []), ticks: [{ value: -Math.PI, label: '−π' }, { value: -Math.PI / 2, label: '−π/2' }, { value: 0, label: '0' }, { value: Math.PI / 2, label: 'π/2' }, { value: Math.PI, label: 'π' }] },
      series: [curve('+arccos(μ) branch', Math.acos, -1, 1), curve('−arccos(μ) branch', x => -Math.acos(x), -1, 1, 'comparison')],
    };
    case 'shots': return {
      x: axis(25, 1600, 'Independent shots N (log scale)', [25, 100, 400, 1600], true),
      y: axis(0, .21, 'Standard error of Pauli mean', [0, .05, .1, .15, .2]),
      series: [curve('True mean zero: 1/√N', n => 1 / Math.sqrt(n), 25, 1600)],
      cursor: { x: 100, y: shotUncertainty(0, 100).standardError },
    };
    case 'covariance': return {
      x: axis(-1, 1, 'Within-shot correlation ρ', [-1, -.5, 0, .5, 1]),
      y: axis(0, .045, 'Variance of mean (100 shots)', [0, .01, .02, .03, .04]),
      series: [curve('Score X + Y', rho => covarianceMeanVariance(rho, 100).sum, -1, 1),
        curve('Score X − Y', rho => covarianceMeanVariance(rho, 100).difference, -1, 1, 'comparison')],
      reference: [{ axis: 'y', value: .02, label: 'Ignoring covariance predicts 0.02' }],
    };
    case 'qpe-bins': return qpePlot();
    case 'aliases': return {
      x: axis(0, 2, 'Unwrapped energy coordinate u = Et/(2π)', [0, .5, 1, 1.5, 2]),
      y: axis(0, 1.05, 'Wrapped phase (turns)', [0, .25, .5, .75, 1]),
      series: [curve('Phase on first branch', x => x, 0, .999), curve('Phase on next branch', x => x - 1, 1, 1.999),
        series('Same phase, different energy', [{ x: .25, y: .25, label: 'A' }, { x: 1.25, y: .25, label: 'B' }], 'comparison', 'points')],
      reference: [{ axis: 'y', value: .25, label: 'A and B both have phase 0.25' }],
    };
    case 'amplification': return {
      x: axis(0, 10, 'Exact amplification rounds k (integer)', [0, 2, 4, 6, 8, 10]),
      y: axis(0, 1.05, 'Probability in the good subspace', [0, .25, .5, .75, 1]),
      series: [series('Initial p = 0.1', Array.from({ length: 11 }, (_, x) => ({ x, y: amplificationProbability(.1, x) })), 'primary', 'points')],
      reference: [{ axis: 'y', value: .1, label: 'Initial success probability' }],
    };
    case 'drive': return {
      x: axis(0, 2, 'Time (arbitrary time units)', [0, .5, 1, 1.5, 2]),
      y: axis(-1.1, 1.1, 'Drive strength f(t) (dimensionless)', [-1, -.5, 0, .5, 1]),
      series: [curve('Continuous sin(2πt)', t => Math.sin(2 * Math.PI * t), 0, 2),
        series('Samples at Δt = 1/8', Array.from({ length: 17 }, (_, i) => ({ x: i / 8, y: Math.sin(2 * Math.PI * i / 8) })), 'comparison', 'points')],
    };
    case 'memory': return {
      x: axis(0, 40, 'Qubits n', [0, 10, 20, 30, 40]),
      y: { ...axis(1e-8, 1e5, 'Raw complex128 memory (GiB, log scale)', [], true), ticks: [{ value: 2 ** -26, label: '2⁻²⁶' }, { value: 2 ** -10, label: '2⁻¹⁰' }, { value: 1, label: '1' }, { value: 16, label: '16' }, { value: 16384, label: '16,384' }] },
      series: [series('Pure vector: 16×2ⁿ bytes', Array.from({ length: 41 }, (_, x) => ({ x, y: rawSimulationBytes(x) / 2 ** 30 }))),
        series('Density matrix: 16×4ⁿ bytes', Array.from({ length: 21 }, (_, x) => ({ x, y: rawSimulationBytes(x, true) / 2 ** 30 })), 'comparison')],
      reference: [{ axis: 'y', value: 16, label: '16 GiB: vector n = 30, density matrix n = 15' }],
    };
    case 'accuracy': return {
      x: axis(.5, 5.5, 'Illustrative repeat number', [1, 2, 3, 4, 5]),
      y: axis(-1.5, 5.5, 'Deviation from synthetic reference (mEh)', [-1, 0, 2, 4, 5]),
      series: [series('Tight but biased', [4.9, 5, 5.1, 4.95, 5.05].map((y, i) => ({ x: i + 1, y })), 'primary', 'points'),
        series('Wider, centered examples', [-1, .8, -.6, .4, .4].map((y, i) => ({ x: i + 1, y })), 'comparison', 'points')],
      reference: [{ axis: 'y', value: 0, label: 'Synthetic target = 0 mEh deviation' }],
    };
    case 'qpe-work': return {
      x: axis(1, 8, 'Phase precision m (bits)', [1, 3, 5, 8]),
      y: axis(0, 270, 'Base-U calls in the named scope', [0, 64, 128, 192, 256]),
      series: [series('All controlled powers: 2ᵐ − 1', Array.from({ length: 8 }, (_, i) => ({ x: i + 1, y: qpeQueryCount(i + 1).total }))),
        series('Largest power only: 2ᵐ⁻¹', Array.from({ length: 8 }, (_, i) => ({ x: i + 1, y: qpeQueryCount(i + 1).largest })), 'comparison')],
    };
    case 'logical-error': return {
      x: axis(3, 21, 'Code distance d (odd integers)', [3, 7, 11, 15, 21]),
      y: logAxis(1e-12, 1, 'Conditional logical-failure probability (log)', [-12, -9, -6, -3, 0]),
      series: [series('Chosen p/pth = 0.1', Array.from({ length: 10 }, (_, i) => ({ x: 3 + i * 2, y: logicalErrorIllustration(3 + i * 2, .1) }))),
        series('Chosen p/pth = 0.5', Array.from({ length: 10 }, (_, i) => ({ x: 3 + i * 2, y: logicalErrorIllustration(3 + i * 2, .5) })), 'comparison')],
    };
    case 'pareto': return {
      x: axis(0, 900, 'Synthetic physical qubits (thousands)', [0, 200, 400, 600, 800]),
      y: axis(0, 6, 'Synthetic duration (hours)', [0, 1, 2, 3, 4, 5, 6]),
      series: [series('Nondominated among these choices', resourceCandidates.filter(p => p.name !== 'C').map(p => ({ x: p.qubits / 1000, y: p.hours, label: p.name })), 'primary', 'points'),
        series('C: dominated by A', [{ x: 300, y: 5, label: 'C' }], 'comparison', 'points')],
      reference: [{ axis: 'x', value: 600, label: 'Initial qubit ceiling: 600 thousand' }, { axis: 'y', value: 2.5, label: 'Initial deadline: 2.5 hours' }],
    };
  }
}

export interface PlotFrame { width: number; height: number; left: number; right: number; top: number; bottom: number }
export function plotFrame(compact: boolean): PlotFrame {
  return compact
    ? { width: 340, height: 270, left: 65, right: 316, top: 15, bottom: 232 }
    : { width: 640, height: 320, left: 75, right: 613, top: 18, bottom: 278 };
}
export function plotCoordinate(value: number, axis: Axis, start: number, end: number): number {
  if (!Number.isFinite(value) || axis.max <= axis.min || axis.scale === 'log' && (axis.min <= 0 || value <= 0)) {
    throw new RangeError('Plot coordinates need finite data and a valid axis domain.');
  }
  const transform = axis.scale === 'log' ? Math.log : (x: number) => x;
  return start + (transform(value) - transform(axis.min)) / (transform(axis.max) - transform(axis.min)) * (end - start);
}
export function pointPosition(point: Point, spec: PlotSpec, frame: PlotFrame): Point {
  return {
    x: plotCoordinate(point.x, spec.x, frame.left, frame.right),
    y: plotCoordinate(point.y, spec.y, frame.bottom, frame.top),
  };
}
export function seriesPath(item: Series, spec: PlotSpec, frame: PlotFrame): string {
  if (item.mode === 'points') return '';
  if (item.mode === 'bars') {
    const baseline = plotCoordinate(Math.max(spec.y.min, Math.min(0, spec.y.max)), spec.y, frame.bottom, frame.top);
    const width = (item.barWidth ?? .2) / (spec.x.max - spec.x.min) * (frame.right - frame.left);
    return item.points.map(point => {
      const p = pointPosition({ x: point.x + (item.offset ?? 0), y: point.y }, spec, frame);
      return `M${(p.x - width / 2).toFixed(3)},${baseline.toFixed(3)}H${(p.x + width / 2).toFixed(3)}V${p.y.toFixed(3)}H${(p.x - width / 2).toFixed(3)}Z`;
    }).join('');
  }
  return item.points.map((point, index) => {
    const p = pointPosition(point, spec, frame);
    return `${index ? 'L' : 'M'}${p.x.toFixed(3)},${p.y.toFixed(3)}`;
  }).join(' ');
}
export function representativeRows(spec: PlotSpec): { series: string; x: number; y: number }[] {
  return spec.series.flatMap(item => {
    const points = item.points.length <= 17 ? item.points : [...new Set([0, .25, .5, .75, 1].map(fraction => Math.round(fraction * (item.points.length - 1))))].map(index => item.points[index]!);
    return points.map(point => ({ series: item.name, x: point.x, y: point.y }));
  });
}
