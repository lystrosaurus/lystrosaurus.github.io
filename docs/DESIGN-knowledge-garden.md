# 智识花园 · 书库子系统 — 系统架构设计（DESIGN）

> 角色：架构师（高见远） · 团队：`software-knowledge-garden`
> 依据：PRD `docs/PRD-knowledge-garden.md` + 主理人核出的种子数据 + 仓库现状 `C:/project/lystrosaurus.github.io`
> 决策基线（已确认）：① 独立「暗色文明」棕金衬线风，与全站青紫科技风作用域隔离；② `src/data/books.ts` 类型化模块为唯一真相源，Agent 可写；③ 种子 = 21 本 `extracted:false` + 2–3 本完整示例；④ `scripts/knowledge-garden-agent.mjs` + WorkBuddy 定时自动化，四步周期幂等。

---

## 1. 实现方案与框架选型

**总体**：纯静态 Astro 6（`output:'static'`）+ Tailwind 4（`@tailwindcss/vite` + `@tailwindcss/typography`）+ TypeScript。无后端、无数据库、无运行时数据获取。所有页面在构建期由 `src/data/books.ts` 静态渲染。

### 1.1 视觉隔离方案（棕金风零污染）
- **新增 `src/styles/garden.css`**，仅由书库相关页面在 frontmatter 中 `import '../styles/garden.css'` 引入。
- 全部规则统一挂在根作用域类 `.garden-root` 下（如 `.garden-root .garden-card { ... }`），**不向全局 `@theme` 注册任何新 Tailwind 工具类**，确保青紫主题的工具类与变量完全不受影响。
- 棕金色板以**局部 CSS 变量**定义在 `.garden-root`（见 §8），字体用 `Georgia, 'Noto Serif SC', serif`。
- 动态色（`book.accent`、分类色、知识点三级色）一律**内联 hex**（`style="color:#xxx"`），禁止 `text-${x}`/`bg-${x}` 这类 Tailwind 动态拼接（Tailwind 4 不生成）。

### 1.2 图谱选型（零依赖优先）
- **决策：构建期确定性「按分类径向布局」+ 纯静态 SVG，节点即 `<a>` 链接**。
- 理由：
  1. 全部坐标在构建期（Astro frontmatter，TS）算完，产物是纯 SVG，`<a href="/books/[slug]">` 节点可直接被搜索引擎抓取、可右键复制、零客户端计算。
  2. 21–24 个节点规模小，径向布局按 8 分类分成 8 个角扇区、同类书放在同心环上，天然无重叠、可读性强、确定性可复现。
  3. **不引入 `d3-force`**：其 runtime 体积 ~80KB+，且我们是静态站、坐标已知，力导向的「有机感」在 20 节点下收益有限，却换来依赖与客户端算力成本。
  4. 仅用一段约 30 行的极简客户端 `<script>`（`src/scripts/garden-graph.client.ts`）做 **hover 高亮相邻节点 / 分类过滤**（通过 `data-related` 属性 + class 切换，不 fetch 数据）。
- 若后续坚持力导向，仅需在 `GraphLayout.computeRadial` 外再挂一个 `computeForce`（仍是自写、零依赖），接口不变。

### 1.3 引用完整性校验
- `src/data/books.ts` 末尾在模块加载时执行 `assertIntegrity()`（开发/构建期失败即抛错）；另提供独立 `scripts/validate-books.mjs` 供 CI / 手动运行，校验 `relatedBookIds`/`syntheses.bookIds` 指向存在 id、`meta.bookCount === books.length`、`Book.category` 存在于 `categories`。

---

## 2. 文件列表（相对路径，含新增与改动）

