import { Theme, CATEGORY_META } from '../common/constants/AppConstants';
import { carbonRepo } from '../data/repository/CarbonRepository';
import { CarbonRecord } from '../common/model/Models';
import { formatDate, startOfDay, formatDateTime } from '../common/utils/DateUtil';
import { showToast } from '../common/utils/ToastUtil';
import { EmptyView } from '../view/components/CommonUI';

class RecordGroup {
  dateStr: string;
  title: string;
  items: Array<CarbonRecord>;

  constructor(dateStr: string, title: string, items: Array<CarbonRecord>) {
    this.dateStr = dateStr;
    this.title = title;
    this.items = items;
  }
}

class FilterChip {
  key: string;
  label: string;
  color: string;

  constructor(key: string, label: string, color: string) {
    this.key = key;
    this.label = label;
    this.color = color;
  }
}

@Entry
@Component
struct HistoryPage {
  @State category: string = '';
  @State rangeDays: number = 0;  // 0=全部
  @State groups: Array<RecordGroup> = [];
  @State totalReduction: number = 0;
  @State count: number = 0;

  private categoryChips: Array<FilterChip> = [
    new FilterChip('', '全部', Theme.PRIMARY)
  ];
  private timeChips: Array<FilterChip> = [
    new FilterChip('0', '全部时间', Theme.PRIMARY),
    new FilterChip('7', '近7天', Theme.PRIMARY),
    new FilterChip('30', '近30天', Theme.PRIMARY)
  ];

  aboutToAppear(): void {
    const metaChips: Array<FilterChip> = [new FilterChip('', '全部', Theme.PRIMARY)];
    for (let i = 0; i < CATEGORY_META.length; i++) {
      metaChips.push(new FilterChip(CATEGORY_META[i].key, CATEGORY_META[i].name, CATEGORY_META[i].color));
    }
    this.categoryChips = metaChips;
    this.reload();
  }

