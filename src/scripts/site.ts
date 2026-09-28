import { emptyProgress, gradeAnswers, loadProgress, PROGRESS_KEY, saveProgress, THEME_KEY, toggleLesson, type Progress, type StorageAccess } from '../lib/progress';
import { searchCourse, type SearchDocument } from '../lib/search';

const base = document.body.dataset.base ?? '/molecule-to-machine/';
const total = Number(document.body.dataset.lessonCount);
const currentLesson = Number(document.body.dataset.currentLesson);
const chapterUrl = (number: number) => `${base}lessons/${String(number).padStart(2, '0')}/`;
let storage: StorageAccess | null = null;
try { storage = window.localStorage; } catch (error) { console.warn('Browser storage is blocked:', error); }
const loaded = loadProgress(storage);
let state: Progress = loaded.state;
let storageMessage = loaded.message;
let persistent = loaded.persistent;
let allowSave = loaded.persistent;

function displayStorage(): void {
  for (const element of document.querySelectorAll<HTMLElement>('[data-storage-status]')) {
    element.textContent = storageMessage;
    element.classList.toggle('storage-warning', !persistent);
  }
  const warning = document.querySelector<HTMLElement>('.storage-toast');
  if (warning) {
    warning.hidden = persistent;
    warning.textContent = storageMessage;
  }
}
function save(): void {
  if (allowSave) {
    const result = saveProgress(storage, state);
    persistent = result.persistent;
    storageMessage = result.message;
  }
  displayStorage();
  updateProgress();
}
function updateProgress(): void {
  const available = new Set([...document.querySelectorAll<HTMLElement>('[data-lesson-link]')].map(link => Number(link.dataset.lessonLink)));
  const completed = state.completed.filter(number => available.has(number));
  for (const label of document.querySelectorAll('[data-progress-count]')) label.textContent = `${completed.length} of ${total} read`;
  for (const progress of document.querySelectorAll<HTMLProgressElement>('[data-course-progress]')) progress.value = completed.length;
  for (const link of document.querySelectorAll<HTMLElement>('[data-lesson-link]')) {
    const done = completed.includes(Number(link.dataset.lessonLink));
    link.classList.toggle('is-read', done);
    const mark = link.querySelector<HTMLElement>('.lesson-state');
    if (mark) mark.hidden = !done;
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-mark-read]')) {
    const done = state.completed.includes(currentLesson);
    button.textContent = done ? 'Marked as read' : 'Mark lesson as read';
    button.setAttribute('aria-pressed', String(done));
    button.disabled = false;
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-bookmark]')) {
    const saved = state.bookmarks.includes(currentLesson);
    button.textContent = saved ? 'Lesson saved' : 'Save lesson';
    button.setAttribute('aria-pressed', String(saved));
    button.disabled = false;
  }
  const place = state.lastPlace;
  for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-continue]')) {
    if (place && available.has(place.lesson)) {
      link.href = `${chapterUrl(place.lesson)}${place.anchor ? `#${encodeURIComponent(place.anchor)}` : ''}`;
      link.textContent = `Continue lesson ${place.lesson}`;
      link.hidden = false;
    }
  }
  for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-resume-here]')) {
    if (place?.lesson === currentLesson && place.anchor && document.getElementById(place.anchor)) {
      link.href = `#${encodeURIComponent(place.anchor)}`;
      link.hidden = false;
    }
  }
  const savedList = document.querySelector<HTMLElement>('[data-saved-list]');
  if (savedList) {
    let shown = 0;
    for (const item of savedList.querySelectorAll<HTMLElement>('[data-saved-lesson]')) {
      item.hidden = !state.bookmarks.includes(Number(item.dataset.savedLesson));
      if (!item.hidden) shown++;
    }
    const empty = document.querySelector<HTMLElement>('[data-no-saved]');
    if (empty) empty.hidden = shown > 0;
  }
  const attempts = Object.values(state.quizzes).filter(attempt => attempt.submitted).length;
  const checkCount = document.querySelector('[data-check-count]');
  if (checkCount) checkCount.textContent = `${attempts} knowledge ${attempts === 1 ? 'check' : 'checks'} submitted. Separate from reading completion.`;
}
updateProgress();
displayStorage();
for (const button of document.querySelectorAll('[data-mark-read]')) button.addEventListener('click', () => { state.completed = toggleLesson(state.completed, currentLesson); save(); });
for (const button of document.querySelectorAll('[data-bookmark]')) button.addEventListener('click', () => { state.bookmarks = toggleLesson(state.bookmarks, currentLesson); save(); });

