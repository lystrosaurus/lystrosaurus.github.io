/**
 * Deterministic color assignment for knowledge categories and tags.
 *
 * A stable palette is indexed by a hash of the input name, so the same
 * category always renders with the same color across reloads and pages.
 * Colors are returned as raw hex strings so they can be applied via inline
 * `style` (Tailwind 4 does not generate dynamic color utilities at runtime).
 */

/** Curated neon-friendly palette that matches the site's dark tech theme. */
const PALETTE: readonly string[] = [
  '#00fff2',
  '#a855f7',
  '#ec4899',
  '#f59e0b',
  '#34d399',
  '#60a5fa',
  '#f472b6',
  '#a3e635',
];

/**
 * Compute a stable, non-negative 32-bit hash for a string (djb2 variant).
 *
 * @param s - the input string
 * @returns a non-negative integer hash
 */
export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Map a category or tag name to a stable palette color (hex string).
 *
 * @param name - the category/tag name
 * @returns a hex color string, e.g. `"#00fff2"`
 */
export function categoryColor(name: string): string {
  return PALETTE[hashString(name) % PALETTE.length];
}
