import { common } from '@kit.AbilityKit';
import { Theme } from '../common/constants/AppConstants';
import { pointsRepo } from '../data/repository/PointsRepository';
import { ensureDb } from '../data/db/CarbonDb';
import { showToast } from '../common/utils/ToastUtil';

@Component
export struct MinePage {
  @State owner: string = '低碳行者';
  @State balance: number = 0;
  @State badgeCount: number = 0;
  @State treeCount: number = 0;
  @State editing: boolean = false;
  @State inputName: string = '';
  // 由 Index 通过 @Prop 直传（替代原 @StorageProp 监听，Tabs 懒加载下更可靠）
  @Prop @Watch('onTickChange') tick: number = 0;
  private reloading: boolean = false;

  async aboutToAppear(): Promise<void> {
    await this.reload();
  }

  /** refreshTick 变化时由 @Watch 触发 */
  onTickChange(): void {
    this.reload();
  }

  async reload(): Promise<void> {
    if (this.reloading) {
      return;
    }
    this.reloading = true;
    try {
      // 兜底：确保数据库已初始化
      await ensureDb(this.getUIContext().getHostContext() as common.Context);
      this.owner = await pointsRepo.getOwnerName();
      this.balance = await pointsRepo.getBalance();
      this.badgeCount = (await pointsRepo.getUnlockedBadges()).length;
      this.treeCount = await pointsRepo.getTreeCount();
    } finally {
      this.reloading = false;
    }
  }

  openEdit(): void {
    this.inputName = this.owner;
    this.editing = true;
  }

  async confirmName(): Promise<void> {
    const n = this.inputName.trim();
    if (n === '') {
      showToast(this.getUIContext(), '昵称不能为空');
      return;
    }
    await pointsRepo.setOwnerName(n);
    this.owner = n;
    this.editing = false;
    showToast(this.getUIContext(), '昵称已更新');
  }

  @Builder
  cell(icon: string, name: string, extra: string, url: string) {
    Row() {
      Text(icon)
        .fontSize(20)
        .width(38)
        .height(38)
        .textAlign(TextAlign.Center)
        .backgroundColor(Theme.BG)
        .borderRadius(19)
      Text(name)
        .fontSize(14)
        .fontColor(Theme.TEXT_MAIN)
        .layoutWeight(1)
        .margin({ left: 12 })
      Text(extra)
        .fontSize(12)
        .fontColor(Theme.TEXT_SUB)
        .margin({ right: 4 })
      Text('›')
        .fontSize(20)
        .fontColor(Theme.TEXT_SUB)
    }
    .width('100%')
    .padding({ top: 12, bottom: 12, left: 4, right: 4 })
    .onClick(() => {
      this.getUIContext().getRouter().pushUrl({ url: url });
    })
  }

  @Builder
  futureCell(icon: string, name: string, url: string) {
    Row() {
      Text(icon)
        .fontSize(18)
        .width(34)
        .height(34)
        .textAlign(TextAlign.Center)
      Text(name)
        .fontSize(13)
        .fontColor(Theme.TEXT_MAIN)
        .layoutWeight(1)
        .margin({ left: 10 })
      Text('已上线')
        .fontSize(10)
        .fontColor(Theme.PRIMARY)
        .backgroundColor(Theme.PRIMARY_LIGHT)
        .padding({ left: 6, right: 6, top: 2, bottom: 2 })
        .borderRadius(8)
      Text('›')
        .fontSize(18)
        .fontColor(Theme.TEXT_SUB)
        .margin({ left: 6 })
    }
    .width('100%')
    .padding({ top: 10, bottom: 10, left: 4, right: 4 })
    .onClick(() => {
      this.getUIContext().getRouter().pushUrl({ url: url });
    })
  }

