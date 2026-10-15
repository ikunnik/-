import { common } from '@kit.AbilityKit';
import { Theme } from '../common/constants/AppConstants';
import { TaskDef, TaskRecord } from '../common/model/Models';
import { DAILY_TASKS } from '../common/constants/DailyTasks';
import { pointsRepo } from '../data/repository/PointsRepository';
import { ensureDb } from '../data/db/CarbonDb';
import { todayStr } from '../common/utils/DateUtil';
import { showToast } from '../common/utils/ToastUtil';

class TaskVM {
  def: TaskDef;
  progress: number;
  claimed: boolean;

  constructor(def: TaskDef, progress: number, claimed: boolean) {
    this.def = def;
    this.progress = progress;
    this.claimed = claimed;
  }
}

@Component
export struct TasksPage {
  @State balance: number = 0;
  @State badgeCount: number = 0;
  @State treeCount: number = 0;
  @State taskVMs: Array<TaskVM> = [];
  // 由 Index 通过 @Prop 直传（替代原 @StorageProp 监听，Tabs 懒加载下更可靠）
  @Prop @Watch('onTickChange') tick: number = 0;
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
      await this.loadTasks();
    } finally {
      this.reloading = false;
    }
  }

  /** 实际取数逻辑 */
  async loadTasks(): Promise<void> {
    // 兜底：确保数据库已初始化
    await ensureDb(this.getUIContext().getHostContext() as common.Context);
    this.balance = await pointsRepo.getBalance();
    this.badgeCount = (await pointsRepo.getUnlockedBadges()).length;
    this.treeCount = await pointsRepo.getTreeCount();
    const records: Array<TaskRecord> = await pointsRepo.getTaskProgress(todayStr());
    const vms: Array<TaskVM> = [];
    for (let i = 0; i < DAILY_TASKS.length; i++) {
      const def = DAILY_TASKS[i];
      let p = 0;
      let claimed = false;
      for (let j = 0; j < records.length; j++) {
        if (records[j].taskId === def.id) {
          p = records[j].progress;
          claimed = records[j].claimed;
        }
      }
      vms.push(new TaskVM(def, Math.min(p, def.goal), claimed));
    }
    this.taskVMs = vms;
  }

  async claim(vm: TaskVM): Promise<void> {
    if (vm.claimed) {
      return;
    }
    if (vm.progress < vm.def.goal) {
      showToast(this.getUIContext(), '任务未完成，继续加油！');
      return;
    }
    const ok = await pointsRepo.claimTask(vm.def.id, todayStr(), vm.def.points, vm.def.name);
    if (ok) {
      showToast(this.getUIContext(), '已领取 +' + vm.def.points + ' 积分');
      await this.reload();
      const cur = AppStorage.get<number>('refreshTick') ?? 0;
      AppStorage.setOrCreate('refreshTick', cur + 1);
    } else {
      showToast(this.getUIContext(), '该任务已领取过了');
    }
  }

  @Builder
  taskCard(vm: TaskVM) {
    Row() {
      Text(vm.def.icon)
        .fontSize(26)
        .width(48)
        .height(48)
        .textAlign(TextAlign.Center)
        .backgroundColor(Theme.BG)
        .borderRadius(24)
      Column() {
        Row() {
          Text(vm.def.name)
            .fontSize(14)
            .fontWeight(FontWeight.Bold)
            .fontColor(Theme.TEXT_MAIN)
            .layoutWeight(1)
          Text('+' + vm.def.points + ' 积分')
            .fontSize(12)
            .fontColor(Theme.WARN)
            .fontWeight(FontWeight.Bold)
        }
        .width('100%')
        Text(vm.def.desc)
          .fontSize(11)
          .fontColor(Theme.TEXT_SUB)
          .margin({ top: 4 })
          .width('100%')
        Row() {
          Progress({ value: vm.progress, total: vm.def.goal, type: ProgressType.Linear })
            .color(Theme.PRIMARY)
            .backgroundColor(Theme.DIVIDER)
            .layoutWeight(1)
            .height(8)
          Text(vm.progress + '/' + vm.def.goal)
            .fontSize(11)
            .fontColor(Theme.TEXT_SUB)
            .width(42)
            .textAlign(TextAlign.End)
        }
        .width('100%')
        .margin({ top: 8 })
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      .margin({ left: 12 })

      Button(vm.claimed ? '已领取' : (vm.progress >= vm.def.goal ? '领取' : '进行中'))
        .width(64)
        .height(34)
        .fontSize(13)
        .backgroundColor(vm.claimed ? Theme.DIVIDER : (vm.progress >= vm.def.goal ? Theme.PRIMARY : Theme.BG))
        .fontColor(vm.claimed ? Theme.TEXT_SUB : (vm.progress >= vm.def.goal ? Color.White : Theme.TEXT_SUB))
        .enabled(!vm.claimed && vm.progress >= vm.def.goal)
    }
    .width('100%')
    .padding(12)
    .backgroundColor(Color.White)
    .borderRadius(14)
    .margin({ bottom: 10 })
    .onClick(() => {
      this.claim(vm);
    })
  }

  @Builder
  entryCard(icon: string, name: string, desc: string) {
    Row() {
      Text(icon)
        .fontSize(22)
        .width(40)
        .height(40)
        .textAlign(TextAlign.Center)
        .backgroundColor(Theme.PRIMARY_LIGHT)
        .borderRadius(20)
      Column() {
        Text(name)
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor(Theme.TEXT_MAIN)
        Text(desc)
          .fontSize(11)
          .fontColor(Theme.TEXT_SUB)
          .margin({ top: 2 })
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      .margin({ left: 10 })
      Text('›')
        .fontSize(20)
        .fontColor(Theme.TEXT_SUB)
    }
    .width('100%')
    .padding(10)
    .backgroundColor(Color.White)
    .borderRadius(12)
    .margin({ bottom: 8 })
  }

  build() {
    Column() {
      Scroll() {
        Column() {
          // 积分概览
          Column() {
            Text('我的碳积分')
              .fontSize(13)
              .fontColor('#E6FFF4')
            Text(String(this.balance))
              .fontSize(44)
              .fontWeight(FontWeight.Bold)
              .fontColor(Color.White)
              .margin({ top: 4 })
            Row() {
              Text('🏅 徽章 ' + this.badgeCount + ' 枚')
                .fontSize(12)
                .fontColor(Color.White)
                .layoutWeight(1)
              Text('🌳 植树 ' + this.treeCount + ' 棵')
                .fontSize(12)
                .fontColor(Color.White)
            }
            .width('100%')
            .margin({ top: 12 })
          }
          .width('100%')
          .alignItems(HorizontalAlign.Start)
          .padding(20)
          .linearGradient({ angle: 135, colors: [['#F59E0B', 0.0], ['#F7B955', 1.0]] })
          .borderRadius({ bottomLeft: 24, bottomRight: 24 })

          // 今日任务
          Column() {
            Row() {
              Text('🎯 今日低碳任务')
                .fontSize(16)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.TEXT_MAIN)
                .layoutWeight(1)
              Text('每日 0 点重置')
                .fontSize(11)
                .fontColor(Theme.TEXT_SUB)
            }
            .width('100%')
            .margin({ bottom: 10 })
            ForEach(this.taskVMs, (vm: TaskVM) => {
              this.taskCard(vm)
            }, (vm: TaskVM) => vm.def.id)
          }
          .width('100%')
          .padding(12)
          .margin({ top: 14 })

          // 积分激励
          Column() {
            Text('🎁 积分激励')
              .fontSize(16)
              .fontWeight(FontWeight.Bold)
              .fontColor(Theme.TEXT_MAIN)
              .width('100%')
              .margin({ bottom: 10 })
            Column() {
              this.entryCard('🌳', '植树证书', '200 积分兑换 1 棵低碳树')
            }
            .width('100%')
            .onClick(() => {
              this.getUIContext().getRouter().pushUrl({ url: 'pages/CertificatePage' });
            })
            Column() {
              this.entryCard('🏅', '低碳徽章墙', '查看已解锁的虚拟徽章')
            }
            .width('100%')
            .onClick(() => {
              this.getUIContext().getRouter().pushUrl({ url: 'pages/BadgesPage' });
            })
            Column() {
              this.entryCard('📒', '积分流水', '查看积分获取与兑换明细')
            }
            .width('100%')
            .onClick(() => {
              this.getUIContext().getRouter().pushUrl({ url: 'pages/PointsRecordsPage' });
            })
          }
          .width('100%')
          .padding(12)
          .margin({ bottom: 16 })
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