const themeControl = document.querySelector<HTMLSelectElement>('[data-theme-control]');
if (themeControl) {
  themeControl.value = document.documentElement.dataset.theme ?? 'system';
  themeControl.addEventListener('change', () => {
    const theme = themeControl.value;
    if (theme === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
    try {
      if (!storage) throw new Error('Theme storage unavailable.');
      if (theme === 'system') storage.removeItem(THEME_KEY); else storage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.warn('Theme could not be saved:', error);
      persistent = false;
      storageMessage = 'Your theme is applied to this page, but browser storage could not save it.';
      displayStorage();
    }
  });
}

function openDialog(dialog: HTMLDialogElement | null, focus?: HTMLElement | null): void {
  if (!dialog) return;
  dialog.showModal();
  document.documentElement.classList.add('dialog-open');
  focus?.focus();
}
for (const dialog of document.querySelectorAll<HTMLDialogElement>('dialog')) {
  dialog.addEventListener('close', () => document.documentElement.classList.remove('dialog-open'));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      dialog.close();
    }
  }, { capture: true });
  dialog.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }
  });
  for (const link of dialog.querySelectorAll('a')) link.addEventListener('click', () => dialog.close());
}
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-open-curriculum]')) {
  button.disabled = false;
  button.addEventListener('click', () => openDialog(document.querySelector('.curriculum-dialog')));
}
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-open-toc]')) {
  button.disabled = false;
  button.addEventListener('click', () => openDialog(document.querySelector('.toc-dialog')));
}

const searchDialog = document.querySelector<HTMLDialogElement>('.search-dialog');
const searchInput = document.querySelector<HTMLInputElement>('#course-search');
const searchStatus = document.querySelector<HTMLElement>('.search-status');
const searchResults = document.querySelector<HTMLOListElement>('.search-results');
let documents: SearchDocument[] | null = null;
let loading: Promise<void> | null = null;
function showSearchResults(): void {
  if (!searchResults || !searchStatus || !searchInput || !documents) return;
  searchResults.replaceChildren();
  const query = searchInput.value.trim();
  if (!query) { searchStatus.textContent = 'Search titles and every section of the complete lesson text.'; return; }
  const results = searchCourse(documents, query);
  searchStatus.textContent = results.length
    ? `${results.length}${results.length === 20 ? ' best' : ''} matching sections.`
    : `No sections match "${query}". Try fewer words, a full method name, or a term such as "orbitals".`;
  for (const result of results) {
    const item = document.createElement('li');
    const link = document.createElement('a'); link.href = result.href;
    const meta = document.createElement('span'); meta.className = 'result-meta'; meta.textContent = `Lesson ${result.number} / ${result.lesson}`;
    const heading = document.createElement('strong'); heading.textContent = result.title;
    const excerpt = document.createElement('p'); excerpt.textContent = result.excerpt;
    link.append(meta, heading, excerpt); item.append(link); searchResults.append(item);
  }
}
async function loadSearch(): Promise<void> {
  if (!searchStatus) return;
  if (documents) { showSearchResults(); return; }
  if (loading) return loading;
  searchStatus.textContent = 'Loading the course text index...';
  loading = (async () => {
    try {
      const response = await fetch(`${base}search-index.json`);
      if (!response.ok) throw new Error(`Search index returned HTTP ${response.status}.`);
      const value: unknown = await response.json();
      if (!Array.isArray(value) || !value.every((item: unknown): item is SearchDocument =>
        typeof item === 'object' && item !== null && 'number' in item && typeof item.number === 'number' &&
        'lesson' in item && typeof item.lesson === 'string' && 'title' in item && typeof item.title === 'string' &&
        'text' in item && typeof item.text === 'string' && 'href' in item && typeof item.href === 'string' && item.href.startsWith(base))) {
        throw new Error('The course search index has an invalid format.');
      }
      documents = value;
      showSearchResults();
    } catch (error) {
      console.error('Course search failed:', error);
      searchStatus.textContent = 'Search could not load. Check your connection, then close and reopen search to retry. The curriculum links still work.';
    } finally { loading = null; }
  })();
  return loading;
}
function openSearch(): void { openDialog(searchDialog, searchInput); void loadSearch(); }
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-open-search]')) {
  button.disabled = false; button.addEventListener('click', openSearch);
}
let searchTimer: ReturnType<typeof setTimeout>;
searchInput?.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(showSearchResults, 100); });
document.addEventListener('keydown', event => {
  const target = event.target;
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey &&
      !(target instanceof HTMLElement && (target.matches('input, textarea, select') || target.isContentEditable)) &&
      !document.querySelector('dialog[open]')) {
    event.preventDefault(); openSearch();
  }
});

