import type relationalStore from "@ohos:data.relationalStore";
import { getStore } from "@normalized:N&&&entry/src/main/ets/data/db/CarbonDb&";
import { dbExecute, dbInsert, dbQuery, rsClose, rsDouble, rsGoToFirstRow, rsGoToNextRow, rsLong, rsString } from "@normalized:N&&&entry/src/main/ets/data/db/DbSafe&";
import { DbConst, CATEGORY_META } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import { CarbonRecord, CategoryStat, TrendPoint, OverviewData, RecordSource } from "@normalized:N&&&entry/src/main/ets/common/model/Models&";
import type { BehaviorType } from "@normalized:N&&&entry/src/main/ets/common/model/Models&";
import { calcReduction, calcPoints, roundTo } from "@normalized:N&&&entry/src/main/ets/common/utils/CalcUtil&";
import { todayStr, getBuckets, calcStreakDays } from "@normalized:N&&&entry/src/main/ets/common/utils/DateUtil&";
import { DAILY_TASKS } from "@normalized:N&&&entry/src/main/ets/common/constants/DailyTasks&";
import { BADGES } from "@normalized:N&&&entry/src/main/ets/common/constants/Badges&";
import { pointsRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/PointsRepository&";
/** 录入结果 */
export class AddResult {
    record: CarbonRecord;
    reduction: number;
    points: number;
    newBadges: Array<string>;
    constructor(record: CarbonRecord, reduction: number, points: number, newBadges: Array<string>) {
        this.record = record;
        this.reduction = reduction;
        this.points = points;
        this.newBadges = newBadges;
    }
}
function mapRecord(rs: relationalStore.ResultSet): CarbonRecord {
    return new CarbonRecord(rsLong(rs, 'id'), rsString(rs, 'category'), rsString(rs, 'behavior_id'), rsString(rs, 'behavior_name'), rsString(rs, 'icon'), rsDouble(rs, 'amount'), rsString(rs, 'unit'), rsDouble(rs, 'reduction'), rsLong(rs, 'points'), rsLong(rs, 'date'), rsString(rs, 'date_str'), rsString(rs, 'note'), rsString(rs, 'source'));
}
export class CarbonRepository {
    /** 录入一条低碳行为，自动核算减排量与积分，并刷新任务/徽章 */
    async addRecord(behavior: BehaviorType, amount: number, note: string, source: string = RecordSource.MANUAL): Promise<AddResult> {
        const store = getStore();
        const reduction = calcReduction(behavior.factor, amount);
        const points = calcPoints(reduction);
        const now = Date.now();
        const dateStr = todayStr();
        const values: relationalStore.ValuesBucket = {
            'category': behavior.category,
            'behavior_id': behavior.id,
            'behavior_name': behavior.name,
            'icon': behavior.icon,
            'amount': amount,
            'unit': behavior.unit,
            'reduction': reduction,
            'points': points,
            'date': now,
            'date_str': dateStr,
            'note': note,
            'source': source
        };
        const id = await dbInsert(store, DbConst.TABLE_RECORD, values);
        const record = new CarbonRecord(id, behavior.category, behavior.id, behavior.name, behavior.icon, amount, behavior.unit, reduction, points, now, dateStr, note, source);
        // 记录积分流水
        await pointsRepo.addPoints('earn', points, '低碳行为：' + behavior.name);
        // 刷新当日任务进度
        await this.updateDailyTasks(dateStr);
        // 检查并解锁徽章
        const newBadges = await this.refreshBadges();
        return new AddResult(record, reduction, points, newBadges);
    }
    /** 删除记录并回滚对应积分 */
    async deleteRecord(id: number): Promise<void> {
        const store = getStore();
        const target = await this.getRecordById(id);
        if (target === null) {
            return;
        }
        await dbExecute(store, `DELETE FROM ${DbConst.TABLE_RECORD} WHERE id = ?`, [id]);
        if (target.points > 0) {
            await pointsRepo.addPoints('earn', -target.points, '删除记录，积分回滚');
        }
        await this.updateDailyTasks(todayStr());
    }
    async getRecordById(id: number): Promise<CarbonRecord | null> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT * FROM ${DbConst.TABLE_RECORD} WHERE id = ?`, [id]);
        let target: CarbonRecord | null = null;
        if (rsGoToFirstRow(rs)) {
            target = mapRecord(rs);
        }
        rsClose(rs);
        return target;
    }
    async getRecentRecords(limit: number): Promise<Array<CarbonRecord>> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT * FROM ${DbConst.TABLE_RECORD} ORDER BY date DESC LIMIT ?`, [limit]);
        return this.collect(rs);
    }
    async getRecordsByDateStr(dateStr: string): Promise<Array<CarbonRecord>> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT * FROM ${DbConst.TABLE_RECORD} WHERE date_str = ? ORDER BY date ASC`, [dateStr]);
        return this.collect(rs);
    }
    /** 按分类查询历史（category 为空表示全部），支持时间范围 */
    async getRecordsByCategory(category: string, startMs: number, endMs: number, limit: number): Promise<Array<CarbonRecord>> {
        const store = getStore();
        let rs: relationalStore.ResultSet;
        if (category === '') {
            rs = await dbQuery(store, `SELECT * FROM ${DbConst.TABLE_RECORD} WHERE date >= ? AND date < ?
         ORDER BY date DESC LIMIT ?`, [startMs, endMs, limit]);
        }
        else {
            rs = await dbQuery(store, `SELECT * FROM ${DbConst.TABLE_RECORD} WHERE category = ? AND date >= ? AND date < ?
         ORDER BY date DESC LIMIT ?`, [category, startMs, endMs, limit]);
        }
        return this.collect(rs);
    }
    async getRecordsBetween(startMs: number, endMs: number): Promise<Array<CarbonRecord>> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT * FROM ${DbConst.TABLE_RECORD} WHERE date >= ? AND date < ? ORDER BY date ASC`, [startMs, endMs]);
        return this.collect(rs);
    }
    async getAllRecords(): Promise<Array<CarbonRecord>> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT * FROM ${DbConst.TABLE_RECORD} ORDER BY date ASC`);
        return this.collect(rs);
    }
    private collect(rs: relationalStore.ResultSet): Array<CarbonRecord> {
        const list: Array<CarbonRecord> = [];
        while (rsGoToNextRow(rs)) {
            list.push(mapRecord(rs));
        }
        rsClose(rs);
        return list;
    }
    /** 依据当日记录刷新每日任务进度 */
    private async updateDailyTasks(dateStr: string): Promise<void> {
        const records = await this.getRecordsByDateStr(dateStr);
        for (let i = 0; i < DAILY_TASKS.length; i++) {
            const task = DAILY_TASKS[i];
            let progress = 0;
            for (let j = 0; j < records.length; j++) {
                const r = records[j];
                if (task.category === '' || r.category === task.category) {
                    if (task.metric === 'amount') {
                        progress += r.amount;
                    }
                    else {
                        progress += 1;
                    }
                }
            }
            await pointsRepo.saveTaskProgress(task.id, dateStr, Math.floor(progress));
        }
    }
    /** 依据当前累计数据检查并解锁徽章，返回本次新解锁徽章名 */
    async refreshBadges(): Promise<Array<string>> {
        const newBadges: Array<string> = [];
        const totalReduction = await this.getTotalReduction();
        const recordCount = await this.getRecordCount();
        const streak = await this.getStreakDays();
        const treeCount = await pointsRepo.getTreeCount();
        const stats = await this.getCategoryStats(0, Date.now() + 86400000);
        for (let i = 0; i < BADGES.length; i++) {
            const b = BADGES[i];
            let achieved = false;
            if (b.metric === 'reduction') {
                achieved = totalReduction >= b.threshold;
            }
            else if (b.metric === 'count') {
                achieved = recordCount >= b.threshold;
            }
            else if (b.metric === 'days') {
                achieved = streak >= b.threshold;
            }
            else if (b.metric === 'tree') {
                achieved = treeCount >= b.threshold;
            }
            else if (b.metric === 'categoryCount') {
                for (let j = 0; j < stats.length; j++) {
                    if (stats[j].category === b.category && stats[j].count >= b.threshold) {
                        achieved = true;
                    }
                }
            }
            if (achieved) {
                const name = await pointsRepo.unlockBadgeIfNew(b.id);
                if (name !== '') {
                    newBadges.push(name);
                }
            }
        }
        return newBadges;
    }
    // ================= 统计 =================
    async getTotalReduction(): Promise<number> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT COALESCE(SUM(reduction), 0) AS v FROM ${DbConst.TABLE_RECORD}`);
        let v = 0;
        if (rsGoToFirstRow(rs)) {
            v = rsDouble(rs, 'v');
        }
        rsClose(rs);
        return roundTo(v, 3);
    }
    async getRecordCount(): Promise<number> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT COUNT(*) AS v FROM ${DbConst.TABLE_RECORD}`);
        let v = 0;
        if (rsGoToFirstRow(rs)) {
            v = rsLong(rs, 'v');
        }
        rsClose(rs);
        return v;
    }
    async getStreakDays(): Promise<number> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT DISTINCT date_str AS d FROM ${DbConst.TABLE_RECORD} ORDER BY d DESC`);
        const days: Array<string> = [];
        while (rsGoToNextRow(rs)) {
            days.push(rsString(rs, 'd'));
        }
        rsClose(rs);
        return calcStreakDays(days);
    }
    /** 分类汇总（补齐 4 类，保证图表连续） */
    async getCategoryStats(startMs: number, endMs: number): Promise<Array<CategoryStat>> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT category, COALESCE(SUM(reduction),0) AS reduction, COUNT(*) AS cnt,
              COALESCE(SUM(points),0) AS pts
       FROM ${DbConst.TABLE_RECORD} WHERE date >= ? AND date < ? GROUP BY category`, [startMs, endMs]);
        const map = new Map<string, CategoryStat>();
        while (rsGoToNextRow(rs)) {
            const cat = rsString(rs, 'category');
            map.set(cat, new CategoryStat(cat, roundTo(rsDouble(rs, 'reduction'), 3), rsLong(rs, 'cnt'), rsLong(rs, 'pts')));
        }
        rsClose(rs);
        const result: Array<CategoryStat> = [];
        for (let i = 0; i < CATEGORY_META.length; i++) {
            const key = CATEGORY_META[i].key;
            const s = map.get(key);
            if (s === undefined) {
                result.push(new CategoryStat(key, 0, 0, 0));
            }
            else {
                result.push(s);
            }
        }
        return result;
    }
    /** 趋势数据：减排量按时间桶聚合 */
    async getTrend(range: string): Promise<Array<TrendPoint>> {
        const buckets = getBuckets(range);
        const startMs = buckets[0].startMs;
        const endMs = buckets[buckets.length - 1].endMs;
        const records = await this.getRecordsBetween(startMs, endMs);
        const sums: Array<number> = [];
        for (let i = 0; i < buckets.length; i++) {
            sums.push(0);
        }
        for (let i = 0; i < records.length; i++) {
            const r = records[i];
            for (let j = 0; j < buckets.length; j++) {
                if (buckets[j].contains(r.date)) {
                    sums[j] += r.reduction;
                    break;
                }
            }
        }
        const points: Array<TrendPoint> = [];
        for (let i = 0; i < buckets.length; i++) {
            points.push(new TrendPoint(buckets[i].label, roundTo(sums[i], 2), buckets[i].startMs));
        }
        return points;
    }
    /** 首页总览 */
    async getOverview(): Promise<OverviewData> {
        const data = new OverviewData();
        const store = getStore();
        const dateStr = todayStr();
        data.totalReduction = await this.getTotalReduction();
        data.recordCount = await this.getRecordCount();
        data.streakDays = await this.getStreakDays();
        data.totalPoints = await pointsRepo.getBalance();
        data.treeCount = await pointsRepo.getTreeCount();
        data.badgeCount = (await pointsRepo.getUnlockedBadges()).length;
        const rsToday = await dbQuery(store, `SELECT COALESCE(SUM(reduction),0) AS r, COUNT(*) AS c FROM ${DbConst.TABLE_RECORD}
       WHERE date_str = ?`, [dateStr]);
        if (rsGoToFirstRow(rsToday)) {
            data.todayReduction = roundTo(rsDouble(rsToday, 'r'), 3);
            data.todayCount = rsLong(rsToday, 'c');
        }
        rsClose(rsToday);
        const rsDays = await dbQuery(store, `SELECT COUNT(DISTINCT date_str) AS v FROM ${DbConst.TABLE_RECORD}`);
        if (rsGoToFirstRow(rsDays)) {
            data.recordDays = rsLong(rsDays, 'v');
        }
        rsClose(rsDays);
        return data;
    }
}
export const carbonRepo: CarbonRepository = new CarbonRepository();
