import hilog from '@ohos.hilog';
import { common } from '@kit.AbilityKit';
import { Theme, CATEGORY_META, CategoryMeta } from '../common/constants/AppConstants';
import { getBehaviorsByCategory, getBehaviorById } from '../common/constants/EmissionFactors';
import { BehaviorType, RecordSource } from '../common/model/Models';
import { calcReduction, calcPoints } from '../common/utils/CalcUtil';
import { carbonRepo } from '../data/repository/CarbonRepository';
import { ensureDb } from '../data/db/CarbonDb';
import { showToast } from '../common/utils/ToastUtil';

const DOMAIN: number = 0x0000;

class AddPageParams {
  category: string = '';
}

@Entry
@Component
struct RecordAddPage {
  @State category: string = 'travel';
  @State behaviors: Array<BehaviorType> = [];
  @State selectedId: string = 'walk';
  @State amount: number = 1;
  @State amountText: string = '1';
  @State note: string = '';
  @State saving: boolean = false;

  // 分类切换动画：列表入场方向（1=向右滑入，-1=向左滑入）与动画 key
  @State listEnterDir: number = 1;
  @State listAnimKey: number = 0;
  @State listOffsetX: number = 0;
  @State listOpacity: number = 1;
  @State animating: boolean = false;

  // 感谢弹窗状态
  @State thanksVisible: boolean = false;
  @State thanksBehavior: string = '';
  @State thanksAmount: number = 0;
  @State thanksUnit: string = '';
  @State thanksReduction: number = 0;
  @State thanksPoints: number = 0;
  @State thanksBadges: Array<string> = [];

  async aboutToAppear(): Promise<void> {
    let cat: string = 'travel';
    const p = this.getUIContext().getRouter().getParams() as AddPageParams;
    if (p !== null && p !== undefined && p.category !== undefined && p.category !== '') {
      cat = p.category;
    }
    this.selectCategory(cat);
  }

  selectCategory(cat: string): void {
    this.category = cat;
    const list = getBehaviorsByCategory(cat);
    this.behaviors = list;
    if (list.length > 0) {
      this.selectBehavior(list[0]);
    }
  }

  /** 点击分类：先滑出→换数据→再按方向滑入，形成连贯的滑动切换动画 */
  switchCategory(cat: string): void {
    if (this.category === cat || this.animating) {
      return;
    }
    const fromIdx = this.categoryIndex(this.category);
    const toIdx = this.categoryIndex(cat);
    // 目标在右侧则从右滑入，在左侧则从左滑入
    this.listEnterDir = toIdx >= fromIdx ? 1 : -1;
    this.animating = true;
    // 阶段一：淡出并轻微位移
    this.listOpacity = 0;
    this.listOffsetX = -12 * this.listEnterDir;
    setTimeout(() => {
      this.selectCategory(cat);
      this.listAnimKey += 1;
      // 阶段二：从目标方向滑入
      this.listOffsetX = 28 * this.listEnterDir;
      setTimeout(() => {
        this.listOffsetX = 0;
        this.listOpacity = 1;
        this.animating = false;
      }, 16);
    }, 130);
  }

  private categoryIndex(key: string): number {
    for (let i = 0; i < CATEGORY_META.length; i++) {
      if (CATEGORY_META[i].key === key) {
        return i;
      }
    }
    return 0;
  }

  selectBehavior(b: BehaviorType): void {
    this.selectedId = b.id;
    this.amount = b.defaultAmount;
    this.amountText = String(b.defaultAmount);
  }

  changeAmount(delta: number): void {
    const b = getBehaviorById(this.selectedId);
    let n = this.amount + delta;
    if (n < 0) {
      n = 0;
    }
    this.amount = Math.round(n * 100) / 100;
    this.amountText = String(this.amount);
  }

  /** 快捷加量：按当前行为步长的倍数快速累加（如步行 +1/+5/+10 公里） */
  quickAdd(multiplier: number): void {
    const step = getBehaviorById(this.selectedId).step;
    this.changeAmount(step * multiplier);
  }

  onAmountInput(text: string): void {
    this.amountText = text;
    const n = parseFloat(text);
    if (!isNaN(n) && n >= 0) {
      this.amount = n;
    }
  }

