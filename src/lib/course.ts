import sourceCourse from '../content/course.json' with { type: 'json' };

export const EXPECTED_LESSONS = 34;
export const SOURCE_REVISION = '97a3ff4fb86ebd5a2516e3548cece69127fd3555';
export const BASE = '/molecule-to-machine/';

export interface Lesson {
  number: number;
  title: string;
  body: string;
  sources: string[];
  caveats: string;
}

export interface Course {
  title: string;
  sourceRepository: string;
  sourceRevision: string;
  lessons: Lesson[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSource(value: unknown): value is string {
  if (typeof value !== 'string' || !value.length) return false;
  if (value.startsWith('https://')) {
    try {
      const url = new URL(value);
      return !url.username && !url.password;
    } catch { return false; }
  }
  return !value.startsWith('/') && !value.includes('..') && !value.includes('\\') && !value.includes(':');
}

export function parseCourse(value: unknown): Course {
  if (!isRecord(value) || typeof value.title !== 'string' ||
      value.sourceRepository !== 'microsoft/qdk-chemistry' || value.sourceRevision !== SOURCE_REVISION ||
      !Array.isArray(value.lessons)) {
    throw new Error('Course metadata is missing or does not identify the pinned public source.');
  }
  const lessons: Lesson[] = value.lessons.map((item: unknown) => {
    if (!isRecord(item) || typeof item.number !== 'number' || !Number.isInteger(item.number) ||
        item.number < 1 || item.number > EXPECTED_LESSONS ||
        typeof item.title !== 'string' || !item.title.trim() ||
        typeof item.body !== 'string' || !item.body.trim() ||
        typeof item.caveats !== 'string' || !item.caveats.trim() ||
        !Array.isArray(item.sources) || !item.sources.length ||
        !item.sources.every(isSource)) {
      throw new Error(`Lesson ${isRecord(item) ? String(item.number) : '(invalid record)'} needs a valid number, title, complete body, safe source references, and caveats.`);
    }
    return {
      number: item.number, title: item.title, body: item.body,
      caveats: item.caveats, sources: item.sources,
    };
  }).sort((a, b) => a.number - b.number);
  if (new Set(lessons.map(lesson => lesson.number)).size !== lessons.length) {
    throw new Error('Lesson numbers must be unique.');
  }
  return { title: value.title, sourceRepository: value.sourceRepository, sourceRevision: value.sourceRevision, lessons };
}

export const course = parseCourse(sourceCourse);
export const lessonUrl = (number: number) => `${BASE}lessons/${String(number).padStart(2, '0')}/`;
export function sourceUrl(path: string): string {
  if (path.startsWith('https://')) return path;
  const isFile = /\.[a-z0-9]+$/iu.test(path) || /(?:^|\/)(?:LICENSE|NOTICE|Dockerfile|Makefile)$/u.test(path);
  return `https://github.com/${course.sourceRepository}/${isFile ? 'blob' : 'tree'}/${course.sourceRevision}/${path.split('/').map(encodeURIComponent).join('/')}`;
}
export const wordCount = (body: string) => body.trim().split(/\s+/u).length;
export const readingMinutes = (body: string) => Math.ceil(wordCount(body) / 180);

export const domains = [
  { id: 'foundations', title: 'The scientific question', range: [1, 3], description: 'Define the problem, learn the language, and follow the software contracts.' },
  { id: 'classical', title: 'Preparing the chemistry', range: [4, 12], description: 'Build, test, and reduce a defensible electronic-structure model.' },
  { id: 'representation', title: 'From electrons to circuits', range: [13, 17], description: 'Carry states, symmetries, and operators into the quantum register.' },
  { id: 'algorithms', title: 'Algorithms & execution', range: [18, 25], description: 'Evolve, measure, estimate phases, and choose an execution route.' },
  { id: 'resources', title: 'Evidence & resources', range: [26, 29], description: 'Separate scientific accuracy, logical work, and physical-machine assumptions.' },
  { id: 'engineering', title: 'The complete workflow', range: [30, 34], description: 'Preserve provenance, move work, and review the whole engineering system.' },
] as const;

export function domainFor(number: number) {
  const domain = domains.find(item => number >= item.range[0] && number <= item.range[1]);
  if (!domain) throw new RangeError(`No course domain for lesson ${number}.`);
  return domain;
}
