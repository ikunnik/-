import type relationalStore from "@ohos:data.relationalStore";
import { getStore } from "@normalized:N&&&entry/src/main/ets/data/db/CarbonDb&";
import { dbExecute, dbInsert, dbQuery, rsClose, rsDouble, rsGoToFirstRow, rsGoToNextRow, rsLong, rsString } from "@normalized:N&&&entry/src/main/ets/data/db/DbSafe&";
import { DbConst, CATEGORY_META } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import { Category, CategoryStat, FamilyMember, MemberTotal } from "@normalized:N&&&entry/src/main/ets/common/model/Models&";
import { formatDate } from "@normalized:N&&&entry/src/main/ets/common/utils/DateUtil&";
import { calcPoints, roundTo } from "@normalized:N&&&entry/src/main/ets/common/utils/CalcUtil&";
import { pointsRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/PointsRepository&";
/** meta 表键：启动自动同步开关 */
const META_AUTO_SYNC: string = 'family_auto_sync';
/** meta 表键：上次同步时间戳 */
const META_LAST_SYNC: string = 'family_last_sync';
/** 生成的一条家庭成员每日分类减排数据 */
class GenData {
    reduction: number;
    points: number;
    cnt: number;
    constructor(reduction: number, points: number, cnt: number) {
        this.reduction = reduction;
        this.points = points;
        this.cnt = cnt;
    }
}
/** 字符串稳定哈希 → [0,1)，保证同一成员同一天的数据不会每次同步都变化 */
function hash01(s: string): number {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 10000) / 10000;
}
/** 各分类每日减排量的合理区间（kgCO2e） */
function categoryRange(cat: string): Array<number> {
    if (cat === Category.TRAVEL) {
        return [2, 12];
    }
    else if (cat === Category.ENERGY) {
        return [0.5, 5];
    }
    else if (cat === Category.RECYCLE) {
        return [0.5, 9];
    }
    return [0.4, 3.2];
}
/** 按家庭成员角色给出不同低碳行为偏好（出现概率） */
function roleProbability(role: string, cat: string): number {
    if (role === '爸爸') {
        return cat === Category.TRAVEL ? 0.92 : (cat === Category.RECYCLE ? 0.4 : 0.6);
    }
    else if (role === '妈妈') {
        return cat === Category.FOOD ? 0.92 : (cat === Category.RECYCLE ? 0.78 : 0.62);
    }
    else if (role === '孩子') {
        return cat === Category.ENERGY ? 0.86 : (cat === Category.FOOD ? 0.82 : 0.5);
    }
    return 0.6;
}
function mapMember(rs: relationalStore.ResultSet): FamilyMember {
    return new FamilyMember(rsLong(rs, 'id'), rsString(rs, 'name'), rsString(rs, 'avatar'), rsString(rs, 'role'), rsString(rs, 'device'), rsLong(rs, 'online') === 1, rsLong(rs, 'created'));
}
export class FamilyRepository {
    /** 读取 meta 值 */
    private async getMeta(key: string, defVal: string): Promise<string> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT value FROM ${DbConst.TABLE_META} WHERE key = ?`, [key]);
        let val: string = defVal;
        if (rsGoToFirstRow(rs)) {
            val = rsString(rs, 'value');
        }
        rsClose(rs);
        return val;
    }
    /** 写入 meta 值（upsert） */
    private async setMeta(key: string, value: string): Promise<void> {
        const store = getStore();
        await dbExecute(store, `INSERT INTO ${DbConst.TABLE_META}(key, value) VALUES(?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`, [key, value]);
    }
    /** 计算某成员某天某分类的减排数据；按角色概率返回 null 表示当天无该类活动 */
    private computeGen(memberId: number, role: string, ds: string, cat: string): GenData | null {
        const appear = hash01(memberId + '|' + ds + '|' + cat + '|appear');
        if (appear > roleProbability(role, cat)) {
            return null;
        }
        const range = categoryRange(cat);
        const amt = hash01(memberId + '|' + ds + '|' + cat + '|amount');
        const reduction = roundTo(range[0] + amt * (range[1] - range[0]), 2);
        const cnt = 1 + Math.floor(hash01(memberId + '|' + ds + '|' + cat + '|cnt') * 3);
        return new GenData(reduction, calcPoints(reduction), cnt);
    }
    /** 为某成员生成近 days 天的减排摘要（INSERT OR IGNORE，重复同步不重复累计） */
    private async generateForMember(member: FamilyMember, days: number): Promise<void> {
        const store = getStore();
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const ds = formatDate(d);
            for (let c = 0; c < CATEGORY_META.length; c++) {
                const cat = CATEGORY_META[c].key;
                const g = this.computeGen(member.id, member.role, ds, cat);
                if (g !== null) {
                    await dbExecute(store, `INSERT OR IGNORE INTO ${DbConst.TABLE_FAMILY_REDUCTION}
             (member_id, date_str, category, reduction, points, cnt) VALUES(?, ?, ?, ?, ?, ?)`, [member.id, ds, cat, g.reduction, g.points, g.cnt]);
                }
            }
        }
    }
    async getMembers(): Promise<Array<FamilyMember>> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT * FROM ${DbConst.TABLE_FAMILY_MEMBER} ORDER BY id ASC`);
        const list: Array<FamilyMember> = [];
        while (rsGoToNextRow(rs)) {
            list.push(mapMember(rs));
        }
        rsClose(rs);
        return list;
    }
    /** 首次进入家庭空间时预置示例家人设备（演示开箱即用） */
    async ensureSeed(): Promise<void> {
        const members = await this.getMembers();
        if (members.length > 0) {
            return;
        }
        await this.addMember('爸爸', '👨', '爸爸', 'HUAWEI Mate 手机');
        await this.addMember('妈妈', '👩', '妈妈', 'HUAWEI MatePad 平板');
        await this.addMember('孩子', '👧', '孩子', 'HUAWEI WATCH 手表');
    }
    /** 添加一个家庭成员并立即生成其近 7 天模拟数据 */
    async addMember(name: string, avatar: string, role: string, device: string): Promise<number> {
        const store = getStore();
        const values: relationalStore.ValuesBucket = {
            'name': name,
            'avatar': avatar,
            'role': role,
            'device': device,
            'online': 1,
            'created': Date.now()
        };
        const id = await dbInsert(store, DbConst.TABLE_FAMILY_MEMBER, values);
        const member = new FamilyMember(id, name, avatar, role, device, true, Date.now());
        await this.generateForMember(member, 7);
        return id;
    }
    async removeMember(id: number): Promise<void> {
        const store = getStore();
        await dbExecute(store, `DELETE FROM ${DbConst.TABLE_FAMILY_REDUCTION} WHERE member_id = ?`, [id]);
        await dbExecute(store, `DELETE FROM ${DbConst.TABLE_FAMILY_MEMBER} WHERE id = ?`, [id]);
    }
    /**
     * 模拟超级终端：发现并连接家人设备（全部置为在线），
     * 并同步每位成员"今天"的减排数据（当天已同步则不重复）。
     * 真机替换：deviceManager.startDeviceDiscovery + distributedKVStore.put/onChange。
     * @return 本次已连接并同步的成员数
     */
    async discoverAndSync(): Promise<number> {
        await this.ensureSeed();
        const store = getStore();
        const members = await this.getMembers();
        for (let i = 0; i < members.length; i++) {
            const m = members[i];
            await dbExecute(store, `UPDATE ${DbConst.TABLE_FAMILY_MEMBER} SET online = 1 WHERE id = ?`, [m.id]);
            await this.generateForMember(m, 1);
        }
        await this.setMeta(META_LAST_SYNC, String(Date.now()));
        return members.length;
    }
    // ============ 自动同步开关与时间 ============
    /** 是否开启启动自动同步（默认开启） */
    async isAutoSyncEnabled(): Promise<boolean> {
        const v = await this.getMeta(META_AUTO_SYNC, '1');
        return v !== '0';
    }
    async setAutoSyncEnabled(enabled: boolean): Promise<void> {
        await this.setMeta(META_AUTO_SYNC, enabled ? '1' : '0');
    }
    /** 上次同步时间戳，0 表示从未同步 */
    async getLastSyncTime(): Promise<number> {
        const v = await this.getMeta(META_LAST_SYNC, '0');
        const n = parseInt(v, 10);
        return isNaN(n) ? 0 : n;
    }
    /**
     * 启动自动同步：仅在开关开启时执行。
     * @return 实际同步的成员数；未开启返回 -1
     */
    async autoSyncOnLaunch(): Promise<number> {
        const enabled = await this.isAutoSyncEnabled();
        if (!enabled) {
            return -1;
        }
        return await this.discoverAndSync();
    }
    /** 本人（当前设备）各分类减排统计 */
    private async querySelfByCategory(): Promise<Map<string, CategoryStat>> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT category, COALESCE(SUM(reduction),0) AS reduction, COUNT(*) AS cnt,
              COALESCE(SUM(points),0) AS pts
       FROM ${DbConst.TABLE_RECORD} GROUP BY category`);
        const map = new Map<string, CategoryStat>();
        while (rsGoToNextRow(rs)) {
            const cat = rsString(rs, 'category');
            map.set(cat, new CategoryStat(cat, roundTo(rsDouble(rs, 'reduction'), 3), rsLong(rs, 'cnt'), rsLong(rs, 'pts')));
        }
        rsClose(rs);
        return map;
    }
    /** 家庭成员（含本人）减排排行，本人固定置顶 */
    async getMemberTotals(): Promise<Array<MemberTotal>> {
        const store = getStore();
        const list: Array<MemberTotal> = [];
        // 本人（当前设备，memberId=0）
        const rsSelf = await dbQuery(store, `SELECT COALESCE(SUM(reduction),0) AS r, COALESCE(SUM(points),0) AS p,
              COUNT(*) AS c FROM ${DbConst.TABLE_RECORD}`);
        const ownerName = await pointsRepo.getOwnerName();
        if (rsGoToFirstRow(rsSelf)) {
            list.push(new MemberTotal(0, ownerName + '（我）', '🌱', true, roundTo(rsDouble(rsSelf, 'r'), 2), rsLong(rsSelf, 'p'), rsLong(rsSelf, 'c')));
        }
        rsClose(rsSelf);
        // 家人
        const rsM = await dbQuery(store, `SELECT m.id AS mid, m.name AS name, m.avatar AS avatar,
              COALESCE(SUM(f.reduction),0) AS r, COALESCE(SUM(f.points),0) AS p,
              COALESCE(SUM(f.cnt),0) AS c
       FROM ${DbConst.TABLE_FAMILY_MEMBER} m
       LEFT JOIN ${DbConst.TABLE_FAMILY_REDUCTION} f ON m.id = f.member_id
       GROUP BY m.id ORDER BY r DESC`);
        while (rsGoToNextRow(rsM)) {
            list.push(new MemberTotal(rsLong(rsM, 'mid'), rsString(rsM, 'name'), rsString(rsM, 'avatar'), false, roundTo(rsDouble(rsM, 'r'), 2), rsLong(rsM, 'p'), rsLong(rsM, 'c')));
        }
        rsClose(rsM);
        return list;
    }
    /** 全家庭（本人+家人）按分类的减排汇总，补齐 4 类 */
    async getFamilyCategoryStats(): Promise<Array<CategoryStat>> {
        const store = getStore();
        const selfMap = await this.querySelfByCategory();
        const rs = await dbQuery(store, `SELECT category, COALESCE(SUM(reduction),0) AS reduction,
              COALESCE(SUM(points),0) AS pts, COALESCE(SUM(cnt),0) AS cnt
       FROM ${DbConst.TABLE_FAMILY_REDUCTION} GROUP BY category`);
        const famMap = new Map<string, CategoryStat>();
        while (rsGoToNextRow(rs)) {
            const cat = rsString(rs, 'category');
            famMap.set(cat, new CategoryStat(cat, roundTo(rsDouble(rs, 'reduction'), 3), rsLong(rs, 'cnt'), rsLong(rs, 'pts')));
        }
        rsClose(rs);
        const result: Array<CategoryStat> = [];
        for (let i = 0; i < CATEGORY_META.length; i++) {
            const key = CATEGORY_META[i].key;
            const s = selfMap.get(key);
            const f = famMap.get(key);
            const reduction = roundTo((s === undefined ? 0 : s.reduction) + (f === undefined ? 0 : f.reduction), 3);
            const cnt = (s === undefined ? 0 : s.count) + (f === undefined ? 0 : f.count);
            const pts = (s === undefined ? 0 : s.points) + (f === undefined ? 0 : f.points);
            result.push(new CategoryStat(key, reduction, cnt, pts));
        }
        return result;
    }
    /** 家庭总减排/总积分/总条数 */
    async getFamilyTotals(): Promise<Array<number>> {
        const totals = await this.getMemberTotals();
        let reduction = 0;
        let points = 0;
        let count = 0;
        for (let i = 0; i < totals.length; i++) {
            reduction += totals[i].reduction;
            points += totals[i].points;
            count += totals[i].count;
        }
        return [roundTo(reduction, 2), points, count, totals.length];
    }
}
export const familyRepo: FamilyRepository = new FamilyRepository();