### 新增文件
| 路径 | 作用 |
|---|---|
| `src/data/books.types.ts` | 全部 TS 接口与联合类型（`Category`/`KnowledgePoint`/`Book`/`Synthesis`/`LogEntry`/`GardenMeta` 及 `CategoryId`/`KPLevel`） |
| `src/data/books.ts` | 唯一真相源：8 分类 + 21 本 `extracted:false` + 2–3 本完整示例 + `syntheses` + `agentLog=[]` + `meta`；末尾 `assertIntegrity()` |
| `src/styles/garden.css` | 棕金主题（`.garden-root` 作用域），静态结构/排版/卡片/引用样式；动态色走内联 |
| `src/utils/garden.ts` | 纯函数 helper：`getLevelColor(level)→hex`、`categoryById(id)`、`getBookBySlug(books,id)`、`escapeHtml` 复用指引；不 import `books.ts`（与数据层解耦） |
| `src/components/BookCard.astro` | 共享书卡（总览网格 + 详情页「关联书目」复用）；动态文本经 `escapeHtml`，accent 内联 |
| `src/pages/books/index.astro` | `/books` 总览：统计 + 分类/榨取筛选 + 网格；客户端筛选脚本（escapeHtml） |
| `src/pages/books/[slug].astro` | `/books/[slug]` 详情：`getStaticPaths` 遍历 books；核心命题/分级知识点/可行动/金句/关联 |
| `src/pages/syntheses.astro` | `/syntheses` 跨书复盘列表 + 空态 |
| `src/pages/garden/graph.astro` | `/garden/graph`：构建期 `GraphLayout` 算坐标 → 静态 SVG（节点 `<a>` 可点） |
| `src/pages/garden/agent.astro` | `/garden/agent` 只读看板：agentLog / meta 计数 / agentVersion |
| `src/scripts/garden-graph.client.ts` | 图谱页客户端脚本：hover 高亮邻居、按分类过滤（零依赖，~30 行） |
| `scripts/knowledge-garden-agent.mjs` | Node runner，四步幂等周期（见 §5） |
| `scripts/garden-serialize.mjs` | 确定性序列化器：把内存模型整体重生成 `books.ts` 文本 |
| `scripts/validate-books.mjs` | 引用完整性校验（CI/手动） |

### 改动文件
| 路径 | 改动 |
|---|---|
| `src/components/Header.astro` | `navItems` 增加 `{ href:'/books', label:'书库', icon:'📖' }`（桌面+移动菜单，激活态高亮一致） |
| `src/pages/search.astro` | **P1**：`searchIndex` 追加 `type:'book'` 项（书名/作者/摘要/分类→`/books/[slug]`），复用既有 Fuse.js |
| `package.json` | `scripts` 增加 `garden:validate`、`garden:run`（`node --experimental-strip-types scripts/knowledge-garden-agent.mjs`） |

### 不动
- `astro.config.mjs`、`src/styles/global.css`（青紫主题保持纯净）、`.github/workflows/deploy.yml`（现有部署已满足，push main → build → 部署）。

---

## 3. 数据结构与接口（TS 类型）

完整定义落地于 `src/data/books.types.ts`，`books.ts` 仅做具名导出与数据填充。

```ts
// src/data/books.types.ts
export type CategoryId =
  | 'thinking' | 'habits' | 'wealth' | 'psychology'
  | 'comm' | 'ai' | 'classic' | 'bio';

export type KPLevel = '基础' | '进阶' | '心法';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;          // emoji
  desc: string;
  accent: string;         // 固定暖色 hex，用于分类标签底色
}

export interface KnowledgePoint {
  concept: string;
  detail: string;
  level: KPLevel;
}

export interface Book {
  id: string;             // URL-safe，直接作 slug 与关联键
  title: string;
  author: string;
  category: CategoryId;
  year: number;
  accent: string;         // 每书强调色 hex（卡片/节点内联）
  summary: string;
  coreThesis: string;     // 详情页引用块
  knowledgePoints: KnowledgePoint[];
  actionable: string[];
  quotes: string[];
  relatedBookIds: string[];
  extracted: boolean;
  extractedAt: string | null;   // 'YYYY-MM-DD HH:mm'
}

export interface Synthesis {
  id: string;
  title: string;
  theme: string;
  bookIds: string[];      // 必须指向已存在 book id
  summary: string;
  points: string[];
}

export interface LogEntry {
  time: string;           // 'YYYY-MM-DD HH:mm'
  action: string;         // '补充' | '榨取' | '复盘' | '关联' | 'init'
  detail: string;
}

export interface GardenMeta {
  generatedAt: string;
  lastReviewedAt: string | null;
  agentVersion: string;   // 语义版本，如 '1.0.0'
  bookCount: number;      // 必须 === books.length
  note?: string;
}

// src/data/books.ts 顶层具名导出
export const categories: Category[] = [/* 8 项，见附录 A */];
export const books: Book[] = [/* 21 目录 + 2–3 完整示例，见附录 A/B */];
export const syntheses: Synthesis[] = [/* 初始 1–2 条或空 */];
export const agentLog: LogEntry[] = [];
export const meta: GardenMeta = {/* bookCount 必须等于 books.length */};
```

