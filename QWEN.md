# QWEN.md

本文件为 Qwen Code 提供项目上下文，帮助理解代码库结构、技术栈和开发规范。

## 项目概述

**Lystrosaurus 的个人网站** — 一个现代化的深色科技风格静态站点，部署在 GitHub Pages（https://lystrosaurus.github.io）。

站点包含三大板块：
- **博客（Blog）**：技术文章、思考与生活记录
- **知识库（Wiki）**：系统性的笔记与速查手册
- **工具集（Tools）**：7 个纯前端开发者工具

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Astro（静态站点生成） | ^6.3.3 |
| 内容 | MDX（@astrojs/mdx） | ^5.0.6 |
| 样式 | Tailwind CSS | ^4.3.0 |
| 排版 | @tailwindcss/typography | ^0.5.19 |
| 搜索 | Fuse.js（客户端模糊搜索） | ^7.0.0 |
| Markdown | Marked（客户端渲染） | ^12.0.0 |
| 部署 | GitHub Pages + GitHub Actions | — |

## 项目结构

```
src/
├── components/          # 可复用 Astro 组件
│   ├── Card.astro       # 通用卡片组件
│   ├── Footer.astro     # 页脚
│   ├── Header.astro     # 顶部导航栏
│   ├── TagCloud.astro   # 标签云展示
│   └── ToolCard.astro   # 工具卡片
├── content/
│   ├── blog/            # 博客文章（MDX）
│   └── wiki/            # 知识库条目（MDX）
├── layouts/
│   ├── BaseLayout.astro # 基础页面布局（Header + Footer）
│   ├── PostLayout.astro # 文章详情布局
│   └── ToolLayout.astro # 工具页面布局
├── pages/
│   ├── index.astro      # 首页（Hero + 技术栈 + 最近文章 + 导航）
│   ├── blog/
│   │   ├── index.astro  # 博客列表页
│   │   └── [slug].astro # 博客详情页（动态路由）
│   ├── wiki/
│   │   ├── index.astro  # 知识库列表页
│   │   └── [slug].astro # 知识库详情页（动态路由）
│   └── tools/
│       ├── index.astro          # 工具列表页
│       ├── json-formatter.astro # JSON 格式化
│       ├── base64.astro         # Base64 编解码
│       ├── timestamp.astro      # 时间戳转换
│       ├── regex-tester.astro   # 正则测试
│       ├── markdown-preview.astro # Markdown 预览
│       ├── pomodoro.astro       # 番茄钟
│       └── todo.astro           # 待办清单（localStorage 持久化）
├── styles/
│   └── global.css       # Tailwind 导入 + 自定义主题 + 组件样式
├── content.config.ts    # 内容集合 schema 定义
└── env.d.ts             # Astro 类型声明
```

## 常用命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本（输出到 dist/）
npm run preview    # 预览生产构建
```

## 内容集合 Schema

在 `src/content.config.ts` 中定义了两个内容集合：

### blog（博客）

```typescript
{
  title: string;        // 文章标题
  description: string;  // 文章描述
  date: string;         // 发布日期（YYYY-MM-DD）
  tags: string[];       // 标签列表
  draft: boolean;       // 是否为草稿（默认 false）
}
```

### wiki（知识库）

```typescript
{
  title: string;        // 条目标题
  description: string;  // 条目描述
  category: string;     // 分类
  order: number;        // 排序权重（默认 0）
  tags: string[];       // 标签列表（默认 []）
  draft: boolean;       // 是否为草稿（默认 false）
}
```

## 设计系统

### 颜色主题（深色科技风）

| Token | 色值 | 用途 |
|-------|------|------|
| `bg` | #0a0a0a | 主背景 |
| `bg-secondary` | #111111 | 次级背景 |
| `bg-tertiary` | #1a1a1a | 三级背景 |
| `cyan` | #00fff2 | 主强调色（霓虹青） |
| `purple` | #a855f7 | 次强调色（紫色） |
| `text-primary` | #e5e5e5 | 主文本 |
| `text-secondary` | #a3a3a3 | 次文本 |
| `text-muted` | #666666 | 弱化文本 |
| `border` | #262626 | 边框 |
| `border-hover` | #404040 | 悬停边框 |

### 自定义 CSS 类（global.css）

| 类名 | 说明 |
|------|------|
| `.glass-card` | 毛玻璃卡片效果 |
| `.glass-card-hover` | 带悬停发光效果的毛玻璃卡片 |
| `.neon-text` | 霓虹青发光文字 |
| `.neon-text-purple` | 紫色发光文字 |
| `.glow-border` | 发光边框 |
| `.btn-primary` | 青色主按钮 |
| `.btn-secondary` | 紫色次按钮 |
| `.input-field` | 统一输入框样式 |
| `.text-gradient-cyan-purple` | 青紫渐变文字 |

### 字体

- **正文**：Inter（系统 UI 备选）
- **代码**：JetBrains Mono / Fira Code

### 动画

- `typewriter` — 打字机效果
- `blink` — 光标闪烁
- `glow-pulse` — 发光脉冲
- `float` — 悬浮浮动

## 路径别名

在 `tsconfig.json` 中配置：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

使用方式：`import Header from '@/components/Header.astro'`

## 开发规范

### 内容编写

- 博客和知识库使用 MDX 格式，放置在 `src/content/blog/` 和 `src/content/wiki/`
- 文件名即为 URL slug（如 `welcome.mdx` → `/blog/welcome`）
- 草稿文件设置 `draft: true` 不会出现在生产构建中

### 组件开发

- 组件使用 Astro 组件语法（`.astro` 文件）
- 工具页面的交互逻辑使用 `<script>` 标签实现客户端 JavaScript
- 遵循已有的深色主题设计系统，使用 `global.css` 中定义的 CSS 变量和工具类

### 样式规范

- 使用 Tailwind CSS 4.x 语法（`@import "tailwindcss"` + `@theme` 配置）
- 自定义颜色和动画在 `@theme` 块中定义
- 组件级样式使用 `@layer components` 组织
- 工具类样式使用 `@layer utilities` 组织

### 内容 frontmatter

所有 MDX 文件必须包含完整的 frontmatter：

```markdown
---
title: "文章标题"
description: "文章描述"
date: "2026-05-15"
tags: ["标签1", "标签2"]
draft: false
---
```

知识库还需额外字段：

```markdown
---
category: "分类名"
order: 1
---
```

## 注意事项

- 静态输出模式（`output: 'static'`），无服务端渲染
- 工具页面为纯客户端交互，无需服务端逻辑
- Todo 工具使用 `localStorage` 持久化数据
- 搜索功能使用 Fuse.js 客户端模糊搜索
- Vite 版本通过 `overrides` 锁定为 ^7.3.2
