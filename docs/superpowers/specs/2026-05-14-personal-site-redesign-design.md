# 个人网站重新设计 - 设计文档

## 概述

将现有的 Hexo 静态博客完全重构为一个现代化的个人网站，包含主页、博客、知识库和小工具功能。采用暗黑科技风格设计。

## 技术栈

- **框架**: Astro 4.x (静态站点生成)
- **内容**: MDX (Markdown + JSX)
- **样式**: Tailwind CSS (暗黑模式)
- **动画**: CSS animations + View Transitions API (Astro 内置)
- **代码高亮**: Shiki (Astro 内置)
- **搜索**: Fuse.js (客户端搜索)
- **部署**: GitHub Actions → GitHub Pages

## 设计风格

### 颜色方案
```
背景: #0a0a0a, #111, #1a1a1a
主色: #00fff2 (cyan)
强调: #a855f7 (purple)
文字: #e5e5e5, #a3a3a3
边框: #262626
成功: #22c55e
警告: #eab308
错误: #ef4444
```

### 视觉效果
- 毛玻璃效果 (backdrop-filter: blur)
- 微妙的发光效果 (box-shadow, text-shadow)
- 等宽字体用于代码区域
- 渐变色点缀
- 卡片悬浮动画

## 项目结构

```
src/
├── pages/                    # 页面
│   ├── index.astro          # 首页
│   ├── blog/
│   │   ├── index.astro      # 博客列表
│   │   └── [slug].astro     # 文章详情
│   ├── wiki/
│   │   ├── index.astro      # 知识库首页（分类筛选 + 搜索）
│   │   └── [slug].astro     # 知识条目详情
│   └── tools/
│       ├── index.astro      # 工具列表
│       ├── json.astro       # JSON 格式化
│       ├── base64.astro     # Base64 编解码
│       ├── timestamp.astro  # 时间戳转换
│       ├── regex.astro      # 正则测试
│       ├── markdown.astro   # Markdown 预览
│       ├── pomodoro.astro   # 番茄钟
│       └── todo.astro       # 待办清单
├── components/              # 组件
│   ├── Header.astro         # 导航栏
│   ├── Footer.astro         # 页脚
│   ├── Card.astro           # 通用卡片
│   ├── TagCloud.astro       # 标签云
│   ├── SearchBar.astro      # 搜索栏
│   ├── PostList.astro       # 文章列表
│   ├── WikiGrid.astro       # 知识库网格
│   └── ToolCard.astro       # 工具卡片
├── layouts/                 # 布局
│   ├── BaseLayout.astro     # 基础布局
│   ├── PostLayout.astro     # 文章布局
│   └── ToolLayout.astro     # 工具布局
├── src/content/             # Astro Content Collections
│   ├── blog/                # 博客文章 (.md/.mdx)
│   │   └── *.mdx
│   ├── wiki/                # 知识库 (.md/.mdx)
│   │   └── *.mdx
│   └── config.ts            # 内容集合 schema 定义
├── styles/                  # 样式
│   └── global.css           # 全局样式
└── lib/                     # 工具函数
    ├── utils.ts
    └── search.ts
```

## 页面设计

### 1. 首页 (index.astro)

**布局：**
- 全屏 Hero 区域
  - 个人头像（带发光边框）
  - 名字 + 打字机效果的一句话介绍
  - 社交链接图标
- 技能标签云（带悬浮发光效果）
- 最新文章区域（3 张卡片）
- 快速导航到各模块

**交互：**
- 打字机效果循环显示不同介绍
- 标签云悬浮放大 + 发光
- 卡片悬浮上移 + 阴影增强

### 2. 博客页 (blog/)

**列表页：**
- 顶部搜索栏
- 标签筛选器
- 文章卡片网格（标题、日期、标签、摘要）
- 分页

**详情页：**
- 文章标题 + 元信息（日期、标签）
- Markdown 渲染（代码高亮）
- 目录导航（右侧悬浮）
- 上一篇/下一篇导航

