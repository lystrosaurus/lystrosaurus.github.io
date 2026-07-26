/**
 * books.types.ts — 书库子系统全部 TS 接口与联合类型（DESIGN §3）。
 *
 * 本文件仅 `export type/interface`，不含任何运行时数据；运行时数组定义在
 * `books.ts`（单一真相源）。Agent runner 通过 `--experimental-strip-types`
 * 直接 import 运行时数组，类型剥离不影响求值。
 */

/** 8 个分类的固定 id 联合类型。 */
export type CategoryId =
  | 'thinking'
  | 'habits'
  | 'wealth'
  | 'psychology'
  | 'comm'
  | 'ai'
  | 'classic'
  | 'bio';

/** 知识点级别：基础 / 进阶 / 心法。 */
export type KPLevel = '基础' | '进阶' | '心法';

/** 分类定义。 */
export interface Category {
  id: CategoryId;
  name: string;
  icon: string; // emoji
  desc: string;
  accent: string; // 固定暖色 hex，用于分类标签底色
}

/** 单条知识点。 */
export interface KnowledgePoint {
  concept: string;
  detail: string;
  level: KPLevel;
}

/** 书籍定义（单一真相源的核心实体）。 */
export interface Book {
  id: string; // URL-safe，直接作 slug 与关联键
  title: string;
  author: string;
  category: CategoryId;
  year: number;
  accent: string; // 每书强调色 hex（卡片/节点内联）
  summary: string;
  coreThesis: string; // 详情页引用块
  knowledgePoints: KnowledgePoint[];
  actionable: string[]; // 可行动洞察
  quotes: string[]; // 金句
  relatedBookIds: string[]; // 关联书目（必须对称、指向已存在 id）
  extracted: boolean; // 是否已榨取
  extractedAt: string | null; // 'YYYY-MM-DD HH:mm'
}

/** 跨书复盘。 */
export interface Synthesis {
  id: string;
  title: string;
  theme: string;
  bookIds: string[]; // 必须指向已存在 book id
  summary: string;
  points: string[];
}

/** Agent 运行日志条目。 */
export interface LogEntry {
  time: string; // 'YYYY-MM-DD HH:mm'
  action: string; // '补充' | '榨取' | '复盘' | '关联' | 'init'
  detail: string;
}

/** 书库元信息。 */
export interface GardenMeta {
  generatedAt: string; // 'YYYY-MM-DD HH:mm'
  lastReviewedAt: string | null;
  agentVersion: string; // 语义版本，如 '1.0.0'
  bookCount: number; // 必须 === books.length
  note?: string;
}

/** 顶层数据模型（供页面与 agent runner 复用）。 */
export interface GardenData {
  categories: Category[];
  books: Book[];
  syntheses: Synthesis[];
  agentLog: LogEntry[];
  meta: GardenMeta;
}
