import { Theme } from '../common/constants/AppConstants';
import { PointRecord } from '../common/model/Models';
import { pointsRepo } from '../data/repository/PointsRepository';
import { formatDateTime } from '../common/utils/DateUtil';
import { EmptyView } from '../view/components/CommonUI';

@Entry
@Component
struct PointsRecordsPage {
  @State balance: number = 0;
  @State records: Array<PointRecord> = [];

  async aboutToAppear(): Promise<void> {
    this.balance = await pointsRepo.getBalance();
    this.records = await pointsRepo.getPointRecords(500);
  }

  @Builder
  row(r: PointRecord) {
    Row() {
      Text(r.amount >= 0 ? '➕' : '🎁')
        .fontSize(20)
        .width(40)
        .height(40)
        .textAlign(TextAlign.Center)
        .backgroundColor(Theme.BG)
        .borderRadius(20)
      Column() {
        Text(r.reason)
          .fontSize(14)
          .fontColor(Theme.TEXT_MAIN)
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
        Text(formatDateTime(r.date))
          .fontSize(11)
          .fontColor(Theme.TEXT_SUB)
          .margin({ top: 3 })
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      .margin({ left: 10 })

      Text((r.amount >= 0 ? '+' : '') + r.amount)
        .fontSize(15)
        .fontWeight(FontWeight.Bold)
        .fontColor(r.amount >= 0 ? Theme.PRIMARY : Theme.DANGER)
    }
    .width('100%')
    .padding({ top: 9, bottom: 9 })
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
        Text('积分流水')
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

      Row() {
        Text('当前余额')
          .fontSize(13)
          .fontColor(Theme.TEXT_SUB)
        Blank()
        Text(String(this.balance) + ' 积分')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .fontColor(Theme.WARN)
      }
      .width('100%')
      .padding(16)
      .backgroundColor(Color.White)

      if (this.records.length === 0) {
        EmptyView({ icon: '📒', text: '暂无积分记录' })
      } else {
        Scroll() {
          Column() {
            Column() {
              ForEach(this.records, (r: PointRecord) => {
                this.row(r)
                Divider().color(Theme.DIVIDER)
              }, (r: PointRecord) => String(r.id))
            }
            .width('100%')
            .padding({ left: 14, right: 14 })
            .backgroundColor(Color.White)
            .borderRadius(14)
            .margin({ left: 12, right: 12, top: 12, bottom: 16 })
          }
          .width('100%')
        }
        .layoutWeight(1)
        .scrollBar(BarState.Off)
        .align(Alignment.Top)
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Theme.BG)
  }
}
