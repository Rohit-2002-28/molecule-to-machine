import type { APIRoute } from 'astro';
import { course } from '../../../lib/course';

export function getStaticPaths() {
  return course.lessons.map(lesson => ({
    params: { number: String(lesson.number).padStart(2, '0') },
    props: { body: lesson.body },
  }));
}
export const GET: APIRoute = ({ props }) => new Response(props.body, {
  headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
});
