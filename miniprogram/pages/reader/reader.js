const app = getApp();
const storage = require('../../utils/storage');
const { getLevelColor, mdToNodes } = require('../../utils/format');

Page({
  data: {
    id: '',
    book: null,
    blocks: [],
    fontSize: 17,
    lineHeight: 1.85,
    theme: 'dark',
    scrollTop: 0,
    svHeight: 0,
    scrollIntoView: '',
    percent: 0,
    bookmarkCount: 0,
    showBmPanel: false,
    bmList: [],
  },

  onLoad(options) {
    const s = storage.getSettings();
    this.setData({
      id: options.id || '',
      fontSize: s.fontSize,
      lineHeight: s.lineHeight,
      theme: s.theme,
    });
  },

  onShow() {
    this.load();
  },

  onReady() {
    // 测量 scroll-view 高度（用于进度百分比），并恢复上次阅读位置
    wx.createSelectorQuery()
      .select('#readerScroll')
      .boundingClientRect((rect) => {
        const patch = {};
        if (rect) patch.svHeight = rect.height;
        const p = storage.getProgress(this.data.id);
        if (p && p.scrollTop > 0) patch.scrollTop = p.scrollTop;
        if (p && p.percent) patch.percent = p.percent;
        if (Object.keys(patch).length) this.setData(patch);
      })
      .exec();
  },

  load() {
    const id = this.data.id;
    const book = app.getBook(id);
    if (!book) {
      wx.showToast({ title: '未找到该书', icon: 'none' });
      return;
    }

    // 把结构化萃取内容扁平化为可读「块」，便于进度/书签定位
    const blocks = [];
    if (book.summary) {
      blocks.push({ key: 'summary', type: 'summary', title: '内容简介', nodes: mdToNodes(book.summary) });
    }
    if (book.coreThesis) {
      blocks.push({ key: 'thesis', type: 'thesis', title: '核心命题', nodes: mdToNodes(book.coreThesis) });
    }
    ['基础', '进阶', '心法'].forEach((level) => {
      (book.knowledgePoints || [])
        .filter((kp) => kp.level === level)
        .forEach((kp, idx) => {
          blocks.push({
            key: 'kp-' + level + '-' + idx,
            type: 'kp',
            level,
            color: getLevelColor(level),
            title: kp.concept,
            nodes: mdToNodes(kp.detail),
          });
        });
    });
    (book.actionable || []).forEach((a, idx) => {
      blocks.push({ key: 'act-' + idx, type: 'actionable', title: '可行动洞察', nodes: mdToNodes(a) });
    });
    (book.quotes || []).forEach((q, idx) => {
      blocks.push({ key: 'quote-' + idx, type: 'quote', title: '金句', nodes: mdToNodes(q) });
    });

    const bms = storage.getBookmarks(id);
    const bmKeys = new Set(bms.map((b) => b.key));
    const marked = blocks.map((b) => Object.assign({}, b, { bookmarked: bmKeys.has(b.key) }));

    this.setData({
      book,
      blocks: marked,
      bookmarkCount: bms.length,
    });
    wx.setNavigationBarTitle({ title: book.title });
  },

  onScroll(e) {
    // 节流：每 400ms 保存一次，避免频繁 setData 跨桥开销
    if (this._saveTimer) return;
    this._saveTimer = true;
    const detail = e.detail;
    const svHeight = this.data.svHeight || 600;
    const max = Math.max(1, detail.scrollHeight - svHeight);
    const percent = Math.min(100, Math.max(0, Math.round((detail.scrollTop / max) * 100)));
    const top = detail.scrollTop;
    setTimeout(() => {
      storage.saveProgress(this.data.id, { scrollTop: top, percent });
      this._saveTimer = false;
    }, 400);
    if (percent !== this.data.percent) this.setData({ percent });
  },

  /* ---------- 字号 ---------- */
  changeFont(delta) {
    let fs = this.data.fontSize + delta;
    fs = Math.max(14, Math.min(24, fs));
    const s = storage.saveSettings({ fontSize: fs });
    this.setData({ fontSize: s.fontSize });
  },
  decFont() {
    this.changeFont(-1);
  },
  incFont() {
    this.changeFont(1);
  },

  /* ---------- 主题 ---------- */
  toggleTheme() {
    const t = this.data.theme === 'dark' ? 'light' : 'dark';
    storage.saveSettings({ theme: t });
    this.setData({ theme: t });
  },

  /* ---------- 书签 ---------- */
  toggleBookmark(e) {
    const key = e.currentTarget.dataset.key;
    const title = e.currentTarget.dataset.title;
    const added = storage.toggleBookmark(this.data.id, { key, title });
    const bms = storage.getBookmarks(this.data.id);
    const bmKeys = new Set(bms.map((b) => b.key));
    this.setData({
      blocks: this.data.blocks.map((b) => Object.assign({}, b, { bookmarked: bmKeys.has(b.key) })),
      bookmarkCount: bms.length,
    });
    wx.showToast({ title: added ? '已加书签' : '已取消书签', icon: 'none' });
  },

  openBmPanel() {
    const bms = storage.getBookmarks(this.data.id);
    const indexMap = {};
    this.data.blocks.forEach((b, i) => (indexMap[b.key] = i));
    const bmList = bms.map((b) => Object.assign({}, b, { index: indexMap[b.key] }));
    this.setData({ showBmPanel: true, bmList });
  },
  closeBmPanel() {
    this.setData({ showBmPanel: false });
  },
  jumpToBm(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ scrollIntoView: 'block-' + index, showBmPanel: false });
    // scroll-into-view 需变化才触发，稍后清空
    setTimeout(() => this.setData({ scrollIntoView: '' }), 350);
  },

  // 阻止书签面板内部点击冒泡到遮罩（关闭逻辑）
  noop() {},

  onUnload() {
    storage.saveProgress(this.data.id, { updatedAt: Date.now() });
  },

  onShareAppMessage() {
    return {
      title: (this.data.book ? this.data.book.title : '阅读') + ' · 智识花园',
      path: '/pages/book-detail/book-detail?id=' + this.data.id,
    };
  },
});
