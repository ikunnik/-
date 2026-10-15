import { common } from '@kit.AbilityKit';
import { Theme } from '../common/constants/AppConstants';
import { carbonRepo } from '../data/repository/CarbonRepository';
import { pointsRepo } from '../data/repository/PointsRepository';
import { ExportUtil, SaveResult } from '../common/utils/ExportUtil';
import { showToast } from '../common/utils/ToastUtil';

@Entry
@Component
struct BackupPage {
  @State recordCount: number = 0;
  @State pointCount: number = 0;
  @State badgeCount: number = 0;
  @State certCount: number = 0;
  @State busy: boolean = false;
  @State lastBackupPath: string = '';
  private context: common.UIAbilityContext | null = null;

  async aboutToAppear(): Promise<void> {
    this.context = this.getUIContext().getHostContext() as common.UIAbilityContext;
    this.recordCount = (await carbonRepo.getAllRecords()).length;
    this.pointCount = (await pointsRepo.getAllPointRecords()).length;
    this.badgeCount = (await pointsRepo.getUnlockedBadges()).length;
    this.certCount = (await pointsRepo.getCertificates()).length;
  }

  private async handleResult(r: number, okMsg: string): Promise<void> {
    if (r === SaveResult.SUCCESS) {
      showToast(this.getUIContext(), okMsg);
    } else if (r === SaveResult.ERROR) {
      showToast(this.getUIContext(), '操作失败，请重试');
    }
  }

  async doAutoBackup(): Promise<void> {
    if (this.busy || this.context === null) {
      return;
    }
    this.busy = true;
    try {
      const path = await ExportUtil.autoBackupToSandbox(this.context);
      this.lastBackupPath = path;
      showToast(this.getUIContext(), '已在本地生成备份');
    } catch (e) {
      showToast(this.getUIContext(), '备份失败');
    }
    this.busy = false;
  }

  async doExportBackup(): Promise<void> {
    if (this.busy || this.context === null) {
      return;
    }
    this.busy = true;
    const r = await ExportUtil.exportBackup(this.context);
    await this.handleResult(r, '备份文件已保存');
    this.busy = false;
  }

  async doExportRecordsCsv(): Promise<void> {
    if (this.busy || this.context === null) {
      return;
    }
    this.busy = true;
    const r = await ExportUtil.exportRecordsCsv(this.context);
    await this.handleResult(r, '统计报表已保存');
    this.busy = false;
  }

  async doExportPointsCsv(): Promise<void> {
    if (this.busy || this.context === null) {
      return;
    }
    this.busy = true;
    const r = await ExportUtil.exportPointsCsv(this.context);
    await this.handleResult(r, '积分报表已保存');
    this.busy = false;
  }

  @Builder
  statItem(value: string, label: string) {
    Column() {
      Text(value)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .fontColor(Theme.PRIMARY)
      Text(label)
        .fontSize(11)
        .fontColor(Theme.TEXT_SUB)
        .margin({ top: 3 })
    }
    .layoutWeight(1)
  }

