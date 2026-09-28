import type { APIRoute } from 'astro';
import { course, lessonUrl } from '../lib/course';
import { renderMarkdown } from '../lib/markdown';
import type { SearchDocument } from '../lib/search';

export const GET: APIRoute = async () => {
  const documents: SearchDocument[] = [];
  for (const lesson of course.lessons) {
    const rendered = await renderMarkdown(lesson.body);
    documents.push({ number: lesson.number, lesson: lesson.title, title: lesson.title, text: rendered.plainText.slice(0, 1600), href: lessonUrl(lesson.number) });
    for (const section of rendered.sections) {
      documents.push({ number: lesson.number, lesson: lesson.title, title: section.title, text: section.text, href: `${lessonUrl(lesson.number)}#${section.id}` });
    }
  }
  return new Response(JSON.stringify(documents), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
