import { Theme } from '../common/constants/AppConstants';
import { BadgeDef } from '../common/model/Models';
import { BADGES } from '../common/constants/Badges';
import { pointsRepo } from '../data/repository/PointsRepository';

@Entry
@Component
struct BadgesPage {
  @State dateMap: Map<string, string> = new Map<string, string>();
  @State unlockedCount: number = 0;

  async aboutToAppear(): Promise<void> {
    const badges = await pointsRepo.getUnlockedBadges();
    const map = new Map<string, string>();
    for (let i = 0; i < badges.length; i++) {
      map.set(badges[i].badgeId, badges[i].dateStr);
    }
    this.dateMap = map;
    this.unlockedCount = badges.length;
  }

  @Builder
  badgeCell(b: BadgeDef) {
    Column() {
      Stack() {
        Text(b.icon)
          .fontSize(40)
          .opacity(this.dateMap.has(b.id) ? 1.0 : 0.3)
        if (!this.dateMap.has(b.id)) {
          Text('🔒')
            .fontSize(16)
            .position({ right: 0, bottom: 0 })
        }
      }
      .width(64)
      .height(64)
      .margin({ top: 14 })

      Text(b.name)
        .fontSize(14)
        .fontWeight(FontWeight.Bold)
        .fontColor(this.dateMap.has(b.id) ? Theme.TEXT_MAIN : Theme.TEXT_SUB)
        .margin({ top: 8 })
      Text(b.desc)
        .fontSize(11)
        .fontColor(Theme.TEXT_SUB)
        .margin({ top: 4, left: 8, right: 8 })
        .textAlign(TextAlign.Center)
      Text(this.dateMap.has(b.id) ? '解锁于 ' + this.dateMap.get(b.id) : '未解锁')
        .fontSize(10)
        .fontColor(this.dateMap.has(b.id) ? Theme.PRIMARY : Theme.TEXT_SUB)
        .margin({ top: 6, bottom: 12 })
    }
    .width('100%')
    .backgroundColor(this.dateMap.has(b.id) ? Theme.PRIMARY_LIGHT : '#F9FAFB')
    .borderRadius(14)
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
        Text('低碳徽章墙')
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
        Text('🏅 已解锁 ' + this.unlockedCount + ' / ' + BADGES.length + ' 枚徽章')
          .fontSize(13)
          .fontColor(Theme.TEXT_SUB)
      }
      .width('100%')
      .padding({ left: 16, top: 12, bottom: 10 })

      Scroll() {
        Grid() {
          ForEach(BADGES, (b: BadgeDef) => {
            GridItem() {
              this.badgeCell(b)
            }
          }, (b: BadgeDef) => b.id)
        }
        .columnsTemplate('1fr 1fr')
        .columnsGap(12)
        .rowsGap(12)
        .padding({ left: 12, right: 12, bottom: 16 })
        .width('100%')
      }
      .layoutWeight(1)
      .scrollBar(BarState.Off)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Theme.BG)
  }
}
