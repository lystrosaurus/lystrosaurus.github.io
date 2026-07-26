/**
 * garden-levels.mjs — 知识点级别排序常量（被 serialize / runner 共享）。
 */

/** 知识点级别固定顺序：基础 → 进阶 → 心法。 */
export const LEVEL_ORDER = ['基础', '进阶', '心法'];

/**
 * 比较两个知识点按级别排序。
 * @param {{ level: string }} a
 * @param {{ level: string }} b
 * @returns {number}
 */
export function compareLevel(a, b) {
  return LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level);
}
