import slugify from 'slugify';

export function createSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'es',
    remove: /[*+~.()'"!:@]/g,
  });
}

export function createUniqueSlug(text: string, existingSlugs: string[]): string {
  let slug = createSlug(text);
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${createSlug(text)}-${counter}`;
    counter++;
  }

  return slug;
}
