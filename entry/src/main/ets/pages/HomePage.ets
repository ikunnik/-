import { common } from '@kit.AbilityKit';
import { Theme, CATEGORY_META, CategoryMeta } from '../common/constants/AppConstants';
import { carbonRepo } from '../data/repository/CarbonRepository';
import { ensureDb } from '../data/db/CarbonDb';
import { OverviewData, CarbonRecord } from '../common/model/Models';
import { formatDateTime } from '../common/utils/DateUtil';
import { Card, SectionTitle, EmptyView } from '../view/components/CommonUI';

@Component
export struct HomePage {
  @State overview: OverviewData = new OverviewData();
  @State recent: Array<CarbonRecord> = [];
  // 由 Index 通过 @Prop 直传（替代原 @StorageProp 监听，Tabs 懒加载下更可靠）
  @Prop @Watch('onTickChange') tick: number = 0;
  // 防止 refreshTick 自增导致的重复并发刷新
  private reloading: boolean = false;

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
      // 兜底：Previewer 下 EntryAbility 不会执行，这里确保数据库已初始化
      await ensureDb(this.getUIContext().getHostContext() as common.Context);
      this.overview = await carbonRepo.getOverview();
      this.recent = await carbonRepo.getRecentRecords(5);
    } catch (err) {
      const e = err as Error;
      console.error('[CarbonFootprint] HomePage reload failed: ' + e.message);
    } finally {
      this.reloading = false;
    }
  }

  /** 累计减排自适应精度：大于 0 的小数值也能看清，避免 0.045 显示成 0.0 */
  totalText(): string {
    const v = this.overview.totalReduction;
    if (v >= 10) {
      return v.toFixed(1);
    }
    if (v >= 1) {
      return v.toFixed(2);
    }
    if (v > 0) {
      return v.toFixed(3);
    }
    return '0.0';
  }

  private goAdd(category: string): void {
    try {
      this.getUIContext().getRouter().pushUrl({
        url: 'pages/RecordAddPage',
        params: { category: category }
      });
    } catch (e) {
      // 路由跳转失败（参数/页面异常），忽略避免崩溃
    }
  }

  @Builder
  headerItem(value: string, label: string) {
    Column() {
      Text(value)
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor(Color.White)
      Text(label)
        .fontSize(11)
        .fontColor('#E6FFF4')
        .margin({ top: 2 })
    }
    .layoutWeight(1)
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
          .fontColor(Theme.TEXT_MAIN)
          .fontWeight(FontWeight.Medium)
        Text(formatDateTime(r.date))
          .fontSize(11)
          .fontColor(Theme.TEXT_SUB)
          .margin({ top: 3 })
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      .margin({ left: 10 })

      Column() {
        Text('-' + r.reduction.toFixed(2) + ' kg')
          .fontSize(14)
          .fontColor(Theme.PRIMARY)
          .fontWeight(FontWeight.Bold)
        Text('+' + r.points + ' 积分')
          .fontSize(11)
          .fontColor(Theme.WARN)
          .margin({ top: 2 })
      }
      .alignItems(HorizontalAlign.End)
    }
    .width('100%')
    .padding({ top: 10, bottom: 10 })
  }

  build() {
    Scroll() {
      Column() {
        // ===== 顶部绿色总览 =====
        Column() {
          Row() {
            Column() {
              Text('🌍 碳足迹')
                .fontSize(18)
                .fontWeight(FontWeight.Bold)
                .fontColor(Color.White)
              Text('累计减排量（kgCO₂e）')
                .fontSize(12)
                .fontColor('#E6FFF4')
                .margin({ top: 6 })
            }
            .alignItems(HorizontalAlign.Start)
            .layoutWeight(1)
            Text('全民绿色生活')
              .fontSize(11)
              .fontColor(Color.White)
              .padding({ left: 8, right: 8, top: 4, bottom: 4 })
              .borderRadius(12)
              .backgroundColor('#33FFFFFF')
          }
          .width('100%')

          Text(this.totalText())
            .fontSize(46)
            .fontWeight(FontWeight.Bold)
            .fontColor(Color.White)
            .margin({ top: 12 })

          Row() {
            this.headerItem(this.overview.todayReduction.toFixed(2), '今日减排(kg)')
            this.headerItem(String(this.overview.totalPoints), '我的碳积分')
            this.headerItem(String(this.overview.streakDays) + '天', '连续打卡')
          }
          .width('100%')
          .margin({ top: 14 })
        }
        .width('100%')
        .padding({ left: 20, right: 20, top: 24, bottom: 24 })
        .alignItems(HorizontalAlign.Start)
        .linearGradient({
          angle: 135,
          colors: [['#26996B', 0.0], ['#3FCB8C', 1.0]]
        })
        .borderRadius({ bottomLeft: 24, bottomRight: 24 })

        // ===== 快捷录入 =====
        Column() {
        Card({ innerPadding: 16 }) {
          Column() {
            Row() {
              Text('记录低碳行为')
                .fontSize(15)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.TEXT_MAIN)
              Blank()
            }
            .width('100%')

            Row() {
              ForEach(CATEGORY_META, (item: CategoryMeta) => {
                Column() {
                  Text(item.icon)
                    .fontSize(26)
                    .width(52)
                    .height(52)
                    .textAlign(TextAlign.Center)
                    .backgroundColor(item.color + '1A')
                    .borderRadius(26)
                  Text(item.name)
                    .fontSize(12)
                    .fontColor(Theme.TEXT_MAIN)
                    .margin({ top: 8 })
                }
                .layoutWeight(1)
                .onClick(() => {
                  this.goAdd(item.key);
                })
              }, (item: CategoryMeta) => item.key)
            }
            .width('100%')
            .margin({ top: 14 })
          }
          .width('100%')
        }
        }
        .width('100%')
        .margin({ left: 12, right: 12, top: 14 })

        // ===== 趣味对照 =====
        Column() {
        Card({ innerPadding: 14 }) {
          Row() {
            Text('🌳')
              .fontSize(26)
              .margin({ right: 10 })
            Column() {
              Text('累计减排相当于种下 ' + this.overview.treeCount + ' 棵树')
                .fontSize(14)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.TEXT_MAIN)
              Text('已坚持 ' + this.overview.recordDays + ' 天，记录 ' + this.overview.recordCount + ' 次低碳行为')
                .fontSize(11)
                .fontColor(Theme.TEXT_SUB)
                .margin({ top: 4 })
            }
            .alignItems(HorizontalAlign.Start)
            .layoutWeight(1)
          }
          .width('100%')
        }
        }
        .width('100%')
        .margin({ left: 12, right: 12, top: 12 })
        .onClick(() => {
          this.getUIContext().getRouter().pushUrl({ url: 'pages/CertificatePage' });
        })

        // ===== 最近记录 =====
        Column() {
          SectionTitle({
            title: '最近低碳记录',
            moreText: '全部',
            onMore: () => {
              this.getUIContext().getRouter().pushUrl({ url: 'pages/HistoryPage' });
            }
          })
          Card({ innerPadding: 14 }) {
            if (this.recent.length === 0) {
              EmptyView({ icon: '🍃', text: '还没有记录，点击上方分类开始吧' })
            } else {
              Column() {
                ForEach(this.recent, (r: CarbonRecord) => {
                  this.recordRow(r)
                }, (r: CarbonRecord) => String(r.id))
              }
              .width('100%')
            }
          }
        }
        .margin({ left: 12, right: 12, top: 18, bottom: 16 })
        .width('100%')
      }
      .width('100%')
      .padding({ bottom: 12 })
    }
    .width('100%')
    .height('100%')
    .align(Alignment.Top)
    .scrollBar(BarState.Off)
    .backgroundColor(Theme.BG)
  }
}