  private dayTitle(dateStr: string): string {
    const now = new Date();
    const today = startOfDay(now);
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (dateStr === formatDate(today)) {
      return '今天';
    } else if (dateStr === formatDate(yesterday)) {
      return '昨天';
    }
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return parseInt(parts[1], 10) + '月' + parseInt(parts[2], 10) + '日';
    }
    return dateStr;
  }

  private rangeStart(): number {
    if (this.rangeDays === 0) {
      return 0;
    }
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (this.rangeDays - 1));
    return start.getTime();
  }

  async reload(): Promise<void> {
    const start = this.rangeStart();
    const end = Date.now() + 86400000;
    const records = await carbonRepo.getRecordsByCategory(this.category, start, end, 2000);
    let total = 0;
    const grouped: Array<RecordGroup> = [];
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      total += r.reduction;
      if (grouped.length === 0 || grouped[grouped.length - 1].dateStr !== r.dateStr) {
        grouped.push(new RecordGroup(r.dateStr, this.dayTitle(r.dateStr), []));
      }
      grouped[grouped.length - 1].items.push(r);
    }
    this.groups = grouped;
    this.totalReduction = Math.round(total * 1000) / 1000;
    this.count = records.length;
  }

  private confirmDelete(id: number): void {
    try {
      this.getUIContext().getPromptAction().showDialog({
        title: '删除记录',
        message: '删除后将同步回滚该条记录的积分，是否继续？',
        buttons: [
          { text: '取消', color: Theme.TEXT_SUB },
          { text: '删除', color: Theme.DANGER }
        ]
      }).then((res) => {
        if (res.index === 1) {
          carbonRepo.deleteRecord(id).then(() => {
            showToast(this.getUIContext(), '已删除');
            this.reload();
            const cur = AppStorage.get<number>('refreshTick') ?? 0;
            AppStorage.setOrCreate('refreshTick', cur + 1);
          });
        }
      });
    } catch (e) {
      // 弹窗参数异常导致抛错，忽略
    }
  }

  @Builder
  chipRow(list: Array<FilterChip>, isCategory: boolean) {
    Scroll() {
      Row() {
        ForEach(list, (c: FilterChip) => {
          Text(c.label)
            .fontSize(13)
            .padding({ left: 14, right: 14, top: 7, bottom: 7 })
            .margin({ right: 8 })
            .borderRadius(16)
            .backgroundColor(this.isSelected(c.key, isCategory) ? c.color : Color.White)
            .fontColor(this.isSelected(c.key, isCategory) ? Color.White : Theme.TEXT_SUB)
            .onClick(() => {
              if (isCategory) {
                this.category = c.key;
              } else {
                this.rangeDays = parseInt(c.key, 10);
              }
              this.reload();
            })
        }, (c: FilterChip) => c.key)
      }
      .padding({ left: 2, right: 2 })
    }
    .scrollable(ScrollDirection.Horizontal)
    .scrollBar(BarState.Off)
    .width('100%')
  }

  private isSelected(key: string, isCategory: boolean): boolean {
    return isCategory ? this.category === key : String(this.rangeDays) === key;
  }

  @Builder
  recordRow(r: CarbonRecord) {
    Row() {
      Text(r.icon)
        .fontSize(20)
        .width(40)
        .height(40)
        .textAlign(TextAlign.Center)
        .backgroundColor(Theme.BG)
        .borderRadius(20)
      Column() {
        Text(r.behaviorName)
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor(Theme.TEXT_MAIN)
        Text(formatDateTime(r.date) + '  ' + r.amount + r.unit + (r.note !== '' ? ' · ' + r.note : ''))
          .fontSize(11)
          .fontColor(Theme.TEXT_SUB)
          .margin({ top: 3 })
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      .margin({ left: 10 })

      Column() {
        Text('-' + r.reduction.toFixed(2) + 'kg')
          .fontSize(13)
          .fontColor(Theme.PRIMARY)
          .fontWeight(FontWeight.Bold)
        Text('删除')
          .fontSize(11)
          .fontColor(Theme.DANGER)
          .margin({ top: 4 })
      }
      .alignItems(HorizontalAlign.End)
      .onClick(() => {
        this.confirmDelete(r.id);
      })
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
        Text('历史记录')
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

      Column() {
        Column() {
          this.chipRow(this.categoryChips, true)
        }
        .width('100%')
        Column() {
          this.chipRow(this.timeChips, false)
        }
        .width('100%')
        .margin({ top: 8 })
        Row() {
          Text('共 ' + this.count + ' 条记录')
            .fontSize(12)
            .fontColor(Theme.TEXT_SUB)
          Blank()
          Text('累计减排 ' + this.totalReduction.toFixed(2) + ' kg')
            .fontSize(12)
            .fontColor(Theme.PRIMARY)
            .fontWeight(FontWeight.Bold)
        }
        .width('100%')
        .margin({ top: 10 })
      }
      .width('100%')
      .padding(12)
      .backgroundColor(Color.White)
      .margin({ bottom: 8 })

      if (this.groups.length === 0) {
        EmptyView({ icon: '🔍', text: '该条件下暂无记录' })
      } else {
        Scroll() {
          Column() {
            ForEach(this.groups, (g: RecordGroup) => {
              Column() {
                Text(g.title)
                  .fontSize(13)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Theme.TEXT_SUB)
                  .width('100%')
                  .margin({ bottom: 6 })
                Column() {
                  ForEach(g.items, (r: CarbonRecord) => {
                    this.recordRow(r)
                    Divider().color(Theme.DIVIDER)
                  }, (r: CarbonRecord) => String(r.id))
                }
                .width('100%')
                .padding({ left: 14, right: 14 })
                .backgroundColor(Color.White)
                .borderRadius(14)
              }
              .width('100%')
              .margin({ bottom: 12 })
            }, (g: RecordGroup) => g.dateStr)
          }
          .padding({ left: 12, right: 12, bottom: 16 })
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