for (const quiz of document.querySelectorAll<HTMLElement>('[data-quiz]')) {
  const form = quiz.querySelector('form');
  const status = quiz.querySelector<HTMLElement>('.quiz-status');
  const fields = [...quiz.querySelectorAll<HTMLFieldSetElement>('[data-question]')];
  const key = quiz.dataset.lesson;
  if (!form || !status || !key) continue;
  form.noValidate = true;
  const correct = fields.map(field => Number(field.dataset.correct));
  const saved = state.quizzes[key];
  function answers(): number[] {
    return fields.map(field => {
      const selected = field.querySelector<HTMLInputElement>('input:checked');
      return selected ? Number(selected.value) : -1;
    });
  }
  function feedback(show: boolean): void {
    const selected = answers();
    fields.forEach((field, index) => {
      const text = field.querySelector<HTMLElement>('.answer-feedback');
      if (!text) return;
      text.hidden = !show;
      const isCorrect = selected[index] === correct[index];
      field.classList.toggle('answer-correct', show && isCorrect);
      field.classList.toggle('answer-revisit', show && !isCorrect);
      const chosen = field.querySelectorAll<HTMLElement>('.answer-option span')[correct[index] ?? -1]?.textContent ?? '';
      text.textContent = `${isCorrect ? 'Correct.' : `Revisit this. The best answer: ${chosen}`} ${text.dataset.explanation ?? ''}`;
    });
  }
  function showScore(): void {
    const result = gradeAnswers(answers(), correct);
    status!.textContent = `${result.score} of ${result.total} correct. ${result.score === result.total ? 'All key ideas checked.' : 'Read the explanations and try again.'} Reading progress is unchanged.`;
    feedback(true);
  }
  if (saved && saved.answers.length === fields.length && saved.answers.every((answer, index) =>
    answer < (fields[index]?.querySelectorAll('input').length ?? 0))) {
    saved.answers.forEach((answer, index) => {
      const input = fields[index]?.querySelector<HTMLInputElement>(`input[value="${answer}"]`);
      if (input) input.checked = true;
    });
    if (saved.submitted) showScore(); else status.textContent = 'Your unfinished answers were restored.';
  } else if (saved) {
    delete state.quizzes[key];
    status.textContent = 'This check changed since your saved attempt. Please answer the current questions.';
    save();
  } else status.textContent = 'Choose one answer for each question, then check your reasoning.';
  for (const button of form.querySelectorAll<HTMLButtonElement>('button')) button.disabled = false;
  form.addEventListener('change', () => {
    state.quizzes[key] = { answers: answers(), submitted: false };
    feedback(false);
    status.textContent = 'Answers changed. Check them when you are ready.';
    save();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const selected = answers();
    const firstMissing = selected.indexOf(-1);
    if (firstMissing !== -1) {
      status.textContent = 'Answer every question before checking.';
      fields[firstMissing]?.querySelector<HTMLInputElement>('input')?.focus();
      return;
    }
    state.quizzes[key] = { answers: selected, submitted: true };
    showScore(); save();
  });
  form.addEventListener('reset', () => {
    delete state.quizzes[key]; feedback(false);
    status.textContent = 'This check has been reset. Reading progress is unchanged.'; save();
  });
}

