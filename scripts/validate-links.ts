import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { BASE, course, lessonUrl } from '../src/lib/course';

const root = resolve('dist');
const origin = 'https://rohit-2002-28.github.io';
const failures = new Set<string>();
const cache = new Map<string, string>();
let links = 0;
function htmlFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(path) : entry.name.endsWith('.html') ? [path] : [];
  });
}
function content(path: string): string {
  const cached = cache.get(path);
  if (cached !== undefined) return cached;
  const text = readFileSync(path, 'utf8'); cache.set(path, text); return text;
}
function routeFor(path: string): string {
  const relativePath = relative(root, path).split(sep).join('/');
  return `${BASE}${relativePath.replace(/index\.html$/u, '')}`;
}
function localFile(pathname: string): string | null {
  if (!pathname.startsWith(BASE)) return null;
  const relativePath = decodeURIComponent(pathname.slice(BASE.length));
  const path = resolve(root, ...relativePath.split('/'));
  if (path !== root && !path.startsWith(root + sep)) return null;
  return pathname.endsWith('/') ? join(path, 'index.html') : path;
}

if (!existsSync(root)) throw new Error('Build the site before validating links.');
for (const file of htmlFiles(root)) {
  const html = content(file);
  const route = routeFor(file);
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/gu)) {
    const href = match[1]?.replace(/&amp;/gu, '&');
    if (!href || href === '#' || href.startsWith('data:') || href.startsWith('mailto:')) continue;
    const target = new URL(href, origin + route);
    if (target.origin !== origin) continue;
    links++;
    const targetFile = localFile(target.pathname);
    if (!targetFile || !existsSync(targetFile)) {
      failures.add(`${route}: missing local destination ${target.pathname}`);
      continue;
    }
    if (target.hash && targetFile.endsWith('.html')) {
      const id = decodeURIComponent(target.hash.slice(1));
      const escapedId = id.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
      if (!new RegExp(`\\bid="${escapedId}"`, 'u').test(content(targetFile))) failures.add(`${route}: missing anchor ${target.pathname}${target.hash}`);
    }
  }
}
for (const lesson of course.lessons) {
  const route = lessonUrl(lesson.number);
  const htmlPath = localFile(route);
  const sourcePath = localFile(`${route}source.md`);
  if (!htmlPath || !existsSync(htmlPath)) failures.add(`Missing static fresh-load route: ${route}`);
  if (!sourcePath || !existsSync(sourcePath) || content(sourcePath) !== lesson.body) {
    failures.add(`Lesson ${lesson.number}: downloadable original body differs from the supplied course.`);
  }
  if (htmlPath && existsSync(htmlPath)) {
    const html = content(htmlPath);
    for (const required of ['data-quiz', 'data-lab', 'concept-plate', 'Complete original lesson', 'THESIS:']) {
      if (!html.includes(required)) failures.add(`Lesson ${lesson.number}: missing ${required}.`);
    }
  }
}
if (failures.size) {
  console.error([...failures].join('\n')); process.exitCode = 1;
} else console.log(`Verified ${links.toLocaleString()} local links/assets/anchors and ${course.lessons.length} fresh lesson routes with exact original Markdown downloads.`);