**导出形态**：`books.ts` 仅 `export const` 上述五个具名常量 + 末尾 `assertIntegrity()`；`books.types.ts` 仅 `export type/interface`。Agent runner 通过 `node --experimental-strip-types` 直接 `import` 该 `.ts` 取得运行时数组，无需额外解析。

---

## 4. 程序调用流程

> 图见 `docs/sequence-diagram.mermaid`（构建期渲染 / 图谱 / Agent 三条时序）。要点：

**① 构建期（页面渲染）**
- 各书库页在 frontmatter `import { books, categories, syntheses, agentLog, meta } from '../../data/books'`；Astro 在 `astro build` 时静态渲染为 HTML。
- `/books/[slug].astro` 用 `getStaticPaths` 遍历 `books`，为每本书生成 `/books/<id>.html`（slug === book.id）。
- `/garden/graph.astro` 在 frontmatter 调 `GraphLayout.computeRadial(books, categories)` 得到 `nodes[]/edges[]`，直接输出静态 SVG，节点为 `<a href="/books/<id>">`。

**② 运行期（图谱交互）**
- 页面已含完整 SVG；`garden-graph.client.ts` 仅读取 DOM 上的 `data-related`/`data-category` 做 hover 高亮与分类过滤，**不发起任何网络请求、不读 books 数据**。

**③ Agent 运行期（数据进化）**
- WorkBuddy 自动化在约定时间运行 `node --experimental-strip-types scripts/knowledge-garden-agent.mjs`。
- runner `import` 当前 `books.ts`（strip-types）→ 内存模型为本次唯一真相 → 四步 mutate → `garden-serialize.mjs` 确定性重生成文本 → `validate-books.mjs` 校验 → 若内容哈希变化则覆盖写回、commit（`[bot]` 前缀）、push main → 现有 Actions 部署。**runner 不做任何写操作除非哈希变化**（幂等）。

---

## 5. Agent runner 设计（内存模型唯一真相 → 整体重生成）

**核心策略**：每次运行都把 `books.ts` 读入内存作为唯一真相，四步只在内存对象上「追加/更新」，最后用**确定性序列化器整体重写 `books.ts`**（保留文件头注释与类型导出骨架）。天然幂等、绝不静默删除。

### 5.1 读取（Node 22+ strip-types）
- 运行命令：`node --experimental-strip-types scripts/knowledge-garden-agent.mjs`（CI 用 Node 24，本地 ≥22.18 均可）。
- 内部：`const m = await import(pathToFileURL(resolve(repo,'src/data/books.ts')).href)` 取得 `categories/books/syntheses/agentLog/meta` 实时数组。
- `books.ts` 仅含类型别名/接口 + `const` 导出，strip-types 可安全剥离类型并求值。

### 5.2 四步周期伪代码
```js
async function main() {
  const model = await loadModel();                 // import books.ts（strip-types）
  const before = hashFile(BOOKS_TS);
  const now = utcNow('YYYY-MM-DD HH:mm');

  step1_supplement(model, now);   // 仅追加新目录条目（按 id 去重，extracted:false）
  step2_extract(model, now);      // 填充已具备内容来源的书的 KP/actionable/quotes，置 extracted:true
  step3_synthesize(model, now);   // 跨书生成/更新 syntheses（id 去重）
  step4_relate(model, now);       // relatedBookIds 对称化 + 概念关联 + 更新 meta/agentLog

  const text = serialize(model);                // 确定性输出
  if (hash(text) === before) { log('no changes'); return; }  // 幂等：不提交不推送
  writeFile(BOOKS_TS, text);
  assertIntegrity(model);                       // 失败则回滚/抛错，不提交
  await gitCommit(`[bot] knowledge-garden: ${summary}`);
  await gitPush();                              // push main → Actions 仅部署
}
```

### 5.3 各步改写的字段
| 步 | 动作 | 改写字段 | 幂等保证 |
|---|---|---|---|
| ① 补充 | 从候选池（agent 内置或外部源）追加新书 | `books[]` 新增 `extracted:false` 条目 | 按 `id` 去重，不覆盖已有 |
| ② 榨取 | 对具备内容来源且未榨取的书填充 | `knowledgePoints/actionable/quotes/summary/coreThesis`、`extracted=true`、`extractedAt` | 只更新已存在书；无来源则跳过 |
| ③ 复盘 | 跨主题聚合 | `syntheses[]` 新增（id 去重）、`title/theme/bookIds/summary/points` | 只追加，不删既有 synthesis |
| ④ 关联 | 对称化 + 概念关联 | `relatedBookIds` 双向补齐、剔除不存在 id；`meta.lastReviewedAt/generatedAt/agentVersion`、`agentLog[]` 追加 | 边仅引用存在 id；meta 计数重算 |

