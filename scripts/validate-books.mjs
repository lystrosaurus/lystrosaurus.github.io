/**
 * validate-books.mjs — 书库数据引用完整性校验（CI / 手动 / Agent runner 复用）。
 *
 * 校验项（DESIGN §3 / PRD §3 引用完整性）：
 *  1. 所有 Category.id 唯一。
 *  2. 所有 Book.id 唯一。
 *  3. 每个 Book.category 必须存在于 categories.id。
 *  4. 每个 Book.relatedBookIds 必须指向已存在的 Book.id。
 *  5. 每个 Synthesis.bookIds 必须指向已存在的 Book.id。
 *  6. meta.bookCount 必须 === books.length。
 *  7.（额外）标记为已榨取的书应至少有一条 knowledgePoints。
 *
 * 双模式：
 *  - 作为主模块运行（node scripts/validate-books.mjs）：打印摘要，失败以非 0 退出。
 *  - 被 import：导出 `validate(model)`，供 knowledge-garden-agent.mjs 调用。
 *
 * 零新增依赖：仅用 Node 内置模块 + strip-types 读取 books.ts（Node 22.18+/24）。
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const BOOKS_TS = resolve(repoRoot, 'src/data/books.ts');

/**
 * 读取 books.ts 中的具名导出（strip-types 直接 import 运行期数组）。
 * @returns {{ categories: any[], books: any[], syntheses: any[], agentLog: any[], meta: any }}
 */
export async function loadModel() {
  const url = new URL(`file://${BOOKS_TS}`).href;
  const mod = await import(url);
  return {
    categories: mod.categories ?? [],
    books: mod.books ?? [],
    syntheses: mod.syntheses ?? [],
    agentLog: mod.agentLog ?? [],
    meta: mod.meta ?? {},
  };
}

/**
 * 校验模型，返回错误信息数组（空数组代表通过）。
 * @param {{ categories: any[], books: any[], syntheses: any[], meta: any }} model
 * @returns {string[]} 错误列表
 */
export function validate(model) {
  const errors = [];
  const { categories, books, syntheses, meta } = model;

  const catIds = categories.map((c) => c.id);
  const dupCats = catIds.filter((id, i) => catIds.indexOf(id) !== i);
  if (dupCats.length) {
    errors.push(`分类 id 重复: ${[...new Set(dupCats)].join(', ')}`);
  }

  const bookIds = books.map((b) => b.id);
  const dupBooks = bookIds.filter((id, i) => bookIds.indexOf(id) !== i);
  if (dupBooks.length) {
    errors.push(`书籍 id 重复: ${[...new Set(dupBooks)].join(', ')}`);
  }

  const catSet = new Set(catIds);
  const bookSet = new Set(bookIds);
  for (const b of books) {
    if (!catSet.has(b.category)) {
      errors.push(`书籍《${b.title}》(id=${b.id}) 的 category="${b.category}" 不存在于分类表`);
    }
    for (const rid of b.relatedBookIds ?? []) {
      if (!bookSet.has(rid)) {
        errors.push(`书籍《${b.title}》(id=${b.id}) 的 relatedBookIds 含不存在的 id="${rid}"`);
      }
    }
    if (b.extracted && (!b.knowledgePoints || b.knowledgePoints.length === 0)) {
      errors.push(`书籍《${b.title}》(id=${b.id}) 标记为已榨取但缺少 knowledgePoints`);
    }
  }

  for (const s of syntheses) {
    for (const bid of s.bookIds ?? []) {
      if (!bookSet.has(bid)) {
        errors.push(`复盘《${s.title}》(id=${s.id}) 的 bookIds 含不存在的 id="${bid}"`);
      }
    }
  }

  if (typeof meta.bookCount === 'number' && meta.bookCount !== books.length) {
    errors.push(`meta.bookCount(${meta.bookCount}) !== books.length(${books.length})`);
  }

  return errors;
}

async function main() {
  let model;
  try {
    model = await loadModel();
  } catch (err) {
    console.error('[garden:validate] 失败: 读取 src/data/books.ts 出错 —', err.message);
    process.exit(1);
  }

  const errors = validate(model);
  const extracted = model.books.filter((b) => b.extracted).length;
  if (errors.length) {
    console.error('[garden:validate] 失败 — 引用完整性问题:');
    for (const e of errors) console.error('  ✗ ' + e);
    process.exit(1);
  }
  console.log(
    `[garden:validate] OK — 书 ${model.books.length}（已榨取 ${extracted}）/ 分类 ${model.categories.length} / 复盘 ${model.syntheses.length} / 日志 ${model.agentLog.length}`,
  );
  process.exit(0);
}

// 仅作为主模块执行时运行（被 runner import 时不触发）。
const invokedUrl = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : '';
if (import.meta.url === invokedUrl) {
  main();
}
