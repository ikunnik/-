/**
 * 减排量与积分计算、数值格式化
 */
import { PointRule } from '../constants/AppConstants';

export function roundTo(n: number, digits: number): number {
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}

/** 减排量 = 数量 × 因子，保留 3 位小数 */
export function calcReduction(factor: number, amount: number): number {
  return roundTo(factor * amount, 3);
}

/**
 * 积分 = 减排量 × 每千克积分。
 * 最低 1 分：单次记录即使减排量很小（如节水 50 升仅 0.045kg），
 * 也应给予正反馈，否则用户会误以为"没有记录成功"，影响打卡连续性。
 */
export function calcPoints(reduction: number): number {
  const p = Math.round(reduction * PointRule.POINTS_PER_KG);
  return reduction > 0 && p < 1 ? 1 : p;
}

/** 友好展示重量：kg / t */
export function formatWeight(n: number): string {
  if (n >= 1000) {
    return (n / 1000).toFixed(2) + ' t';
  }
  if (n >= 10) {
    return n.toFixed(1) + ' kg';
  }
  return n.toFixed(2) + ' kg';
}

/** 保留指定位数的小数字符串 */
export function fixed(n: number, digits: number): string {
  return n.toFixed(digits);
}
