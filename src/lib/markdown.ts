/**
 * Маленький безопасный markdown: абзацы, переносы строк, **жирный**, *курсив* и [ссылки](https://…).
 * Всё остальное экранируется — HTML из данных в страницу не попадает.
 */
const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

function inline(text: string): string {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

export function renderMarkdown(md: string): string {
  return md
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p>${inline(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
}
