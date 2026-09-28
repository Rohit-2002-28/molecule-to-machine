function finite(value: number, name: string): void {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite.`);
}

function integer(value: number, min: number, max: number, name: string): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${name} must be an integer from ${min} to ${max}.`);
  }
}

export function combinations(n: number, k: number): bigint {
  integer(n, 0, 256, 'Number of states');
  integer(k, 0, n, 'Number selected');
  let count = 1n;
  const smaller = Math.min(k, n - k);
  for (let i = 1; i <= smaller; i++) {
    count = (count * BigInt(n - smaller + i)) / BigInt(i);
  }
  return count;
}

export function activeSpace(orbitals: number, electrons: number, twiceSpin: number) {
  integer(orbitals, 1, 64, 'Spatial orbitals');
  integer(electrons, 0, 2 * orbitals, 'Electrons');
  integer(twiceSpin, -electrons, electrons, 'N alpha minus N beta');
  if ((electrons + twiceSpin) % 2 !== 0) {
    throw new RangeError('Electron count and N alpha minus N beta must have the same parity.');
  }
  const alpha = (electrons + twiceSpin) / 2;
  const beta = (electrons - twiceSpin) / 2;
  if (alpha > orbitals || beta > orbitals) {
    throw new RangeError('Each spin channel can hold at most one electron per spatial orbital.');
  }
  return {
    alpha, beta,
    spinOrbitals: 2 * orbitals,
    directMappingQubits: 2 * orbitals,
    allDeterminants: combinations(2 * orbitals, electrons),
    fixedSpinDeterminants: combinations(orbitals, alpha) * combinations(orbitals, beta),
  };
}

export function twoStateMixing(e0: number, e1: number, coupling: number) {
  finite(e0, 'First diagonal energy');
  finite(e1, 'Second diagonal energy');
  finite(coupling, 'Coupling');
  const gap = Math.hypot(e1 - e0, 2 * coupling);
  const lower = (e0 + e1 - gap) / 2;
  const upper = (e0 + e1 + gap) / 2;
  const firstWeight = gap === 0 ? 1 : (1 + (e1 - e0) / gap) / 2;
  return { lower, upper, firstWeight, lowering: Math.min(e0, e1) - lower };
}

export function shotUncertainty(expectation: number, shots: number) {
  finite(expectation, 'Expectation');
  if (Math.abs(expectation) > 1) throw new RangeError('A Pauli expectation must be between -1 and 1.');
  integer(shots, 1, 100_000_000, 'Shots');
  const variance = 1 - expectation ** 2;
  return { variance, standardError: Math.sqrt(variance / shots) };
}

export function interference(phaseRadians: number) {
  finite(phaseRadians, 'Phase');
  const p0 = Math.cos(phaseRadians / 2) ** 2;
  return { p0, p1: 1 - p0 };
}

export function pauliCommutes(first: string, second: string, qubitWise = false): boolean {
  if (!/^[IXYZ]+$/.test(first) || !/^[IXYZ]+$/.test(second) || first.length !== second.length) {
    throw new RangeError('Pauli strings must have equal length and contain only I, X, Y, or Z.');
  }
  let differences = 0;
  for (let index = 0; index < first.length; index++) {
    const a = first[index];
    const b = second[index];
    if (a !== b && a !== 'I' && b !== 'I') differences++;
  }
  return qubitWise ? differences === 0 : differences % 2 === 0;
}

export function groupPaulis(terms: string[]): string[][] {
  if (terms.length === 0) throw new RangeError('Add at least one Pauli string.');
  const width = terms[0]?.length ?? 0;
  const groups: string[][] = [];
  for (const term of terms) {
    if (term.length !== width || !/^[IXYZ]+$/.test(term)) {
      throw new RangeError('Use equal-length Pauli strings containing only I, X, Y, or Z.');
    }
    const existing = groups.find(group => group.every(other => pauliCommutes(term, other, true)));
    if (existing) existing.push(term);
    else groups.push([term]);
  }
  return groups;
}

export function phaseEstimate(energy: number, time: number, bits: number) {
  finite(energy, 'Energy');
  finite(time, 'Evolution time');
  if (time <= 0) throw new RangeError('Evolution time must be positive.');
  integer(bits, 1, 20, 'Readout bits');
  const rawPhase = energy * time / (2 * Math.PI);
  const phase = ((rawPhase % 1) + 1) % 1;
  const bins = 2 ** bits;
  const nearestBin = Math.round(phase * bins) % bins;
  return {
    phase, nearestBin,
    binary: nearestBin.toString(2).padStart(bits, '0'),
    phaseResolution: 1 / bins,
    energyResolution: 2 * Math.PI / (time * bins),
    energyPeriod: 2 * Math.PI / time,
    decodedEnergy: nearestBin * 2 * Math.PI / (time * bins),
  };
}

export function errorBudget(model: number, approximation: number, estimation: number) {
  for (const [name, value] of Object.entries({ model, approximation, estimation })) {
    finite(value, name);
    if (value < 0) throw new RangeError('Error allowances must be nonnegative.');
  }
  return { worstCase: model + approximation + estimation };
}

export function illustrativeResources(logical: number, distance: number, cycles: number, cycleMicros: number) {
  integer(logical, 1, 100_000, 'Logical qubits');
  integer(distance, 3, 99, 'Code distance');
  if (distance % 2 === 0) throw new RangeError('Use an odd code distance in this illustration.');
  integer(cycles, 1, 1_000_000_000, 'Cycles');
  finite(cycleMicros, 'Cycle time');
  if (cycleMicros <= 0) throw new RangeError('Cycle time must be positive.');
  return {
    physicalDataQubits: logical * 2 * distance ** 2,
    seconds: cycles * cycleMicros / 1_000_000,
  };
}

export function executionContract(revision: boolean, mapping: boolean, units: boolean, uncertainty: boolean) {
  const checks = [
    { label: 'Pinned input revision', passed: revision },
    { label: 'Orbital and qubit ordering', passed: mapping },
    { label: 'Units and energy offsets', passed: units },
    { label: 'Accuracy target and uncertainty', passed: uncertainty },
  ];
  return { checks, ready: checks.every(check => check.passed) };
}
