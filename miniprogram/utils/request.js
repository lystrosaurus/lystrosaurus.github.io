/**
 * utils/request.js — 统一数据层（同步桥）。
 *
 * 远程端点由静态站点的 scripts/gen-books-json.mjs 生成并托管在 GitHub Pages：
 *   https://lystrosaurus.github.io/api/books.json
 * 该端点的 syncToken 等于 books.ts 中 meta.generatedAt；小程序据此判断是否刷新。
 *
 * 读取优先级：远程(force 或 token 变化) → 本地缓存(storage) → 内置兜底(JSON)。
 * 全部走 Promise 化 wx.request，避免回调地狱。
 */

const REMOTE_URL = 'https://lystrosaurus.github.io/api/books.json';
const CACHE_KEY = 'mp_books_cache';
const local = require('../data/books.local.json');

/** Promise 化的 wx.request */
function wxRequest(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: options.header || { 'Content-Type': 'application/json' },
      timeout: options.timeout || 8000,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300 && res.data) {
          resolve(res.data);
        } else {
          reject(new Error('HTTP ' + res.statusCode));
        }
      },
      fail: reject,
    });
  });
}

function readCache() {
  try {
    return wx.getStorageSync(CACHE_KEY) || null;
  } catch (e) {
    return null;
  }
}

function writeCache(payload) {
  try {
    wx.setStorageSync(CACHE_KEY, payload);
  } catch (e) {}
}

/**
 * 拉取书籍数据。
 * @param {boolean} force 为 true 时忽略 token 比对，强制拉取远端
 * @returns {Promise<{books,categories,syntheses,meta,source,syncToken}>}
 */
function syncBooks(force) {
  const cache = readCache();

  return wxRequest({ url: REMOTE_URL })
    .then((data) => {
      const token = data && data.syncToken;
      // 非强制且 token 一致 → 复用缓存，仅刷新 cachedAt
      if (!force && cache && cache.syncToken === token && cache.books) {
        writeCache(Object.assign({}, cache, { cachedAt: Date.now() }));
        return Object.assign({}, data, { source: 'cache' });
      }
      writeCache({
        syncToken: token,
        books: data.books,
        categories: data.categories,
        syntheses: data.syntheses,
        meta: data.meta,
        cachedAt: Date.now(),
      });
      return Object.assign({}, data, { source: 'remote' });
    })
    .catch(() => {
      // 远端不可达：优先用本地缓存，其次内置兜底
      if (cache && cache.books) {
        return Object.assign({}, cache, { source: 'cache' });
      }
      return Object.assign({}, local, { source: 'local' });
    });
}

/** 直接返回内置兜底数据（用于无网络初始化） */
function localBooks() {
  return Object.assign({}, local, { source: 'local' });
}

module.exports = { syncBooks, localBooks, REMOTE_URL };