### 5.4 幂等 & 安全保证
- **整体重生成**：序列化器输出顺序固定（数组按 `id` 排序；每书 `knowledgePoints` 按 `基础→进阶→心法`、其余数组稳定排序；2 空格缩进、文件尾换行）→ 同输入同输出 → 哈希相等 → 不提交。
- **绝不静默删除**：runner 只 `push`/`update` 已存在条目与追加新条目；无 `splice`/truncate。
- **引用完整**：`relatedBookIds`/`syntheses.bookIds` 仅含存在 id；`meta.bookCount` 重算等于 `books.length`；写回前 `assertIntegrity` 校验，失败不提交。
- **日志轮转**：`agentLog` 保留最近 100 条（日志滚动，非业务数据丢失，可接受）。

### 5.5 提交 / 部署 / 防 CI 循环
- 提交信息前缀 `[bot] knowledge-garden:`（仅作标识，**不**加 `[skip ci]`，因为我们**希望** push 触发部署）。
- 现有 `deploy.yml` 仅在 `push: main` 时 `npm ci → build → 部署`，**无任何步骤会回跑 agent**；agent 由 WorkBuddy 自动化（仓库外调度器）触发，因此 bot push → 仅部署，不回触发 agent，**无循环**。
- runner 在内容哈希未变时直接 `return`，不产生空 push / 冗余部署。
- 若未来想加 GitHub Actions 定时跑 agent，应在该 workflow 加 `if: github.actor != 'github-actions[bot]'` 之类守卫，避免触发环（当前方案不需要）。

---

## 6. 任务列表（有序、含依赖、按实现顺序）

> 严格遵循「≤5 任务、每任务 ≥3 文件、T01 为基础设施」的拆分铁律。P0 全覆盖：数据模块+种子 / 5 页面 / 图谱 / agent runner / 自动化 / Header 集成。

### T01 · 书库基础设施与样式系统（零污染）　【P0 基础设施】
- **文件**：`src/styles/garden.css`（新增）、`src/utils/garden.ts`（新增）、`scripts/validate-books.mjs`（新增）、`package.json`（改：加 `garden:validate`/`garden:run`）
- **依赖**：无（仅依赖既有仓库）
- **验收**：garden.css 全部规则挂在 `.garden-root` 下，全局 `@theme` 无新增；`validate-books.mjs` 在引用断裂时以非 0 退出。

### T02 · 数据层与种子（单一真相源）　【P0 数据】
- **文件**：`src/data/books.types.ts`（新增）、`src/data/books.ts`（新增：8 分类+21 本目录+2–3 完整示例）、`scripts/garden-serialize.mjs`（新增）
- **依赖**：T01（复用 validate 逻辑与 utils 约定）
- **验收**：`meta.bookCount === books.length`；所有 `relatedBookIds`/`syntheses.bookIds` 指向存在 id；`books.ts` 可被 `--experimental-strip-types` 直接 import；序列化器 round-trip 后哈希一致（幂等）。

### T03 · 展示页：总览 / 详情 / 复盘　【P0 展示】
- **文件**：`src/components/BookCard.astro`（新增）、`src/pages/books/index.astro`（新增）、`src/pages/books/[slug].astro`（新增）、`src/pages/syntheses.astro`（新增）
- **依赖**：T01（样式/helper）、T02（数据）
- **验收**：统计数字正确；分类+榨取筛选实时生效；详情页三级知识点色标签可读、关联卡可跳转；`syntheses` 空态正确。

### T04 · 展示页：图谱 / Agent 看板　【P0 展示】
- **文件**：`src/pages/garden/graph.astro`（新增）、`src/pages/garden/agent.astro`（新增）、`src/scripts/garden-graph.client.ts`（新增）
- **依赖**：T01、T02
- **验收**：节点为 `<a>` 可跳 `/books/[slug]`；径向布局确定性、无重叠；hover 高亮邻居；agent 看板纯只读、数据来自 `books.ts`。

