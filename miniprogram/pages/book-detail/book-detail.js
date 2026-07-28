const app = getApp();
const storage = require('../../utils/storage');
const { getCategoryColor, getLevelColor, mdToNodes } = require('../../utils/format');

Page({
  data: {
    id: '',
    book: null,
    category: null,
    catColor: '#c9954a',
    kpByLevel: [],
    actionable: [],
    relatedBooks: [],
    inShelf: false,
    progress: null,
  },

  onLoad(options) {
    this.setData({ id: options.id || '' });
  },

  onShow() {
    this.load();
  },

  load() {
    const id = this.data.id;
    const book = app.getBook(id);
    if (!book) {
      wx.showToast({ title: '未找到该书', icon: 'none' });
      return;
    }
    const category = app.getCategory(book.category);
    const catMap = {};
    (app.globalData.categories || []).forEach((c) => (catMap[c.id] = c));

    const LEVELS = ['基础', '进阶', '心法'];
    const kpByLevel = LEVELS.map((level) => {
      const list = (book.knowledgePoints || [])
        .filter((kp) => kp.level === level)
        .map((kp) => Object.assign({}, kp, { detailNodes: mdToNodes(kp.detail) }));
      return { level, color: getLevelColor(level), list };
    }).filter((g) => g.list.length > 0);

    const relatedBooks = (book.relatedBookIds || [])
      .map((rid) => app.getBook(rid))
      .filter(Boolean)
      .map((b) => Object.assign({}, b, { category: catMap[b.category] }));

    const actionable = (book.actionable || []).map((a) => mdToNodes(a));
    const coreThesisNodes = book.coreThesis ? mdToNodes(book.coreThesis) : null;
    const summaryNodes = book.summary ? mdToNodes(book.summary) : null;
    const quotesNodes = (book.quotes || []).map((q) => mdToNodes(q));

    this.setData({
      book,
      category,
      catColor: getCategoryColor(book.category),
      kpByLevel,
      actionable,
      relatedBooks,
      coreThesisNodes,
      summaryNodes,
      quotesNodes,
      inShelf: storage.isInShelf(id),
      progress: storage.getProgress(id),
    });
    wx.setNavigationBarTitle({ title: book.title });
  },

  startReading() {
    wx.navigateTo({ url: '/pages/reader/reader?id=' + this.data.id });
  },

  toggleShelf() {
    const id = this.data.id;
    const wasIn = storage.isInShelf(id);
    if (wasIn) {
      storage.removeFromShelf(id);
    } else {
      storage.addToShelf(id);
    }
    this.setData({ inShelf: !wasIn });
    wx.showToast({ title: wasIn ? '已移出书架' : '已加入书架', icon: 'none' });
  },

  onCardTap(e) {
    wx.navigateTo({ url: '/pages/book-detail/book-detail?id=' + e.detail.id });
  },

  onShareAppMessage() {
    const b = this.data.book;
    return {
      title: b.title + ' · ' + b.author,
      path: '/pages/book-detail/book-detail?id=' + this.data.id,
    };
  },
});
