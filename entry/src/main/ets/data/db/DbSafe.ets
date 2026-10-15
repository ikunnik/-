/**
 * relationalStore 安全访问包装层
 * ----------------------------------------------------------------
 * SDK 的 executeSql / querySql / insert / ResultSet 方法在声明中均
 * 标注了可抛出异常（BusinessError），编译器要求调用处做异常处理。
 * 这里统一在封装层 try-catch 后原样抛出，既满足编译检查，
 * 又不改变调用方的错误传播语义。
 */
import { relationalStore } from '@kit.ArkData';

/** 执行 SQL（无结果集），异常原样抛出 */
export async function dbExecute(store: relationalStore.RdbStore, sql: string,
                                args?: Array<relationalStore.ValueType>): Promise<void> {
  try {
    await store.executeSql(sql, args);
  } catch (e) {
    throw e as Error;
  }
}

/** 查询并返回结果集，异常原样抛出 */
export async function dbQuery(store: relationalStore.RdbStore, sql: string,
                              args?: Array<relationalStore.ValueType>): Promise<relationalStore.ResultSet> {
  try {
    return await store.querySql(sql, args);
  } catch (e) {
    throw e as Error;
  }
}

/** 插入一行，返回行 id，异常原样抛出 */
export async function dbInsert(store: relationalStore.RdbStore, table: string,
                               values: relationalStore.ValuesBucket): Promise<number> {
  try {
    return await store.insert(table, values);
  } catch (e) {
    throw e as Error;
  }
}

/** 游标移到第一行；失败按无数据返回 false */
export function rsGoToFirstRow(rs: relationalStore.ResultSet): boolean {
  try {
    return rs.goToFirstRow();
  } catch (e) {
    return false;
  }
}

/** 游标移到下一行；失败按遍历结束返回 false */
export function rsGoToNextRow(rs: relationalStore.ResultSet): boolean {
  try {
    return rs.goToNextRow();
  } catch (e) {
    return false;
  }
}

/** 读取整型列，列不存在或读取失败返回 0 */
export function rsLong(rs: relationalStore.ResultSet, column: string): number {
  try {
    return rs.getLong(rs.getColumnIndex(column));
  } catch (e) {
    return 0;
  }
}

/** 读取浮点列，列不存在或读取失败返回 0 */
export function rsDouble(rs: relationalStore.ResultSet, column: string): number {
  try {
    return rs.getDouble(rs.getColumnIndex(column));
  } catch (e) {
    return 0;
  }
}

/** 读取字符串列，列不存在或读取失败返回空串 */
export function rsString(rs: relationalStore.ResultSet, column: string): string {
  try {
    return rs.getString(rs.getColumnIndex(column));
  } catch (e) {
    return '';
  }
}

/** 关闭结果集（关闭失败不影响主流程） */
export function rsClose(rs: relationalStore.ResultSet): void {
  try {
    rs.close();
  } catch (e) {
    // 忽略关闭失败
  }
}
