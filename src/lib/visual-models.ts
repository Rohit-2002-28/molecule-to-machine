import { combinations, interference, shotUncertainty } from './models';

export interface Point { x: number; y: number; label?: string }
export interface ParetoCandidate { name: string; qubits: number; hours: number }
function bounded(value: number, min: number, max: number, name: string): void {
  if (!Number.isFinite(value) || value < min || value > max) throw new RangeError(`${name} must be finite and between ${min} and ${max}.`);
}
function whole(value: number, min: number, max: number, name: string): void {
  bounded(value, min, max, name);
  if (!Number.isInteger(value)) throw new RangeError(`${name} must be an integer.`);
}
export function sampleFunction(fn: (x: number) => number, from: number, to: number, count = 81): Point[] {
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) throw new RangeError('Sample bounds must be finite and increasing.');
  whole(count, 2, 2048, 'Sample count');
  return Array.from({ length: count }, (_, index) => {
    const x = from + (to - from) * index / (count - 1);
    const y = fn(x);
    if (!Number.isFinite(y)) throw new RangeError(`Nonfinite function value at ${x}.`);
    return { x, y };
  });
}
export function morse(x: number, a = 2) {
  bounded(x, 0, 20, 'Normalized separation');
  bounded(a, .01, 10, 'Morse shape parameter');
  const z = Math.exp(-a * (x - 1));
  const energy = (1 - z) ** 2 - 1;
  const slope = 2 * a * z * (1 - z);
  const curvature = 2 * a ** 2 * z * (2 * z - 1);
  return { energy, slope, force: -slope, curvature };
}
export function gaussianShape(x: number, alpha: number): number {
  bounded(x, -100, 100, 'Position');
  bounded(alpha, .001, 100, 'Gaussian exponent');
  return Math.exp(-alpha * x ** 2);
}
export function shellCounts(l: number) {
  whole(l, 0, 6, 'Angular momentum');
  return { spherical: 2 * l + 1, cartesian: (l + 1) * (l + 2) / 2 };
}
export function shannonEntropy(probabilities: number[]): number {
  if (!probabilities.length || probabilities.some(p => !Number.isFinite(p) || p < 0 || p > 1) ||
      Math.abs(probabilities.reduce((sum, p) => sum + p, 0) - 1) > 1e-10) {
    throw new RangeError('Probabilities must be finite, nonnegative, and sum to one.');
  }
  return probabilities.reduce((sum, p) => sum - (p === 0 ? 0 : p * Math.log(p)), 0);
}
export function orbitalEntropy(t: number) {
  bounded(t, 0, 1, 'Mixing parameter');
  const probabilities = [1 - 3 * t / 4, t / 4, t / 4, t / 4];
  return { probabilities, entropy: shannonEntropy(probabilities) };
}
export function determinantCounts(orbitals: number) {
  whole(orbitals, 2, 24, 'Even spatial orbitals');
  if (orbitals % 2) throw new RangeError('This half-filled example needs an even number of orbitals.');
  return { all: combinations(2 * orbitals, orbitals), fixed: combinations(orbitals, orbitals / 2) ** 2n };
}
export function excitationDistance(first: string, second: string): number {
  if (!/^[01]+$/u.test(first) || !/^[01]+$/u.test(second) || first.length !== second.length ||
      [...first].filter(bit => bit === '1').length !== [...second].filter(bit => bit === '1').length) {
    throw new RangeError('Determinants must have equal mode and electron counts.');
  }
  return [...first].filter((bit, index) => bit !== second[index]).length / 2;
}
export function choleskyToyResidual(rank: number): number {
  whole(rank, 0, 4, 'Retained rank');
  const spectrum = [4, 1, .25, .0625];
  return Math.sqrt(spectrum.slice(rank).reduce((sum, value) => sum + value ** 2, 0) /
    spectrum.reduce((sum, value) => sum + value ** 2, 0));
}
export function retainedWeight(weights: number[], count: number): number {
  shannonEntropy(weights);
  whole(count, 0, weights.length, 'Retained support');
  return weights.slice(0, count).reduce((sum, weight) => sum + weight, 0);
}
export function covarianceMeanVariance(rho: number, shots: number) {
  bounded(rho, -1, 1, 'Correlation');
  whole(shots, 1, 1_000_000, 'Shots');
  return { sum: (2 + 2 * rho) / shots, difference: (2 - 2 * rho) / shots, diagonalOnly: 2 / shots };
}
export function qpeDistribution(phase: number, bits: number): Point[] {
  bounded(phase, 0, 1, 'Eigenphase in turns');
  whole(bits, 1, 8, 'Phase bits');
  const count = 2 ** bits;
  // A bounded direct Fourier sum avoids the sine-ratio singularity at exact bins.
  return Array.from({ length: count }, (_, y) => {
    let real = 0;
    let imaginary = 0;
    for (let x = 0; x < count; x++) {
      const angle = 2 * Math.PI * x * (phase - y / count);
      real += Math.cos(angle);
      imaginary += Math.sin(angle);
    }
    return { x: y / count, y: (real ** 2 + imaginary ** 2) / count ** 2, label: y.toString(2).padStart(bits, '0') };
  });
}
export function amplificationProbability(initial: number, rounds: number): number {
  bounded(initial, 0, 1, 'Initial good probability');
  whole(rounds, 0, 1000, 'Amplification rounds');
  return Math.sin((2 * rounds + 1) * Math.asin(Math.sqrt(initial))) ** 2;
}
export function rawSimulationBytes(qubits: number, density = false): number {
  whole(qubits, 0, 50, 'Qubits');
  return 16 * 2 ** ((density ? 2 : 1) * qubits);
}
export function qpeQueryCount(bits: number) {
  whole(bits, 1, 30, 'Phase bits');
  return { largest: 2 ** (bits - 1), total: 2 ** bits - 1 };
}
export function logicalErrorIllustration(distance: number, ratio: number, prefactor = .1): number {
  whole(distance, 3, 99, 'Code distance');
  if (distance % 2 === 0) throw new RangeError('The illustration uses odd code distances.');
  bounded(ratio, .0001, .9999, 'Below-threshold physical/threshold ratio');
  bounded(prefactor, .0001, 1, 'Prefactor');
  return prefactor * ratio ** ((distance + 1) / 2);
}
export const resourceCandidates: ParetoCandidate[] = [
  { name: 'A', qubits: 200_000, hours: 4 },
  { name: 'B', qubits: 400_000, hours: 2 },
  { name: 'C', qubits: 300_000, hours: 5 },
  { name: 'D', qubits: 800_000, hours: 1 },
];
export function classifyCandidates(candidates: ParetoCandidate[], maxQubits: number, deadline: number) {
  bounded(maxQubits, 0, 1e12, 'Qubit ceiling');
  bounded(deadline, 0, 1e9, 'Deadline');
  for (const point of candidates) {
    bounded(point.qubits, 1, 1e12, 'Candidate qubits');
    bounded(point.hours, Number.EPSILON, 1e9, 'Candidate time');
  }
  return candidates.map(point => ({
    ...point,
    feasible: point.qubits <= maxQubits && point.hours <= deadline,
    dominated: candidates.some(other => other !== point && other.qubits <= point.qubits && other.hours <= point.hours &&
      (other.qubits < point.qubits || other.hours < point.hours)),
  }));
}
export { interference, shotUncertainty };
