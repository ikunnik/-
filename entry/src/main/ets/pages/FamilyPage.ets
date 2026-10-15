import { Theme, CATEGORY_META, getCategoryMeta } from '../common/constants/AppConstants';
import { MemberTotal, CategoryStat, FamilyMember } from '../common/model/Models';
import { familyRepo } from '../data/repository/FamilyRepository';
import { showToast } from '../common/utils/ToastUtil';
import { formatWeight } from '../common/utils/CalcUtil';

class RoleOption {
  role: string;
  avatar: string;
  device: string;

  constructor(role: string, avatar: string, device: string) {
    this.role = role;
    this.avatar = avatar;
    this.device = device;
  }
}

const ROLE_OPTIONS: Array<RoleOption> = [
  new RoleOption('爸爸', '👨', 'HUAWEI Mate 手机'),
  new RoleOption('妈妈', '👩', 'HUAWEI MatePad 平板'),
  new RoleOption('孩子', '👧', 'HUAWEI WATCH 手表'),
  new RoleOption('家人', '👦', 'HUAWEI 手机')
];

@Entry
@Component
struct FamilyPage {
  @State totals: Array<MemberTotal> = [];
  @State stats: Array<CategoryStat> = [];
  @State members: Array<FamilyMember> = [];
  @State totalReduction: number = 0;
  @State totalPoints: number = 0;
  @State memberCount: number = 0;
  @State syncing: boolean = false;
  @State showAdd: boolean = false;
  @State addName: string = '';
  @State addRole: string = '爸爸';
  @State autoSync: boolean = true;
  @State lastSync: number = 0;

  async aboutToAppear(): Promise<void> {
    await familyRepo.ensureSeed();
    this.autoSync = await familyRepo.isAutoSyncEnabled();
    await this.reload();
  }

  onPageShow(): void {
    this.reload();
  }

  async reload(): Promise<void> {
    this.totals = await familyRepo.getMemberTotals();
    this.stats = await familyRepo.getFamilyCategoryStats();
    this.members = await familyRepo.getMembers();
    const all = await familyRepo.getFamilyTotals();
    this.totalReduction = all[0];
    this.totalPoints = all[1];
    this.memberCount = all[3];
    this.lastSync = await familyRepo.getLastSyncTime();
  }

  /** 最近同步时间的友好展示 */
  lastSyncText(): string {
    if (this.lastSync <= 0) {
      return '尚未同步';
    }
    const d = new Date(this.lastSync);
    const hh = d.getHours() < 10 ? '0' + d.getHours() : String(d.getHours());
    const mm = d.getMinutes() < 10 ? '0' + d.getMinutes() : String(d.getMinutes());
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + hh + ':' + mm;
  }

  /** 切换「启动自动同步」开关 */
  async toggleAutoSync(): Promise<void> {
    const next = !this.autoSync;
    this.autoSync = next;
    await familyRepo.setAutoSyncEnabled(next);
    showToast(this.getUIContext(), next ? '已开启启动自动同步' : '已关闭启动自动同步');
  }

  getMemberById(id: number): FamilyMember | null {
    for (let i = 0; i < this.members.length; i++) {
      if (this.members[i].id === id) {
        return this.members[i];
      }
    }
    return null;
  }

  async sync(): Promise<void> {
    if (this.syncing) {
      return;
    }
    this.syncing = true;
    // 模拟超级终端发现与同步的耗时
    setTimeout(async () => {
      const n = await familyRepo.discoverAndSync();
      await this.reload();
      this.syncing = false;
      showToast(this.getUIContext(), '已连接 ' + n + ' 台家人设备，数据同步完成');
    }, 900);
  }

  async doAddMember(): Promise<void> {
    const name = this.addName.trim();
    if (name === '') {
      showToast(this.getUIContext(), '请输入家人昵称');
      return;
    }
    let avatar = '👦';
    let device = 'HUAWEI 手机';
    for (let i = 0; i < ROLE_OPTIONS.length; i++) {
      if (ROLE_OPTIONS[i].role === this.addRole) {
        avatar = ROLE_OPTIONS[i].avatar;
        device = ROLE_OPTIONS[i].device;
      }
    }
    await familyRepo.addMember(name, avatar, this.addRole, device);
    this.showAdd = false;
    this.addName = '';
    await this.reload();
    showToast(this.getUIContext(), '已通过超级终端添加家庭成员：' + name);
  }

