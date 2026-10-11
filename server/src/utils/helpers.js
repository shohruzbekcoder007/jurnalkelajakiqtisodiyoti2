import slugify from 'slugify';

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function makeSlug(text) {
  return slugify(String(text || ''), { lower: true, strict: true, locale: 'uz' });
}

export async function uniqueSlug(Model, text, excludeId = null) {
  const base = makeSlug(text) || 'item';
  let slug = base;
  let i = 2;
  /* eslint-disable no-await-in-loop */
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const found = await Model.findOne(query).lean();
    if (!found) return slug;
    slug = `${base}-${i}`;
    i += 1;
  }
}

// Strip HTML and build an excerpt the way WordPress does (55 words + "...")
export function buildExcerpt(html, words = 30) {
  const text = String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const parts = text.split(' ');
  if (parts.length <= words) return text;
  return `${parts.slice(0, words).join(' ')}...`;
}

export function parsePaging(query, defaultPerPage = 12) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(query.per_page, 10) || defaultPerPage));
  return { page, perPage, skip: (page - 1) * perPage };
}
