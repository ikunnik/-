/**
 * 虚拟低碳徽章库。达成条件后自动解锁。
 * metric:
 *  reduction     累计减排量(kg)
 *  count         累计记录条数
 *  days          连续打卡天数
 *  categoryCount 某分类累计记录条数
 *  tree          累计兑换植树证书棵数
 */
import { BadgeDef } from '../model/Models';
import { Category } from '../model/Models';

export const BADGES: Array<BadgeDef> = [
  new BadgeDef('badge_first', '初次行动', '记录第 1 条低碳行为', '🌱', 'count', 1),
  new BadgeDef('badge_sprout', '绿色新星', '累计减排达到 10 kg', '🌿', 'reduction', 10),
  new BadgeDef('badge_lowcarbon', '低碳达人', '累计减排达到 100 kg', '🍃', 'reduction', 100),
  new BadgeDef('badge_pioneer', '减排先锋', '累计减排达到 500 kg', '🏅', 'reduction', 500),
  new BadgeDef('badge_guardian', '碳中和卫士', '累计减排达到 1000 kg', '🏆', 'reduction', 1000),
  new BadgeDef('badge_streak7', '坚持一周', '连续 7 天记录低碳行为', '🔥', 'days', 7),
  new BadgeDef('badge_travel', '绿色出行家', '绿色出行累计 50 次', '🚲', 'categoryCount', 50, Category.TRAVEL),
  new BadgeDef('badge_recycle', '回收能手', '旧物回收累计 20 次', '♻️', 'categoryCount', 20, Category.RECYCLE),
  new BadgeDef('badge_food', '光盘达人', '光盘绿色消费累计 30 次', '🍚', 'categoryCount', 30, Category.FOOD),
  new BadgeDef('badge_tree', '植树达人', '累计兑换 5 棵植树证书', '🌳', 'tree', 5)
];

export function getBadgeById(id: string): BadgeDef | null {
  for (let i = 0; i < BADGES.length; i++) {
    if (BADGES[i].id === id) {
      return BADGES[i];
    }
  }
  return null;
}