  async removeMember(m: MemberTotal): Promise<void> {
    const mem = this.getMemberById(m.memberId);
    if (mem === null) {
      return;
    }
    try {
      const res = await this.getUIContext().getPromptAction().showDialog({
        title: '移除家庭成员',
        message: '确定移除「' + m.name + '」及其同步数据吗？',
        buttons: [
          { text: '取消', color: Theme.TEXT_SUB },
          { text: '移除', color: Theme.DANGER }
        ]
      });
      if (res.index === 1) {
        await familyRepo.removeMember(m.memberId);
        await this.reload();
        showToast(this.getUIContext(), '已移除');
      }
    } catch (e) {
      // 弹窗或移除失败，忽略避免崩溃
    }
  }

  @Builder
  memberRow(m: MemberTotal, rank: number) {
    Row() {
      Stack() {
        Text(m.avatar)
          .fontSize(26)
          .width(50)
          .height(50)
          .textAlign(TextAlign.Center)
          .backgroundColor(m.isSelf ? Theme.PRIMARY_LIGHT : Theme.BG)
          .borderRadius(25)
        Text(String(rank))
          .fontSize(10)
          .fontColor(Color.White)
          .backgroundColor(Theme.WARN)
          .width(18)
          .height(18)
          .textAlign(TextAlign.Center)
          .borderRadius(9)
          .position({ x: 34, y: 0 })
      }
      .width(50)
      .height(50)
      .margin({ right: 12 })

      Column() {
        Row() {
          Text(m.name)
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor(Theme.TEXT_MAIN)
          if (m.isSelf) {
            Text('本机')
              .fontSize(9)
              .fontColor(Theme.PRIMARY)
              .backgroundColor(Theme.PRIMARY_LIGHT)
              .padding({ left: 5, right: 5, top: 1, bottom: 1 })
              .borderRadius(6)
              .margin({ left: 6 })
          }
        }
        Text(this.getMemberById(m.memberId) === null ? '当前设备' :
          (this.getMemberById(m.memberId)!.device +
            (this.getMemberById(m.memberId)!.online ? ' · 已连接' : ' · 未连接')))
          .fontSize(11)
          .fontColor(Theme.TEXT_SUB)
          .margin({ top: 3 })
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)

      Column() {
        Text(formatWeight(m.reduction))
          .fontSize(15)
          .fontWeight(FontWeight.Bold)
          .fontColor(Theme.PRIMARY)
        Text(m.points + ' 积分 · ' + m.count + ' 次')
          .fontSize(10)
          .fontColor(Theme.TEXT_SUB)
          .margin({ top: 2 })
      }
      .alignItems(HorizontalAlign.End)

      if (!m.isSelf) {
        Text('🗑️')
          .fontSize(16)
          .padding(8)
          .onClick(() => {
            this.removeMember(m);
          })
      }
    }
    .width('100%')
    .padding({ top: 10, bottom: 10 })
  }

  @Builder
  categoryBar(s: CategoryStat) {
    Column() {
      Row() {
        Text(getCategoryMeta(s.category).icon)
          .fontSize(16)
          .margin({ right: 6 })
        Text(getCategoryMeta(s.category).name)
          .fontSize(13)
          .fontColor(Theme.TEXT_MAIN)
          .layoutWeight(1)
        Text(formatWeight(s.reduction))
          .fontSize(13)
          .fontWeight(FontWeight.Medium)
          .fontColor(getCategoryMeta(s.category).color)
      }
      .width('100%')
      Stack({ alignContent: Alignment.Start }) {
        Column()
          .width('100%')
          .height(8)
          .backgroundColor(Theme.BG)
          .borderRadius(4)
        Column()
          .width(this.totalReduction <= 0 ? '0%' :
            (s.reduction / this.totalReduction * 100).toFixed(1) + '%')
          .height(8)
          .backgroundColor(getCategoryMeta(s.category).color)
          .borderRadius(4)
      }
      .width('100%')
      .margin({ top: 6 })
    }
    .width('100%')
    .margin({ bottom: 12 })
  }

