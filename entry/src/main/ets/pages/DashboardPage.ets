import { common } from '@kit.AbilityKit';
import { Theme, RangeType, getRangeName, getCategoryMeta } from '../common/constants/AppConstants';
import { carbonRepo } from '../data/repository/CarbonRepository';
import { ensureDb } from '../data/db/CarbonDb';
import { CategoryStat, TrendPoint } from '../common/model/Models';
import { getBuckets } from '../common/utils/DateUtil';
import { LineChart } from '../view/components/LineChart';
import { BarChart } from '../view/components/BarChart';
import { PieChart } from '../view/components/PieChart';
import { ChartItem } from '../view/components/ChartItem';
import { Card } from '../view/components/CommonUI';

@Component
export struct DashboardPage {
  @State range: string = RangeType.DAY;
  @State lineData: Array<ChartItem> = [];
  @State barData: Array<ChartItem> = [];
  @State pieData: Array<ChartItem> = [];
  @State rangeTotal: number = 0;
  @State rangeCount: number = 0;
  @State rangeAvg: number = 0;
  // 由 Index 通过 @Prop 直传（替代原 @StorageProp 监听，Tabs 懒加载下更可靠）
  @Prop @Watch('onTickChange') tick: number = 0;
  private reloading: boolean = false;

  private ranges: Array<string> = [RangeType.DAY, RangeType.WEEK, RangeType.MONTH, RangeType.YEAR];

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
      await ensureDb(this.getUIContext().getHostContext() as common.Context);
      await this.loadCharts();
    } finally {
      this.reloading = false;
    }
  }

  /** 实际取数与绘图数据组装 */
  async loadCharts(): Promise<void> {
    const trend: Array<TrendPoint> = await carbonRepo.getTrend(this.range);
    const buckets = getBuckets(this.range);
    const start = buckets[0].startMs;
    const end = buckets[buckets.length - 1].endMs;
    const stats: Array<CategoryStat> = await carbonRepo.getCategoryStats(start, end);
    const records = await carbonRepo.getRecordsBetween(start, end);

    const lines: Array<ChartItem> = [];
    let total = 0;
    for (let i = 0; i < trend.length; i++) {
      lines.push(new ChartItem(trend[i].label, trend[i].value, Theme.PRIMARY));
      total += trend[i].value;
    }
    const bars: Array<ChartItem> = [];
    const pies: Array<ChartItem> = [];
    for (let i = 0; i < stats.length; i++) {
      const meta = getCategoryMeta(stats[i].category);
      bars.push(new ChartItem(meta.name, stats[i].reduction, meta.color));
      pies.push(new ChartItem(meta.name, stats[i].reduction, meta.color));
    }
    this.lineData = lines;
    this.barData = bars;
    this.pieData = pies;
    this.rangeTotal = Math.round(total * 100) / 100;
    this.rangeCount = records.length;
    this.rangeAvg = buckets.length > 0 ? Math.round(total / buckets.length * 100) / 100 : 0;
  }

  @Builder
  rangeChip(r: string) {
    Text(getRangeName(r))
      .fontSize(14)
      .layoutWeight(1)
      .height(34)
      .textAlign(TextAlign.Center)
      .borderRadius(17)
      .backgroundColor(this.range === r ? Theme.PRIMARY : Color.White)
      .fontColor(this.range === r ? Color.White : Theme.TEXT_SUB)
      .fontWeight(this.range === r ? FontWeight.Bold : FontWeight.Normal)
      .onClick(() => {
        this.range = r;
        this.reload();
      })
  }

  @Builder
  summaryItem(value: string, label: string) {
    Column() {
      Text(value)
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor(Theme.TEXT_MAIN)
      Text(label)
        .fontSize(11)
        .fontColor(Theme.TEXT_SUB)
        .margin({ top: 3 })
    }
    .layoutWeight(1)
  }

  build() {
    Column() {
      Row() {
        Text('数据看板')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .fontColor(Theme.TEXT_MAIN)
        Blank()
        Text('📂 历史')
          .fontSize(13)
          .fontColor(Theme.PRIMARY)
          .padding({ left: 10, right: 10, top: 6, bottom: 6 })
          .backgroundColor(Theme.PRIMARY_LIGHT)
          .borderRadius(14)
          .onClick(() => {
            this.getUIContext().getRouter().pushUrl({ url: 'pages/HistoryPage' });
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 16, bottom: 10 })

      Row() {
        ForEach(this.ranges, (r: string) => {
          this.rangeChip(r)
        }, (r: string) => r)
      }
      .width('100%')
      .padding(4)
      .margin({ left: 12, right: 12 })
      .backgroundColor(Color.White)
      .borderRadius(20)

      Scroll() {
        Column() {
          Column() {
            Card({ innerPadding: 16 }) {
              Row() {
                this.summaryItem(this.rangeTotal.toFixed(1), '本' + getRangeName(this.range) + '减排(kg)')
                this.summaryItem(String(this.rangeCount), '记录次数')
                this.summaryItem(this.rangeAvg.toFixed(1), '日均减排(kg)')
              }
              .width('100%')
            }
          }
          .width('100%')
          .margin({ left: 12, right: 12, top: 14 })

          Column() {
            Card({ innerPadding: 14 }) {
              Column() {
                Text('减排趋势（kgCO₂e）')
                  .fontSize(15)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Theme.TEXT_MAIN)
                  .width('100%')
                LineChart({ items: this.lineData })
              }
              .width('100%')
            }
          }
          .width('100%')
          .margin({ left: 12, right: 12, top: 12 })

          Column() {
            Card({ innerPadding: 14 }) {
              Column() {
                Text('分类减排对比（kg）')
                  .fontSize(15)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Theme.TEXT_MAIN)
                  .width('100%')
                BarChart({ items: this.barData })
              }
              .width('100%')
            }
          }
          .width('100%')
          .margin({ left: 12, right: 12, top: 12 })

          Column() {
            Card({ innerPadding: 14 }) {
              Column() {
                Text('分类减排占比')
                  .fontSize(15)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Theme.TEXT_MAIN)
                  .width('100%')
                PieChart({ items: this.pieData })
              }
              .width('100%')
            }
          }
          .width('100%')
          .margin({ left: 12, right: 12, top: 12, bottom: 16 })
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
