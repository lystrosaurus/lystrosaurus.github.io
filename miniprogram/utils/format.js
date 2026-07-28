/**
 * utils/format.js — 渲染辅助。
 *
 *  - 分类/知识点配色与静态站点保持一致（固定暖色 hex）。
 *  - mdToNodes：把 **加粗** 与 `代码` 转为 <rich-text> 可用的 nodes 数组
 *    （小程序无 v-html，结构化文本必须用 rich-text 渲染）。
 *    先做转义再套标记，避免注入风险（数据虽来自可信单一真相源，仍加固）。
 */

const CATEGORY_ACCENTS = {
  thinking: '#c9954a',
  habits: '#d9a05b',
  wealth: '#b8863f',
  psychology: '#c98a5a',
  comm: '#d4b483',
  ai: '#a98b5a',
  classic: '#cf9b6a',
  bio: '#b9935a',
};

const LEVEL_COLORS = {
  基础: '#8a9a5b',
  进阶: '#c9954a',
  心法: '#cf7d52',
};

function getCategoryColor(id) {
  return CATEGORY_ACCENTS[id] || '#c9954a';
}
function getLevelColor(level) {
  return LEVEL_COLORS[level] || '#c9954a';
}
function getLevelLabel(level) {
  return level;
}

/** 转义 HTML 特殊字符 */
function escapeHtml(s) {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * 轻量内联 markdown → rich-text nodes。
 * 支持 **bold** 与 `code`；其余按纯文本渲染。
 * @param {string} input
 * @returns {Array} rich-text nodes
 */
function mdToNodes(input) {
  const text = escapeHtml(input == null ? '' : String(input));
  const nodes = [];
  let i = 0;
  let buf = '';
  const flush = () => {
    if (buf) {
      nodes.push({ type: 'text', text: buf });
      buf = '';
    }
  };
  while (i < text.length) {
    // **bold**
    if (text[i] === '*' && text[i + 1] === '*') {
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        flush();
        nodes.push({
          name: 'strong',
          attrs: { class: 'md-strong' },
          children: [{ type: 'text', text: text.slice(i + 2, end) }],
        });
        i = end + 2;
        continue;
      }
    }
    // `code`
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end !== -1) {
        flush();
        nodes.push({
          name: 'code',
          attrs: { class: 'md-code' },
          children: [{ type: 'text', text: text.slice(i + 1, end) }],
        });
        i = end + 1;
        continue;
      }
    }
    buf += text[i];
    i++;
  }
  flush();
  return nodes;
}

/** 格式化时间戳为 MM-DD HH:mm */
function formatDateTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const p = (n) => (n < 10 ? '0' + n : '' + n);
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

module.exports = {
  CATEGORY_ACCENTS,
  LEVEL_COLORS,
  getCategoryColor,
  getLevelColor,
  getLevelLabel,
  mdToNodes,
  escapeHtml,
  formatDateTime,
};
