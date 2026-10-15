/**
 * 拓展功能 1：鸿蒙超级终端 · 多设备数据同步 · 家庭碳积分合并
 * ----------------------------------------------------------------
 * 本文件是"超级终端能力"的门面，当前工作在【本地模拟模式】：
 *   数据来自 data/repository/FamilyRepository.ets（family_members / family_reduction
 *   本地表），可完整演示"发现家人设备 → 同步各设备减排 → 家庭合并统计"。
 *
 * 切换为真机分布式（同一华为账号、多设备组网）：
 * 1. 权限：module.json5 申请 ohos.permission.DISTRIBUTED_DATASYNC（user_grant），
 *    运行时通过 abilityAccessCtrl 弹窗授权。
 * 2. 设备发现与组网：
 *    import { deviceManager } from '@kit.DistributedServiceKit';
 *    const dm = deviceManager.createDeviceManager('com.example.carbonfootprint');
 *    // dm.startDeviceDiscovery({ subscribeId: <id>, mode: DISCOVERY_MODE_ACTIVE });
 *    // 回调 onDeviceFound 得到 DeviceInfo（deviceName/deviceId）；
 *    // dm.getTrustedDeviceListSync() 取已组网可信设备。
 * 3. 数据同步（任选其一）：
 *    A. 分布式 KV：
 *       import { distributedKVStore } from '@kit.ArkData';
 *       // 单分布式数据库，KV 协同，键如 `family/{familyId}/member/{deviceId}/{date}/{cat}`，
 *       // 写入本人减排摘要；setOnDataChange 订阅家人变更。
 *    B. 分布式数据对象：
 *       import { distributedDataObject } from '@kit.ArkData';
 *       // 建立 sessionId 相同的家庭会话，各成员把当日摘要写入同一对象自动同步。
 * 4. 同步进来的家人数据写入 family_reduction（member 用 deviceId 标识），
 *    source 记为 RecordSource.FAMILY，按 (deviceId,date,category) 去重；
 *    FamilyRepository 的合并统计逻辑无需改动。
 */
import { Category } from '../../common/model/Models';
import { familyRepo } from '../../data/repository/FamilyRepository';
import { FamilyMember } from '../../common/model/Models';

/** 家庭成员设备（UI 展示用） */
export class FamilyDevice {
  deviceId: string;
  deviceName: string;
  memberName: string;
  online: boolean;
  todayReduction: number;

  constructor(deviceId: string, deviceName: string, memberName: string,
              online: boolean, todayReduction: number) {
    this.deviceId = deviceId;
    this.deviceName = deviceName;
    this.memberName = memberName;
    this.online = online;
    this.todayReduction = todayReduction;
  }
}

/** 家庭分类减排汇总 */
export class FamilySummary {
  totalReduction: number;
  totalPoints: number;
  memberCount: number;
  categoryReduction: Map<string, number>;

  constructor() {
    this.totalReduction = 0;
    this.totalPoints = 0;
    this.memberCount = 0;
    this.categoryReduction = new Map<string, number>();
  }
}

function toDevice(m: FamilyMember): FamilyDevice {
  return new FamilyDevice('dev-' + m.id, m.device, m.name + '·' + m.role, m.online, 0);
}

export class SuperTerminal {
  /** 功能已上线（本地模拟模式）；真机接入分布式后把 MODE 改为 'distributed' */
  static readonly ENABLED: boolean = true;
  /** 当前模式：simulate=本地模拟；distributed=真机分布式 */
  static readonly MODE: string = 'simulate';
  /** 当前家庭组 ID（真机由创建/加入家庭流程获得） */
  familyId: string = 'family-demo-001';

  /** 首次进入预置示例家人设备 */
  async ensureFamily(): Promise<void> {
    await familyRepo.ensureSeed();
  }

  /** 发现家庭组内已组网的可信设备（模拟：返回家人设备） */
  async discoverFamilyDevices(): Promise<Array<FamilyDevice>> {
    await familyRepo.ensureSeed();
    const members = await familyRepo.getMembers();
    const list: Array<FamilyDevice> = [];
    for (let i = 0; i < members.length; i++) {
      list.push(toDevice(members[i]));
    }
    return list;
  }

  /**
   * 超级终端一键同步：发现并连接家人设备、上报/拉取各设备当日减排摘要。
   * @return 已连接并同步的成员数
   */
  async reportToFamily(): Promise<number> {
    return await familyRepo.discoverAndSync();
  }

  /** 聚合家庭所有成员的减排与积分（本人 + 家人） */
  async mergeFamilyReduction(): Promise<FamilySummary> {
    const summary = new FamilySummary();
    const stats = await familyRepo.getFamilyCategoryStats();
    for (let i = 0; i < stats.length; i++) {
      summary.categoryReduction.set(stats[i].category, stats[i].reduction);
    }
    const totals = await familyRepo.getFamilyTotals();
    summary.totalReduction = totals[0];
    summary.totalPoints = totals[1];
    summary.memberCount = totals[3];
    if (!summary.categoryReduction.has(Category.TRAVEL)) {
      summary.categoryReduction.set(Category.TRAVEL, 0);
    }
    if (!summary.categoryReduction.has(Category.ENERGY)) {
      summary.categoryReduction.set(Category.ENERGY, 0);
    }
    if (!summary.categoryReduction.has(Category.RECYCLE)) {
      summary.categoryReduction.set(Category.RECYCLE, 0);
    }
    if (!summary.categoryReduction.has(Category.FOOD)) {
      summary.categoryReduction.set(Category.FOOD, 0);
    }
    return summary;
  }
}

export const superTerminal: SuperTerminal = new SuperTerminal();
