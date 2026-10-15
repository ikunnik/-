import { Theme } from '../common/constants/AppConstants';
import { ScienceArticle } from '../common/model/Models';
import { getArticleById } from '../common/constants/ScienceArticles';

class ArticleParams {
  id: string = '';
}

@Entry
@Component
struct ArticleDetailPage {
  @State article: ScienceArticle | null = null;
  private paragraphs: Array<string> = [];

  aboutToAppear(): void {
    const p = this.getUIContext().getRouter().getParams() as ArticleParams;
    let id = '';
    if (p !== null && p !== undefined) {
      id = p.id;
    }
    const a = getArticleById(id);
    if (a !== null) {
      this.article = a;
      const parts = a.content.split('\n');
      const arr: Array<string> = [];
      for (let i = 0; i < parts.length; i++) {
        const trimmed = parts[i].trim();
        if (trimmed !== '') {
          arr.push(trimmed);
        }
      }
      this.paragraphs = arr;
    }
  }

  @Builder
  header() {
    Column() {
      Text(this.article?.icon ?? '📖')
        .fontSize(56)
        .width(96)
        .height(96)
        .textAlign(TextAlign.Center)
        .backgroundColor(Theme.PRIMARY_LIGHT)
        .borderRadius(24)
      Text(this.article?.category ?? '')
        .fontSize(11)
        .fontColor(Theme.PRIMARY)
        .backgroundColor(Theme.PRIMARY_LIGHT)
        .padding({ left: 10, right: 10, top: 4, bottom: 4 })
        .borderRadius(10)
        .margin({ top: 12 })
      Text(this.article?.title ?? '')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .fontColor(Theme.TEXT_MAIN)
        .textAlign(TextAlign.Center)
        .margin({ top: 12, left: 12, right: 12 })
    }
    .width('100%')
    .padding({ top: 20, bottom: 20 })
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
        Text('科普详情')
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

      if (this.article === null) {
        Text('文章不存在')
          .fontSize(14)
          .fontColor(Theme.TEXT_SUB)
          .margin({ top: 40 })
      } else {
        Scroll() {
          Column() {
            this.header()
            Column() {
              ForEach(this.paragraphs, (text: string, index: number) => {
                Text(text)
                  .fontSize(15)
                  .lineHeight(26)
                  .fontColor('#374151')
                  .width('100%')
                  .margin({ bottom: 14 })
              }, (text: string, index: number) => String(index))
            }
            .width('100%')
            .padding(16)
            .backgroundColor(Color.White)
            .borderRadius(16)
            .margin({ left: 12, right: 12, bottom: 24 })
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
