import { plotCoordinate, plotFor, plotFrame, pointPosition, qpePlot, seriesPath, type PlotSpec } from '../lib/plot-data';
import { classifyCandidates, morse, resourceCandidates, shotUncertainty } from '../lib/visual-models';

const fmt = (value: number) => Number(value.toPrecision(6)).toLocaleString(undefined, { maximumFractionDigits: 6 });
function updateCursor(figure: HTMLElement, spec: PlotSpec, x: number, y: number): void {
  for (const svg of figure.querySelectorAll<SVGSVGElement>('.figure-chart')) {
    const frame = plotFrame(svg.dataset.compact === 'true');
    const point = pointPosition({ x, y }, spec, frame);
    const marker = svg.querySelector('[data-cursor]');
    marker?.setAttribute('cx', String(point.x)); marker?.setAttribute('cy', String(point.y));
    svg.querySelector('[data-cursor-guide]')?.setAttribute('d', `M${point.x},${frame.bottom}V${point.y}`);
  }
}
export function initInlineFigures(): void {
  for (const figure of document.querySelectorAll<HTMLElement>('[data-inline-figure][data-interaction]')) {
    if (!figure.dataset.interaction) continue;
    const fieldset = figure.querySelector<HTMLFieldSetElement>('.figure-explorer fieldset');
    const readout = figure.querySelector<HTMLElement>('[data-figure-readout]');
    const errorElement = figure.querySelector<HTMLElement>('.figure-input-error');
    if (!fieldset || !readout || !errorElement) continue;
    fieldset.disabled = false;
    function number(name: string): number {
      const input = fieldset?.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`);
      if (!input || !input.value.trim()) throw new RangeError('Enter a value for every control.');
      const value = Number(input.value);
      if (!Number.isFinite(value) || !input.checkValidity()) throw new RangeError('Use a value within the labeled control range and step.');
      return value;
    }
    function update(): void {
      if (!readout || !errorElement) return;
      try {
        switch (figure.dataset.interaction) {
          case 'separation': {
            const x = number('separation');
            const point = morse(x);
            updateCursor(figure, plotFor('morse'), x, point.energy);
            readout.textContent = `Selected x = ${fmt(x)} · E/Dₑ = ${fmt(point.energy)} · slope = ${fmt(point.slope)} · normalized force = ${fmt(point.force)}.`;
            break;
          }
          case 'shots': {
            const shots = number('shots');
            const error = shotUncertainty(0, shots).standardError;
            updateCursor(figure, plotFor('shots'), shots, error);
            readout.textContent = `Selected N = ${shots.toLocaleString()} · standard error = ${fmt(error)}. Halving this error needs ${fmt(4 * shots)} shots at the same variance.`;
            break;
          }
          case 'qpe-bits': {
            const bits = number('bits');
            const spec = qpePlot(bits);
            const item = spec.series[0]!;
            for (const svg of figure.querySelectorAll<SVGSVGElement>('.figure-chart')) {
              svg.querySelector('[data-series="0"] .series-path')?.setAttribute('d', seriesPath(item, spec, plotFrame(svg.dataset.compact === 'true')));
            }
            const values = figure.querySelector('[data-figure-values]');
            if (values) {
              const rows = item.points.map(point => {
                const row = document.createElement('tr');
                const label = document.createElement('th'); label.scope = 'row'; label.textContent = `Bin ${point.label}`;
                const x = document.createElement('td'); x.textContent = fmt(point.x);
                const y = document.createElement('td'); y.textContent = fmt(point.y);
                row.append(label, x, y); return row;
              });
              values.replaceChildren(...rows);
            }
            const sum = item.points.reduce((total, point) => total + point.y, 0);
            readout.textContent = `${bits} bits · ${2 ** bits} bins · spacing ${fmt(2 ** -bits)} turns · probabilities sum to ${fmt(sum)}.`;
            break;
          }
          case 'pareto': {
            const ceiling = number('qubits');
            const deadline = number('deadline');
            const candidates = classifyCandidates(resourceCandidates, ceiling, deadline);
            const fits = candidates.filter(point => point.feasible).map(point => point.name);
            const spec = plotFor('pareto');
            for (const svg of figure.querySelectorAll<SVGSVGElement>('.figure-chart')) {
              const frame = plotFrame(svg.dataset.compact === 'true');
              const x = plotCoordinate(ceiling / 1000, spec.x, frame.left, frame.right);
              const y = plotCoordinate(deadline, spec.y, frame.bottom, frame.top);
              svg.querySelector('[data-reference="x"]')?.setAttribute('d', `M${x},${frame.top}V${frame.bottom}`);
              svg.querySelector('[data-reference="y"]')?.setAttribute('d', `M${frame.left},${y}H${frame.right}`);
            }
            const xLabel = figure.querySelector('[data-reference-label="x"]');
            const yLabel = figure.querySelector('[data-reference-label="y"]');
            if (xLabel) xLabel.textContent = `Dotted qubit ceiling: ${ceiling.toLocaleString()}. `;
            if (yLabel) yLabel.textContent = `Dotted deadline: ${fmt(deadline)} hours.`;
            readout.textContent = fits.length ? `Fits both limits: ${fits.join(', ')}. C remains dominated by A.` : 'No candidate fits both limits. These limits do not change the underlying workload or create another candidate.';
            break;
          }
          default: throw new Error('Unsupported inline figure interaction.');
        }
        errorElement.hidden = true;
        delete figure.dataset.invalid;
      } catch (error) {
        if (!(error instanceof RangeError)) console.error('Inline figure could not update:', error);
        errorElement.hidden = false;
        errorElement.textContent = error instanceof Error ? error.message : 'The figure could not update. The static model and original lesson remain available.';
        readout.textContent = 'No current selection result. The curves still describe the fixed model stated below.';
        figure.dataset.invalid = 'true';
      }
    }
    fieldset.addEventListener('input', update);
    fieldset.addEventListener('change', update);
    update();
  }
}
