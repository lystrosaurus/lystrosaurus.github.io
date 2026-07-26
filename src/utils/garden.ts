/**
 * Garden-specific pure helpers for the 知识花园 / 书库 subsystem.
 *
 * Deliberately decoupled from `src/data/books.ts` (no runtime import of the
 * data layer) so the Agent runner and client scripts can reuse these helpers
 * without creating a circular dependency. The 8 category warm colours are
 * fixed by product decision and mirrored here as the canonical render source;
 * `books.ts` carries the same `accent` values on each `Category`.
 *
 * Dynamic colours are always returned as raw hex strings so callers can apply
 * them via inline `style="color:#xxx"` (Tailwind 4 does not generate dynamic
 * colour utilities at runtime).
 */

import { escapeHtml } from './dom';
import type { Book, CategoryId, KPLevel } from '../data/books.types';

/** Fixed warm accent per category (independent of `book.accent`). */
export const CATEGORY_ACCENTS: Record<CategoryId, string> = {
  thinking: '#c9954a',
  habits: '#d9a05b',
  wealth: '#b8863f',
  psychology: '#c98a5a',
  comm: '#d4b483',
  ai: '#a98b5a',
  classic: '#cf9b6a',
  bio: '#b9935a',
};

/** Return the fixed warm colour for a category id (falls back to gold). */
export function getCategoryColor(id: CategoryId | string): string {
  return (CATEGORY_ACCENTS as Record<string, string>)[id] ?? '#c9954a';
}

/** Three-tier knowledge-point colours (暗底可读的柔和暖色). */
export const LEVEL_COLORS: Record<KPLevel, string> = {
  '基础': '#8a9a5b', // 橄榄绿
  '进阶': '#c9954a', // 金
  '心法': '#cf7d52', // 赭红
};

/** Return the inline hex colour for a knowledge-point level. */
export function getLevelColor(level: KPLevel): string {
  return LEVEL_COLORS[level] ?? '#c9954a';
}

/** Human label for a level (currently the level name itself). */
export function getLevelLabel(level: KPLevel): string {
  return level;
}

/** Numeric ordering used for sorting knowledge points (基础→进阶→心法). */
export function getLevelOrder(level: KPLevel): number {
  return level === '基础' ? 0 : level === '进阶' ? 1 : 2;
}

/** The URL slug for a book equals its id (decided by the architect). */
export function bookSlug(id: string): string {
  return id;
}

/**
 * Per-book accent fallback used by the graph layout: prefer the book's own
 * accent, otherwise fall back to the category colour. (Provided so either the
 * radial-graph variant or the alternative implementation resolve cleanly.)
 */
export function getBookAccent(book: Book, categoryColor: string): string {
  return book.accent || categoryColor;
}

/** Slug helper for the alternative graph implementation (slug === book.id). */
export function getSlug(book: Book): string {
  return book.id;
}

/** Format a nullable date string; renders a dash when null/empty. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return value;
}

/**
 * XSS-safe lightweight inline markdown.
 *
 * Escapes the input FIRST, then applies `**bold**` and `` `code` `` markers.
 * No raw HTML tags are introduced, so the result is safe to inject via
 * `set:html` for Agent-authored fields (knowledge-point details, synthesis
 * points, etc.).
 *
 * @param input - the raw (untrusted) text
 * @returns escaped HTML with bold/code spans applied
 */
export function renderInlineMarkdown(input: string): string {
  const escaped = escapeHtml(input ?? '');
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<span class="garden-md-strong">$1</span>')
    .replace(/`(.+?)`/g, '<span class="garden-md-code">$1</span>');
}

/** Re-export for convenience so pages import a single garden module. */
export { escapeHtml };
