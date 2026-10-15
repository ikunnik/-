import { Category } from "@normalized:N&&&entry/src/main/ets/common/model/Models&";
/** 分类元数据 */
export class CategoryMeta {
    key: string;
    name: string;
    icon: string;
    color: string;
    desc: string;
    constructor(key: string, name: string, icon: string, color: string, desc: string) {
        this.key = key;
        this.name = name;
        this.icon = icon;
        this.color = color;
        this.desc = desc;
    }
}
export const CATEGORY_META: Array<CategoryMeta> = [
    new CategoryMeta(Category.TRAVEL, '绿色出行', '🚲', '#2E9E6B', '步行、骑行、公共交通替代燃油车出行'),
    new CategoryMeta(Category.ENERGY, '节水节电', '💡', '#3B82F6', '节约用电、用水、用气，减少能源消耗'),
    new CategoryMeta(Category.RECYCLE, '旧物回收', '♻️', '#D97706', '垃圾分类回收、旧物捐赠与循环利用'),
    new CategoryMeta(Category.FOOD, '光盘行动', '🍚', '#16A34A', '光盘惜粮、减少一次性用品、绿色餐饮')
];
export function getCategoryMeta(key: string): CategoryMeta {
    for (let i = 0; i < CATEGORY_META.length; i++) {
        if (CATEGORY_META[i].key === key) {
            return CATEGORY_META[i];
        }
    }
    return CATEGORY_META[0];
}
/** 积分与激励规则 */
export class PointRule {
    static readonly POINTS_PER_KG: number = 10; // 每减排 1 kgCO2e 获得 10 积分
    static readonly POINTS_PER_TREE: number = 200; // 兑换 1 棵植树证书所需积分
    static readonly FIRST_RECORD_POINTS: number = 20; // 首次记录奖励
}
/** 图表时间维度 */
export class RangeType {
    static readonly DAY: string = 'day'; // 近 7 日（按天）
    static readonly WEEK: string = 'week'; // 近 8 周（按周）
    static readonly MONTH: string = 'month'; // 近 6 月（按月）
    static readonly YEAR: string = 'year'; // 近 12 月（按年/月）
}
export function getRangeName(range: string): string {
    if (range === RangeType.DAY) {
        return '日';
    }
    else if (range === RangeType.WEEK) {
        return '周';
    }
    else if (range === RangeType.MONTH) {
        return '月';
    }
    else {
        return '年';
    }
}
/** 主题色板 */
export class Theme {
    static readonly PRIMARY: string = '#2E9E6B';
    static readonly PRIMARY_LIGHT: string = '#E6F6EE';
    static readonly BG: string = '#F4F7F5';
    static readonly CARD: string = '#FFFFFF';
    static readonly TEXT_MAIN: string = '#1F2937';
    static readonly TEXT_SUB: string = '#6B7280';
    static readonly DIVIDER: string = '#EEF1EF';
    static readonly WARN: string = '#F59E0B';
    static readonly DANGER: string = '#EF4444';
    static readonly CHART_COLORS: Array<string> = ['#2E9E6B', '#3B82F6', '#D97706', '#16A34A', '#8B5CF6', '#EC4899'];
}
/** 数据库常量 */
export class DbConst {
    static readonly DB_NAME: string = 'carbon_footprint.db';
    static readonly TABLE_RECORD: string = 'carbon_records';
    static readonly TABLE_POINT: string = 'point_records';
    static readonly TABLE_TASK: string = 'task_records';
    static readonly TABLE_BADGE: string = 'user_badges';
    static readonly TABLE_CERT: string = 'certificates';
    static readonly TABLE_META: string = 'meta';
    static readonly TABLE_FAMILY_MEMBER: string = 'family_members';
    static readonly TABLE_FAMILY_REDUCTION: string = 'family_reduction';
    static readonly TABLE_BENEFIT_ORDER: string = 'benefit_orders';
}
/** 跨页面刷新通知（AppStorage 键） */
export class StoreKey {
    static readonly DATA_CHANGED: string = 'data_changed';
}
