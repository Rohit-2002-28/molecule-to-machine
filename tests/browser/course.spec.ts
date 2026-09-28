import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const key = 'molecule-to-machine:learning:v1';
const route = (number: number) => `lessons/${String(number).padStart(2, '0')}/`;
async function open(page: Page, path = '') {
  const response = await page.goto(path);
  expect(response?.status()).toBe(200);
  await expect(page.locator('[data-open-search]')).toBeEnabled();
}

test('the complete curriculum is linked and never locked', async ({ page }) => {
  await open(page, './');
  await expect(page.locator('.lesson-list a')).toHaveCount(34);
  await expect(page.locator('.availability-notice')).toHaveCount(0);
  await page.getByRole('link', { name: 'Start with the question' }).click();
  await expect(page).toHaveURL(/\/molecule-to-machine\/lessons\/01\/$/);
  await expect(page.locator('.lesson-body')).toContainText('fourteen');
});

test('every lesson is a real static deep route with a plate, original body, model, and three checks', async ({ request }) => {
  for (let number = 1; number <= 34; number++) {
    const response = await request.get(route(number));
    expect(response.status(), `Lesson ${number}`).toBe(200);
    const html = await response.text();
    expect(html).toContain('Complete original lesson');
    expect(html).toContain('concept-plate');
    expect(html).toContain('data-lab');
    expect(html.match(/data-question/g)).toHaveLength(3);
    expect(html).not.toContain('katex-error');
  }
});

test('full-text search finds body concepts and follows an anchored result', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Search course', exact: true }).click();
  await page.getByLabel('Find a concept, method, or phrase').fill('covariance');
  await expect(page.locator('.search-results li').first()).toContainText('Grouped shots introduce covariance');
  await page.locator('.search-results a').first().click();
  await expect(page).toHaveURL(/\/lessons\/20\/#section-grouped-shots/);
  await page.reload();
  await expect(page.locator('#section-grouped-shots-introduce-covariance-the-current-result-omits')).toBeVisible();
  await page.keyboard.press('/');
  await page.locator('#course-search').fill('nothingwillmatchthisterm');
  await expect(page.locator('.search-status')).toContainText('No sections match');
  await page.keyboard.press('Escape');
  await expect(page.locator('.search-dialog')).not.toBeVisible();
});

test('search loading failure is explicit and retryable', async ({ page }) => {
  await page.route('**/search-index.json', route => route.abort());
  await open(page);
  await page.getByRole('button', { name: 'Search course', exact: true }).click();
  await expect(page.locator('.search-status')).toContainText('Search could not load');
  await page.keyboard.press('Escape');
  await page.unroute('**/search-index.json');
  await page.getByRole('button', { name: 'Search course', exact: true }).click();
  await page.locator('#course-search').fill('active space');
  await expect(page.locator('.search-results li').first()).toBeVisible();
});

