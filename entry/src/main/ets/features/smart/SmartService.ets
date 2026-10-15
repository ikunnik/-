/**
 * 拓展功能 4：智能服务 · 个性化任务推荐 / 生活建议 / 通知推送 / 社交分享
 * ----------------------------------------------------------------
 * - 个性化推荐与建议：纯本地规则，基于近 7 天分类减排统计，无需联网。
 * - 通知推送：@kit.NotificationKit 本地通知（真实下发，无需服务端）。
 * - 社交分享：系统分享面板（Want ACTION_SEND_TO_DATA，分享文本），
 *   并提供"复制文案"兜底（@kit.BasicServicesKit pasteboard）。
 * - 定时提醒：真机可用 @kit.BackgroundTasksKit 的 reminderAgentManager 发布日历式
 *   周期提醒（如每日 20:00），见本文件 scheduleDailyReminder 注释。
 */
import { notificationManager } from '@kit.NotificationKit';
import { common, Want, wantConstant } from '@kit.AbilityKit';
import { pasteboard } from '@kit.BasicServicesKit';
import { CategoryStat, OverviewData } from '../../common/model/Models';

/** 一条个性化建议 */
export class SmartTip {
  id: string;
  icon: string;
  title: string;
  content: string;

  constructor(id: string, icon: string, title: string, content: string) {
    this.id = id;
    this.icon = icon;
    this.title = title;
    this.content = content;
  }
}

/** 今日个性化重点任务 */
export class FocusTask {
  category: string;
  taskId: string;
  icon: string;
  title: string;
  desc: string;

  constructor(category: string, taskId: string, icon: string, title: string, desc: string) {
    this.category = category;
    this.taskId = taskId;
    this.icon = icon;
    this.title = title;
    this.desc = desc;
  }
}

/** 建议生成所需的分类减排快照 */
export class CategorySnapshot {
  category: string;
  reduction: number;

  constructor(category: string, reduction: number) {
    this.category = category;
    this.reduction = reduction;
  }
}

export class SmartService {
  /** 功能已上线 */
  static readonly ENABLED: boolean = true;
  /** 本地通知 ID（固定，重复发布覆盖） */
  static readonly NOTIFY_ID: number = 1001;

  /** 基于近 7 天各分类减排，推荐"最薄弱分类"作为今日重点任务 */
  buildFocus(stats: Array<CategoryStat>): FocusTask {
    let minCat = '';
    let minVal = -1;
    let allZero = true;
    for (let i = 0; i < stats.length; i++) {
      if (stats[i].reduction > 0) {
        allZero = false;
      }
      if (minVal < 0 || stats[i].reduction < minVal) {
        minVal = stats[i].reduction;
        minCat = stats[i].category;
      }
    }
    if (allZero) {
      return new FocusTask('travel', 'task_travel', '🚲', '今日重点：绿色出行',
        '新的一天，先从步行、骑行或公交开始，记录 2 次绿色出行即可领取积分。');
    }
    if (minCat === 'travel') {
      return new FocusTask('travel', 'task_travel', '🚲', '今日重点：多绿色出行',
        '你最近的绿色出行减排偏少，试试短途步行或骑行、通勤乘公交地铁。');
    } else if (minCat === 'energy') {
      return new FocusTask('energy', 'task_energy', '💡', '今日重点：节约用电',
        '节水节电还有提升空间，随手关灯、空调调高 1℃、拔掉待机插头。');
    } else if (minCat === 'recycle') {
      return new FocusTask('recycle', 'task_recycle', '♻️', '今日重点：旧物回收',
        '记得把纸箱、塑料瓶、旧衣物分类回收，闲置物品优先转赠。');
    }
    return new FocusTask('food', 'task_food', '🍚', '今日重点：光盘行动',
      '适量点餐、按需取餐，自带水杯购物袋，减少食物浪费与一次性用品。');
  }

