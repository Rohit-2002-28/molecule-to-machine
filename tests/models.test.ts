import { describe, expect, it } from 'vitest';
import {
  activeSpace, combinations, errorBudget, executionContract, groupPaulis,
  illustrativeResources, interference, pauliCommutes, phaseEstimate,
  shotUncertainty, twoStateMixing,
} from '../src/lib/models';

describe('active spaces and occupation', () => {
  it('counts determinants exactly without unsafe integer rounding', () => {
    expect(combinations(4, 2)).toBe(6n);
    expect(combinations(0, 0)).toBe(1n);
    expect(combinations(128, 64)).toBe(23951146041928082866135587776380551750n);
    expect(activeSpace(2, 2, 0)).toEqual({
      alpha: 1, beta: 1, spinOrbitals: 4, directMappingQubits: 4,
      allDeterminants: 6n, fixedSpinDeterminants: 4n,
    });
  });
  it('handles empty and full filling', () => {
    expect(activeSpace(64, 0, 0).fixedSpinDeterminants).toBe(1n);
    expect(activeSpace(64, 128, 0).fixedSpinDeterminants).toBe(1n);
  });
  it('rejects invalid occupancy, parity, nonintegers, and nonfinite inputs', () => {
    for (const args of [[2, 3, 0], [2, 5, 1], [2, 4, 2], [0, 0, 0], [2.5, 2, 0], [NaN, 2, 0]]) {
      const [m = 0, n = 0, spin = 0] = args;
      expect(() => activeSpace(m, n, spin)).toThrow(RangeError);
    }
    expect(() => combinations(3, 4)).toThrow(RangeError);
  });
});

describe('two-state variational model', () => {
  it('diagonalizes a symmetric matrix and never raises the lower state', () => {
    expect(twoStateMixing(0, 2, 0).lower).toBe(0);
    expect(twoStateMixing(0, 0, 1)).toEqual({ lower: -1, upper: 1, firstWeight: .5, lowering: 1 });
    expect(twoStateMixing(1, 1, 0).firstWeight).toBe(1);
    expect(twoStateMixing(-1, 2, .5).lower).toBeLessThan(-1);
    expect(() => twoStateMixing(Infinity, 0, 0)).toThrow();
  });
});

describe('measurement and interference', () => {
  it('gives inverse square-root shot scaling for independent Pauli shots', () => {
    expect(shotUncertainty(0, 100).standardError).toBe(.1);
    expect(shotUncertainty(0, 400).standardError).toBe(.05);
    expect(shotUncertainty(1, 1).standardError).toBe(0);
    expect(() => shotUncertainty(1.1, 10)).toThrow();
    expect(() => shotUncertainty(0, 0)).toThrow();
  });
  it('models H - phase - H probabilities', () => {
    expect(interference(0).p0).toBe(1);
    expect(interference(Math.PI).p1).toBeCloseTo(1);
    expect(interference(Math.PI / 2).p0).toBeCloseTo(.5);
    expect(() => interference(NaN)).toThrow();
  });
});

describe('Pauli grouping', () => {
  it('distinguishes commuting from qubit-wise commuting', () => {
    expect(pauliCommutes('XX', 'ZZ')).toBe(true);
    expect(pauliCommutes('XX', 'ZZ', true)).toBe(false);
    expect(pauliCommutes('XI', 'IX', true)).toBe(true);
    expect(groupPaulis(['ZI', 'IZ', 'ZZ', 'XX', 'XI'])).toEqual([['ZI', 'IZ', 'ZZ'], ['XX', 'XI']]);
  });
  it('rejects malformed or unequal strings', () => {
    expect(() => groupPaulis([])).toThrow();
    expect(() => groupPaulis(['XI', 'Y'])).toThrow();
    expect(() => pauliCommutes('AB', 'ZZ')).toThrow();
  });
});

describe('phase resolution and aliasing', () => {
  it('rounds to a binary grid and exposes modulo ambiguity', () => {
    const result = phaseEstimate(Math.PI / 2, 1, 3);
    expect(result.phase).toBeCloseTo(.25);
    expect(result.binary).toBe('010');
    expect(result.energyResolution).toBeCloseTo(Math.PI / 4);
    expect(phaseEstimate(Math.PI / 2 + 2 * Math.PI, 1, 3).phase).toBeCloseTo(result.phase);
    expect(phaseEstimate(-Math.PI / 2, 1, 3).binary).toBe('110');
    expect(phaseEstimate(2 * Math.PI - .001, 1, 3).nearestBin).toBe(0);
    expect(() => phaseEstimate(0, 0, 3)).toThrow();
    expect(() => phaseEstimate(0, 1, 21)).toThrow();
  });
});

describe('budgets and handoffs', () => {
  it('adds conservative error allowances without assuming independence', () => {
    expect(errorBudget(.1, .2, .3).worstCase).toBeCloseTo(.6);
    expect(() => errorBudget(-1, 0, 0)).toThrow();
  });
  it('keeps the illustrative patch count separate from real resource estimation', () => {
    expect(illustrativeResources(10, 3, 1000, 1)).toEqual({ physicalDataQubits: 180, seconds: .001 });
    expect(() => illustrativeResources(10, 4, 1000, 1)).toThrow();
    expect(() => illustrativeResources(10, 3, 1000, 0)).toThrow();
  });
  it('requires every handoff item', () => {
    expect(executionContract(true, true, true, true).ready).toBe(true);
    expect(executionContract(true, true, false, true).ready).toBe(false);
  });
});