### 3. 知识库 (wiki/)

**首页：**
- 分类导航：技术栈、面试、教程
- 搜索栏
- 卡片网格展示

**详情页：**
- 侧边栏目录
- 内容渲染
- 相关条目推荐

### 4. 小工具页 (tools/)

**工具列表：**
- 工具卡片网格
- 每个卡片：图标 + 名称 + 简短描述

**工具详情（纯客户端交互）：**

1. **JSON 格式化**
   - 输入框（支持粘贴）
   - 格式化/压缩按钮
   - 输出框（带语法高亮）
   - 复制按钮

2. **Base64 编解码**
   - 双向转换
   - 输入/输出框
   - 支持文件转 Base64

3. **时间戳转换**
   - Unix 时间戳 ↔ 日期时间
   - 当前时间戳显示
   - 多种格式输出

4. **正则测试**
   - 正则表达式输入
   - 测试字符串输入
   - 实时匹配高亮
   - 匹配结果列表

5. **Markdown 预览**
   - 左侧编辑器
   - 右侧实时预览
   - 支持代码高亮

6. **番茄钟**
   - 25 分钟倒计时
   - 开始/暂停/重置
   - 完成提示音
   - 统计完成次数

7. **待办清单**
   - 添加/删除/完成
   - 本地存储持久化
   - 分类筛选

## 组件设计

### Header.astro
- 固定顶部导航
- Logo + 站点名称
- 导航链接：首页、博客、知识库、工具
- 移动端汉堡菜单

### Card.astro
- 通用卡片组件
- 支持：文章卡片、知识卡片、工具卡片
- 悬浮动画效果
- 毛玻璃背景

### TagCloud.astro
- 技能/标签展示
- 随机大小和颜色
- 悬浮发光效果

## 响应式设计

- **桌面** (>1024px): 多列布局，侧边栏
- **平板** (768-1024px): 双列布局
- **手机** (<768px): 单列布局，汉堡菜单

## 性能优化

- Astro 静态生成，零 JS（除工具页）
- 图片懒加载
- CSS 按需加载
- 代码分割（工具页独立）

## 部署流程

1. 本地开发：`npm run dev`
2. 构建：`npm run build`
3. GitHub Actions 自动部署
4. 输出到 `dist/` 目录
5. 推送到 `gh-pages` 分支

## GitHub Actions 配置

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 内容迁移

从现有 Hexo 博客迁移 3 篇文章：
1. Hello World → blog/hello-world.mdx
2. information schema → blog/mysql-information-schema.mdx
3. pm (mermaid) → blog/mermaid-diagrams.mdx

## 实现阶段

### 阶段 1：基础框架
- 初始化 Astro 项目 + Tailwind CSS
- 创建 BaseLayout、Header、Footer
- 实现首页（Hero + 标签云 + 最新文章）
- 配置 GitHub Actions 部署

### 阶段 2：博客模块
- 配置 Content Collections (blog)
- 实现博客列表页
- 实现文章详情页（Markdown 渲染 + 代码高亮）
- 迁移现有 3 篇文章

### 阶段 3：知识库模块
- 配置 Content Collections (wiki)
- 实现知识库首页（分类 + 搜索）
- 实现知识条目详情页
- 添加示例内容

### 阶段 4：小工具模块
- 实现工具列表页
- 逐个实现 7 个工具（优先级：JSON > Base64 > 时间戳 > 正则 > Markdown > 番茄钟 > 待办）

## 待办事项

- [ ] 初始化 Astro 项目
- [ ] 配置 Tailwind CSS
- [ ] 创建基础布局和组件
- [ ] 实现首页
- [ ] 实现博客模块
- [ ] 实现知识库模块
- [ ] 实现小工具模块
- [ ] 迁移现有内容
- [ ] 配置 GitHub Actions
- [ ] 测试和优化
