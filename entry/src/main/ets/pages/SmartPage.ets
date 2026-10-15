import { common } from '@kit.AbilityKit';
import { Theme } from '../common/constants/AppConstants';
import { CategoryStat, OverviewData } from '../common/model/Models';
import { carbonRepo } from '../data/repository/CarbonRepository';
import { smartService, SmartTip, FocusTask, CategorySnapshot } from '../features/smart/SmartService';
import { showToast } from '../common/utils/ToastUtil';
import { formatWeight } from '../common/utils/CalcUtil';

class AddPageParams {
  category: string = '';
}

@Entry
@Component
struct SmartPage {
  @State stats: Array<CategoryStat> = [];
  @State overview: OverviewData = new OverviewData();
  @State focus: FocusTask = new FocusTask('travel', 'task_travel', '🚲', '今日重点', '正在生成…');
  @State tips: Array<SmartTip> = [];

  async aboutToAppear(): Promise<void> {
    await this.reload();
  }

  onPageShow(): void {
    this.reload();
  }

  async reload(): Promise<void> {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).getTime();
    const end = now.getTime() + 86400000;
    this.stats = await carbonRepo.getCategoryStats(start, end);
    this.overview = await carbonRepo.getOverview();
    this.focus = smartService.buildFocus(this.stats);
    const snap: Array<CategorySnapshot> = [];
    for (let i = 0; i < this.stats.length; i++) {
      snap.push(new CategorySnapshot(this.stats[i].category, this.stats[i].reduction));
    }
    this.tips = smartService.buildTips(snap);
  }

  async sendReminder(): Promise<void> {
    const ok = await smartService.pushLocalNotification(
      '🌱 今日低碳提醒',
      this.focus.title.replace('今日重点：', '') + '：' + this.focus.desc);
    if (ok) {
      showToast(this.getUIContext(), '已发送本地通知，请在通知栏查看');
    } else {
      showToast(this.getUIContext(), '通知未开启，请在系统设置中允许本应用通知');
    }
  }

  async share(): Promise<void> {
    const ctx = this.getUIContext().getHostContext() as common.UIAbilityContext;
    const text = smartService.buildShareText(this.overview);
    const ok = await smartService.shareText(ctx, text);
    if (!ok) {
      showToast(this.getUIContext(), '未找到可分享的应用，可先复制文案');
    }
  }

  async copyShare(): Promise<void> {
    const text = smartService.buildShareText(this.overview);
    const ok = await smartService.copyText(text);
    showToast(this.getUIContext(), ok ? '成果文案已复制，去粘贴分享吧' : '复制失败');
  }

  @Builder
  tipCard(t: SmartTip) {
    Row() {
      Text(t.icon)
        .fontSize(24)
        .width(44)
        .height(44)
        .textAlign(TextAlign.Center)
        .backgroundColor(Theme.PRIMARY_LIGHT)
        .borderRadius(22)
      Column() {
        Text(t.title)
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor(Theme.TEXT_MAIN)
        Text(t.content)
          .fontSize(12)
          .fontColor(Theme.TEXT_SUB)
          .lineHeight(18)
          .margin({ top: 3 })
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      .margin({ left: 12 })
    }
    .width('100%')
    .padding({ top: 10, bottom: 10 })
  }

  @Builder
  shareCell(icon: string, label: string, value: string) {
    Column() {
      Text(icon)
        .fontSize(18)
        .margin({ bottom: 4 })
      Text(value)
        .fontSize(17)
        .fontWeight(FontWeight.Bold)
        .fontColor(Color.White)
      Text(label)
        .fontSize(10)
        .fontColor('#E6FFF4')
        .margin({ top: 2 })
    }
    .layoutWeight(1)
  }

  build() {
    Column() {
      // 顶部导航
      Row() {
        Text('‹')
          .fontSize(28)
          .fontColor(Theme.TEXT_MAIN)
          .width(40)
          .onClick(() => {
            this.getUIContext().getRouter().back();
          })
        Text('智能服务')
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
      .padding({ left: 8, right: 8 })
      .backgroundColor(Color.White)

      Scroll() {
        Column() {
          // 今日个性化重点
          Column() {
            Row() {
              Text('🎯 今日个性化任务')
                .fontSize(15)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.TEXT_MAIN)
                .layoutWeight(1)
              Text('按你近 7 天数据推荐')
                .fontSize(10)
                .fontColor(Theme.TEXT_SUB)
            }
            .width('100%')
            Row() {
              Text(this.focus.icon)
                .fontSize(34)
                .width(56)
                .height(56)
                .textAlign(TextAlign.Center)
                .backgroundColor(Theme.PRIMARY_LIGHT)
                .borderRadius(28)
              Column() {
                Text(this.focus.title)
                  .fontSize(15)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Theme.TEXT_MAIN)
                Text(this.focus.desc)
                  .fontSize(12)
                  .fontColor(Theme.TEXT_SUB)
                  .lineHeight(18)
                  .margin({ top: 4 })
              }
              .alignItems(HorizontalAlign.Start)
              .layoutWeight(1)
              .margin({ left: 12 })
            }
            .width('100%')
            .margin({ top: 12 })
            Button('立即去完成')
              .width('100%')
              .height(40)
              .fontSize(14)
              .backgroundColor(Theme.PRIMARY)
              .borderRadius(20)
              .margin({ top: 12 })
              .onClick(() => {
                const params: AddPageParams = { category: this.focus.category };
                this.getUIContext().getRouter().pushUrl({ url: 'pages/RecordAddPage', params: params });
              })
          }
          .width('100%')
          .padding(14)
          .backgroundColor(Color.White)
          .borderRadius(16)
          .margin({ left: 12, right: 12, top: 14 })

          // 生活建议
          Column() {
            Text('💡 低碳生活建议')
              .fontSize(15)
              .fontWeight(FontWeight.Bold)
              .fontColor(Theme.TEXT_MAIN)
              .width('100%')
              .margin({ bottom: 4 })
            ForEach(this.tips, (t: SmartTip) => {
              this.tipCard(t)
              Divider().color(Theme.DIVIDER)
            }, (t: SmartTip) => t.id)
          }
          .width('100%')
          .padding({ left: 14, right: 14 })
          .backgroundColor(Color.White)
          .borderRadius(16)
          .margin({ left: 12, right: 12, top: 14 })

          // 智能提醒
          Column() {
            Text('📩 智能提醒')
              .fontSize(15)
              .fontWeight(FontWeight.Bold)
              .fontColor(Theme.TEXT_MAIN)
              .width('100%')
              .margin({ bottom: 8 })
            Button('立即发送今日低碳提醒')
              .width('100%')
              .height(42)
              .fontSize(14)
              .backgroundColor(Theme.PRIMARY)
              .borderRadius(21)
              .onClick(() => {
                this.sendReminder();
              })
            Text('真机可通过 reminderAgent 设置每日定时提醒（如每天 20:00），代码已预留，见 SmartService。')
              .fontSize(11)
              .fontColor(Theme.TEXT_SUB)
              .lineHeight(16)
              .width('100%')
              .margin({ top: 8 })
          }
          .width('100%')
          .padding(14)
          .backgroundColor(Color.White)
          .borderRadius(16)
          .margin({ left: 12, right: 12, top: 14 })

          // 成果分享卡片
          Column() {
            Column() {
              Text('🌱 我的低碳成绩单')
                .fontSize(17)
                .fontWeight(FontWeight.Bold)
                .fontColor(Color.White)
              Row() {
                this.shareCell('⚖️', '累计减排', formatWeight(this.overview.totalReduction))
                this.shareCell('🪙', '碳积分', String(this.overview.totalPoints))
              }
              .width('100%')
              .margin({ top: 16 })
              Row() {
                this.shareCell('🏅', '徽章', String(this.overview.badgeCount))
                this.shareCell('🌳', '认种树木', String(this.overview.treeCount))
                this.shareCell('🔥', '连续打卡', this.overview.streakDays + ' 天')
              }
              .width('100%')
              .margin({ top: 14 })
              Text('碳足迹 · 全民绿色生活')
                .fontSize(11)
                .fontColor('#E6FFF4')
                .width('100%')
                .textAlign(TextAlign.Center)
                .margin({ top: 16 })
            }
            .width('100%')
            .padding(20)
            .alignItems(HorizontalAlign.Start)
            .linearGradient({ angle: 135, colors: [['#26996B', 0.0], ['#3FCB8C', 1.0]] })
            .borderRadius(16)

            Row() {
              Button('📤 分享成果')
                .layoutWeight(1)
                .height(42)
                .fontSize(14)
                .backgroundColor(Theme.PRIMARY)
                .onClick(() => {
                  this.share();
                })
              Button('📋 复制文案')
                .layoutWeight(1)
                .height(42)
                .fontSize(14)
                .backgroundColor(Theme.BG)
                .fontColor(Theme.TEXT_MAIN)
                .margin({ left: 12 })
                .onClick(() => {
                  this.copyShare();
                })
            }
            .width('100%')
            .margin({ top: 12 })
          }
          .width('100%')
          .padding(14)
          .backgroundColor(Color.White)
          .borderRadius(16)
          .margin({ left: 12, right: 12, top: 14, bottom: 20 })
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
