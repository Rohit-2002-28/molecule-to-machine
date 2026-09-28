export interface SearchDocument { number: number; lesson: string; title: string; text: string; href: string }
export interface SearchResult extends SearchDocument { excerpt: string; score: number }
const normalize = (text: string) => text.normalize('NFKC').toLocaleLowerCase();

export function searchCourse(documents: SearchDocument[], query: string, limit = 20): SearchResult[] {
  const terms = normalize(query).trim().split(/\s+/u).filter(Boolean);
  if (!terms.length) return [];
  return documents.flatMap(document => {
    const title = normalize(document.title);
    const lesson = normalize(document.lesson);
    const text = normalize(document.text);
    if (!terms.every(term => `${title} ${lesson} ${text}`.includes(term))) return [];
    const score = terms.reduce((sum, term) =>
      sum + (title.includes(term) ? 10 : 0) + (lesson.includes(term) ? 4 : 0) + (text.includes(term) ? 1 : 0), 0);
    const first = Math.min(...terms.map(term => text.indexOf(term)).filter(index => index >= 0));
    let start = Number.isFinite(first) ? Math.max(0, first - 65) : 0;
    if (Number.isFinite(first) && document.text.slice(start, first).includes('\\')) start = first;
    const excerpt = `${start ? '...' : ''}${document.text.slice(start, start + 200).replace(/\s+/gu, ' ')}${document.text.length > start + 200 ? '...' : ''}`;
    return [{ ...document, score, excerpt }];
  }).sort((a, b) => b.score - a.score || a.number - b.number).slice(0, limit);
}
