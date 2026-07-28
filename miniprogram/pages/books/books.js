const app = getApp();

Page({
  data: {
    categories: [],
    filtered: [],
    activeCat: '',
    activeStatus: '',
    keyword: '',
    resultCount: 0,
    stats: { total: 0, extracted: 0, pending: 0 },
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    app
      .refreshData(true)
      .then(() => this.loadData())
      .finally(() => wx.stopPullDownRefresh());
  },

  loadData() {
    const books = app.globalData.books || [];
    const categories = app.globalData.categories || [];
    const catMap = {};
    categories.forEach((c) => (catMap[c.id] = c));

    const decorated = books.map((b) => Object.assign({}, b, { category: catMap[b.category] }));
    const extracted = books.filter((b) => b.extracted).length;

    this.setData({
      categories,
      books: decorated,
      stats: { total: books.length, extracted, pending: books.length - extracted },
    });
    this.applyFilter();
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value });
    this.applyFilter();
  },

  setCat(e) {
    this.setData({ activeCat: e.currentTarget.dataset.cat });
    this.applyFilter();
  },

  setStatus(e) {
    this.setData({ activeStatus: e.currentTarget.dataset.status });
    this.applyFilter();
  },

  applyFilter() {
    const { books, activeCat, activeStatus, keyword } = this.data;
    const kw = (keyword || '').trim().toLowerCase();

    const list = books.filter((b) => {
      const okCat = !activeCat || (b.category && b.category.id === activeCat);
      const okStatus =
        !activeStatus || (activeStatus === '1' ? b.extracted : !b.extracted);
      const okKw =
        !kw ||
        (b.title + b.author + b.summary).toLowerCase().indexOf(kw) !== -1;
      return okCat && okStatus && okKw;
    });

    this.setData({ filtered: list, resultCount: list.length });
  },

  onCardTap(e) {
    wx.navigateTo({ url: '/pages/book-detail/book-detail?id=' + e.detail.id });
  },
});