  /**
   * 基于各分类减排快照生成个性化建议（纯本地规则）。
   * 找到减排量最低的分类给针对性建议，并补充坚持打卡建议。
   */
  buildTips(snapshot: Array<CategorySnapshot>): Array<SmartTip> {
    const tips: Array<SmartTip> = [];
    const adviceMap: Map<string, SmartTip> = new Map<string, SmartTip>();
    adviceMap.set('travel', new SmartTip('t1', '🚲', '多绿色出行', '试试短途步行或骑行，通勤选公交地铁，每公里都能减碳。'));
    adviceMap.set('energy', new SmartTip('t2', '💡', '节约用电', '随手关灯、空调调高 1℃，使用节能家电，减少待机能耗。'));
    adviceMap.set('recycle', new SmartTip('t3', '♻️', '旧物回收', '纸箱、塑料瓶、旧衣物记得分类回收，闲置物品优先转赠。'));
    adviceMap.set('food', new SmartTip('t4', '🍚', '光盘行动', '适量点餐、按需取餐，减少食物浪费就是低碳。'));

    let minCat = '';
    let minVal = -1;
    for (let i = 0; i < snapshot.length; i++) {
      if (minVal < 0 || snapshot[i].reduction < minVal) {
        minVal = snapshot[i].reduction;
        minCat = snapshot[i].category;
      }
    }
    if (minCat !== '' && adviceMap.has(minCat)) {
      const weak = adviceMap.get(minCat);
      if (weak !== undefined) {
        tips.push(weak);
      }
    }
    tips.push(new SmartTip('t5', '🎯', '坚持每日打卡', '连续完成今日低碳任务，可获得更多积分与徽章。'));
    tips.push(new SmartTip('t6', '🌳', '积分变树木', '每 200 积分可兑换 1 棵植树证书，让减排看得见。'));
    return tips;
  }

  /** 生成可分享的减排成果文案 */
  buildShareText(ov: OverviewData): string {
    return '🌱 我的低碳成绩单\n' +
      '我在「碳足迹」已累计减排 ' + ov.totalReduction.toFixed(2) + ' kg CO₂e，' +
      '累计 ' + ov.recordCount + ' 条低碳记录、坚持打卡 ' + ov.streakDays + ' 天；\n' +
      '共获得 ' + ov.totalPoints + ' 碳积分、' + ov.badgeCount + ' 枚低碳徽章，' +
      '认种 ' + ov.treeCount + ' 棵树。\n' +
      '低碳生活，从我做起，一起来记录你的绿色日常吧！🌍';
  }

  /** 发布一条本地通知（真实下发）；返回是否成功 */
  async pushLocalNotification(title: string, text: string): Promise<boolean> {
    try {
      const req: notificationManager.NotificationRequest = {
        id: SmartService.NOTIFY_ID,
        content: {
          notificationContentType: notificationManager.ContentType.NOTIFICATION_CONTENT_BASIC_TEXT,
          normal: {
            title: title,
            text: text,
            additionalText: '碳足迹'
          }
        }
      };
      await notificationManager.publish(req);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * 真机定时提醒（示例，需要 @kit.BackgroundTasksKit）：
   *   import { reminderAgentManager } from '@kit.BackgroundTasksKit';
   *   const reminder = {
   *     reminderType: reminderAgentManager.ReminderType.REMINDER_TYPE_DAILY,
   *     hour: 20, minute: 0,
   *     title: '低碳打卡提醒', content: '今天还没记录低碳行为，快来打卡吧～'
   *   } as reminderAgentManager.ReminderRequest;
   *   await reminderAgentManager.publishReminder(reminder);
   */

  /** 调起系统分享面板分享文本；返回是否成功调起 */
  /** 调起系统分享面板分享文本（Stage 模型 ACTION_SEND_TO_DATA）；返回是否成功调起 */
  async shareText(ctx: common.UIAbilityContext, text: string): Promise<boolean> {
    try {
      const want: Want = {
        action: wantConstant.Action.ACTION_SEND_TO_DATA,
        type: 'text/plain',
        parameters: {
          'title': '分享我的低碳成果',
          'content': text,
          'summary': text
        }
      };
      await ctx.startAbility(want);
      return true;
    } catch (e) {
      return false;
    }
  }

  /** 复制文案到剪贴板（分享兜底） */
  async copyText(text: string): Promise<boolean> {
    try {
      const pb = pasteboard.getSystemPasteboard();
      const data = pasteboard.createData(pasteboard.MIMETYPE_TEXT_PLAIN, text);
      await pb.setData(data);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const smartService: SmartService = new SmartService();
