import { HomePage } from './HomePage';
import { DashboardPage } from './DashboardPage';
import { TasksPage } from './TasksPage';
import { SciencePage } from './SciencePage';
import { MinePage } from './MinePage';
import { Theme } from '../common/constants/AppConstants';

/**
 * 刷新机制说明：
 * - 二级页面（如 RecordAddPage）保存成功后自增 AppStorage.refreshTick；
 * - Index.onPageShow 在返回首页时读取该值并同步到本页 @State tick；
 * - tick 通过 @Prop 直传给各 Tab 子页，子页 @Watch 触发 reload。
 * 不再让子页各自 @StorageProp + @Watch 监听 AppStorage——
 * Tabs/TabContent 懒加载场景下该链路不可靠，@Prop 父传子是确定性传播。
 */
@Entry
@Component
struct Index {
  @State currentIndex: number = 0;
  @State tick: number = 0;

  aboutToAppear(): void {
    // 只在键不存在时初始化，绝不能无条件重置（会覆盖二级页面保存时的自增）
    if (AppStorage.get<number>('refreshTick') === undefined) {
      AppStorage.setOrCreate('refreshTick', 0);
    }
  }

  // 从录入页等二级页面返回时，把 AppStorage 的最新计数同步给各 Tab 子页
  onPageShow(): void {
    const cur = AppStorage.get<number>('refreshTick') ?? 0;
    if (cur !== this.tick) {
      this.tick = cur;
    }
  }

  private tabName(i: number): string {
    const names: Array<string> = ['首页', '看板', '任务', '科普', '我的'];
    return names[i];
  }

  private tabIcon(i: number): string {
    const icons: Array<string> = ['🏠', '📊', '🎯', '📖', '👤'];
    return icons[i];
  }

  @Builder
  tabBar(index: number) {
    Column() {
      Text(this.tabIcon(index))
        .fontSize(22)
        .fontColor(this.currentIndex === index ? Theme.PRIMARY : '#9CA3AF')
      Text(this.tabName(index))
        .fontSize(11)
        .margin({ top: 2 })
        .fontColor(this.currentIndex === index ? Theme.PRIMARY : '#9CA3AF')
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }

  build() {
    Column() {
      Tabs({ barPosition: BarPosition.End }) {
        TabContent() {
          HomePage({ tick: this.tick })
        }
        .tabBar(this.tabBar(0))

        TabContent() {
          DashboardPage({ tick: this.tick })
        }
        .tabBar(this.tabBar(1))

        TabContent() {
          TasksPage({ tick: this.tick })
        }
        .tabBar(this.tabBar(2))

        TabContent() {
          SciencePage()
        }
        .tabBar(this.tabBar(3))

        TabContent() {
          MinePage({ tick: this.tick })
        }
        .tabBar(this.tabBar(4))
      }
      .barHeight(60)
      .scrollable(false)
      .onChange((index: number) => {
        this.currentIndex = index;
        // 切换 Tab 时也刷新一次对应页面数据
        const cur = (AppStorage.get<number>('refreshTick') ?? 0) + 1;
        AppStorage.setOrCreate('refreshTick', cur);
        this.tick = cur;
      })
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Theme.BG)
  }
}