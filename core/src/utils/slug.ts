/**
 * A field's slug is the name card templates use to reference it, e.g.
 * `{{front}}`. It is kept separate from the field's display name so names can
 * be rich — spaces, punctuation, capitals — without breaking the Handlebars
 * reference, and so renaming a field does not silently break its templates.
 */

/** Characters Handlebars can reference bare, i.e. without `{{[...]}}`. */
const SAFE = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const isValidSlug = (slug: string) => SAFE.test(slug);

/**
 * Derive a template-safe slug from a display name. Used to prefill the slug
 * when a field is created; the user can then choose something friendlier.
 */
export const slugify = (name: string) => {
  const base = name
    .normalize("NFKD")
    // strip accents so "Ação" becomes "acao" rather than losing the letters
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (base === "") return "field";
  // Handlebars references cannot start with a digit.
  return /^[0-9]/.test(base) ? `field_${base}` : base;
};

/** Append a numeric suffix until the slug is not in `taken`. */
export const uniqueSlug = (slug: string, taken: Iterable<string>) => {
  const used = new Set(taken);
  if (!used.has(slug)) return slug;
  let n = 2;
  while (used.has(`${slug}_${n}`)) n++;
  return `${slug}_${n}`;
};
