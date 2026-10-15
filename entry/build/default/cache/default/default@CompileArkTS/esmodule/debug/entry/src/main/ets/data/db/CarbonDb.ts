import relationalStore from "@ohos:data.relationalStore";
import type common from "@ohos:app.ability.common";
import { DbConst } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
let rdbStore: relationalStore.RdbStore | null = null;
let dbContext: common.Context | null = null;
let initPromise: Promise<void> | null = null;
const SQL_RECORD: string = `CREATE TABLE IF NOT EXISTS ${DbConst.TABLE_RECORD} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT,
  behavior_id TEXT,
  behavior_name TEXT,
  icon TEXT,
  amount REAL,
  unit TEXT,
  reduction REAL,
  points INTEGER,
  date INTEGER,
  date_str TEXT,
  note TEXT,
  source TEXT
)`;
const SQL_POINT: string = `CREATE TABLE IF NOT EXISTS ${DbConst.TABLE_POINT} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT,
  amount INTEGER,
  balance INTEGER,
  reason TEXT,
  date INTEGER,
  date_str TEXT
)`;
const SQL_TASK: string = `CREATE TABLE IF NOT EXISTS ${DbConst.TABLE_TASK} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT,
  date_str TEXT,
  progress INTEGER,
  claimed INTEGER,
  UNIQUE(task_id, date_str)
)`;
const SQL_BADGE: string = `CREATE TABLE IF NOT EXISTS ${DbConst.TABLE_BADGE} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  badge_id TEXT UNIQUE,
  date INTEGER,
  date_str TEXT
)`;
const SQL_CERT: string = `CREATE TABLE IF NOT EXISTS ${DbConst.TABLE_CERT} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT,
  tree_count INTEGER,
  points INTEGER,
  date INTEGER,
  date_str TEXT,
  owner TEXT
)`;
const SQL_META: string = `CREATE TABLE IF NOT EXISTS ${DbConst.TABLE_META} (
  key TEXT PRIMARY KEY,
  value TEXT
)`;
const SQL_FAMILY_MEMBER: string = `CREATE TABLE IF NOT EXISTS ${DbConst.TABLE_FAMILY_MEMBER} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  avatar TEXT,
  role TEXT,
  device TEXT,
  online INTEGER,
  created INTEGER
)`;
const SQL_FAMILY_REDUCTION: string = `CREATE TABLE IF NOT EXISTS ${DbConst.TABLE_FAMILY_REDUCTION} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER,
  date_str TEXT,
  category TEXT,
  reduction REAL,
  points INTEGER,
  cnt INTEGER,
  UNIQUE(member_id, date_str, category)
)`;
const SQL_BENEFIT_ORDER: string = `CREATE TABLE IF NOT EXISTS ${DbConst.TABLE_BENEFIT_ORDER} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  benefit_id TEXT,
  name TEXT,
  icon TEXT,
  points INTEGER,
  code TEXT,
  date INTEGER,
  date_str TEXT
)`;
export async function initDb(context: common.Context): Promise<void> {
    const config: relationalStore.StoreConfig = {
        name: DbConst.DB_NAME,
        securityLevel: relationalStore.SecurityLevel.S1
    };
    try {
        const store = await relationalStore.getRdbStore(context, config);
        await store.executeSql(SQL_RECORD);
        await store.executeSql(SQL_POINT);
        await store.executeSql(SQL_TASK);
        await store.executeSql(SQL_BADGE);
        await store.executeSql(SQL_CERT);
        await store.executeSql(SQL_META);
        await store.executeSql(SQL_FAMILY_MEMBER);
        await store.executeSql(SQL_FAMILY_REDUCTION);
        await store.executeSql(SQL_BENEFIT_ORDER);
        rdbStore = store;
    }
    catch (e) {
        throw e as Error;
    }
    // 迁移/兜底：若版本升级新增表，executeSql 均为 IF NOT EXISTS，安全可重复执行
}
/**
 * 确保数据库可用。
 *
 * 【为什么需要】Previewer（预览器）不会执行 EntryAbility.onWindowStageCreate，
 * 导致 initDb 从未被调用，getStore() 抛「数据库尚未初始化」，
 * 表现为首页全是 0、保存记录永远失败。这里做惰性兜底：
 * 页面首次访问时传入 context 补做初始化。
 */
export async function ensureDb(context: common.Context): Promise<void> {
    if (rdbStore !== null) {
        return;
    }
    // 并发调用时复用同一个初始化 Promise，避免重复建表
    if (initPromise === null) {
        dbContext = context;
        initPromise = initDb(context).catch((err: Error) => {
            // 失败后允许下次重试
            initPromise = null;
            throw err;
        });
    }
    await initPromise;
}
export function getStore(): relationalStore.RdbStore {
    if (rdbStore === null) {
        throw new Error('数据库尚未初始化，请先在 EntryAbility 中调用 initDb');
    }
    return rdbStore;
}
/** 数据库是否已就绪（供 UI 展示友好提示，避免抛异常） */
export function isDbReady(): boolean {
    return rdbStore !== null;
}
