/**
 * 全局数据模型定义（ArkTS 严格模式，全部使用 class 显式类型）
 */
/** 低碳行为大类 */
export class Category {
    static readonly TRAVEL: string = 'travel'; // 绿色出行
    static readonly ENERGY: string = 'energy'; // 节水节电
    static readonly RECYCLE: string = 'recycle'; // 旧物回收
    static readonly FOOD: string = 'food'; // 光盘行动
}
/** 记录来源 */
export class RecordSource {
    static readonly MANUAL: string = 'manual'; // 手动录入
    static readonly AI: string = 'ai'; // AI 识图（拓展）
    static readonly FAMILY: string = 'family'; // 家庭终端同步（拓展）
}
/** 积分流水类型 */
export class PointType {
    static readonly EARN: string = 'earn'; // 获取
    static readonly EXCHANGE: string = 'exchange'; // 兑换消耗
}
/** 可配置的行为类型（碳排放因子库的一条定义） */
export class BehaviorType {
    id: string;
    name: string;
    category: string;
    unit: string; // 计量单位
    factor: number; // 每单位对应的减排量 kgCO2e
    icon: string; // 图标（emoji，便于单机渲染）
    hint: string; // 录入提示
    defaultAmount: number;
    step: number;
    constructor(id: string, name: string, category: string, unit: string, factor: number, icon: string, hint: string, defaultAmount: number = 1, step: number = 1) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.unit = unit;
        this.factor = factor;
        this.icon = icon;
        this.hint = hint;
        this.defaultAmount = defaultAmount;
        this.step = step;
    }
}
/** 一条低碳行为记录 */
export class CarbonRecord {
    id: number;
    category: string;
    behaviorId: string;
    behaviorName: string;
    icon: string;
    amount: number;
    unit: string;
    reduction: number; // 减排量 kgCO2e
    points: number; // 获得积分
    date: number; // 时间戳（毫秒）
    dateStr: string; // yyyy-MM-dd
    note: string;
    source: string;
    constructor(id: number, category: string, behaviorId: string, behaviorName: string, icon: string, amount: number, unit: string, reduction: number, points: number, date: number, dateStr: string, note: string, source: string) {
        this.id = id;
        this.category = category;
        this.behaviorId = behaviorId;
        this.behaviorName = behaviorName;
        this.icon = icon;
        this.amount = amount;
        this.unit = unit;
        this.reduction = reduction;
        this.points = points;
        this.date = date;
        this.dateStr = dateStr;
        this.note = note;
        this.source = source;
    }
}
/** 积分流水 */
export class PointRecord {
    id: number;
    type: string;
    amount: number; // 正数为获取，兑换时为负数
    balance: number; // 变动后余额
    reason: string;
    date: number;
    dateStr: string;
    constructor(id: number, type: string, amount: number, balance: number, reason: string, date: number, dateStr: string) {
        this.id = id;
        this.type = type;
        this.amount = amount;
        this.balance = balance;
        this.reason = reason;
        this.date = date;
        this.dateStr = dateStr;
    }
}
/** 日常任务定义 */
export class TaskDef {
    id: string;
    name: string;
    desc: string;
    icon: string;
    category: string; // 关联分类，空字符串表示任意
    goal: number; // 目标次数/数量
    metric: string; // times=按次数，amount=按数量
    points: number; // 完成奖励积分
    daily: boolean; // 是否每日任务
    constructor(id: string, name: string, desc: string, icon: string, category: string, goal: number, metric: string, points: number, daily: boolean = true) {
        this.id = id;
        this.name = name;
        this.desc = desc;
        this.icon = icon;
        this.category = category;
        this.goal = goal;
        this.metric = metric;
        this.points = points;
        this.daily = daily;
    }
}
/** 任务完成记录（某天某任务） */
export class TaskRecord {
    id: number;
    taskId: string;
    dateStr: string;
    progress: number;
    claimed: boolean;
    constructor(id: number, taskId: string, dateStr: string, progress: number, claimed: boolean) {
        this.id = id;
        this.taskId = taskId;
        this.dateStr = dateStr;
        this.progress = progress;
        this.claimed = claimed;
    }
}
/** 徽章定义 */
export class BadgeDef {
    id: string;
    name: string;
    desc: string;
    icon: string;
    metric: string; // reduction=累计减排，count=记录次数，days=连续天数，categoryCount=某分类次数
    category: string; // metric 为 categoryCount 时使用
    threshold: number;
    constructor(id: string, name: string, desc: string, icon: string, metric: string, threshold: number, category: string = '') {
        this.id = id;
        this.name = name;
        this.desc = desc;
        this.icon = icon;
        this.metric = metric;
        this.category = category;
        this.threshold = threshold;
    }
}
/** 用户已解锁徽章 */
export class UserBadge {
    id: number;
    badgeId: string;
    date: number;
    dateStr: string;
    constructor(id: number, badgeId: string, date: number, dateStr: string) {
        this.id = id;
        this.badgeId = badgeId;
        this.date = date;
        this.dateStr = dateStr;
    }
}
/** 植树证书 */
export class Certificate {
    id: number;
    code: string; // 证书编号
    treeCount: number;
    points: number; // 消耗积分
    date: number;
    dateStr: string;
    owner: string;
    constructor(id: number, code: string, treeCount: number, points: number, date: number, dateStr: string, owner: string) {
        this.id = id;
        this.code = code;
        this.treeCount = treeCount;
        this.points = points;
        this.date = date;
        this.dateStr = dateStr;
        this.owner = owner;
    }
}
/** 科普文章 */
export class ScienceArticle {
    id: string;
    title: string;
    category: string;
    icon: string;
    summary: string;
    content: string; // 以 \n 分段的正文
    constructor(id: string, title: string, category: string, icon: string, summary: string, content: string) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.icon = icon;
        this.summary = summary;
        this.content = content;
    }
}
/** 分类汇总统计 */
export class CategoryStat {
    category: string;
    reduction: number;
    count: number;
    points: number;
    constructor(category: string, reduction: number, count: number, points: number) {
        this.category = category;
        this.reduction = reduction;
        this.count = count;
        this.points = points;
    }
}
/** 趋势数据点 */
export class TrendPoint {
    label: string;
    value: number;
    date: number;
    constructor(label: string, value: number, date: number) {
        this.label = label;
        this.value = value;
        this.date = date;
    }
}
/** 首页总览数据 */
export class OverviewData {
    totalReduction: number;
    totalPoints: number;
    todayReduction: number;
    todayCount: number;
    recordCount: number;
    recordDays: number;
    treeCount: number;
    badgeCount: number;
    streakDays: number;
    constructor() {
        this.totalReduction = 0;
        this.totalPoints = 0;
        this.todayReduction = 0;
        this.todayCount = 0;
        this.recordCount = 0;
        this.recordDays = 0;
        this.treeCount = 0;
        this.badgeCount = 0;
        this.streakDays = 0;
    }
}
/** 家庭成员（超级终端发现的家人设备，本人为当前设备、不入此表） */
export class FamilyMember {
    id: number;
    name: string;
    avatar: string;
    role: string; // 爸爸/妈妈/儿子/女儿/家人
    device: string; // 模拟设备名称
    online: boolean;
    created: number;
    constructor(id: number, name: string, avatar: string, role: string, device: string, online: boolean, created: number) {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.role = role;
        this.device = device;
        this.online = online;
        this.created = created;
    }
}
/** 家庭成员（含本人）减排汇总，用于家庭排行 */
export class MemberTotal {
    memberId: number; // 0 表示本人（当前设备）
    name: string;
    avatar: string;
    isSelf: boolean;
    reduction: number;
    points: number;
    count: number;
    constructor(memberId: number, name: string, avatar: string, isSelf: boolean, reduction: number, points: number, count: number) {
        this.memberId = memberId;
        this.name = name;
        this.avatar = avatar;
        this.isSelf = isSelf;
        this.reduction = reduction;
        this.points = points;
        this.count = count;
    }
}
/** 城市碳普惠平台权益兑换订单 */
export class BenefitOrder {
    id: number;
    benefitId: string;
    name: string;
    icon: string;
    points: number;
    code: string;
    date: number;
    dateStr: string;
    constructor(id: number, benefitId: string, name: string, icon: string, points: number, code: string, date: number, dateStr: string) {
        this.id = id;
        this.benefitId = benefitId;
        this.name = name;
        this.icon = icon;
        this.points = points;
        this.code = code;
        this.date = date;
        this.dateStr = dateStr;
    }
}
