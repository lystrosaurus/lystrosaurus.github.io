/**
 * gen-books-json.mjs — 知识花园 / 书库 数据同步桥。
 *
 * 单一真相源：src/data/books.ts（由 knowledge-garden-agent 自动生成/维护）。
 * 本脚本在「不重复存储数据」的前提下，把同一份结构输出为两份 JSON：
 *
 *   1) public/api/books.json          → 站点静态托管，作为小程序远程同步端点
 *   2) miniprogram/data/books.local.json → 小程序离线 / 开发期兜底副本
 *
 * 小程序运行期优先拉取远程端点；远程不可达或域名未配置时回退到本地副本，
 * 保证「单一真相源 + 双端一致」。远程与本地通过 meta.generatedAt 比对刷新。
 *
 * 运行：node --experimental-strip-types scripts/gen-books-json.mjs
 * 已挂到 npm script：npm run gen:books
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  books,
  categories,
  syntheses,
  agentLog,
  meta,
} from '../src/data/books.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// 远程端点与本地兜底共用同一份 payload；为小程序精简掉 agentLog（仅站点审计用）。
const payload = {
  categories,
  books,
  syntheses,
  meta: { ...meta, bookCount: books.length },
  // 同步校验用：小程序比对远端与本地 generatedAt 决定是否刷新缓存
  syncToken: meta.generatedAt,
};

const publicDir = resolve(root, 'public/api');
mkdirSync(publicDir, { recursive: true });
writeFileSync(
  resolve(publicDir, 'books.json'),
  JSON.stringify(payload, null, 2),
  'utf8',
);

const mpDataDir = resolve(root, 'miniprogram/data');
mkdirSync(mpDataDir, { recursive: true });
writeFileSync(
  resolve(mpDataDir, 'books.local.json'),
  JSON.stringify(payload, null, 2),
  'utf8',
);

console.log(
  `✓ gen:books → ${books.length} 本书 / ${categories.length} 分类 / ${syntheses.length} 复盘\n` +
    `  - public/api/books.json\n` +
    `  - miniprogram/data/books.local.json\n` +
    `  syncToken=${payload.syncToken}`,
);
