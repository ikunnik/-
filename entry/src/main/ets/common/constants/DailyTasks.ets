/**
 * 日常低碳任务库（每日重置）。完成后领取积分奖励。
 * metric: times=按记录条数；amount=按行为数量合计。category 为空表示任意分类。
 */
import { TaskDef } from '../model/Models';
import { Category } from '../model/Models';

export const DAILY_TASKS: Array<TaskDef> = [
  new TaskDef('task_travel', '绿色出行', '今日记录 2 次绿色出行', '🚲', Category.TRAVEL, 2, 'times', 15),
  new TaskDef('task_energy', '节能小卫士', '今日完成 1 次节水节电', '💡', Category.ENERGY, 1, 'times', 10),
  new TaskDef('task_recycle', '回收好习惯', '今日完成 1 次旧物回收', '♻️', Category.RECYCLE, 1, 'times', 20),
  new TaskDef('task_food', '光盘惜粮', '今日记录 2 次光盘或绿色消费', '🍚', Category.FOOD, 2, 'times', 15),
  new TaskDef('task_checkin', '低碳打卡', '今日累计记录 3 条低碳行为', '✅', '', 3, 'times', 10)
];

export function getTaskById(id: string): TaskDef | null {
  for (let i = 0; i < DAILY_TASKS.length; i++) {
    if (DAILY_TASKS[i].id === id) {
      return DAILY_TASKS[i];
    }
  }
  return null;
}
