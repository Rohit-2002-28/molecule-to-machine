import {
  activeSpace, twoStateMixing, interference, shotUncertainty, groupPaulis,
  phaseEstimate, errorBudget, illustrativeResources, executionContract,
} from '../lib/models';

const format = (value: number, digits = 5) => value.toLocaleString(undefined, { maximumFractionDigits: digits });

export function initLabs(): void {
  for (const lab of document.querySelectorAll<HTMLElement>('[data-lab]')) {
    const form = lab.querySelector('form');
    const results = lab.querySelector<HTMLElement>('.lab-results');
    const errorElement = lab.querySelector<HTMLElement>('.lab-error');
    if (!form || !results || !errorElement) continue;
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (button) button.disabled = false;
    function update() {
      if (!form || !results || !errorElement) return;
      const data = new FormData(form);
      function num(name: string): number {
        const value = data.get(name);
        if (typeof value !== 'string' || !value.trim()) throw new RangeError('Fill in every numeric field.');
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) throw new RangeError('Use finite numbers in each numeric field.');
        const input = form?.querySelector<HTMLInputElement>(`[name="${name}"]`);
        if (input?.min && parsed < Number(input.min) || input?.max && parsed > Number(input.max)) {
          throw new RangeError(`${input?.labels?.[0]?.textContent?.trim() ?? name} must be between ${input?.min} and ${input?.max}.`);
        }
        return parsed;
      }
      try {
        let rows: [string, string][] = [];
        let probabilities: [string, number][] = [];
        switch (lab.dataset.kind) {
          case 'active': {
            const result = activeSpace(num('orbitals'), num('electrons'), num('spin'));
            rows = [
              ['Alpha / beta electrons', `${result.alpha} / ${result.beta}`],
              ['Untapered direct-mapping qubits', String(result.directMappingQubits)],
              ['All fixed-electron determinants', result.allDeterminants.toLocaleString()],
              ['Fixed spin-projection determinants', result.fixedSpinDeterminants.toLocaleString()],
            ];
            break;
          }
          case 'mixing': {
            const result = twoStateMixing(0, num('gap'), num('coupling'));
            rows = [
              ['Lower eigenvalue', format(result.lower)], ['Upper eigenvalue', format(result.upper)],
              ['Lowering from the lowest diagonal', format(result.lowering)],
              ['First configuration weight', `${format(result.firstWeight * 100, 2)}%`],
            ];
            probabilities = [['First configuration', result.firstWeight], ['Second configuration', 1 - result.firstWeight]];
            break;
          }
          case 'interference': {
            const phase = num('phase');
            const result = interference(phase);
            rows = [['Phase', `${format(phase, 3)} radians (${format(phase / Math.PI, 3)} pi)`],
              ['Probability of zero', `${format(100 * result.p0, 2)}%`], ['Probability of one', `${format(100 * result.p1, 2)}%`]];
            probabilities = [['Zero', result.p0], ['One', result.p1]];
            break;
          }
          case 'shots': {
            const result = shotUncertainty(num('expectation'), num('shots'));
            rows = [['Single-shot variance', format(result.variance)],
              ['Standard error of the mean', result.standardError.toPrecision(4)],
              ['To halve this standard error', `${format(num('shots') * 4, 0)} shots at the same variance`]];
            break;
          }
          case 'grouping': {
            const value = data.get('terms');
            if (typeof value !== 'string') throw new RangeError('Enter Pauli strings separated by commas.');
            const groups = groupPaulis(value.split(',').map(term => term.trim().toUpperCase()));
            rows = groups.map((group, index) => [`Product-basis group ${index + 1}`, group.join(', ')]);
            rows.push(['Grouping scope', `${groups.length} settings in this greedy partition; not a proven minimum`]);
            break;
          }
          case 'phase': {
            const result = phaseEstimate(num('energy'), num('time'), num('bits'));
            rows = [['Wrapped phase', format(result.phase, 6)], ['Nearest binary bin', result.binary],
              ['Phase grid spacing', format(result.phaseResolution, 8)],
              ['Energy grid spacing', format(result.energyResolution, 8)],
              ['Energy alias period', format(result.energyPeriod, 6)],
              ['Decoded representative in [0, period)', format(result.decodedEnergy, 6)]];
            break;
          }
          case 'budget': {
            const result = errorBudget(num('model'), num('approximation'), num('estimation'));
            rows = [['Sum of valid absolute bounds', `${format(result.worstCase, 3)} mEh`],
              ['Against an illustrative 1 mEh target', result.worstCase <= 1 ? `${format(1 - result.worstCase, 3)} mEh remains` : `${format(result.worstCase - 1, 3)} mEh over the target`],
              ['Not included', 'A device failure probability is a separate budget.']];
            break;
          }
          case 'resources': {
            const result = illustrativeResources(num('logical'), num('distance'), num('cycles'), num('cycleTime'));
            rows = [['Illustrative physical data qubits', format(result.physicalDataQubits, 0)], ['Illustrative duration', `${format(result.seconds, 6)} seconds`],
              ['Scope warning', 'Excludes factories, routing, decoding, logical failure, and much more. Not a real QRE.']];
            break;
          }
          case 'handoff': {
            const result = executionContract(data.has('revision'), data.has('mapping'), data.has('units'), data.has('uncertainty'));
            rows = result.checks.map(check => [check.label, check.passed ? 'Included in this example' : 'Missing from this example']);
            rows.push(['Teaching checklist', result.ready ? 'All four categories included. Correctness still needs review.' : 'The next consumer lacks important context.']);
            break;
          }
          default: throw new Error('Unknown educational model.');
        }
        const list = document.createElement('dl');
        list.className = 'result-list';
        for (const [term, value] of rows) {
          const row = document.createElement('div');
          const dt = document.createElement('dt'); dt.textContent = term;
          const dd = document.createElement('dd'); dd.textContent = value;
          row.append(dt, dd); list.append(row);
        }
        results.replaceChildren(list);
        for (const [label, value] of probabilities) {
          const row = document.createElement('div'); row.className = 'probability-row';
          const text = document.createElement('span'); text.textContent = label;
          const meter = document.createElement('meter'); meter.min = 0; meter.max = 1; meter.value = value; meter.setAttribute('aria-label', label);
          row.append(text, meter); results.append(row);
        }
        errorElement.hidden = true;
      } catch (error) {
        if (!(error instanceof RangeError)) console.error('Educational model failed:', error);
        errorElement.textContent = error instanceof Error ? error.message : 'This model could not update. Reload the page to try again.';
        errorElement.hidden = false;
        results.replaceChildren();
      }
    }
    form.addEventListener('submit', event => { event.preventDefault(); update(); });
    form.addEventListener('input', update);
    update();
  }
}
