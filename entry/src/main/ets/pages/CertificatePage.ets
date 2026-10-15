import { Theme, PointRule } from '../common/constants/AppConstants';
import { Certificate } from '../common/model/Models';
import { pointsRepo } from '../data/repository/PointsRepository';
import { carbonRepo } from '../data/repository/CarbonRepository';
import { showToast } from '../common/utils/ToastUtil';
import { EmptyView } from '../view/components/CommonUI';

@Entry
@Component
struct CertificatePage {
  @State balance: number = 0;
  @State treeCount: number = 0;
  @State owner: string = '低碳行者';
  @State certs: Array<Certificate> = [];
  @State exchangeNum: number = 1;
  private nums: Array<number> = [1, 3, 5, 10];

  async aboutToAppear(): Promise<void> {
    await this.reload();
  }

  async reload(): Promise<void> {
    this.balance = await pointsRepo.getBalance();
    this.treeCount = await pointsRepo.getTreeCount();
    this.owner = await pointsRepo.getOwnerName();
    this.certs = await pointsRepo.getCertificates();
  }

  async exchange(): Promise<void> {
    const cost = this.exchangeNum * PointRule.POINTS_PER_TREE;
    if (this.balance < cost) {
      showToast(this.getUIContext(), '积分不足，继续记录低碳行为积攒积分吧');
      return;
    }
    const cert = await pointsRepo.exchangeCertificate(this.exchangeNum);
    if (cert !== null) {
      showToast(this.getUIContext(), '成功兑换 ' + this.exchangeNum + ' 棵低碳树！');
      await carbonRepo.refreshBadges();
      await this.reload();
      const cur = AppStorage.get<number>('refreshTick') ?? 0;
      AppStorage.setOrCreate('refreshTick', cur + 1);
    } else {
      showToast(this.getUIContext(), '兑换失败，积分不足');
    }
  }

  @Builder
  numChip(n: number) {
    Text(n + ' 棵')
      .fontSize(14)
      .layoutWeight(1)
      .height(38)
      .textAlign(TextAlign.Center)
      .borderRadius(19)
      .backgroundColor(this.exchangeNum === n ? Theme.PRIMARY : Color.White)
      .fontColor(this.exchangeNum === n ? Color.White : Theme.TEXT_SUB)
      .fontWeight(this.exchangeNum === n ? FontWeight.Bold : FontWeight.Normal)
      .onClick(() => {
        this.exchangeNum = n;
      })
  }

  @Builder
  certificateCard(c: Certificate) {
    Column() {
      Text('🌳 全民低碳植树荣誉证书')
        .fontSize(15)
        .fontWeight(FontWeight.Bold)
        .fontColor('#2E7D52')
      Row() {
        Text('🌲')
          .fontSize(46)
          .margin({ right: 12 })
        Column() {
          Text('持有人：' + c.owner)
            .fontSize(13)
            .fontColor(Theme.TEXT_MAIN)
          Text('以低碳行动兑换 ' + c.treeCount + ' 棵低碳树')
            .fontSize(13)
            .fontColor(Theme.TEXT_MAIN)
            .margin({ top: 6 })
          Text('为应对气候变化贡献一份绿色力量')
            .fontSize(11)
            .fontColor(Theme.TEXT_SUB)
            .margin({ top: 6 })
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)
      }
      .width('100%')
      .margin({ top: 14 })
      Divider()
        .color('#CDEAD9')
        .margin({ top: 12, bottom: 10 })
      Row() {
        Text('编号：' + c.code)
          .fontSize(11)
          .fontColor(Theme.TEXT_SUB)
          .layoutWeight(1)
        Text(c.dateStr)
          .fontSize(11)
          .fontColor(Theme.TEXT_SUB)
      }
      .width('100%')
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#F2FBF5')
    .borderRadius(16)
    .border({ width: 1.5, color: '#9BD8B6' })
    .margin({ bottom: 12 })
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
        Text('植树证书')
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
          // 兑换区
          Column() {
            Row() {
              Column() {
                Text('我的积分')
                  .fontSize(12)
                  .fontColor(Theme.TEXT_SUB)
                Text(String(this.balance))
                  .fontSize(26)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Theme.WARN)
              }
              .alignItems(HorizontalAlign.Start)
              .layoutWeight(1)
              Column() {
                Text('已种树')
                  .fontSize(12)
                  .fontColor(Theme.TEXT_SUB)
                Text(String(this.treeCount) + ' 棵')
                  .fontSize(26)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Theme.PRIMARY)
              }
              .alignItems(HorizontalAlign.End)
            }
            .width('100%')

            Text('选择兑换数量（每棵 ' + PointRule.POINTS_PER_TREE + ' 积分）')
              .fontSize(13)
              .fontColor(Theme.TEXT_MAIN)
              .width('100%')
              .margin({ top: 16, bottom: 10 })
            Row() {
              ForEach(this.nums, (n: number) => {
                this.numChip(n)
              }, (n: number) => String(n))
            }
            .width('100%')

            Button('🌳 兑换 ' + this.exchangeNum + ' 棵，消耗 ' +
              (this.exchangeNum * PointRule.POINTS_PER_TREE) + ' 积分')
              .width('100%')
              .height(46)
              .fontSize(15)
              .fontWeight(FontWeight.Bold)
              .backgroundColor(Theme.PRIMARY)
              .borderRadius(23)
              .margin({ top: 16 })
              .onClick(() => {
                this.exchange();
              })
          }
          .width('100%')
          .padding(16)
          .backgroundColor(Color.White)
          .borderRadius(16)
          .margin({ left: 12, right: 12, top: 14 })

          // 证书列表
          Row() {
            Text('我的证书')
              .fontSize(16)
              .fontWeight(FontWeight.Bold)
              .fontColor(Theme.TEXT_MAIN)
          }
          .width('100%')
          .padding({ left: 16, top: 16, bottom: 8 })

          if (this.certs.length === 0) {
            EmptyView({ icon: '🌱', text: '还没有证书，用积分兑换第一棵树吧' })
          } else {
            Column() {
              ForEach(this.certs, (c: Certificate) => {
                this.certificateCard(c)
              }, (c: Certificate) => c.code)
            }
            .width('100%')
            .padding({ left: 12, right: 12, bottom: 16 })
          }
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
