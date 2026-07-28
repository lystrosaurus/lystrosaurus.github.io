/**
 * utils/storage.js — 本地持久化层。
 *
 * 负责：阅读设置 / 个人书架 / 阅读进度 / 书签 / 同步状态。
 * 所有键以 mp_ 前缀避免与缓存数据冲突。书签与进度以 bookId 为维度存储，
 * 保证「阅读进度记忆」「书签功能」「个人书架」在重开小程序后仍保留。
 */

const KEY = {
  settings: 'mp_settings',
  shelf: 'mp_shelf',
  progress: 'mp_progress',
  bookmarks: 'mp_bookmarks',
  lastSync: 'mp_last_sync',
};

const DEFAULT_SETTINGS = {
  fontSize: 17, // px，阅读字号
  lineHeight: 1.85,
  theme: 'dark', // dark | light
};

function read(key, fallback) {
  try {
    const v = wx.getStorageSync(key);
    return v === '' || v === undefined || v === null ? fallback : v;
  } catch (e) {
    return fallback;
  }
}

function write(key, val) {
  try {
    wx.setStorageSync(key, val);
  } catch (e) {}
}

/* ---------- 阅读设置 ---------- */
function getSettings() {
  return Object.assign({}, DEFAULT_SETTINGS, read(KEY.settings, {}));
}
function saveSettings(patch) {
  const merged = Object.assign({}, getSettings(), patch);
  write(KEY.settings, merged);
  return merged;
}

/* ---------- 个人书架 ---------- */
function getShelf() {
  return read(KEY.shelf, []);
}
function isInShelf(id) {
  return getShelf().indexOf(id) !== -1;
}
function addToShelf(id) {
  const s = getShelf();
  if (s.indexOf(id) === -1) {
    s.unshift(id); // 最新添加在最前
    write(KEY.shelf, s);
  }
  return s;
}
function removeFromShelf(id) {
  const s = getShelf().filter((x) => x !== id);
  write(KEY.shelf, s);
  return s;
}

/* ---------- 阅读进度（记忆） ---------- */
function getProgress(bookId) {
  const all = read(KEY.progress, {});
  return all[bookId] || null;
}
function saveProgress(bookId, patch) {
  const all = read(KEY.progress, {});
  all[bookId] = Object.assign({}, all[bookId], patch, { updatedAt: Date.now() });
  write(KEY.progress, all);
  return all[bookId];
}
function getAllProgress() {
  return read(KEY.progress, {});
}

/* ---------- 书签 ---------- */
function getBookmarks(bookId) {
  const all = read(KEY.bookmarks, {});
  return all[bookId] || [];
}
function setBookmarks(bookId, list) {
  const all = read(KEY.bookmarks, {});
  all[bookId] = list;
  write(KEY.bookmarks, all);
}
/**
 * 切换书签。bm = { key, title }，key 在书中唯一（如 'kp-基础-0'）。
 * @returns {boolean} 切换后是否处于已收藏状态
 */
function toggleBookmark(bookId, bm) {
  const list = getBookmarks(bookId);
  const idx = list.findIndex((b) => b.key === bm.key);
  let added;
  if (idx >= 0) {
    list.splice(idx, 1);
    added = false;
  } else {
    list.push(Object.assign({ addedAt: Date.now() }, bm));
    added = true;
  }
  setBookmarks(bookId, list);
  return added;
}

/* ---------- 同步状态 ---------- */
function setLastSync(info) {
  write(KEY.lastSync, info);
}
function getLastSync() {
  return read(KEY.lastSync, null);
}

module.exports = {
  getSettings,
  saveSettings,
  getShelf,
  isInShelf,
  addToShelf,
  removeFromShelf,
  getProgress,
  saveProgress,
  getAllProgress,
  getBookmarks,
  setBookmarks,
  toggleBookmark,
  setLastSync,
  getLastSync,
};
