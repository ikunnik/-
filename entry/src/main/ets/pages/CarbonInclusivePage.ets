import { Theme } from '../common/constants/AppConstants';
import { BenefitOrder } from '../common/model/Models';
import { carbonInclusiveClient, Benefit } from '../features/platform/CarbonInclusiveClient';
import { platformRepo } from '../data/repository/PlatformRepository';
import { pointsRepo } from '../data/repository/PointsRepository';
import { showToast } from '../common/utils/ToastUtil';
import { formatDateTime } from '../common/utils/DateUtil';

@Entry
@Component
struct CarbonInclusivePage {
  @State localPoints: number = 0;
  @State remotePoints: number = 0;
  @State lastSync: number = 0;
  @State benefits: Array<Benefit> = [];
  @State orders: Array<BenefitOrder> = [];
  @State syncing: boolean = false;

  async aboutToAppear(): Promise<void> {
    this.benefits = await carbonInclusiveClient.listBenefits();
    await this.reload();
  }

  onPageShow(): void {
    this.reload();
  }

  async reload(): Promise<void> {
    this.localPoints = await pointsRepo.getBalance();
    this.remotePoints = await platformRepo.getRemotePoints();
    this.lastSync = await platformRepo.getLastSync();
    this.orders = await platformRepo.getOrders();
  }

  async sync(): Promise<void> {
    if (this.syncing) {
      return;
    }
    this.syncing = true;
    await carbonInclusiveClient.mockDelay(800);
    const remote = await platformRepo.syncFromLocal();
    await this.reload();
    this.syncing = false;
    showToast(this.getUIContext(), '已上报同步，平台碳币 ' + remote);
  }

  async exchange(b: Benefit): Promise<void> {
    if (this.localPoints < b.points) {
      showToast(this.getUIContext(), '积分不足，再积累 ' + (b.points - this.localPoints) + ' 积分');
      return;
    }
    try {
      const res = await this.getUIContext().getPromptAction().showDialog({
        title: '兑换权益',
        message: '确认用 ' + b.points + ' 积分兑换「' + b.name + '」吗？',
        buttons: [
          { text: '取消', color: Theme.TEXT_SUB },
          { text: '确认兑换', color: Theme.PRIMARY }
        ]
      });
      if (res.index !== 1) {
        return;
      }
    } catch (e) {
      return;
    }
    await carbonInclusiveClient.mockDelay(600);
    const order = await platformRepo.exchangeBenefit(b);
    if (order === null) {
      showToast(this.getUIContext(), '兑换失败，积分不足');
      return;
    }
    await this.reload();
    try {
      this.getUIContext().getPromptAction().showDialog({
        title: '🎉 兑换成功',
        message: '「' + b.name + '」核销码：' + order.code + '\n可在我的权益中查看使用',
        buttons: [{ text: '好的', color: Theme.PRIMARY }]
      });
    } catch (e) {
      // 弹窗参数异常导致抛错，忽略
    }
  }

  @Builder
  benefitCard(b: Benefit) {
    Column() {
      Text(b.icon)
        .fontSize(34)
        .margin({ top: 4, bottom: 6 })
      Text(b.name)
        .fontSize(13)
        .fontWeight(FontWeight.Bold)
        .fontColor(Theme.TEXT_MAIN)
        .maxLines(1)
      Text(b.desc)
        .fontSize(10)
        .fontColor(Theme.TEXT_SUB)
        .lineHeight(14)
        .height(28)
        .margin({ top: 4, bottom: 6 })
        .textAlign(TextAlign.Center)
      Button(b.points + ' 积分')
        .width('100%')
        .height(30)
        .fontSize(12)
        .backgroundColor(this.localPoints >= b.points ? Theme.PRIMARY : Theme.DIVIDER)
        .fontColor(this.localPoints >= b.points ? Color.White : Theme.TEXT_SUB)
        .onClick(() => {
          this.exchange(b);
        })
    }
    .width('100%')
    .height(150)
    .padding(10)
    .backgroundColor(Color.White)
    .borderRadius(14)
    .alignItems(HorizontalAlign.Center)
  }

