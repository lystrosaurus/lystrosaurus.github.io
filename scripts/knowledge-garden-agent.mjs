#!/usr/bin/env node
/**
 * knowledge-garden-agent.mjs — 知识花园书库的四步可重入（幂等）Agent runner。
 *
 * 注意：本文件为 .mjs（纯 JavaScript）。`--experimental-strip-types` 仅用于让本文件
 * 能直接 import 运行期 .ts 数据模块（src/data/books.ts），本文件自身不含类型注解。
 *
 * 设计目标：可随时安全运行，且在同一数据状态下重复执行结果一致（幂等）。
 *
 * 四步（仅修改内存中的 model，绝不边跑边写盘）：
 *   ① 补充 supplement：从内置 PENDING_POOL 追加新书目（默认空，需人工 / Agent 显式填充）。
 *   ② 榨取 extract：仅当书目配置了内容来源时抽取 knowledgePoints；当前无来源配置，
 *      故为 no-op（绝不臆造内容）。
 *   ③ 复盘 synthesize：若发现新的跨书主题则追加 synthesis；种子已含 1 条，no-op。
 *   ④ 关联 relate：对称化 relatedBookIds、剔除悬空引用、重算 meta.bookCount、
 *      更新 lastReviewedAt、写入运行日志 —— 仅当有实际变化时执行。
 *
 * 幂等性：序列化采用 scripts/garden-serialize.mjs 的确定性输出（2 空格缩进、数组按 id 排序、
 * 知识点按 基础→进阶→心法 排序、结尾换行）。若序列化结果与原文件字节一致，
 * 判定「无变化」，直接退出 0，不写盘、不提交。
 *
 * 提交策略：确有变化时写回 src/data/books.ts，运行与 validate-books.mjs 同源的完整性校验
 * （失败则中止、绝不提交），随后 git add + commit；仅当配置了 upstream remote 才尝试 push，
 * push 失败（本环境无凭据）可接受并仅作本地提示。
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { serialize } from './garden-serialize.mjs';
import { validate } from './validate-books.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const BOOKS_TS = resolve(repoRoot, 'src/data/books.ts');

/**
 * 待补充书目池。保持为空：新增书目需由用户 / Agent 显式填充后才会生效，
 * 这样默认运行绝不会意外写入内容。每项形如：
 *   { id, title, author, category, year, accent, summary,
 *     coreThesis, knowledgePoints, actionable, quotes,
 *     relatedBookIds, extracted, extractedAt }
 */
const PENDING_POOL = [];

function hash(text) {
  return createHash('sha256').update(text).digest('hex');
}

function nowStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

async function main() {
  // 1) 载入实时模型（strip-types 直接 import 运行期数组）
  const mod = await import(pathToFileURL(BOOKS_TS).href);
  const model = {
    categories: mod.categories,
    books: mod.books,
    syntheses: mod.syntheses,
    agentLog: mod.agentLog,
    meta: mod.meta,
  };

  const fileText = readFileSync(BOOKS_TS, 'utf8');
  const beforeHash = hash(fileText);

  let changed = false;

  // ① supplement：仅追加 PENDING_POOL 中尚不存在的书目（按 id 去重）
  if (Array.isArray(PENDING_POOL) && PENDING_POOL.length > 0) {
    const existing = new Set(model.books.map((b) => b.id));
    for (const nb of PENDING_POOL) {
      if (!nb || !nb.id || existing.has(nb.id)) continue;
      model.books.push({ ...nb });
      existing.add(nb.id);
      changed = true;
    }
  }

  // ② extract：当前无内容来源配置，no-op（保留扩展点：当 book.contentSource 存在时在此抽取）

  // ③ synthesize：no-op（种子已含 1 条；未发现新跨书主题则不追加）

  // ④ relate：对称化 + 去悬空 + 重算 bookCount
  const bookIds = new Set(model.books.map((b) => b.id));
  for (const b of model.books) {
    const clean = (b.relatedBookIds || []).filter((r) => bookIds.has(r));
    if (clean.length !== (b.relatedBookIds || []).length) {
      b.relatedBookIds = clean;
      changed = true;
    }
    for (const r of b.relatedBookIds) {
      const other = model.books.find((x) => x.id === r);
      if (other && !other.relatedBookIds.includes(b.id)) {
        other.relatedBookIds.push(b.id);
        changed = true;
      }
    }
  }
  if (model.meta.bookCount !== model.books.length) {
    model.meta.bookCount = model.books.length;
    changed = true;
  }

  // 仅当有变化时更新时间戳 + 运行日志
  if (changed) {
    const stamp = nowStamp();
    model.meta.lastReviewedAt = stamp;
    model.agentLog.unshift({
      time: stamp,
      action: '关联',
      detail: 'Agent 周期：对称化相关书目、清理悬空引用、重算书目计数。',
    });
    if (model.agentLog.length > 100) model.agentLog.length = 100;
  }

  const newText = serialize(model);

  // 幂等判定：序列化结果与原文件一致 → 无变化
  if (hash(newText) === beforeHash) {
    console.log('[garden:run] no changes — 数据已是目标状态，无需提交。');
    process.exit(0);
  }

  // 完整性校验（与 validate-books.mjs 同源），失败绝不写盘 / 提交
  const errors = validate(model);
  if (errors.length) {
    console.error('[garden:run] 数据完整性校验失败，已中止（未写入 / 未提交）:');
    for (const e of errors) console.error('  ✗ ' + e);
    process.exit(1);
  }

  writeFileSync(BOOKS_TS, newText, 'utf8');
  console.log('[garden:run] 已更新 src/data/books.ts');

  const { execSync } = await import('node:child_process');
  try {
    execSync('git add src/data/books.ts', { cwd: repoRoot, stdio: 'inherit' });
    execSync('git commit -m "[bot] knowledge-garden: 周期更新（关联/复盘）"', {
      cwd: repoRoot,
      stdio: 'inherit',
    });
  } catch (e) {
    console.error('[garden:run] git 提交失败：', e && e.message ? e.message : e);
  }

  // 仅在存在 upstream remote 时尝试 push；失败可接受（本地验证场景无凭据）
  try {
    execSync('git rev-parse --abbrev-ref --symbolic-full-name @{u}', {
      cwd: repoRoot,
      stdio: 'pipe',
    });
    execSync('git push', { cwd: repoRoot, stdio: 'inherit' });
  } catch {
    console.log('[garden:run] 无 upstream / push 失败（可接受，本地验证）。');
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('[garden:run] 运行失败:', err);
  process.exit(1);
});
