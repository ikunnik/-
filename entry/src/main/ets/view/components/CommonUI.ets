/**
 * 通用 UI 组件：卡片、分区标题、统计块、空态
 */
import { Theme } from '../../common/constants/AppConstants';

@Builder
function EmptyBuilder() {
  Column() {
  }
}

@Component
export struct Card {
  @Prop innerPadding: number = 14;
  @BuilderParam content: () => void = EmptyBuilder;

  build() {
    Column() {
      this.content()
    }
    .width('100%')
    .backgroundColor(Theme.CARD)
    .borderRadius(16)
    .padding(this.innerPadding)
    .shadow({
      radius: 8,
      color: '#11000000',
      offsetX: 0,
      offsetY: 2
    })
  }
}

@Component
export struct SectionTitle {
  @Prop title: string = '';
  @Prop moreText: string = '';
  onMore: () => void = (): void => {
  };

  build() {
    Row() {
      Row() {
        Divider()
          .vertical(true)
          .height(16)
          .width(3)
          .color(Theme.PRIMARY)
          .borderRadius(2)
          .margin({ right: 8 })
        Text(this.title)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor(Theme.TEXT_MAIN)
      }

      Blank()
      if (this.moreText !== '') {
        Text(this.moreText + ' >')
          .fontSize(12)
          .fontColor(Theme.TEXT_SUB)
          .onClick(() => {
            this.onMore();
          })
      }
    }
    .width('100%')
    .margin({ bottom: 10 })
  }
}

@Component
export struct StatMini {
  @Prop icon: string = '';
  @Prop value: string = '';
  @Prop label: string = '';
  @Prop color: string = Theme.PRIMARY;

  build() {
    Column() {
      Text(this.icon)
        .fontSize(22)
        .margin({ bottom: 4 })
      Text(this.value)
        .fontSize(17)
        .fontWeight(FontWeight.Bold)
        .fontColor(Theme.TEXT_MAIN)
        .maxLines(1)
      Text(this.label)
        .fontSize(11)
        .fontColor(Theme.TEXT_SUB)
        .margin({ top: 2 })
        .maxLines(1)
    }
    .layoutWeight(1)
    .padding({ top: 12, bottom: 12 })
    .backgroundColor(Theme.BG)
    .borderRadius(12)
  }
}

@Component
export struct EmptyView {
  @Prop icon: string = '🍃';
  @Prop text: string = '暂无数据';

  build() {
    Column() {
      Text(this.icon)
        .fontSize(42)
        .margin({ bottom: 10 })
      Text(this.text)
        .fontSize(13)
        .fontColor(Theme.TEXT_SUB)
    }
    .width('100%')
    .padding({ top: 40, bottom: 40 })
    .justifyContent(FlexAlign.Center)
  }
}
