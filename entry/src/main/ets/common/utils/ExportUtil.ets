/**
 * 本地数据备份与统计报表导出
 * - JSON 全量备份：碳记录、积分流水、徽章、证书
 * - CSV 统计报表：低碳行为明细、积分流水（含 BOM，Excel 可直接打开）
 * - 通过 DocumentViewPicker 让用户选择保存位置（文件管理 / 电脑 / 云盘）
 */
import { fileIo as fs, picker } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import { carbonRepo } from '../../data/repository/CarbonRepository';
import { pointsRepo } from '../../data/repository/PointsRepository';
import { getCategoryMeta } from '../constants/AppConstants';
import { RecordSource, CarbonRecord, PointRecord, UserBadge, Certificate } from '../model/Models';
import { formatDateTime } from './DateUtil';

/** 保存结果：0=用户取消，1=成功，-1=失败 */
export class SaveResult {
  static readonly CANCEL: number = 0;
  static readonly SUCCESS: number = 1;
  static readonly ERROR: number = -1;
}

class BackupData {
  app: string;
  version: number;
  exportTime: string;
  ownerName: string;
  balance: number;
  carbonRecords: Array<CarbonRecord>;
  pointRecords: Array<PointRecord>;
  badges: Array<UserBadge>;
  certificates: Array<Certificate>;

  constructor(exportTime: string, ownerName: string, balance: number,
              carbonRecords: Array<CarbonRecord>, pointRecords: Array<PointRecord>,
              badges: Array<UserBadge>, certificates: Array<Certificate>) {
    this.app = 'CarbonFootprint';
    this.version = 1;
    this.exportTime = exportTime;
    this.ownerName = ownerName;
    this.balance = balance;
    this.carbonRecords = carbonRecords;
    this.pointRecords = pointRecords;
    this.badges = badges;
    this.certificates = certificates;
  }
}

function fileStamp(): string {
  const d = new Date();
  const p = (n: number): string => (n < 10 ? '0' + n : String(n));
  return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '_' +
    p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
}

function csvEscape(v: string): string {
  if (v.indexOf(',') >= 0 || v.indexOf('"') >= 0 || v.indexOf('\n') >= 0) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}

function sourceName(s: string): string {
  if (s === RecordSource.AI) {
    return 'AI识图';
  }
  if (s === RecordSource.FAMILY) {
    return '家庭同步';
  }
  return '手动录入';
}

export class ExportUtil {
  /** 生成 JSON 全量备份字符串 */
  static async buildBackupJson(): Promise<string> {
    const owner = await pointsRepo.getOwnerName();
    const balance = await pointsRepo.getBalance();
    const carbonRecords = await carbonRepo.getAllRecords();
    const pointRecords = await pointsRepo.getAllPointRecords();
    const badges = await pointsRepo.getUnlockedBadges();
    const certificates = await pointsRepo.getCertificates();
    const data = new BackupData(
      formatDateTime(Date.now()), owner, balance,
      carbonRecords, pointRecords, badges, certificates
    );
    return JSON.stringify(data, null, 2);
  }

  /** 生成低碳行为明细 CSV */
  static async buildRecordsCsv(): Promise<string> {
    const records = await carbonRepo.getAllRecords();
    let csv = '\uFEFF日期,分类,低碳行为,数量,单位,减排量(kgCO2e),获得积分,来源,备注\n';
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const row: Array<string> = [
        formatDateTime(r.date),
        getCategoryMeta(r.category).name,
        r.behaviorName,
        String(r.amount),
        r.unit,
        r.reduction.toFixed(3),
        String(r.points),
        sourceName(r.source),
        r.note
      ];
      for (let j = 0; j < row.length; j++) {
        if (j > 0) {
          csv += ',';
        }
        csv += csvEscape(row[j]);
      }
      csv += '\n';
    }
    return csv;
  }

  /** 生成积分流水 CSV */
  static async buildPointsCsv(): Promise<string> {
    const records = await pointsRepo.getAllPointRecords();
    let csv = '\uFEFF日期,类型,积分变动,变动后余额,说明\n';
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const row: Array<string> = [
        formatDateTime(r.date),
        r.amount >= 0 ? '获取' : '兑换',
        String(r.amount),
        String(r.balance),
        r.reason
      ];
      for (let j = 0; j < row.length; j++) {
        if (j > 0) {
          csv += ',';
        }
        csv += csvEscape(row[j]);
      }
      csv += '\n';
    }
    return csv;
  }

  /** 弹出系统保存选择器，把内容写入用户选择的位置 */
  static async saveViaPicker(context: common.UIAbilityContext, fileName: string,
                             content: string): Promise<number> {
    try {
      const docPicker = new picker.DocumentViewPicker(context);
      const options = new picker.DocumentSaveOptions();
      options.newFileNames = [fileName];
      const uris = await docPicker.save(options);
      if (uris === undefined || uris === null || uris.length === 0) {
        return SaveResult.CANCEL;
      }
      const file = fs.openSync(uris[0], fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);
      fs.writeSync(file.fd, content);
      fs.closeSync(file);
      return SaveResult.SUCCESS;
    } catch (e) {
      return SaveResult.ERROR;
    }
  }

  /** 导出 JSON 备份到用户选择位置 */
  static async exportBackup(context: common.UIAbilityContext): Promise<number> {
    const content = await ExportUtil.buildBackupJson();
    return await ExportUtil.saveViaPicker(context, '碳足迹备份_' + fileStamp() + '.json', content);
  }

  /** 导出低碳行为明细 CSV 到用户选择位置 */
  static async exportRecordsCsv(context: common.UIAbilityContext): Promise<number> {
    const content = await ExportUtil.buildRecordsCsv();
    return await ExportUtil.saveViaPicker(context, '低碳行为统计报表_' + fileStamp() + '.csv', content);
  }

  /** 导出积分流水 CSV 到用户选择位置 */
  static async exportPointsCsv(context: common.UIAbilityContext): Promise<number> {
    const content = await ExportUtil.buildPointsCsv();
    return await ExportUtil.saveViaPicker(context, '积分流水报表_' + fileStamp() + '.csv', content);
  }

  /**
   * 自动备份到应用沙箱目录（无需用户交互，便于本地留存）
   * 返回写入的文件路径
   */
  static async autoBackupToSandbox(context: common.UIAbilityContext): Promise<string> {
    const content = await ExportUtil.buildBackupJson();
    const path = context.filesDir + '/carbon_backup_' + fileStamp() + '.json';
    try {
      const file = fs.openSync(path, fs.OpenMode.WRITE_ONLY | fs.OpenMode.CREATE);
      try {
        fs.writeSync(file.fd, content);
      } finally {
        try {
          fs.closeSync(file);
        } catch (closeErr) {
          // 关闭失败不影响备份结果
        }
      }
    } catch (e) {
      throw e as Error;
    }
    return path;
  }
}