### T05 · 集成：Header / 搜索 / Agent Runner / 自动化　【P0 集成 + P1 搜索】
- **文件**：`src/components/Header.astro`（改：加「书库」nav）、`src/pages/search.astro`（改：P1 追加 book 索引项）、`scripts/knowledge-garden-agent.mjs`（新增）、`package.json`（改：见 T01）
- **依赖**：T01（validate）、T02（serialize + 数据）
- **验收**：Header 出现「书库」且 `/books*` 下高亮；runner 连跑两次结果一致、既有条目不被删；push 触发部署、无 CI 循环；WorkBuddy 自动化按约定节奏调度 runner（配置在 App 内，文档化）。

> 依赖图见 `docs/sequence-diagram.mermaid` 末尾的 `graph` 块（T01/T02 为基座，T03/T04/T05 并行依赖二者）。

---

## 7. 依赖包列表（零新增）

- **不新增任何运行时/构建依赖。**
- 图谱：自写径向布局（TS，构建期）→ 静态 SVG；hover 用 ~30 行原生 JS。无 `d3-force`/图库。
- `node --experimental-strip-types` 为 Node 22.18+/24 内置能力，无需安装包。
- P1 搜索复用既有 `fuse.js@^7`（已在 `package.json`）。
- 仅 `package.json` 的 `scripts` 字段新增两条命令，不引入依赖。

---

## 8. 共享知识（跨文件约定）

- **棕金主题 CSS 变量**（定义在 `.garden-root` 内，静态）：
  `--garden-bg:#0f0e0c; --garden-card:#221f1b; --garden-text:#e8e0d4; --garden-accent:#c9954a; --garden-border:#3a3530; --garden-secondary:#a39888;`；字体 `Georgia, 'Noto Serif SC', serif`。
- **知识点三级色**（内联 hex，`src/utils/garden.ts` 的 `getLevelColor`）：基础 `#8a9a5b`（橄榄绿）、进阶 `#c9954a`（金）、心法 `#cf7d52`（赭红）——均为暗底可读的柔和暖色。
- **动态取色规则**：
  - 书卡/节点强调色 = `book.accent`（内联 `style`）。
  - 分类标签色 = `category.accent`（8 个固定暖 hex，见附录 A）。
  - 图谱边色 = 源端 `book.accent`（`relatedBookIds` 的发起方）。
- **escapeHtml 使用点**：所有经 `innerHTML`/`set:html` 注入的动态文本（书卡标题/作者、筛选结果、图谱标签若客户端生成）必须过 `src/utils/dom.ts` 的 `escapeHtml`；Astro 模板默认自动转义，仅 `set:html` 场景需手动转义（Agent 写入字段视为不可信）。
- **slug 规则**：`slug === book.id`（已 URL-safe），`getStaticPaths` 直接映射 `params:{ slug: book.id }`，`relatedBookIds` 与 `syntheses.bookIds` 直接用 id。
- **日期格式**：`'YYYY-MM-DD HH:mm'`，runner 以 UTC 生成以保证确定性；`extractedAt`/`time`/`generatedAt`/`lastReviewedAt` 同格式。
- **导航激活**：Header 以 `currentPath === '/books' || startsWith('/books/')` 判定高亮（与现有逻辑一致）。

---

## 9. 待明确事项（仅设计层面、需用户拍板）

1. **图谱布局最终选型**：本设计推荐「构建期径向-by-分类 + 静态 SVG」。是否接受？或坚持客户端力导向（自写零依赖，仍不引 d3）？
2. **自动化节奏**：建议「补充+榨取=每日，复盘+关联=每周」；或全每日？请定档（影响 T05 自动化配置）。
3. **推送权限模型**：WorkBuddy 自动化以何种凭据 push `main`（仓库已关联的 GitHub 账号 token）？需确认其有写权限且不会触发额外 Actions。
4. **另 2 本完整示例书的榨取内容归属**：atomic-habits 已由主理人提供（附录 B）；thinking-fast-slow、poor-charlie 两本由工程师按公认准确知识点填充（PRD 已确认此分工）。是否调整为仅 2 本示例（atomic-habits + thinking-fast-slow）？
5. **分类固定色板**：附录 A 给出的 8 个暖 hex 是否采用？或允许书卡完全由 `book.accent` 驱动、分类标签统一用金 `#c9954a`？
6. **agentVersion 进位策略 & agentLog 轮转上限（100）**：是否认可「仅在内容实际变化时 +patch」与「日志保留最近 100 条」？

---

# 附录 A · 种子数据规格（来自主理人核出，工程阶段落地）