  @Builder
  orderRow(o: BenefitOrder) {
    Row() {
      Text(o.icon)
        .fontSize(24)
        .width(44)
        .height(44)
        .textAlign(TextAlign.Center)
        .backgroundColor(Theme.BG)
        .borderRadius(22)
      Column() {
        Text(o.name)
          .fontSize(13)
          .fontWeight(FontWeight.Medium)
          .fontColor(Theme.TEXT_MAIN)
        Text('核销码 ' + o.code)
          .fontSize(10)
          .fontColor(Theme.TEXT_SUB)
          .margin({ top: 3 })
        Text(formatDateTime(o.date))
          .fontSize(10)
          .fontColor(Theme.TEXT_SUB)
          .margin({ top: 2 })
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      .margin({ left: 10 })
      Text('-' + o.points)
        .fontSize(14)
        .fontWeight(FontWeight.Bold)
        .fontColor(Theme.DANGER)
    }
    .width('100%')
    .padding({ top: 10, bottom: 10 })
  }

  build() {
    Column() {
      // 顶部导航
      Row() {
        Text('‹')
          .fontSize(28)
          .fontColor(Color.White)
          .width(40)
          .onClick(() => {
            this.getUIContext().getRouter().back();
          })
        Text('城市碳普惠平台')
          .fontSize(17)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.White)
          .layoutWeight(1)
          .textAlign(TextAlign.Center)
        Text('')
          .width(40)
      }
      .width('100%')
      .height(48)
      .padding({ left: 8, right: 8 })

      Scroll() {
        Column() {
          // 平台账户卡
          Column() {
            Row() {
              Text('🏙️ 城市碳普惠平台')
                .fontSize(16)
                .fontWeight(FontWeight.Bold)
                .fontColor(Color.White)
                .layoutWeight(1)
              Text('模拟对接')
                .fontSize(10)
                .fontColor(Theme.PRIMARY)
                .backgroundColor(Color.White)
                .padding({ left: 6, right: 6, top: 2, bottom: 2 })
                .borderRadius(8)
            }
            .width('100%')
            Row() {
              Column() {
                Text(String(this.localPoints))
                  .fontSize(22)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Color.White)
                Text('App 碳积分')
                  .fontSize(11)
                  .fontColor('#E6FFF4')
                  .margin({ top: 3 })
              }
              .layoutWeight(1)
              .alignItems(HorizontalAlign.Start)
              Text('⇄')
                .fontSize(22)
                .fontColor(Color.White)
              Column() {
                Text(String(this.remotePoints))
                  .fontSize(22)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Color.White)
                Text('平台碳币')
                  .fontSize(11)
                  .fontColor('#E6FFF4')
                  .margin({ top: 3 })
              }
              .layoutWeight(1)
              .alignItems(HorizontalAlign.End)
            }
            .width('100%')
            .margin({ top: 14 })
            Text(this.lastSync === 0 ? '尚未同步，点击下方按钮上报积分' : '上次同步：' + formatDateTime(this.lastSync))
              .fontSize(11)
              .fontColor('#E6FFF4')
              .width('100%')
              .margin({ top: 8 })
            Button(this.syncing ? '正在同步…' : '🔄 一键同步积分到平台')
              .width('100%')
              .height(42)
              .fontSize(14)
              .fontWeight(FontWeight.Bold)
              .backgroundColor(Color.White)
              .fontColor(Theme.PRIMARY)
              .borderRadius(21)
              .margin({ top: 12 })
              .enabled(!this.syncing)
              .onClick(() => {
                this.sync();
              })
          }
          .width('100%')
          .padding(18)
          .alignItems(HorizontalAlign.Start)
          .linearGradient({ angle: 135, colors: [['#2563B0', 0.0], ['#3FCB8C', 1.0]] })
          .borderRadius({ bottomLeft: 24, bottomRight: 24 })

          // 权益商城
          Column() {
            Row() {
              Text('🎁 低碳权益商城')
                .fontSize(15)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.TEXT_MAIN)
                .layoutWeight(1)
              Text('我的积分 ' + this.localPoints)
                .fontSize(12)
                .fontColor(Theme.WARN)
            }
            .width('100%')
            .margin({ bottom: 10 })
            Grid() {
              ForEach(this.benefits, (b: Benefit) => {
                GridItem() {
                  this.benefitCard(b)
                }
              }, (b: Benefit) => b.id)
            }
            .columnsTemplate('1fr 1fr')
            .columnsGap(10)
            .rowsGap(10)
            .height(Math.ceil(this.benefits.length / 2) * 158)
            .width('100%')
          }
          .width('100%')
          .padding(14)
          .backgroundColor(Color.White)
          .borderRadius(16)
          .margin({ left: 12, right: 12, top: 14 })

          // 我的权益/兑换记录
          Column() {
            Text('📒 我的兑换记录')
              .fontSize(15)
              .fontWeight(FontWeight.Bold)
              .fontColor(Theme.TEXT_MAIN)
              .width('100%')
              .margin({ bottom: 4 })
            if (this.orders.length === 0) {
              Column() {
                Text('🎫')
                  .fontSize(38)
                  .margin({ bottom: 8 })
                Text('还没有兑换记录，快去用积分兑换权益吧')
                  .fontSize(12)
                  .fontColor(Theme.TEXT_SUB)
              }
              .width('100%')
              .padding({ top: 24, bottom: 24 })
            } else {
              ForEach(this.orders, (o: BenefitOrder) => {
                this.orderRow(o)
                Divider().color(Theme.DIVIDER)
              }, (o: BenefitOrder) => String(o.id))
            }
          }
          .width('100%')
          .padding(14)
          .backgroundColor(Color.White)
          .borderRadius(16)
          .margin({ left: 12, right: 12, top: 14, bottom: 20 })
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
