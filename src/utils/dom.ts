/**
 * Shared DOM / string utilities for client-side scripts.
 *
 * These helpers are intentionally framework-agnostic and side-effect free so
 * they can be imported both from Astro frontmatter (server) and from bundled
 * client `<script>` modules.
 */

/**
 * Escape the five special HTML characters so that user-controlled text can be
 * safely injected into `innerHTML` without enabling XSS.
 *
 * @param s - the raw string to escape
 * @returns the escaped string
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
