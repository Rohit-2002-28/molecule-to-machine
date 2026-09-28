export const PROGRESS_KEY = 'molecule-to-machine:learning:v1';
export const THEME_KEY = 'molecule-to-machine:theme';

export interface QuizAttempt { answers: number[]; submitted: boolean }
export interface Progress {
  version: 1;
  completed: number[];
  bookmarks: number[];
  lastPlace: { lesson: number; anchor: string } | null;
  quizzes: Record<string, QuizAttempt>;
}
export interface StorageAccess { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export interface StorageResult { state: Progress; persistent: boolean; message: string }

export const emptyProgress = (): Progress => ({
  version: 1, completed: [], bookmarks: [], lastPlace: null, quizzes: {},
});
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function lessonNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 34;
}
function lessonList(value: unknown): value is number[] {
  return Array.isArray(value) && value.every(lessonNumber) && new Set(value).size === value.length;
}

export function parseProgress(value: unknown): Progress {
  if (!record(value) || value.version !== 1 || !lessonList(value.completed) || !lessonList(value.bookmarks) ||
      !record(value.quizzes)) throw new Error('Saved progress has an unsupported or damaged format.');
  const quizzes: Record<string, QuizAttempt> = {};
  for (const [key, attempt] of Object.entries(value.quizzes)) {
    if (!/^(?:[1-9]|[12]\d|3[0-4])$/u.test(key) || !record(attempt) ||
        !Array.isArray(attempt.answers) || attempt.answers.length > 10 ||
        !attempt.answers.every((answer: unknown) => typeof answer === 'number' && Number.isInteger(answer) && answer >= -1 && answer <= 5) ||
        typeof attempt.submitted !== 'boolean') throw new Error('A saved knowledge check has an invalid format.');
    quizzes[key] = { answers: attempt.answers, submitted: attempt.submitted };
  }
  let lastPlace: Progress['lastPlace'] = null;
  if (value.lastPlace !== null) {
    if (!record(value.lastPlace) || !lessonNumber(value.lastPlace.lesson) ||
        typeof value.lastPlace.anchor !== 'string' ||
        !/^(?:section-[\p{L}\p{N}-]+|learning|knowledge-check|sources|)$/u.test(value.lastPlace.anchor)) {
      throw new Error('The saved reading place has an invalid format.');
    }
    lastPlace = { lesson: value.lastPlace.lesson, anchor: value.lastPlace.anchor };
  }
  return { version: 1, completed: value.completed, bookmarks: value.bookmarks, lastPlace, quizzes };
}

export function loadProgress(storage: StorageAccess | null): StorageResult {
  if (!storage) return { state: emptyProgress(), persistent: false, message: 'Browser storage is unavailable. Changes last only on this page; lessons remain fully accessible.' };
  try {
    const saved = storage.getItem(PROGRESS_KEY);
    return { state: saved ? parseProgress(JSON.parse(saved)) : emptyProgress(), persistent: true, message: 'Saved only in this browser. No account or tracking.' };
  } catch (error) {
    console.warn('Unable to read course progress:', error);
    return { state: emptyProgress(), persistent: false, message: 'Saved progress could not be read. Changes are temporary; use Clear learning data to reset it.' };
  }
}

export function saveProgress(storage: StorageAccess | null, state: Progress): { persistent: boolean; message: string } {
  try {
    if (!storage) throw new Error('Browser storage is unavailable.');
    storage.setItem(PROGRESS_KEY, JSON.stringify(state));
    return { persistent: true, message: 'Saved only in this browser. No account or tracking.' };
  } catch (error) {
    console.warn('Unable to save course progress:', error);
    return { persistent: false, message: 'This browser could not save your changes. They last only on this page; the course is still available.' };
  }
}

export function toggleLesson(list: number[], number: number): number[] {
  if (!lessonNumber(number)) throw new RangeError('Invalid lesson number.');
  return list.includes(number) ? list.filter(item => item !== number) : [...list, number].sort((a, b) => a - b);
}

export function gradeAnswers(answers: number[], correct: number[]): { score: number; total: number; complete: boolean } {
  if (!correct.length || answers.length !== correct.length ||
      !correct.every(answer => Number.isInteger(answer) && answer >= 0) ||
      !answers.every(answer => Number.isInteger(answer) && answer >= -1)) throw new RangeError('Invalid answer set.');
  return { score: answers.filter((answer, index) => answer === correct[index]).length, total: correct.length, complete: answers.every(answer => answer >= 0) };
}