  @Builder
  actionRow(icon: string, title: string, desc: string, action: () => void) {
    Row() {
      Text(icon)
        .fontSize(22)
        .width(42)
        .height(42)
        .textAlign(TextAlign.Center)
        .backgroundColor(Theme.PRIMARY_LIGHT)
        .borderRadius(21)
      Column() {
        Text(title)
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor(Theme.TEXT_MAIN)
        Text(desc)
          .fontSize(11)
          .fontColor(Theme.TEXT_SUB)
          .margin({ top: 2 })
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      .margin({ left: 10 })
      Text('›')
        .fontSize(20)
        .fontColor(Theme.TEXT_SUB)
    }
    .width('100%')
    .padding(12)
    .backgroundColor(Color.White)
    .borderRadius(14)
    .margin({ bottom: 10 })
    .onClick(action)
  }

  build() {
    Column() {
      Row() {
        Text('‹')
          .fontSize(28)
          .fontColor(Theme.TEXT_MAIN)
          .width(40)
          .onClick(() => {
            this.getUIContext().getRouter().back();
          })
        Text('数据备份与导出')
          .fontSize(17)
          .fontWeight(FontWeight.Bold)
          .fontColor(Theme.TEXT_MAIN)
          .layoutWeight(1)
          .textAlign(TextAlign.Center)
        Text('')
          .width(40)
      }
      .width('100%')
      .height(48)
      .backgroundColor(Color.White)

      Scroll() {
        Column() {
          // 数据概览
          Column() {
            Text('本地数据概览')
              .fontSize(14)
              .fontWeight(FontWeight.Bold)
              .fontColor(Theme.TEXT_MAIN)
              .width('100%')
              .margin({ bottom: 12 })
            Row() {
              this.statItem(String(this.recordCount), '低碳记录')
              this.statItem(String(this.pointCount), '积分流水')
              this.statItem(String(this.badgeCount), '徽章')
              this.statItem(String(this.certCount), '证书')
            }
            .width('100%')
          }
          .width('100%')
          .padding(16)
          .backgroundColor(Color.White)
          .borderRadius(16)
          .margin({ left: 12, right: 12, top: 14 })

          Text('备份与导出')
            .fontSize(14)
            .fontWeight(FontWeight.Bold)
            .fontColor(Theme.TEXT_MAIN)
            .width('100%')
            .padding({ left: 16, top: 18, bottom: 8 })

          Column() {
            this.actionRow('💾', '本地快速备份', '在应用沙箱生成一份 JSON 备份', () => {
              this.doAutoBackup();
            })
          }
          .width('100%')
          .padding({ left: 12, right: 12 })

          Column() {
            this.actionRow('📤', '导出 JSON 全量备份', '选择保存位置，含碳数据/积分/徽章/证书', () => {
              this.doExportBackup();
            })
          }
          .width('100%')
          .padding({ left: 12, right: 12 })

          Column() {
            this.actionRow('📊', '导出低碳行为报表(CSV)', '可用 Excel 打开，便于统计分析', () => {
              this.doExportRecordsCsv();
            })
          }
          .width('100%')
          .padding({ left: 12, right: 12 })

          Column() {
            this.actionRow('🧾', '导出积分流水报表(CSV)', '积分获取与兑换明细', () => {
              this.doExportPointsCsv();
            })
          }
          .width('100%')
          .padding({ left: 12, right: 12 })

          if (this.lastBackupPath !== '') {
            Column() {
              Text('✅ 最近一次本地备份')
                .fontSize(12)
                .fontColor(Theme.TEXT_SUB)
                .width('100%')
              Text(this.lastBackupPath)
                .fontSize(11)
                .fontColor(Theme.TEXT_SUB)
                .width('100%')
                .margin({ top: 4 })
            }
            .width('100%')
            .padding(12)
            .backgroundColor(Theme.PRIMARY_LIGHT)
            .borderRadius(12)
            .margin({ left: 12, right: 12 })
          }

          Column() {
            Text('📌 数据说明')
              .fontSize(13)
              .fontWeight(FontWeight.Bold)
              .fontColor(Theme.TEXT_MAIN)
              .width('100%')
            Text('· 本应用为单机版，所有数据保存在本地数据库（carbon_footprint.db），不上传服务器。\n' +
              '· 建议定期导出 JSON 备份留存；卸载应用会清除本地数据。\n' +
              '· 从备份恢复、超级终端家庭同步等能力已预留接入位置，详见随附《拓展功能实现思路》。')
              .fontSize(12)
              .lineHeight(20)
              .fontColor(Theme.TEXT_SUB)
              .width('100%')
              .margin({ top: 8 })
          }
          .width('100%')
          .padding(14)
          .backgroundColor(Color.White)
          .borderRadius(16)
          .margin({ left: 12, right: 12, top: 6, bottom: 16 })
        }
        .width('100%')
      }
      .layoutWeight(1)
      .scrollBar(BarState.Off)
      .align(Alignment.Top)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Theme.BG)
  }
}
