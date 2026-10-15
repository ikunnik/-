import { Theme, CATEGORY_META, CategoryMeta } from '../common/constants/AppConstants';
import { getBehaviorsByCategory } from '../common/constants/EmissionFactors';
import { BehaviorType } from '../common/model/Models';

@Entry
@Component
struct FactorLibraryPage {
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
        Text('碳排放因子库')
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

      Text('内置参考排放因子，用于自动核算每一项低碳行为的减排量（kgCO₂e）。数据为科普参考值，可随研究更新。')
        .fontSize(12)
        .lineHeight(19)
        .fontColor(Theme.TEXT_SUB)
        .width('100%')
        .padding({ left: 16, right: 16, top: 12, bottom: 10 })

      Scroll() {
        Column() {
          ForEach(CATEGORY_META, (cat: CategoryMeta) => {
            Column() {
              Row() {
                Text(cat.icon + ' ' + cat.name)
                  .fontSize(14)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(cat.color)
              }
              .width('100%')
              .margin({ bottom: 8 })
              Column() {
                ForEach(getBehaviorsByCategory(cat.key), (b: BehaviorType) => {
                  Row() {
                    Text(b.icon)
                      .fontSize(20)
                      .width(38)
                      .height(38)
                      .textAlign(TextAlign.Center)
                      .backgroundColor(Theme.BG)
                      .borderRadius(19)
                    Column() {
                      Text(b.name)
                        .fontSize(13)
                        .fontColor(Theme.TEXT_MAIN)
                      Text(b.hint)
                        .fontSize(11)
                        .fontColor(Theme.TEXT_SUB)
                        .margin({ top: 2 })
                        .maxLines(1)
                        .textOverflow({ overflow: TextOverflow.Ellipsis })
                    }
                    .alignItems(HorizontalAlign.Start)
                    .layoutWeight(1)
                    .margin({ left: 10 })
                    Text(b.factor + ' kg/' + b.unit)
                      .fontSize(12)
                      .fontColor(Theme.PRIMARY)
                      .fontWeight(FontWeight.Bold)
                  }
                  .width('100%')
                  .padding({ top: 9, bottom: 9 })
                }, (b: BehaviorType) => b.id)
              }
              .width('100%')
              .padding({ left: 12, right: 12 })
              .backgroundColor(Color.White)
              .borderRadius(14)
            }
            .width('100%')
            .padding({ left: 12, right: 12 })
            .margin({ bottom: 12 })
          }, (cat: CategoryMeta) => cat.key)
        }
        .width('100%')
        .padding({ bottom: 16 })
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
