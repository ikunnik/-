import type relationalStore from "@ohos:data.relationalStore";
import { getStore } from "@normalized:N&&&entry/src/main/ets/data/db/CarbonDb&";
import { dbExecute, dbQuery, rsClose, rsGoToFirstRow, rsGoToNextRow, rsLong, rsString } from "@normalized:N&&&entry/src/main/ets/data/db/DbSafe&";
import { DbConst, PointRule } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import { PointRecord, PointType, TaskRecord, UserBadge, Certificate } from "@normalized:N&&&entry/src/main/ets/common/model/Models&";
import { todayStr, formatDate, pad } from "@normalized:N&&&entry/src/main/ets/common/utils/DateUtil&";
import { getBadgeById } from "@normalized:N&&&entry/src/main/ets/common/constants/Badges&";
const META_BALANCE: string = 'points_balance';
const META_OWNER: string = 'owner_name';
async function getMeta(key: string, defVal: string): Promise<string> {
    const store = getStore();
    const rs = await dbQuery(store, `SELECT value FROM ${DbConst.TABLE_META} WHERE key = ?`, [key]);
    let val: string = defVal;
    if (rsGoToFirstRow(rs)) {
        val = rsString(rs, 'value');
    }
    rsClose(rs);
    return val;
}
async function setMeta(key: string, value: string): Promise<void> {
    const store = getStore();
    await dbExecute(store, `INSERT INTO ${DbConst.TABLE_META}(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`, [key, value]);
}
/** 写入一条积分流水（不含事务） */
async function setPointFlow(type: string, amount: number, balance: number, reason: string, now: number): Promise<void> {
    const store = getStore();
    await dbExecute(store, `INSERT INTO ${DbConst.TABLE_POINT}(type, amount, balance, reason, date, date_str)
     VALUES(?, ?, ?, ?, ?, ?)`, [type, amount, balance, reason, now, todayStr()]);
}
function mapPoint(rs: relationalStore.ResultSet): PointRecord {
    return new PointRecord(rsLong(rs, 'id'), rsString(rs, 'type'), rsLong(rs, 'amount'), rsLong(rs, 'balance'), rsString(rs, 'reason'), rsLong(rs, 'date'), rsString(rs, 'date_str'));
}
export class PointsRepository {
    // ============ 积分余额与流水 ============
    async getBalance(): Promise<number> {
        const v = await getMeta(META_BALANCE, '0');
        const n = parseInt(v, 10);
        return isNaN(n) ? 0 : n;
    }
    async getOwnerName(): Promise<string> {
        return await getMeta(META_OWNER, '低碳行者');
    }
    async setOwnerName(name: string): Promise<void> {
        await setMeta(META_OWNER, name);
    }
    /**
     * 增加积分（type=earn 正数；兑换时 type=exchange，amount 传负数）。
     *
     * 【重要】这里刻意不使用事务：
     * ArkData 的 beginTrans()/commit(txId) 与异步 executeSql/querySql 混用存在
     * 事务嵌套与状态残留风险（报 "cannot start a transaction within a transaction"），
     * 而"写流水 + 更新余额"两条语句本身已足够安全，且 setMeta 使用 upsert 幂等。
     */
    async addPoints(type: string, amount: number, reason: string): Promise<number> {
        return await this.writePointsNoTx(type, amount, reason);
    }
    /**
     * 写入积分流水 + 更新余额（无事务）。
     * 抽出独立方法，供 claimTask / exchangeCertificate 复用，避免事务嵌套。
     */
    private async writePointsNoTx(type: string, amount: number, reason: string): Promise<number> {
        const balance = await this.getBalance();
        const newBalance = balance + amount;
        const now = Date.now();
        await setPointFlow(type, amount, newBalance, reason, now);
        await setMeta(META_BALANCE, String(newBalance));
        return newBalance;
    }
    async getPointRecords(limit: number): Promise<Array<PointRecord>> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT * FROM ${DbConst.TABLE_POINT} ORDER BY date DESC LIMIT ?`, [limit]);
        const list: Array<PointRecord> = [];
        while (rsGoToNextRow(rs)) {
            list.push(mapPoint(rs));
        }
        rsClose(rs);
        return list;
    }
    async getAllPointRecords(): Promise<Array<PointRecord>> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT * FROM ${DbConst.TABLE_POINT} ORDER BY date ASC`);
        const list: Array<PointRecord> = [];
        while (rsGoToNextRow(rs)) {
            list.push(mapPoint(rs));
        }
        rsClose(rs);
        return list;
    }
    // ============ 每日任务 ============
    /** 获取指定日期的任务进度记录 */
    async getTaskProgress(dateStr: string): Promise<Array<TaskRecord>> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT * FROM ${DbConst.TABLE_TASK} WHERE date_str = ?`, [dateStr]);
        const list: Array<TaskRecord> = [];
        while (rsGoToNextRow(rs)) {
            list.push(new TaskRecord(rsLong(rs, 'id'), rsString(rs, 'task_id'), rsString(rs, 'date_str'), rsLong(rs, 'progress'), rsLong(rs, 'claimed') === 1));
        }
        rsClose(rs);
        return list;
    }
    /** 仅当新进度更大时更新进度 */
    async saveTaskProgress(taskId: string, dateStr: string, progress: number): Promise<void> {
        const store = getStore();
        await dbExecute(store, `INSERT INTO ${DbConst.TABLE_TASK}(task_id, date_str, progress, claimed) VALUES(?, ?, ?, 0)
       ON CONFLICT(task_id, date_str) DO UPDATE SET progress = CASE WHEN excluded.progress > ${DbConst.TABLE_TASK}.progress
       THEN excluded.progress ELSE ${DbConst.TABLE_TASK}.progress END`, [taskId, dateStr, progress]);
    }
    /** 领取任务奖励，返回是否领取成功（已领取返回 false） */
    async claimTask(taskId: string, dateStr: string, points: number, taskName: string): Promise<boolean> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT claimed FROM ${DbConst.TABLE_TASK} WHERE task_id = ? AND date_str = ?`, [taskId, dateStr]);
        let claimed = true;
        if (rsGoToFirstRow(rs)) {
            claimed = rsLong(rs, 'claimed') === 1;
        }
        rsClose(rs);
        if (claimed) {
            return false;
        }
        // 与 addPoints 保持一致，不使用事务：UPDATE 幂等 + setMeta upsert 幂等
        await dbExecute(store, `UPDATE ${DbConst.TABLE_TASK} SET claimed = 1 WHERE task_id = ? AND date_str = ?`, [taskId, dateStr]);
        await this.writePointsNoTx(PointType.EARN, points, '任务奖励：' + taskName);
        return true;
    }
    // ============ 徽章 ============
    async getUnlockedBadges(): Promise<Array<UserBadge>> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT * FROM ${DbConst.TABLE_BADGE} ORDER BY date ASC`);
        const list: Array<UserBadge> = [];
        while (rsGoToNextRow(rs)) {
            list.push(new UserBadge(rsLong(rs, 'id'), rsString(rs, 'badge_id'), rsLong(rs, 'date'), rsString(rs, 'date_str')));
        }
        rsClose(rs);
        return list;
    }
    async getUnlockedBadgeIds(): Promise<Array<string>> {
        const badges = await this.getUnlockedBadges();
        const ids: Array<string> = [];
        for (let i = 0; i < badges.length; i++) {
            ids.push(badges[i].badgeId);
        }
        return ids;
    }
    /** 若未解锁则解锁，返回新解锁的徽章名（空字符串表示已存在） */
    async unlockBadgeIfNew(badgeId: string): Promise<string> {
        const store = getStore();
        const exist = await dbQuery(store, `SELECT id FROM ${DbConst.TABLE_BADGE} WHERE badge_id = ?`, [badgeId]);
        const has = rsGoToFirstRow(exist);
        rsClose(exist);
        if (has) {
            return '';
        }
        const now = Date.now();
        await dbExecute(store, `INSERT OR IGNORE INTO ${DbConst.TABLE_BADGE}(badge_id, date, date_str) VALUES(?, ?, ?)`, [badgeId, now, formatDate(new Date(now))]);
        const def = getBadgeById(badgeId);
        return def === null ? '' : def.name;
    }
    // ============ 植树证书 ============
    async getCertificates(): Promise<Array<Certificate>> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT * FROM ${DbConst.TABLE_CERT} ORDER BY date DESC`);
        const list: Array<Certificate> = [];
        while (rsGoToNextRow(rs)) {
            list.push(new Certificate(rsLong(rs, 'id'), rsString(rs, 'code'), rsLong(rs, 'tree_count'), rsLong(rs, 'points'), rsLong(rs, 'date'), rsString(rs, 'date_str'), rsString(rs, 'owner')));
        }
        rsClose(rs);
        return list;
    }
    async getTreeCount(): Promise<number> {
        const store = getStore();
        const rs = await dbQuery(store, `SELECT COALESCE(SUM(tree_count), 0) AS total FROM ${DbConst.TABLE_CERT}`);
        let total = 0;
        if (rsGoToFirstRow(rs)) {
            total = rsLong(rs, 'total');
        }
        rsClose(rs);
        return total;
    }
    /** 兑换植树证书；积分不足返回 null */
    async exchangeCertificate(treeCount: number): Promise<Certificate | null> {
        const cost = treeCount * PointRule.POINTS_PER_TREE;
        const balance = await this.getBalance();
        if (balance < cost || treeCount <= 0) {
            return null;
        }
        const store = getStore();
        const now = new Date();
        const d = now;
        const code = 'CF-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
            pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
        // 与 addPoints 保持一致，不使用事务（扣积分、插证书三步均为幂等/唯一约束保护）
        await this.writePointsNoTx(PointType.EXCHANGE, -cost, '兑换植树证书 ' + treeCount + ' 棵');
        await dbExecute(store, `INSERT INTO ${DbConst.TABLE_CERT}(code, tree_count, points, date, date_str, owner)
       VALUES(?, ?, ?, ?, ?, ?)`, [code, treeCount, cost, now.getTime(), formatDate(now), await this.getOwnerName()]);
        const list = await this.getCertificates();
        for (let i = 0; i < list.length; i++) {
            if (list[i].code === code) {
                return list[i];
            }
        }
        return null;
    }
}
export const pointsRepo: PointsRepository = new PointsRepository();
