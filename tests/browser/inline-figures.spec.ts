import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { inlineFigures, figuresForLesson } from '../../src/data/inline-figures';
import { course } from '../../src/lib/course';
import { renderMarkdown } from '../../src/lib/markdown';

const route = (number: number) => `lessons/${String(number).padStart(2, '0')}/`;
async function visit(page: Page, number: number, figure?: string) {
  const response = await page.goto(`${route(number)}${figure ? `#figure-${figure}` : ''}`);
  expect(response?.status()).toBe(200);
  await expect(page.locator('[data-open-search]')).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);
}

test('every figure is adjacent to its declared section and original heading identities are unchanged', async ({ page }) => {
  test.setTimeout(120000);
  let total = 0;
  for (const lesson of course.lessons) {
    await visit(page, lesson.number);
    const expected = figuresForLesson(lesson.number);
    await expect(page.locator('[data-inline-figure]')).toHaveCount(expected.length);
    total += expected.length;
    const actual = await page.locator('[data-inline-figure]').evaluateAll(figures => figures.map(figure => {
      let node = figure.previousElementSibling;
      let paragraphs = 0;
      while (node && !/^H[1-6]$/.test(node.tagName)) {
        if (node.tagName === 'P') paragraphs++;
        node = node.previousElementSibling;
      }
      return { id: figure.getAttribute('data-inline-figure'), anchor: node?.id, paragraphs };
    }));
    for (const figure of expected) {
      expect(actual.find(item => item.id === figure.id)).toEqual({ id: figure.id, anchor: figure.anchor, paragraphs: figure.afterParagraph });
    }
    const rendered = await renderMarkdown(lesson.body);
    expect(await page.locator('.lesson-body > :is(h2,h3,h4,h5,h6)').evaluateAll(headings => headings.map(heading => heading.id))).toEqual(rendered.sections.map(section => section.id));
    const ids = await page.locator('[id]').evaluateAll(elements => elements.map(element => element.id));
    expect(new Set(ids).size).toBe(ids.length);
  }
  expect(total).toBe(46);
});

test('the energy curve appears immediately after the energy-curve explanation, not at the lesson end', async ({ page }) => {
  await visit(page, 1, 'bond-energy');
  const figure = page.locator('#figure-bond-energy');
  await expect(figure).toBeVisible();
  expect(await figure.evaluate(element => element.previousElementSibling?.textContent)).toContain('eventual separation of the atoms');
  expect(await figure.evaluate(element => element.nextElementSibling?.textContent)).toContain('not automatically a simulation');
  await expect(figure.locator('.figure-assumptions')).toContainText('not computed N₂ data');
  await expect(figure.locator('.chart-annotation text:visible')).toHaveText(['Repulsion', 'Stretching', 'Dissociation']);
  await expect(figure.locator('.plot-legend')).toContainText('Equilibrium minimum');
  await expect(figure.locator('.plot-reference-label')).toContainText('Dissociation reference');
});