  @Builder
  addDialog() {
    Column() {
      Column() {
        Text('添加家庭成员')
          .fontSize(17)
          .fontWeight(FontWeight.Bold)
          .fontColor(Theme.TEXT_MAIN)
          .margin({ bottom: 16 })
        TextInput({ text: this.addName, placeholder: '家人昵称，如：爸爸' })
          .width('100%')
          .height(44)
          .backgroundColor(Theme.BG)
          .borderRadius(12)
          .onChange((v: string) => {
            this.addName = v;
          })
        Row() {
          ForEach(ROLE_OPTIONS, (opt: RoleOption) => {
            Text(opt.avatar + ' ' + opt.role)
              .fontSize(13)
              .padding({ left: 10, right: 10, top: 7, bottom: 7 })
              .borderRadius(16)
              .backgroundColor(this.addRole === opt.role ? Theme.PRIMARY : Theme.BG)
              .fontColor(this.addRole === opt.role ? Color.White : Theme.TEXT_SUB)
              .margin({ right: 8 })
              .onClick(() => {
                this.addRole = opt.role;
              })
          }, (opt: RoleOption) => opt.role)
        }
        .width('100%')
        .margin({ top: 14 })
        Row() {
          Button('取消')
            .layoutWeight(1)
            .height(40)
            .backgroundColor(Theme.BG)
            .fontColor(Theme.TEXT_SUB)
            .onClick(() => {
              this.showAdd = false;
            })
          Button('📡 连接并添加')
            .layoutWeight(1)
            .height(40)
            .backgroundColor(Theme.PRIMARY)
            .margin({ left: 12 })
            .onClick(() => {
              this.doAddMember();
            })
        }
        .width('100%')
        .margin({ top: 20 })
      }
      .width('84%')
      .padding(22)
      .backgroundColor(Color.White)
      .borderRadius(18)
      .onClick(() => {
      })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#80000000')
    .justifyContent(FlexAlign.Center)
    .onClick(() => {
      this.showAdd = false;
    })
  }

  build() {
    Stack() {
      Column() {
        // 顶部导航
        Row() {
          Text('‹')
            .fontSize(28)
            .fontColor(Color.White)
            .width(40)
            .onClick(() => {
              this.getUIContext().getRouter().back();
            })
          Text('家庭空间 · 超级终端')
            .fontSize(17)
            .fontWeight(FontWeight.Bold)
            .fontColor(Color.White)
            .layoutWeight(1)
            .textAlign(TextAlign.Center)
          Text('＋')
            .fontSize(24)
            .fontColor(Color.White)
            .width(40)
            .textAlign(TextAlign.Center)
            .onClick(() => {
              this.addName = '';
              this.showAdd = true;
            })
        }
        .width('100%')
        .height(48)
        .padding({ left: 8, right: 8 })

        Scroll() {
          Column() {
            // 家庭总览
            Column() {
              Row() {
                Text('🏡 家庭低碳总览')
                  .fontSize(16)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Color.White)
                  .layoutWeight(1)
                Text('共 ' + this.memberCount + ' 位成员')
                  .fontSize(12)
                  .fontColor('#E6FFF4')
              }
              .width('100%')
              Row() {
                Column() {
                  Text(formatWeight(this.totalReduction))
                    .fontSize(24)
                    .fontWeight(FontWeight.Bold)
                    .fontColor(Color.White)
                  Text('家庭累计减排')
                    .fontSize(11)
                    .fontColor('#E6FFF4')
                    .margin({ top: 4 })
                }
                .layoutWeight(1)
                .alignItems(HorizontalAlign.Start)
                Column() {
                  Text(String(this.totalPoints))
                    .fontSize(24)
                    .fontWeight(FontWeight.Bold)
                    .fontColor(Color.White)
                  Text('家庭碳积分')
                    .fontSize(11)
                    .fontColor('#E6FFF4')
                    .margin({ top: 4 })
                }
                .layoutWeight(1)
                .alignItems(HorizontalAlign.Start)
              }
              .width('100%')
              .margin({ top: 16 })

              Button(this.syncing ? '正在同步家人设备…' : '📡 超级终端一键同步')
                .width('100%')
                .height(44)
                .fontSize(15)
                .fontWeight(FontWeight.Bold)
                .backgroundColor(Color.White)
                .fontColor(Theme.PRIMARY)
                .borderRadius(22)
                .margin({ top: 18 })
                .enabled(!this.syncing)
                .onClick(() => {
                  this.sync();
                })

              // 启动自动同步开关
              Row() {
                Text(this.autoSync ? '🔄' : '⏸️')
                  .fontSize(16)
                  .margin({ right: 8 })
                Column() {
                  Text('启动时自动同步')
                    .fontSize(13)
                    .fontWeight(FontWeight.Medium)
                    .fontColor(Theme.PRIMARY)
                  Text('上次同步：' + this.lastSyncText())
                    .fontSize(11)
                    .fontColor('#DFF6EA')
                    .margin({ top: 2 })
                }
                .alignItems(HorizontalAlign.Start)
                .layoutWeight(1)
                Text(this.autoSync ? '已开启' : '已关闭')
                  .fontSize(12)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Color.White)
                  .backgroundColor(this.autoSync ? Theme.PRIMARY : '#8AB8A2')
                  .padding({ left: 10, right: 10, top: 4, bottom: 4 })
                  .borderRadius(12)
              }
              .width('100%')
              .padding({ top: 10, bottom: 10, left: 12, right: 12 })
              .backgroundColor('#1F8F62')
              .borderRadius(14)
              .margin({ top: 10 })
              .onClick(() => {
                this.toggleAutoSync();
              })
            }
            .width('100%')
            .padding(18)
            .alignItems(HorizontalAlign.Start)
            .linearGradient({ angle: 135, colors: [['#26996B', 0.0], ['#3FCB8C', 1.0]] })
            .borderRadius({ bottomLeft: 24, bottomRight: 24 })

            // 成员减排排行
            Column() {
              Row() {
                Text('👨‍👩‍👧‍👦 家庭成员减排排行')
                  .fontSize(15)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Theme.TEXT_MAIN)
              }
              .width('100%')
              .margin({ bottom: 6 })
              ForEach(this.totals, (m: MemberTotal, index?: number) => {
                this.memberRow(m, (index === undefined ? 0 : index) + 1)
              }, (m: MemberTotal) => String(m.memberId))
            }
            .width('100%')
            .padding(14)
            .backgroundColor(Color.White)
            .borderRadius(16)
            .margin({ left: 12, right: 12, top: 14 })

            // 家庭分类占比
            Column() {
              Text('家庭分类减排构成')
                .fontSize(15)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.TEXT_MAIN)
                .width('100%')
                .margin({ bottom: 12 })
              ForEach(this.stats, (s: CategoryStat) => {
                this.categoryBar(s)
              }, (s: CategoryStat) => s.category)
            }
            .width('100%')
            .padding(14)
            .backgroundColor(Color.White)
            .borderRadius(16)
            .margin({ left: 12, right: 12, top: 14 })

            // 真机接入说明
            Column() {
              Text('🔗 真机多设备同步（接入点已预留）')
                .fontSize(13)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.TEXT_MAIN)
                .width('100%')
                .margin({ bottom: 6 })
              Text('当前为单机模拟模式。在登录同一华为账号、完成分布式组网的多台设备上，可通过 @kit.DistributedServiceKit 的 deviceManager 发现可信设备，并用 @kit.ArkData 的 distributedKVStore / distributedDataObject 同步各设备减排数据，家庭合并统计逻辑无需改动。')
                .fontSize(12)
                .fontColor(Theme.TEXT_SUB)
                .lineHeight(19)
                .width('100%')
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

      if (this.showAdd) {
        this.addDialog()
      }
    }
    .width('100%')
    .height('100%')
  }
}