  async save(): Promise<void> {
    if (this.saving) {
      return;
    }
    if (this.amount <= 0) {
      showToast(this.getUIContext(), '请输入大于 0 的数量');
      return;
    }
    this.saving = true;
    const b = getBehaviorById(this.selectedId);
    try {
      // 兜底：Previewer 下 EntryAbility 不会执行，这里确保数据库已初始化
      await ensureDb(this.getUIContext().getHostContext() as common.Context);

      const result = await carbonRepo.addRecord(b, this.amount, this.note.trim(), RecordSource.MANUAL);

      // 回读校验：确认记录已真实落库，而非仅在内存中返回成功
      const savedTotal = await carbonRepo.getTotalReduction();
      hilog.info(DOMAIN, 'CarbonFootprint',
        'Saved. thisRecord=%{public}s kg, dbTotal=%{public}s kg',
        result.reduction.toFixed(3), String(savedTotal));

      // 写入后台统计（记录表 + 积分流水 + 任务进度 + 徽章），并通知各 Tab 页刷新
      const cur = AppStorage.get<number>('refreshTick') ?? 0;
      AppStorage.setOrCreate('refreshTick', cur + 1);

      this.thanksBehavior = b.name;
      this.thanksAmount = result.record.amount;
      this.thanksUnit = result.record.unit;
      this.thanksReduction = result.reduction;
      this.thanksPoints = result.points;
      this.thanksBadges = result.newBadges;
      this.thanksVisible = true;
    } catch (err) {
      const e = err as Error;
      hilog.error(DOMAIN, 'CarbonFootprint', 'Save failed: %{public}s', e.message);
      const reason = e.message === undefined || e.message === '' ? '未知错误' : e.message;
      showToast(this.getUIContext(), '保存失败：' + reason);
    } finally {
      this.saving = false;
    }
  }

  /** 关闭感谢弹窗并返回上一页 */
  closeThanks(): void {
    this.thanksVisible = false;
    this.thanksBadges = [];
    this.getUIContext().getRouter().back();
  }

  @Builder
  categoryChip(item: CategoryMeta) {
    Text(item.icon + ' ' + item.name)
      .fontSize(13)
      .padding({ left: 12, right: 12, top: 7, bottom: 7 })
      .borderRadius(16)
      .backgroundColor(this.category === item.key ? item.color : Color.White)
      .fontColor(this.category === item.key ? Color.White : Theme.TEXT_SUB)
      .margin({ right: 8 })
      .animation({ duration: 220, curve: Curve.EaseInOut })
      .onClick(() => {
        this.switchCategory(item.key);
      })
  }

