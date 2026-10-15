import { Theme } from '../common/constants/AppConstants';
import { ScienceArticle } from '../common/model/Models';
import { SCIENCE_ARTICLES, ScienceCategory } from '../common/constants/ScienceArticles';

class ScienceTab {
  key: string;
  label: string;

  constructor(key: string, label: string) {
    this.key = key;
    this.label = label;
  }
}

@Component
export struct SciencePage {
  @State filter: string = '全部';
  @State list: Array<ScienceArticle> = SCIENCE_ARTICLES;
  private tabs: Array<ScienceTab> = [
    new ScienceTab('全部', '全部'),
    new ScienceTab(ScienceCategory.POLICY, '双碳政策'),
    new ScienceTab(ScienceCategory.CONCEPT, '基础概念'),
    new ScienceTab(ScienceCategory.TIPS, '减碳技巧')
  ];

  private applyFilter(key: string): void {
    this.filter = key;
    const arr: Array<ScienceArticle> = [];
    for (let i = 0; i < SCIENCE_ARTICLES.length; i++) {
      if (key === '全部' || SCIENCE_ARTICLES[i].category === key) {
        arr.push(SCIENCE_ARTICLES[i]);
      }
    }
    this.list = arr;
  }

  @Builder
  tabChip(t: ScienceTab) {
    Text(t.label)
      .fontSize(13)
      .padding({ left: 14, right: 14, top: 7, bottom: 7 })
      .margin({ right: 8 })
      .borderRadius(16)
      .backgroundColor(this.filter === t.key ? Theme.PRIMARY : Color.White)
      .fontColor(this.filter === t.key ? Color.White : Theme.TEXT_SUB)
      .onClick(() => {
        this.applyFilter(t.key);
      })
  }

  @Builder
  articleCard(a: ScienceArticle) {
    Row() {
      Text(a.icon)
        .fontSize(30)
        .width(52)
        .height(52)
        .textAlign(TextAlign.Center)
        .backgroundColor(Theme.PRIMARY_LIGHT)
        .borderRadius(14)
      Column() {
        Text(a.title)
          .fontSize(15)
          .fontWeight(FontWeight.Bold)
          .fontColor(Theme.TEXT_MAIN)
          .maxLines(2)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
        Text(a.summary)
          .fontSize(12)
          .fontColor(Theme.TEXT_SUB)
          .margin({ top: 5 })
          .maxLines(2)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
        Text(a.category)
          .fontSize(10)
          .fontColor(Theme.PRIMARY)
          .backgroundColor(Theme.PRIMARY_LIGHT)
          .padding({ left: 8, right: 8, top: 3, bottom: 3 })
          .borderRadius(8)
          .margin({ top: 6 })
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      .margin({ left: 12 })
    }
    .width('100%')
    .padding(12)
    .backgroundColor(Color.White)
    .borderRadius(14)
    .margin({ bottom: 10 })
    .onClick(() => {
      this.getUIContext().getRouter().pushUrl({ url: 'pages/ArticleDetailPage', params: { id: a.id } });
    })
  }

  build() {
    Column() {
      Row() {
        Text('双碳科普')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .fontColor(Theme.TEXT_MAIN)
      }
      .width('100%')
      .padding({ left: 16, top: 18, bottom: 8 })

      Scroll() {
        Row() {
          ForEach(this.tabs, (t: ScienceTab) => {
            this.tabChip(t)
          }, (t: ScienceTab) => t.key)
        }
        .padding({ left: 16, right: 16 })
      }
      .scrollable(ScrollDirection.Horizontal)
      .scrollBar(BarState.Off)
      .width('100%')

      Scroll() {
        Column() {
          ForEach(this.list, (a: ScienceArticle) => {
            this.articleCard(a)
          }, (a: ScienceArticle) => a.id)
        }
        .width('100%')
        .padding({ left: 12, right: 12, top: 12, bottom: 16 })
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
