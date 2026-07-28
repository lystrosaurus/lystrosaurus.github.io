# Lystrosaurus's Personal Website

> 一个暗色「科技美学」风格的静态个人站点，包含博客、知识库、书库（知识花园）与一组客户端开发者工具，并提供全站模糊搜索。

🌐 线上地址：<https://lystrosaurus.github.io>

---

## ✨ 功能模块

| 模块 | 路径 | 说明 |
| --- | --- | --- |
| 首页 | `/` | Hero、技能标签云、最近文章、快捷导航 |
| 博客 Blog | `/blog` · `/blog/[slug]` | MDX 文章，支持草稿（`draft: true`） |
| 知识库 Wiki | `/wiki` · `/wiki/[slug]` | MDX 知识卡片，支持分类与排序 |
| 书库 Garden | `/books` · `/books/[slug]` | 21 本书的知识萃取卡片（基础/进阶/心法三级知识点、可行动项、金句、摘要） |
| 复盘 Syntheses | `/syntheses` | 跨书主题复盘，串联相关书目 |
| 知识图谱 Graph | `/garden/graph` | 书目关系可视化（按分类着色） |
| 智能体 Agent | `/garden/agent` | 知识花园统计看板 |
| 开发者工具 Tools | `/tools` | JSON 格式化、Base64、时间戳、正则测试、Markdown 预览、番茄钟、待办（localStorage 持久化） |
| 全站搜索 | `/search` | 基于 Fuse.js 的客户端模糊搜索（博客 + 知识库 + 工具） |
| 笔记 Notes | `/notes` | 独立笔记页 |

### 设计系统

- 全站采用青紫科技主题（`src/styles/global.css` 中的 Tailwind 4 `@theme` tokens）。
- 书库页面使用独立的棕金衬线主题（`src/styles/garden.css`），与全站主题作用域隔离，互不污染。
- 移动端优先：全站固定底部导航栏（`BottomNav`），花园类页面附带面包屑（`Breadcrumbs`）。

---

## 🧱 技术栈

- **框架**：[Astro](https://astro.build/) 7.x，静态输出（`output: 'static'`，无 SSR）
- **内容**：MDX（`@astrojs/mdx`）
- **样式**：Tailwind CSS 4.x（CSS-first 配置，无 `tailwind.config.js`）+ `@tailwindcss/typography`
- **客户端搜索**：Fuse.js
- **客户端 Markdown 渲染**：marked
- **构建工具**：Vite 8（经 `package.json` 的 `overrides` 锁定 esbuild / postcss 版本）
- **部署**：GitHub Pages，GitHub Actions 自动构建（Node 24）

---

## 🚀 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:4321）
npm run dev

# 生产构建（含书库 JSON 预生成）→ dist/
npm run build

# 预览生产构建
npm run preview
```

> ⚠️ `build` 脚本会先执行 `npm run gen:books` 生成 `public/api/books.json`，再运行 `astro build`。请确保 `scripts/gen-books-json.mjs` 可正常读取 `src/data/books.ts`。

### 其它脚本

| 命令 | 作用 |
| --- | --- |
| `npm run garden:validate` | 校验 `src/data/books.ts` 的书库数据完整性与确定性序列化 |
| `npm run garden:run` | 运行知识花园智能体（生成 / 更新萃取） |
| `npm run gen:books` | 由 `src/data/books.ts` 生成 `public/api/books.json` |

---

## 📁 目录结构

```
.
├── astro.config.mjs          # Astro 配置（site / MDX / 静态输出 / Tailwind）
├── src/
│   ├── pages/                # 文件式路由
│   │   ├── blog/  wiki/      # 内容集合列表 + 详情
│   │   ├── books/  syntheses # 书库 + 复盘
│   │   ├── garden/          # graph（图谱）/ agent（看板）
│   │   ├── tools/           # 各开发者工具页面
│   │   ├── index.astro      # 首页
│   │   ├── search.astro      # 全站搜索
│   │   └── notes.astro
│   ├── content/              # blog / wiki 的 MDX 源文件
│   ├── components/          # Header / Footer / Card / BottomNav / Breadcrumbs / SearchBox …
│   ├── layouts/             # BaseLayout / PostLayout / ToolLayout
│   ├── data/                # books.ts（书库单一真相源）+ 类型定义
│   ├── styles/              # global.css（全站主题）/ garden.css（书库主题）
│   └── utils/               # 分类 / DOM / 花园辅助函数
├── scripts/                 # 书库校验、序列化、JSON 生成、智能体
└── .github/workflows/       # deploy.yml（GitHub Pages 部署）
```

---

## 📝 内容贡献约定

- **新增博客 / 知识库文章**：在 `src/content/blog/` 或 `src/content/wiki/` 下添加 `.mdx`，填写完整 frontmatter（标题、描述、日期/分类、标签）。文件名即 URL slug。
- **新增书库书目**：编辑 `src/data/books.ts`，按 `src/data/books.types.ts` 定义补全字段（含 `knowledgePoints` / `actionable` / `quotes` / `summary` / `coreThesis`）。设 `draft: true` 可暂不进入生产构建。
- **新增开发者工具**：创建 `src/pages/tools/<name>.astro`（使用 `ToolLayout`），交互逻辑写在 `<script>` 标签（原生 JS），并在 `search.astro` 的工具索引中补充镜像条目以保持可搜索。
- **样式**：跟随 Tailwind 4 CSS-first 配置——新颜色 / 动画写入 `@theme`，组件类写入 `@layer components`，工具类写入 `@layer utilities`。请复用设计系统 tokens，勿直接硬编码新色值。

---

## 🔧 部署

推送至 `main` 分支即触发 `.github/workflows/deploy.yml`：`npm ci` → `npm run build` → 上传 `dist/` 至 GitHub Pages。也可在 Actions 页面手动 `workflow_dispatch` 触发。

---

## 📄 License

本项目为个人站点，内容版权归作者所有。