**8 分类（id | name | icon | desc | accent）**
| id | name | icon | desc | accent |
|---|---|---|---|---|
| thinking | 思维与认知 | 🧠 | 理解大脑如何思考、如何做更聪明的决策 | `#c9954a` |
| habits | 习惯与效能 | ⚡ | 用系统与复利打造可持续的高效习惯 | `#d9a05b` |
| wealth | 财富与投资 | 💰 | 建立可复制的财富认知与长期投资纪律 | `#b8863f` |
| psychology | 心理与行为 | 🌱 | 读懂动机、情绪与人类行为背后的机制 | `#c98a5a` |
| comm | 沟通与表达 | 💬 | 让观点被听懂、被信任、被打动 | `#d4b483` |
| ai | AI 与未来 | ⚙ | 理解智能的本质与技术在文明中的走向 | `#a98b5a` |
| classic | 东方智慧 | ☯ | 从东方经典中提炼可践行的处世心法 | `#cf9b6a` |
| bio | 传记与思维史 | 🎭 | 在伟人与科学家的轨迹中看见思维演进 | `#b9935a` |

**21 本书（id | title | author | category）**
| id | title | author | category |
|---|---|---|---|
| thinking-fast-slow | 思考，快与慢 | Daniel Kahneman | thinking |
| poor-charlie | 穷查理宝典 | Charlie Munger | thinking |
| principles | 原则 | Ray Dalio | thinking |
| atomic-habits | 原子习惯 | James Clear | habits |
| 7-habits | 高效能人士的七个习惯 | Stephen Covey | habits |
| deep-work | 深度工作 | Cal Newport | habits |
| rich-dad-poor-dad | 穷爸爸富爸爸 | Robert Kiyosaki | wealth |
| intelligent-investor | 聪明的投资者 | Benjamin Graham | wealth |
| naval | 纳瓦尔宝典 | Naval Ravikant | wealth |
| influence | 影响力 | Robert Cialdini | psychology |
| courage-to-be-disliked | 被讨厌的勇气 | 岸见一郎/古贺史健 | psychology |
| flow | 心流 | Mihaly Csikszentmihalyi | psychology |
| nonviolent | 非暴力沟通 | Marshall Rosenberg | comm |
| pyramid | 金字塔原理 | Barbara Minto | comm |
| story | 故事 | Robert McKee | comm |
| life3 | 生命3.0 | Max Tegmark | ai |
| hackers-painters | 黑客与画家 | Paul Graham | ai |
| sunzi | 孙子兵法 | 孙武 | classic |
| daode | 道德经 | 老子 | classic |
| jobs | 史蒂夫·乔布斯传 | Walter Isaacson | bio |
| deliberate | 刻意练习 | Anders Ericsson | bio |

> 年份 `year` 由工程师按公开出版年填充；`accent` 未榨取书默认取所属分类 accent，完整示例书用下方指定/精选 hex。

# 附录 B · atomic-habits 完整榨取示例（种子直接写入）
- `accent: '#E17055'`
- `summary`：一段 50–120 字（聚焦「系统优于目标、身份导向、1% 改进复利」）
- `coreThesis`：「你得到的不是你想要的，而是你反复做的。」
- `knowledgePoints`（4–6 个，按级）：
  - `{concept:'1% 复利', detail:'...', level:'基础'}`
  - `{concept:'身份导向', detail:'...', level:'心法'}`
  - （其余由工程师按公认准确内容补全）
- `actionable`：若干条可执行洞察
- `quotes`：含「你不会改变目标，你会改变系统。」
- `relatedBookIds: ['naval','deep-work','7-habits']`
- `extracted: true`，`extractedAt: '2026-07-26'`

> thinking-fast-slow、poor-charlie 两本由工程师用公认准确知识点填充为完整示例（PRD 已确认分工）。

# 附录 C · 图谱径向布局算法（构建期，零依赖）
```
computeRadial(books, categories):
  N = categories.length (8)
  for each category c at angle θ_c = 2π * i / N:
    members = books.filter(category === c.id)          // 同类聚一扇区
    for k, book in members:
      r = BASE + k * RING_STEP                          // 同心环避免重叠
      pos[book.id] = (cx + r*cos(θ_c), cy + r*sin(θ_c))
  edges = unique relatedBookIds pairs → line between pos[a],pos[b]
  return { nodes: [{id, x, y, accent, title}], edges: [{from, to, color}] }
```
- 参数：`BASE=120, RING_STEP=70, viewBox 自适应最大半径`。确定性、可复现、无客户端算力。
