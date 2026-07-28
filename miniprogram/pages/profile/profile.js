const app = getApp();
const storage = require('../../utils/storage');
const { formatDateTime } = require('../../utils/format');

Page({
  data: {
    fontSize: 17,
    theme: 'dark',
    bookCount: 0,
    lastSync: null,
    sourceText: '',
  },

  onShow() {
    this.load();
  },

  load() {
    const s = storage.getSettings();
    const ls = storage.getLastSync();
    const sourceMap = { remote: '远程已更新', cache: '本地缓存', local: '内置兜底' };
    this.setData({
      fontSize: s.fontSize,
      theme: s.theme,
      bookCount: (app.globalData.books || []).length,
      lastSync: ls ? formatDateTime(ls.at) : '尚未同步',
      sourceText: ls ? sourceMap[ls.source] || ls.source : '—',
    });
  },

  changeFont(delta) {
    let fs = this.data.fontSize + delta;
    fs = Math.max(14, Math.min(24, fs));
    storage.saveSettings({ fontSize: fs });
    this.setData({ fontSize: fs });
  },

  toggleTheme() {
    const t = this.data.theme === 'dark' ? 'light' : 'dark';
    storage.saveSettings({ theme: t });
    this.setData({ theme: t });
    wx.showToast({ title: t === 'dark' ? '暗色' : '浅色', icon: 'none' });
  },

  syncNow() {
    wx.showLoading({ title: '同步中' });
    app
      .refreshData(true)
      .then((res) => {
        storage.setLastSync({ at: Date.now(), source: res ? res.source : 'local' });
        this.load();
        wx.hideLoading();
        if (res && res.source === 'remote') {
          wx.showToast({ title: '已更新数据', icon: 'none' });
        } else {
          wx.showToast({ title: '已是最新', icon: 'none' });
        }
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '同步失败（本地兜底）', icon: 'none' });
      });
  },

  clearCache() {
    wx.showModal({
      title: '清除本地数据',
      content: '将清除书架、阅读进度、书签与缓存，且不可恢复。确定继续？',
      success: (r) => {
        if (r.confirm) {
          wx.clearStorageSync();
          this.load();
          wx.showToast({ title: '已清除', icon: 'none' });
        }
      },
    });
  },
});