const clearButton = document.querySelector<HTMLButtonElement>('[data-clear-progress]');
const clearConfirm = document.querySelector<HTMLElement>('[data-clear-confirm]');
if (clearButton && clearConfirm) {
  clearButton.disabled = false;
  clearButton.addEventListener('click', () => { clearConfirm.hidden = false; clearConfirm.querySelector<HTMLElement>('button')?.focus(); });
  document.querySelector('[data-cancel-clear]')?.addEventListener('click', () => { clearConfirm.hidden = true; clearButton.focus(); });
  document.querySelector('[data-confirm-clear]')?.addEventListener('click', () => {
    try {
      if (!storage) throw new Error('Browser storage is unavailable.');
      storage.removeItem(PROGRESS_KEY);
      storage.setItem(PROGRESS_KEY, JSON.stringify(emptyProgress()));
      state = emptyProgress(); persistent = true; allowSave = true;
      storageMessage = 'Learning data cleared. New progress will be saved only in this browser.';
      clearConfirm.hidden = true; updateProgress(); displayStorage(); clearButton.focus();
    } catch (error) {
      console.warn('Could not clear stored learning data:', error);
      state = emptyProgress(); persistent = false; allowSave = false;
      storageMessage = 'Temporary progress was cleared, but this page cannot access stored browser data. Clear this site’s data in your browser settings to remove any older saved copy.';
      clearConfirm.hidden = true; updateProgress(); displayStorage();
    }
  });
}

if (currentLesson >= 1 && currentLesson <= 34) {
  const original = document.querySelector<HTMLElement>('.lesson-body');
  const meter = document.querySelector<HTMLProgressElement>('[data-reading-meter]');
  let lastSave = 0;
  function trackReading(): void {
    if (!original) return;
    const top = original.getBoundingClientRect().top + window.scrollY;
    const length = Math.max(1, original.scrollHeight - window.innerHeight);
    if (meter) meter.value = Math.max(0, Math.min(100, (window.scrollY - top + 100) / length * 100));
    if (Date.now() - lastSave < 1500) return;
    const headings = [...original.querySelectorAll<HTMLElement>('h2[id], h3[id]')];
    const reached = headings.filter(heading => heading.getBoundingClientRect().top <= 160);
    const anchor = reached.at(-1)?.id ?? '';
    if (state.lastPlace?.lesson !== currentLesson || state.lastPlace.anchor !== anchor) {
      state.lastPlace = { lesson: currentLesson, anchor }; save();
    }
    for (const link of document.querySelectorAll<HTMLAnchorElement>('.section-toc a')) {
      if (link.hash === `#${anchor}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    }
    lastSave = Date.now();
  }
  window.addEventListener('scroll', trackReading, { passive: true });
  window.addEventListener('pagehide', () => { lastSave = 0; trackReading(); });
  if (!state.lastPlace || state.lastPlace.lesson !== currentLesson) {
    state.lastPlace = { lesson: currentLesson, anchor: '' }; save();
  }
}

document.querySelector('[data-print]')?.addEventListener('click', () => window.print());
window.addEventListener('storage', event => {
  if (event.key !== PROGRESS_KEY) return;
  const next = loadProgress(storage);
  state = next.state; persistent = next.persistent; allowSave = next.persistent; storageMessage = next.message;
  updateProgress(); displayStorage();
});