test('saved lessons, read markers, and clear controls persist transparently', async ({ page }) => {
  await open(page, route(10));
  await page.getByRole('button', { name: 'Save lesson', exact: true }).click();
  await page.getByRole('button', { name: 'Mark lesson as read', exact: true }).first().click();
  await open(page, 'saved/');
  await page.reload();
  await expect(page.locator('[data-saved-lesson]:visible')).toContainText('Selecting the active space');
  await expect(page.locator('main [data-progress-count]')).toHaveText('1 of 34 read');
  await page.getByRole('button', { name: 'Clear learning data', exact: true }).click();
  await page.getByRole('button', { name: 'Keep my progress', exact: true }).click();
  await expect(page.locator('main [data-progress-count]')).toHaveText('1 of 34 read');
  await page.getByRole('button', { name: 'Clear learning data', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, clear learning data', exact: true }).click();
  await expect(page.locator('main [data-progress-count]')).toHaveText('0 of 34 read');
  await expect(page.locator('[data-no-saved]')).toBeVisible();
});

test('knowledge checks teach, retry, restore, and never mark reading complete', async ({ page }) => {
  await open(page, `${route(1)}#knowledge-check`);
  await page.getByRole('button', { name: 'Check answers', exact: true }).click();
  await expect(page.locator('.quiz-status')).toContainText('Answer every question');
  for (const [index, answer] of [1, 2, 0].entries()) await page.locator('[data-question]').nth(index).locator('input').nth(answer).check();
  await page.getByRole('button', { name: 'Check answers', exact: true }).click();
  await expect(page.locator('.quiz-status')).toContainText('3 of 3 correct');
  await expect(page.locator('[data-mark-read]').first()).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await expect(page.locator('.quiz-status')).toContainText('3 of 3 correct');
  await page.locator('[data-question]').first().locator('input').first().check();
  await page.getByRole('button', { name: 'Check answers', exact: true }).click();
  await expect(page.locator('.quiz-status')).toContainText('2 of 3 correct');
  await expect(page.locator('.answer-feedback').first()).toContainText('Revisit this');
  await page.getByRole('button', { name: 'Reset this check', exact: true }).click();
  await expect(page.locator('[data-question] input:checked')).toHaveCount(0);
  await expect(page.locator('.quiz-status')).toContainText('reset');
});

test('active-space count and impossible occupation errors are mathematically explicit', async ({ page }) => {
  await open(page, `${route(10)}#learning`);
  await page.getByLabel('Spatial orbitals', { exact: true }).fill('6');
  await page.getByLabel('Active electrons', { exact: true }).fill('6');
  await expect(page.locator('.lab-results')).toContainText('924');
  await expect(page.locator('.lab-results')).toContainText('400');
  await expect(page.locator('.lab-results')).toContainText('12');
  await page.getByLabel('N alpha minus N beta', { exact: true }).fill('1');
  await expect(page.locator('.lab-error')).toContainText('same parity');
  await expect(page.locator('.lab-results')).toBeEmpty();
  await page.getByLabel('N alpha minus N beta', { exact: true }).fill('0');
  await expect(page.locator('.lab-error')).not.toBeVisible();
});

test('all nine educational model types initialize as labeled illustrations', async ({ page }) => {
  for (const number of [1, 2, 3, 10, 13, 14, 20, 21, 28]) {
    await open(page, `${route(number)}#learning`);
    await expect(page.locator('.model-notice')).toContainText('Illustrative model, not a scientific calculation');
    await expect(page.locator('.result-list')).toBeVisible();
    await expect(page.locator('.lab-start')).toHaveCount(0);
    await expect(page.locator('.lab-error')).not.toBeVisible();
  }
});

test('the last section supports continue and fresh anchored reloads', async ({ page }) => {
  await open(page, route(2));
  const heading = page.locator('.lesson-body h2').nth(3);
  const id = await heading.getAttribute('id');
  await heading.evaluate(element => element.scrollIntoView({ block: 'start' }));
  await expect.poll(() => page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey) ?? '{}').lastPlace?.anchor, key)).toBe(id);
  await open(page, './');
  await expect(page.locator('[data-continue]')).toHaveAttribute('href', `/molecule-to-machine/lessons/02/#${id}`);
  await page.locator('[data-continue]').click();
  await page.reload();
  await expect(page).toHaveURL(new RegExp(`#${id}$`));
});

test('blocked browser storage does not block reading, models, or current-page progress', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
  });
  await open(page, route(10));
  await expect(page.locator('[data-storage-status]')).toContainText('storage is unavailable');
  await expect(page.locator('.lesson-body')).toContainText('active');
  await page.getByRole('button', { name: 'Save lesson', exact: true }).click();
  await expect(page.locator('[data-bookmark]')).toHaveText('Lesson saved');
  await expect(page.locator('.result-list')).toBeVisible();
});

