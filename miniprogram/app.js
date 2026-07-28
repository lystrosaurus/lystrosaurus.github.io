/**
 * app.js — 小程序全局入口。
 *
 * 设计要点（与静态站点「单一真相源」保持一致）：
 *  - 启动时先同步加载本地兜底数据（miniprogram/data/books.local.json），保证首屏秒开；
 *  - 随后后台静默调用 utils/request.syncBooks() 拉取远程端点
 *    https://lystrosaurus.github.io/api/books.json（由站点的 books.ts 构建生成）；
 *  - 远端 syncToken 与本地缓存比对，仅在数据更新时刷新缓存，避免无效流量。
 *
 * 各页面在 onShow 读取 globalData 并触发 refreshData()，保证切后台同步后刷新。
 */
const { syncBooks } = require('./utils/request');

App({
  globalData: {
    books: [],
    categories: [],
    syntheses: [],
    meta: null,
    ready: false,
    _source: 'local', // remote | cache | local
  },

  onLaunch() {
    // 1) 本地兜底，首屏立即可见
    try {
      const local = require('./data/books.local.json');
      this.globalData.books = local.books || [];
      this.globalData.categories = local.categories || [];
      this.globalData.syntheses = local.syntheses || [];
      this.globalData.meta = local.meta || null;
    } catch (e) {
      console.warn('[app] 本地兜底数据加载失败', e);
    }
    // 2) 后台静默同步
    this.refreshData(false);
  },

  /**
   * 拉取并刷新数据。force=true 时忽略 token 比对，强制刷新（用于「我的」手动同步）。
   * @returns {Promise<{books,categories,syntheses,meta,source}>}
   */
  refreshData(force) {
    return syncBooks(force)
      .then((res) => {
        this.globalData.books = res.books || [];
        this.globalData.categories = res.categories || [];
        this.globalData.syntheses = res.syntheses || [];
        this.globalData.meta = res.meta || null;
        this.globalData.ready = true;
        this.globalData._source = res.source;
        const storage = require('./utils/storage');
        storage.setLastSync({ at: Date.now(), source: res.source });
        return res;
      })
      .catch((err) => {
        console.warn('[app] 同步失败，继续使用本地/缓存数据', err);
        return null;
      });
  },

  getBook(id) {
    return (this.globalData.books || []).find((b) => b.id === id);
  },

  getCategory(id) {
    return (this.globalData.categories || []).find((c) => c.id === id);
  },
});
