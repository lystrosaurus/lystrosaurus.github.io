/**
 * Deterministic serializer for the knowledge-garden data model.
 *
 * `canonicalize(model)` produces a stable, key-ordered plain object (used by
 * the Agent runner for idempotency hashing). `serialize(model)` renders the
 * full `src/data/books.ts` text from that canonical form — same input always
 * yields byte-identical output, which is what makes the Agent runner idempotent.
 *
 * The embedded `assertIntegrity` mirrors `src/data/books.ts` so the regenerated
 * file remains self-validating at load time.
 */

/** Pure reference-integrity check (plain-JS twin of the one in books.ts). */
const ASSERT_FN = `export function assertIntegrity(model) {
  const errors = [];
  const catIds = new Set(model.categories.map((c) => c.id));
  if (catIds.size !== model.categories.length) errors.push('分类 id 不唯一');
  const bookIds = new Set(model.books.map((b) => b.id));
  if (bookIds.size !== model.books.length) errors.push('书籍 id 不唯一');
  for (const b of model.books) {
    if (!catIds.has(b.category)) errors.push('书籍 ' + b.id + ' 的分类 ' + b.category + ' 不存在');
    for (const r of b.relatedBookIds) {
      if (!bookIds.has(r)) errors.push('书籍 ' + b.id + ' 的 relatedBookIds 含不存在的 id: ' + r);
    }
    if (b.extracted && (!b.knowledgePoints || b.knowledgePoints.length === 0)) {
      errors.push('书籍 ' + b.id + ' 标记为已榨取但缺少 knowledgePoints');
    }
  }
  for (const s of model.syntheses) {
    for (const bid of s.bookIds) {
      if (!bookIds.has(bid)) errors.push('复盘 ' + s.id + ' 的 bookIds 含不存在的 id: ' + bid);
    }
  }
  if (model.meta.bookCount !== model.books.length) {
    errors.push('meta.bookCount(' + model.meta.bookCount + ') !== books.length(' + model.books.length + ')');
  }
  if (errors.length) {
    throw new Error('[garden] 数据完整性校验失败:\\n' + errors.join('\\n'));
  }
}`;

function levelRank(level) {
  return level === '基础' ? 0 : level === '进阶' ? 1 : 2;
}

/**
 * Produce a deterministic, key-ordered projection of the model.
 * - categories / books / syntheses sorted by id
 * - knowledgePoints sorted 基础 → 进阶 → 心法, then by concept
 * - arrays (actionable / quotes / relatedBookIds) sorted
 * Does NOT mutate the input model.
 *
 * @param {import('../src/data/books.types.ts').GardenModel} model
 */
export function canonicalize(model) {
  const categories = [...model.categories].sort((a, b) => a.id.localeCompare(b.id));

  const books = [...model.books]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      category: b.category,
      year: b.year,
      accent: b.accent,
      summary: b.summary,
      coreThesis: b.coreThesis,
      knowledgePoints: [...b.knowledgePoints].sort(
        (p, q) => levelRank(p.level) - levelRank(q.level) || p.concept.localeCompare(q.concept),
      ),
      actionable: [...b.actionable].sort((a, b2) => a.localeCompare(b2)),
      quotes: [...b.quotes].sort((a, b2) => a.localeCompare(b2)),
      relatedBookIds: [...b.relatedBookIds].sort((a, b2) => a.localeCompare(b2)),
      extracted: b.extracted,
      extractedAt: b.extractedAt,
    }));

  const syntheses = [...model.syntheses].sort((a, b) => a.id.localeCompare(b.id));
  const agentLog = [...model.agentLog];
  const meta = { ...model.meta };

  return { categories, books, syntheses, agentLog, meta };
}

/**
 * Render the full `books.ts` text from a model.
 *
 * @param {import('../src/data/books.types.ts').GardenModel} model
 * @returns {string}
 */
export function serialize(model) {
  const c = canonicalize(model);

  const header = `/**
 * 知识花园 / 书库 —— 数据单一真相源（由 scripts/knowledge-garden-agent.mjs 自动生成）。
 * 请勿手改；如需修改请运行 runner，或编辑后运行 npm run garden:validate。
 */
import type {
  Book,
  Category,
  GardenMeta,
  KnowledgePoint,
  LogEntry,
  Synthesis,
} from './books.types';

`;

  const body = `${ASSERT_FN}

export const categories: Category[] = ${JSON.stringify(c.categories, null, 2)};

export const books: Book[] = ${JSON.stringify(c.books, null, 2)};

export const syntheses: Synthesis[] = ${JSON.stringify(c.syntheses, null, 2)};

export const agentLog: LogEntry[] = ${JSON.stringify(c.agentLog, null, 2)};

export const meta: GardenMeta = ${JSON.stringify(c.meta, null, 2)};

assertIntegrity({ categories, books, syntheses, agentLog, meta });
`;

  return header + body;
}