test('damaged local records are reported and can be explicitly reset', async ({ page }) => {
  await page.addInitScript(storageKey => {
    if (!sessionStorage.getItem('injected-invalid-record')) {
      localStorage.setItem(storageKey, '{bad');
      sessionStorage.setItem('injected-invalid-record', 'yes');
    }
  }, key);
  await open(page, 'saved/');
  await expect(page.locator('main [data-storage-status]')).toContainText('could not be read');
  await page.getByRole('button', { name: 'Clear learning data', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, clear learning data', exact: true }).click();
  await expect(page.locator('main [data-storage-status]')).toContainText('Learning data cleared');
  await page.reload();
  await expect(page.locator('main [data-storage-status]')).toContainText('Saved only in this browser');
});

test('glossary filters real definitions and provides a useful empty state', async ({ page }) => {
  await open(page, 'glossary/');
  await page.getByLabel('Find a term or an idea').fill('covariance');
  await expect(page.locator('[data-term]:visible')).toHaveCount(1);
  await expect(page.locator('[data-term]:visible')).toContainText('shared shots');
  await page.getByLabel('Find a term or an idea').fill('unknowntermxyz');
  await expect(page.locator('[data-term-empty]')).toBeVisible();
});

test('responsive dialogs trap focus, close with Escape, and return focus', async ({ page, isMobile }) => {
  await open(page, route(21));
  if (isMobile) {
    const menu = page.getByRole('button', { name: 'Open curriculum', exact: true });
    await menu.click();
    await expect(page.locator('.curriculum-dialog')).toBeVisible();
    await page.keyboard.press('Tab');
    expect(await page.locator('.curriculum-dialog').evaluate(dialog => dialog.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
    await page.getByRole('button', { name: 'On this page', exact: true }).click();
    await expect(page.locator('.toc-dialog')).toBeVisible();
    await page.keyboard.press('Escape');
  } else {
    await expect(page.getByRole('button', { name: 'Open curriculum', exact: true })).not.toBeVisible();
  }
  await page.getByRole('button', { name: 'Search course', exact: true }).click();
  await expect(page.locator('#course-search')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Search course', exact: true })).toBeFocused();
});

test('long content and equations never overflow the page', async ({ page }) => {
  for (const number of [2, 12, 14, 20, 28, 34]) {
    await open(page, route(number));
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, page: document.documentElement.scrollWidth }));
    expect(dimensions.page, `Lesson ${number}`).toBeLessThanOrEqual(dimensions.viewport + 1);
    await expect(page.locator('.katex-error')).toHaveCount(0);
    if (number !== 34) expect(await page.locator('.katex').count()).toBeGreaterThan(0);
    const diagram = page.locator('.diagram');
    const overflow = await diagram.evaluate(svg => {
      const viewBox = (svg as SVGSVGElement).viewBox.baseVal;
      return [...svg.querySelectorAll('text')].some(text => {
        const box = text.getBBox();
        return box.x < -1 || box.y < -1 || box.x + box.width > viewBox.width + 1 || box.y + box.height > viewBox.height + 1;
      });
    });
    expect(overflow).toBe(false);
  }
});

test('the original lesson remains available without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${baseURL}${route(20)}`);
  expect((await page.locator('.lesson-body').innerText()).length).toBeGreaterThan(10000);
  expect(await page.locator('.katex').count()).toBeGreaterThan(10);
  await expect(page.locator('a[download]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await context.close();
});

test('dark and reduced-motion modes remain usable, and printing removes chrome', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await open(page, route(13));
  await page.getByLabel('Color theme').selectOption('dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.locator('.button').first().evaluate(element => parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThanOrEqual(.001);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.site-header')).not.toBeVisible();
  await expect(page.locator('.sidebar')).not.toBeVisible();
  await expect(page.locator('.lesson-body')).toBeVisible();
});

test('no critical or serious accessibility findings in reading and search', async ({ page }) => {
  await open(page, route(13));
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(scan.violations, JSON.stringify(scan.violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.map(node => node.target) })))).toEqual([]);
  await page.getByRole('button', { name: 'Search course', exact: true }).click();
  const dialog = await new AxeBuilder({ page }).include('.search-dialog').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(dialog.violations).toEqual([]);
});