  @Builder
  editDialog() {
    Column() {
      Column() {
        Text('设置昵称')
          .fontSize(17)
          .fontWeight(FontWeight.Bold)
          .fontColor(Theme.TEXT_MAIN)
          .margin({ bottom: 16 })
        TextInput({ text: this.inputName, placeholder: '请输入昵称' })
          .width('100%')
          .height(44)
          .backgroundColor(Theme.BG)
          .borderRadius(12)
          .onChange((v: string) => {
            this.inputName = v;
          })
        Row() {
          Button('取消')
            .layoutWeight(1)
            .height(40)
            .backgroundColor(Theme.BG)
            .fontColor(Theme.TEXT_SUB)
            .onClick(() => {
              this.editing = false;
            })
          Button('保存')
            .layoutWeight(1)
            .height(40)
            .backgroundColor(Theme.PRIMARY)
            .margin({ left: 12 })
            .onClick(() => {
              this.confirmName();
            })
        }
        .width('100%')
        .margin({ top: 18 })
      }
      .width('82%')
      .padding(22)
      .backgroundColor(Color.White)
      .borderRadius(18)
      .onClick(() => {
        // 阻止点击卡片时关闭弹窗
      })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#80000000')
    .justifyContent(FlexAlign.Center)
    .onClick(() => {
      this.editing = false;
    })
  }

  build() {
    Stack() {
      Scroll() {
        Column() {
          // 个人卡片
          Column() {
            Row() {
              Text('🌱')
                .fontSize(30)
                .width(64)
                .height(64)
                .textAlign(TextAlign.Center)
                .backgroundColor('#FFFFFF33')
                .borderRadius(32)
              Column() {
                Row() {
                  Text(this.owner)
                    .fontSize(19)
                    .fontWeight(FontWeight.Bold)
                    .fontColor(Color.White)
                  Text(' ✏️')
                    .fontSize(13)
                    .margin({ left: 6 })
                }
                .onClick(() => {
                  this.openEdit();
                })
                Text('点击昵称可修改')
                  .fontSize(11)
                  .fontColor('#E6FFF4')
                  .margin({ top: 6 })
              }
              .alignItems(HorizontalAlign.Start)
              .layoutWeight(1)
              .margin({ left: 14 })
            }
            .width('100%')

            Row() {
              Column() {
                Text(String(this.balance))
                  .fontSize(20)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Color.White)
                Text('碳积分')
                  .fontSize(11)
                  .fontColor('#E6FFF4')
                  .margin({ top: 3 })
              }
              .layoutWeight(1)
              Column() {
                Text(String(this.badgeCount))
                  .fontSize(20)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Color.White)
                Text('徽章')
                  .fontSize(11)
                  .fontColor('#E6FFF4')
                  .margin({ top: 3 })
              }
              .layoutWeight(1)
              Column() {
                Text(String(this.treeCount))
                  .fontSize(20)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Color.White)
                Text('种树')
                  .fontSize(11)
                  .fontColor('#E6FFF4')
                  .margin({ top: 3 })
              }
              .layoutWeight(1)
            }
            .width('100%')
            .margin({ top: 18 })
          }
          .width('100%')
          .padding(20)
          .alignItems(HorizontalAlign.Start)
          .linearGradient({ angle: 135, colors: [['#26996B', 0.0], ['#3FCB8C', 1.0]] })
          .borderRadius({ bottomLeft: 24, bottomRight: 24 })

          // 功能
          Column() {
            Column() {
              this.cell('🏅', '低碳徽章墙', '', 'pages/BadgesPage')
              Divider().color(Theme.DIVIDER)
              this.cell('🌳', '植树证书', '', 'pages/CertificatePage')
              Divider().color(Theme.DIVIDER)
              this.cell('📒', '积分流水', '', 'pages/PointsRecordsPage')
              Divider().color(Theme.DIVIDER)
              this.cell('🧮', '碳排放因子库', '26 项', 'pages/FactorLibraryPage')
              Divider().color(Theme.DIVIDER)
              this.cell('💾', '数据备份与导出', '', 'pages/BackupPage')
            }
            .width('100%')
            .padding({ left: 12, right: 12 })
            .backgroundColor(Color.White)
            .borderRadius(16)
            .margin({ left: 12, right: 12, top: 16 })
          }
          .width('100%')

          // 拓展能力预告
          Column() {
            Row() {
              Text('🚀 鸿蒙特色能力')
                .fontSize(15)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.TEXT_MAIN)
            }
            .width('100%')
            .margin({ bottom: 6 })
            Column() {
              this.futureCell('📡', '超级终端·家庭碳积分合并', 'pages/FamilyPage')
              Divider().color(Theme.DIVIDER)
              this.futureCell('📷', '端侧 AI 图片智能识别', 'pages/AiRecognizePage')
              Divider().color(Theme.DIVIDER)
              this.futureCell('🏙️', '城市碳普惠平台对接', 'pages/CarbonInclusivePage')
              Divider().color(Theme.DIVIDER)
              this.futureCell('📢', '智能服务·提醒建议与分享', 'pages/SmartPage')
            }
            .width('100%')
            .padding({ left: 12, right: 12 })
            .backgroundColor(Color.White)
            .borderRadius(16)
          }
          .width('100%')
          .padding({ left: 12, right: 12 })
          .margin({ top: 16 })

          Text('碳足迹 · 全民绿色生活 v1.0.0（单机版）\n响应“双碳”战略，践行低碳生活')
            .fontSize(11)
            .fontColor(Theme.TEXT_SUB)
            .textAlign(TextAlign.Center)
            .width('100%')
            .margin({ top: 22, bottom: 20 })
        }
        .width('100%')
      }
      .width('100%')
      .height('100%')
      .scrollBar(BarState.Off)
      .align(Alignment.Top)
      .backgroundColor(Theme.BG)

      if (this.editing) {
        this.editDialog()
      }
    }
    .width('100%')
    .height('100%')
    .alignContent(Alignment.Center)
  }
}
