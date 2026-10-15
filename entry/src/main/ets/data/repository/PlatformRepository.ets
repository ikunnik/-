/**
 * 城市碳普惠平台 · 本地数据仓库
 * 平台碳币余额、同步时间、权益兑换订单的本地持久化。
 * 网络交互（Mock）见 features/platform/CarbonInclusiveClient.ets。
 */
import { relationalStore } from '@kit.ArkData';
import { getStore } from '../db/CarbonDb';
import { dbExecute, dbQuery, rsClose, rsGoToNextRow, rsLong, rsString } from '../db/DbSafe';
import { DbConst } from '../../common/constants/AppConstants';
import { BenefitOrder, PointType } from '../../common/model/Models';
import { Benefit } from '../../features/platform/CarbonInclusiveClient';
import { pointsRepo } from './PointsRepository';
import { todayStr, formatDate, pad } from '../../common/utils/DateUtil';

const META_REMOTE_POINTS: string = 'platform_points';
const META_LAST_SYNC: string = 'platform_last_sync';

async function getMeta(key: string, defVal: string): Promise<string> {
  const store = getStore();
  const rs = await dbQuery(store, `SELECT value FROM ${DbConst.TABLE_META} WHERE key = ?`, [key]);
  let val: string = defVal;
  try {
    if (rs.goToFirstRow()) {
      val = rs.getString(rs.getColumnIndex('value'));
    }
  } catch (e) {
    // 读取失败按默认值处理
  }
  rsClose(rs);
  return val;
}

async function setMeta(key: string, value: string): Promise<void> {
  const store = getStore();
  await dbExecute(store,
    `INSERT INTO ${DbConst.TABLE_META}(key, value) VALUES(?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value]);
}

function mapOrder(rs: relationalStore.ResultSet): BenefitOrder {
  return new BenefitOrder(
    rsLong(rs, 'id'),
    rsString(rs, 'benefit_id'),
    rsString(rs, 'name'),
    rsString(rs, 'icon'),
    rsLong(rs, 'points'),
    rsString(rs, 'code'),
    rsLong(rs, 'date'),
    rsString(rs, 'date_str')
  );
}

export class PlatformRepository {
  /** 平台侧碳币余额（演示按本地积分 1:1 互通） */
  async getRemotePoints(): Promise<number> {
    const v = await getMeta(META_REMOTE_POINTS, '0');
    const n = parseInt(v, 10);
    return isNaN(n) ? 0 : n;
  }

  /** 上次同步时间戳（0 表示从未同步） */
  async getLastSync(): Promise<number> {
    const v = await getMeta(META_LAST_SYNC, '0');
    const n = parseInt(v, 10);
    return isNaN(n) ? 0 : n;
  }

  /** 把本地积分同步到城市碳普惠平台（模拟上报，幂等：以当前余额为准） */
  async syncFromLocal(): Promise<number> {
    const local = await pointsRepo.getBalance();
    await setMeta(META_REMOTE_POINTS, String(local));
    await setMeta(META_LAST_SYNC, String(Date.now()));
    return local;
  }

  /** 兑换权益：积分不足返回 null；成功扣减本地积分并生成核销订单 */
  async exchangeBenefit(benefit: Benefit): Promise<BenefitOrder | null> {
    const balance = await pointsRepo.getBalance();
    if (balance < benefit.points || benefit.points <= 0) {
      return null;
    }
    const store = getStore();
    const now = new Date();
    const rand = Math.floor(Math.random() * 90 + 10);
    const code = 'PT-' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) +
      pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds()) + rand;
    let txId: number = -1;
    try {
      // 使用异步事务 API，且 addPoints 内部自开事务会形成嵌套，故这里不加外层事务，
      // 改为顺序执行保证最终一致（扣积分 + 生成订单 + 同步平台余额）。
      await pointsRepo.addPoints(PointType.EXCHANGE, -benefit.points, '碳普惠兑换：' + benefit.name);
      await dbExecute(store,
        `INSERT INTO ${DbConst.TABLE_BENEFIT_ORDER}(benefit_id, name, icon, points, code, date, date_str)
         VALUES(?, ?, ?, ?, ?, ?, ?)`,
        [benefit.id, benefit.name, benefit.icon, benefit.points, code, now.getTime(), formatDate(now)]);
      // 兑换后平台碳币同步为最新余额
      const newBalance = await pointsRepo.getBalance();
      await setMeta(META_REMOTE_POINTS, String(newBalance));
    } catch (e) {
      throw e as Error;
    }
    const list = await this.getOrders();
    for (let i = 0; i < list.length; i++) {
      if (list[i].code === code) {
        return list[i];
      }
    }
    return null;
  }

  async getOrders(): Promise<Array<BenefitOrder>> {
    const store = getStore();
    const rs = await dbQuery(store,
      `SELECT * FROM ${DbConst.TABLE_BENEFIT_ORDER} ORDER BY date DESC`);
    const list: Array<BenefitOrder> = [];
    while (rsGoToNextRow(rs)) {
      list.push(mapOrder(rs));
    }
    rsClose(rs);
    return list;
  }
}

export const platformRepo: PlatformRepository = new PlatformRepository();