  @Builder
  behaviorItem(b: BehaviorType) {
    Row() {
      Text(b.icon)
        .fontSize(22)
        .width(42)
        .height(42)
        .textAlign(TextAlign.Center)
        .backgroundColor(Theme.BG)
        .borderRadius(21)
      Column() {
        Text(b.name)
          .fontSize(14)
          .fontColor(Theme.TEXT_MAIN)
          .fontWeight(FontWeight.Medium)
        Text('每' + b.unit + '约减排 ' + b.factor + ' kg')
          .fontSize(11)
          .fontColor(Theme.TEXT_SUB)
          .margin({ top: 3 })
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      .margin({ left: 10 })

      Radio({ value: b.id, group: 'behavior' })
        .checked(this.selectedId === b.id)
        .enabled(false)
    }
    .width('100%')
    .padding(12)
    .margin({ bottom: 8 })
    .borderRadius(12)
    .backgroundColor(this.selectedId === b.id ? Theme.PRIMARY_LIGHT : Color.White)
    .border({
      width: this.selectedId === b.id ? 1.5 : 1,
      color: this.selectedId === b.id ? Theme.PRIMARY : Theme.DIVIDER
    })
    .onClick(() => {
      this.selectBehavior(b);
    })
  }

  /** 感谢弹窗：附插图 + 文案 + 本次入账明细 */
  @Builder
  thanksOverlay() {
    Stack({ alignContent: Alignment.Center }) {
      // 半透明遮罩
      Column()
        .width('100%')
        .height('100%')
        .backgroundColor('#66000000')
        .onClick(() => {
        })

      Column() {
        Image($r('app.media.thanks_green'))
          .width(150)
          .height(150)
          .objectFit(ImageFit.Contain)
          .margin({ bottom: 6 })

        Text('记录保存成功！感谢你的低碳行动，减排贡献已计入碳足迹')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor(Theme.TEXT_MAIN)
          .textAlign(TextAlign.Center)
          .lineHeight(26)
          .width('100%')
          .margin({ bottom: 14 })

        // 入账明细
        Column() {
          Row() {
            Text('记录行为')
              .fontSize(12)
              .fontColor(Theme.TEXT_SUB)
            Blank()
            Text(this.thanksBehavior + ' ' + this.thanksAmount + this.thanksUnit)
              .fontSize(13)
              .fontWeight(FontWeight.Medium)
              .fontColor(Theme.TEXT_MAIN)
          }
          .width('100%')
          .margin({ bottom: 8 })

          Row() {
            Text('本次减排')
              .fontSize(12)
              .fontColor(Theme.TEXT_SUB)
            Blank()
            Text(this.thanksReduction.toFixed(3) + ' kg CO2e')
              .fontSize(13)
              .fontWeight(FontWeight.Medium)
              .fontColor(Theme.TEXT_MAIN)
          }
          .width('100%')
          .margin({ bottom: 8 })

          Row() {
            Text('获得积分')
              .fontSize(12)
              .fontColor(Theme.TEXT_SUB)
            Blank()
            Text('+' + this.thanksPoints)
              .fontSize(13)
              .fontWeight(FontWeight.Medium)
              .fontColor(Theme.WARN)
          }
          .width('100%')
        }
        .width('100%')
        .padding(14)
        .backgroundColor(Theme.PRIMARY_LIGHT)
        .borderRadius(14)

        if (this.thanksBadges.length > 0) {
          Text('🎉 解锁新徽章：' + this.thanksBadges.join('、'))
            .fontSize(12)
            .fontColor(Theme.WARN)
            .textAlign(TextAlign.Center)
            .margin({ top: 12 })
        }

        Button('继续低碳')
          .width('100%')
          .height(44)
          .fontSize(15)
          .fontWeight(FontWeight.Bold)
          .backgroundColor(Theme.PRIMARY)
          .borderRadius(22)
          .margin({ top: 18 })
          .onClick(() => {
            this.closeThanks();
          })
      }
      .width('84%')
      .padding({ top: 20, bottom: 20, left: 18, right: 18 })
      .backgroundColor(Color.White)
      .borderRadius(20)
    }
  }

  build() {
    Stack() {
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
          Text('记录低碳行为')
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
          // AI 图片识别入口
          Row() {
            Text('📷')
              .fontSize(24)
              .width(44)
              .height(44)
              .textAlign(TextAlign.Center)
              .backgroundColor(Theme.PRIMARY_LIGHT)
              .borderRadius(22)
            Column() {
              Text('AI 图片智能识别')
                .fontSize(14)
                .fontWeight(FontWeight.Medium)
                .fontColor(Theme.TEXT_MAIN)
              Text('拍张照自动识别行为并填充数量，端侧处理不上传')
                .fontSize(11)
                .fontColor(Theme.TEXT_SUB)
                .margin({ top: 3 })
            }
            .alignItems(HorizontalAlign.Start)
            .layoutWeight(1)
            .margin({ left: 12 })
            Text('›')
              .fontSize(22)
              .fontColor(Theme.TEXT_SUB)
          }
          .width('100%')
          .padding(12)
          .backgroundColor(Color.White)
          .borderRadius(16)
          .margin({ left: 12, right: 12, top: 12 })
          .onClick(() => {
            this.getUIContext().getRouter().pushUrl({ url: 'pages/AiRecognizePage' });
          })

          // 分类
            Row() {
              Scroll() {
                Row() {
                  ForEach(CATEGORY_META, (item: CategoryMeta) => {
                    this.categoryChip(item)
                  }, (item: CategoryMeta) => item.key)
                }
                .padding({ left: 4, right: 4 })
              }
              .scrollable(ScrollDirection.Horizontal)
              .scrollBar(BarState.Off)
              .width('100%')
            }
            .width('100%')
            .margin({ top: 10, bottom: 4 })

            // 数量输入（置于分类下方首屏可见，方便快速记录多公里）
            Column() {
              Text(getBehaviorById(this.selectedId).hint)
                .fontSize(13)
                .fontColor(Theme.TEXT_SUB)
                .width('100%')
                .margin({ bottom: 12 })
              Row() {
                Button('－')
                  .width(44)
                  .height(44)
                  .fontSize(20)
                  .backgroundColor(Theme.BG)
                  .fontColor(Theme.TEXT_MAIN)
                  .onClick(() => {
                    this.changeAmount(-getBehaviorById(this.selectedId).step);
                  })
                TextInput({ text: this.amountText })
                  .type(InputType.Number)
                  .layoutWeight(1)
                  .height(44)
                  .textAlign(TextAlign.Center)
                  .fontSize(18)
                  .fontWeight(FontWeight.Bold)
                  .backgroundColor(Theme.BG)
                  .margin({ left: 10, right: 10 })
                  .onChange((v: string) => {
                    this.onAmountInput(v);
                  })
                Button('＋')
                  .width(44)
                  .height(44)
                  .fontSize(20)
                  .backgroundColor(Theme.BG)
                  .fontColor(Theme.TEXT_MAIN)
                  .onClick(() => {
                    this.changeAmount(getBehaviorById(this.selectedId).step);
                  })
              }
              .width('100%')
              // 快捷加量：按步长倍数一键累加（步行即 +1/+5/+10 公里）
              Row() {
                Text('快捷')
                  .fontSize(12)
                  .fontColor(Theme.TEXT_SUB)
                  .margin({ right: 8 })
                ForEach([1, 5, 10], (m: number) => {
                  Text('+' + m)
                    .fontSize(13)
                    .fontWeight(FontWeight.Medium)
                    .fontColor(Theme.PRIMARY)
                    .backgroundColor(Theme.PRIMARY_LIGHT)
                    .padding({ left: 14, right: 14, top: 6, bottom: 6 })
                    .borderRadius(14)
                    .margin({ right: 8 })
                    .onClick(() => {
                      this.quickAdd(m);
                    })
                }, (m: number) => String(m))
                Blank()
                Text('单位：' + getBehaviorById(this.selectedId).unit)
                  .fontSize(12)
                  .fontColor(Theme.TEXT_SUB)
              }
              .width('100%')
              .margin({ top: 10 })
            }
            .width('100%')
            .padding(14)
            .backgroundColor(Color.White)
            .borderRadius(16)
            .margin({ left: 12, right: 12, top: 8 })

            // 行为类型（切换分类时按方向滑动淡入）
            Column() {
              ForEach(this.behaviors, (b: BehaviorType) => {
                this.behaviorItem(b)
              }, (b: BehaviorType) => b.id)
            }
            .width('100%')
            .padding({ left: 12, right: 12, top: 4 })
            .opacity(this.listOpacity)
            .translate({ x: this.listOffsetX })
            .animation({
              duration: this.animating ? 240 : 0,
              curve: Curve.EaseInOut
            })

            // 实时核算结果
            Row() {
              Column() {
                Text('本次减排量')
                  .fontSize(12)
                  .fontColor(Theme.TEXT_SUB)
                Text(calcReduction(getBehaviorById(this.selectedId).factor, this.amount).toFixed(3) + ' kg')
                  .fontSize(20)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Theme.PRIMARY)
                  .margin({ top: 4 })
              }
              .alignItems(HorizontalAlign.Start)
              .layoutWeight(1)
              Column() {
                Text('可获积分')
                  .fontSize(12)
                  .fontColor(Theme.TEXT_SUB)
                Text('+' + calcPoints(calcReduction(getBehaviorById(this.selectedId).factor, this.amount)))
                  .fontSize(20)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Theme.WARN)
                  .margin({ top: 4 })
              }
              .alignItems(HorizontalAlign.End)
            }
            .width('100%')
            .padding(16)
            .backgroundColor(Theme.PRIMARY_LIGHT)
            .borderRadius(16)
            .margin({ left: 12, right: 12, top: 12 })

            // 备注
            TextArea({ placeholder: '备注（可选）：如步行上下班、随手关灯…', text: this.note })
              .width('100%')
              .height(70)
              .fontSize(13)
              .backgroundColor(Color.White)
              .borderRadius(16)
              .padding(12)
              .margin({ left: 12, right: 12, top: 12 })
              .onChange((v: string) => {
                this.note = v;
              })
          }
          .width('100%')
          .padding({ bottom: 16 })
        }
        .layoutWeight(1)
        .scrollBar(BarState.Off)
        .align(Alignment.Top)

        // 保存按钮
        Button(this.saving ? '保存中…' : '💾 保存记录')
          .width('100%')
          .height(48)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .backgroundColor(this.saving ? Theme.TEXT_SUB : Theme.PRIMARY)
          .borderRadius(24)
          .margin({ left: 16, right: 16, top: 10, bottom: 14 })
          .enabled(!this.saving)
          .onClick(() => {
            this.save();
          })
      }
      .width('100%')
      .height('100%')
      .backgroundColor(Theme.BG)

      // 感谢弹窗
      if (this.thanksVisible) {
        this.thanksOverlay()
      }
    }
    .width('100%')
    .height('100%')
  }
}