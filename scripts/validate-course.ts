import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { course, EXPECTED_LESSONS, wordCount } from '../src/lib/course';
import { renderMarkdown } from '../src/lib/markdown';
import { learning } from '../src/data/learning';
import { glossary } from '../src/data/glossary';
import { figuresForLesson, inlineFigures } from '../src/data/inline-figures';
import { interleaveFigures } from '../src/lib/inline-placement';

const release = process.argv.includes('--release');
const issues: string[] = [];
const hash = createHash('sha256').update(readFileSync(new URL('../src/content/course.json', import.meta.url))).digest('hex');
if (hash !== 'f46926672ecadbbc96a119b09024bf5804d0eaebe5851728f469652199e8b757') issues.push('The original course corpus changed. Supplemental visuals must not rewrite its bytes.');
if (release && course.lessons.length !== EXPECTED_LESSONS) issues.push(`Release requires ${EXPECTED_LESSONS} lessons, found ${course.lessons.length}.`);
let words = 0;
let sections = 0;
let equations = 0;
const labs = new Set<string>();
for (const [index, lesson] of course.lessons.entries()) {
  const label = `Lesson ${lesson.number}`;
  if (lesson.number !== index + 1) issues.push(`${label}: nonsequential numbering.`);
  const count = wordCount(lesson.body);
  words += count;
  if (lesson.body.length < 5000 || count < 800) issues.push(`${label}: insufficient full lesson content (${count} words).`);
  if (!new RegExp(`^# Lesson ${lesson.number}\\b`, 'u').test(lesson.body)) issues.push(`${label}: original lesson heading is missing.`);
  if (/\ufffd/u.test(lesson.body)) issues.push(`${label}: Unicode replacement character.`);
  if (/C:\\Users\\|session-state[/\\]|<cross_session_message>|<system_notification>/iu.test(lesson.body)) issues.push(`${label}: private environment metadata.`);
  if (/^\s*(?:TODO:\s*write|Lesson coming soon|Placeholder lesson)\b/imu.test(lesson.body)) issues.push(`${label}: placeholder text.`);
  const rendered = await renderMarkdown(lesson.body);
  sections += rendered.sections.length;
  equations += (rendered.html.match(/class="katex"/gu) ?? []).length;
  for (const error of rendered.mathErrors) issues.push(`${label}: ${error}`);
  if (rendered.sections.length < 3) issues.push(`${label}: insufficient section structure.`);
  if (/<script\b|<iframe\b|\son\w+=|href="javascript:/iu.test(rendered.html)) issues.push(`${label}: unsafe rendered content.`);
  if (rendered.html.includes('class="katex-error"')) issues.push(`${label}: failed equation rendering.`);
  const figures = figuresForLesson(lesson.number);
  if (!figures.length) issues.push(`${label}: no contextual figures.`);
  const chunks = interleaveFigures(rendered.blocks, figures);
  if (chunks.filter(chunk => chunk.kind === 'html').map(chunk => chunk.html).join('') !== rendered.html) {
    issues.push(`${label}: inline placement modified the original rendered blocks.`);
  }
  const extra = learning[lesson.number];
  if (!extra || extra.questions.length !== 3 || !extra.plate.caption || !extra.labContext) {
    issues.push(`${label}: missing three checks, concept plate, or model context.`);
    continue;
  }
  labs.add(extra.lab);
  for (const question of extra.questions) {
    if (question.choices.length < 3 || new Set(question.choices).size !== question.choices.length ||
        question.correct < 0 || question.correct >= question.choices.length || question.explanation.length < 50) {
      issues.push(`${label}: invalid or incomplete knowledge check.`);
    }
  }
}
if (release && labs.size < 8) issues.push(`Only ${labs.size} distinct interactive model types.`);
for (const term of glossary) {
  if (!term.definition || !term.context || !term.lessons.length || term.lessons.some(number => number < 1 || number > EXPECTED_LESSONS)) {
    issues.push(`Glossary: invalid term ${term.term}.`);
  }
}
if (issues.length) {
  console.error(issues.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`${release ? 'Release' : 'Content'} validation passed: ${course.lessons.length} complete lessons, ${words.toLocaleString()} words, ${sections} sections, ${equations} rendered equations, ${course.lessons.length * 3} checks, ${labs.size} model types, ${glossary.length} glossary terms, ${inlineFigures.length} contextual figures at verified block anchors.\nCorpus SHA256: ${hash}`);
}
