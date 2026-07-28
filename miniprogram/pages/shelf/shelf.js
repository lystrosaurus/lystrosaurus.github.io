const app = getApp();
const storage = require('../../utils/storage');
const { getCategoryColor, formatDateTime } = require('../../utils/format');

Page({
  data: {
    items: [],
    empty: false,
  },

  onShow() {
    this.load();
  },

  load() {
    const ids = storage.getShelf();
    const catMap = {};
    (app.globalData.categories || []).forEach((c) => (catMap[c.id] = c));

    const progressAll = storage.getAllProgress();
    const items = ids
      .map((id) => {
        const b = app.getBook(id);
        if (!b) return null;
        const cat = catMap[b.category];
        const p = progressAll[id];
        return {
          id,
          title: b.title,
          author: b.author,
          year: b.year,
          catColor: getCategoryColor(b.category),
          catName: cat ? cat.name : '',
          catIcon: cat ? cat.icon : '',
          percent: p ? p.percent : 0,
          updatedAt: p ? formatDateTime(p.updatedAt) : '',
        };
      })
      .filter(Boolean);

    this.setData({ items, empty: items.length === 0 });
  },

  open(e) {
    wx.navigateTo({ url: '/pages/reader/reader?id=' + e.currentTarget.dataset.id });
  },

  remove(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '移出书架',
      content: '确定把这本书移出书架？阅读进度与书签仍保留。',
      success: (r) => {
        if (r.confirm) {
          storage.removeFromShelf(id);
          this.load();
        }
      },
    });
  },

  goBooks() {
    wx.switchTab({ url: '/pages/books/books' });
  },
});