test('keyboard separation selection uses the correct Morse values and preserves the scientific disclaimer', async ({ page }) => {
  await visit(page, 1, 'bond-energy');
  const control = page.getByLabel('Normalized separation x', { exact: true });
  await expect(control).toBeEnabled();
  await control.focus();
  await page.keyboard.press('Home');
  await expect(page.locator('[data-figure-readout]')).toContainText('0.501951');
  await expect(page.locator('[data-figure-readout]')).toContainText('normalized force = 10.91');
  await page.keyboard.press('End');
  await expect(page.locator('[data-figure-readout]')).toContainText('-0.004951');
  await control.evaluate(input => {
    (input as HTMLInputElement).value = '1';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(page.locator('[data-figure-readout]')).toContainText('E/Dₑ = -1');
  await expect(page.locator('[data-figure-readout]')).toContainText('slope = 0');
  await expect(page.locator('#figure-bond-energy .figure-assumptions')).toContainText('arbitrary scales');
});

test('shot control changes only an analytical standard error', async ({ page }) => {
  await visit(page, 20, 'shot-standard-error');
  const figure = page.locator('#figure-shot-standard-error');
  await figure.getByLabel('Independent shots N', { exact: true }).focus();
  await page.keyboard.press('Home');
  await expect(figure.locator('[data-figure-readout]')).toContainText('standard error = 0.2');
  await page.keyboard.press('End');
  await expect(figure.locator('[data-figure-readout]')).toContainText('standard error = 0.025');
  await expect(figure.locator('.figure-assumptions')).toContainText('not a confidence interval');
});

test('QPE precision changes the complete analytic distribution and accessible table', async ({ page }) => {
  await visit(page, 21, 'qpe-finite-bins');
  const figure = page.locator('#figure-qpe-finite-bins');
  const initialPath = await figure.locator('.chart-wide [data-series="0"] path').getAttribute('d');
  await figure.getByLabel('Readout bits m', { exact: true }).selectOption('5');
  await expect(figure.locator('[data-figure-readout]')).toContainText('32 bins');
  await expect(figure.locator('[data-figure-readout]')).toContainText('probabilities sum to 1');
  await expect(figure.locator('tbody tr')).toHaveCount(32);
  expect(await figure.locator('.chart-wide [data-series="0"] path').getAttribute('d')).not.toBe(initialPath);
  await figure.getByText('Inspect plotted values', { exact: true }).click();
  await expect(figure.locator('table')).toBeVisible();
  const sum = await figure.locator('tbody tr td:last-child').evaluateAll(cells => cells.reduce((total, cell) => total + Number(cell.textContent), 0));
  expect(sum).toBeCloseTo(1, 4);
  await figure.getByLabel('Readout bits m', { exact: true }).selectOption('2');
  await expect(figure.locator('tbody tr')).toHaveCount(4);
});

test('Pareto budget feasibility is separate from dominance and invalid input is explicit', async ({ page }) => {
  await visit(page, 29, 'resource-pareto-budget');
  const figure = page.locator('#figure-resource-pareto-budget');
  await expect(figure.locator('[data-figure-readout]')).toContainText('Fits both limits: B.');
  await figure.getByLabel('Qubit ceiling', { exact: true }).fill('200000');
  await expect(figure.locator('[data-figure-readout]')).toContainText('No candidate fits');
  await figure.getByLabel('Qubit ceiling', { exact: true }).fill('800000');
  await expect(figure.locator('[data-figure-readout]')).toContainText('Fits both limits: B, D.');
  await expect(figure.locator('[data-reference-label="x"]')).toContainText('800,000');
  await figure.getByLabel('Deadline (hours)', { exact: true }).fill('');
  await expect(figure.locator('.figure-input-error')).toBeVisible();
  await expect(figure.locator('[data-figure-readout]')).toContainText('No current selection result');
  await figure.getByLabel('Deadline (hours)', { exact: true }).fill('5');
  await expect(figure.locator('.figure-input-error')).not.toBeVisible();
  await expect(figure.locator('[data-figure-readout]')).toContainText('C remains dominated');
});

test('all new plots reflow without tiny ticks, clipped labels, duplicate charts, or page overflow', async ({ page, isMobile }) => {
  test.setTimeout(120000);
  for (const number of [...new Set(inlineFigures.map(figure => figure.lesson))]) {
    await visit(page, number);
    const result = await page.evaluate(() => {
      const problems: string[] = [];
      if (document.documentElement.scrollWidth > innerWidth + 1) problems.push('Page overflow');
      for (const figure of document.querySelectorAll('[data-inline-figure]')) {
        const charts = [...figure.querySelectorAll<SVGSVGElement>('.figure-chart')].filter(chart => chart.getClientRects().length);
        if (figure.querySelector('.plot-layout') && charts.length !== 1) problems.push('Duplicate/missing visible chart');
        for (const chart of [...charts, ...figure.querySelectorAll<SVGSVGElement>('.compact-diagram')]) {
          const viewBox = chart.viewBox.baseVal;
          const scale = chart.getBoundingClientRect().width / viewBox.width;
          for (const text of chart.querySelectorAll('text')) {
            const box = text.getBBox();
            if (box.x < -1 || box.y < -1 || box.x + box.width > viewBox.width + 1 || box.y + box.height > viewBox.height + 1) problems.push(`Clipped: ${text.textContent}`);
            if (parseFloat(getComputedStyle(text).fontSize) * scale < 13.9) problems.push(`Tiny: ${text.textContent}`);
          }
        }
      }
      return problems;
    });
    expect(result, `Lesson ${number}, ${isMobile ? 'mobile' : 'desktop'}`).toEqual([]);
  }
});

test('static figures, assumptions, and data remain complete without JavaScript', async ({ browser, baseURL, isMobile }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: isMobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 } });
  try {
    const page = await context.newPage();
    await page.goto(`${baseURL}${route(1)}#figure-bond-energy`);
    const figure = page.locator('#figure-bond-energy');
    await expect(figure.locator('.figure-chart:visible')).toHaveCount(1);
    await expect(figure.locator('[name="separation"]')).toBeDisabled();
    await expect(figure.locator('[data-figure-readout]')).toContainText('−0.746574');
    await figure.getByText('Inspect plotted values', { exact: true }).click();
    await expect(figure.locator('table')).toBeVisible();
    await expect(page.locator('.lesson-body')).toContainText('It is not automatically a simulation');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  } finally { await context.close(); }
});

test('figures keep text and distinguishable series in dark, high contrast, reduced motion, and print', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce', contrast: 'more' });
  await visit(page, 1, 'bond-energy');
  await expect(page.locator('#figure-bond-energy .figure-assumptions')).toBeVisible();
  const dark = await new AxeBuilder({ page }).include('#figure-bond-energy').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(dark.violations).toEqual([]);
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.locator('#figure-bond-energy .figure-chart:visible')).toHaveCount(1);
  await page.emulateMedia({ forcedColors: 'none', media: 'print', colorScheme: 'light' });
  await expect(page.locator('#figure-bond-energy .chart-wide')).toBeVisible();
  await expect(page.locator('#figure-bond-energy .chart-compact')).not.toBeVisible();
  await expect(page.locator('#figure-bond-energy .figure-explorer')).not.toBeVisible();
  await expect(page.locator('#figure-bond-energy .figure-assumptions')).toBeVisible();
});

test('new plots and diagram tables satisfy keyboard and named-region accessibility checks', async ({ page }) => {
  test.setTimeout(90000);
  for (const number of [1, 9, 14, 21, 29]) {
    await visit(page, number);
    const scan = await new AxeBuilder({ page }).include('[data-inline-figure]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(scan.violations, `Lesson ${number}: ${JSON.stringify(scan.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })))}`).toEqual([]);
  }
});
