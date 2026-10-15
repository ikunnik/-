import { Theme } from '../common/constants/AppConstants';
import { RecordSource } from '../common/model/Models';
import { getBehaviorById } from '../common/constants/EmissionFactors';
import { behaviorRecognizer, RecognizeResult } from '../features/ai/BehaviorRecognizer';
import { carbonRepo } from '../data/repository/CarbonRepository';
import { calcReduction, calcPoints } from '../common/utils/CalcUtil';
import { showToast } from '../common/utils/ToastUtil';

@Entry
@Component
struct AiRecognizePage {
  @State imageUri: string = '';
  @State isDemo: boolean = false;
  @State recognizing: boolean = false;
  @State result: RecognizeResult | null = null;
  @State amount: number = 1;
  @State amountText: string = '1';
  @State saving: boolean = false;
  @State demoSeq: number = 0;

  startRecognize(uri: string, demo: boolean): void {
    this.imageUri = uri;
    this.isDemo = demo;
    this.result = null;
    this.recognizing = true;
    setTimeout(async () => {
      const res = await behaviorRecognizer.recognize(uri);
      this.result = res;
      this.recognizing = false;
      if (res !== null) {
        const b = getBehaviorById(res.behaviorId);
        this.amount = b.defaultAmount;
        this.amountText = String(b.defaultAmount);
      }
    }, 1200);
  }

  async pickFromGallery(): Promise<void> {
    const uri = await behaviorRecognizer.pickImage();
    if (uri !== '') {
      this.startRecognize(uri, false);
    }
  }

  useDemo(): void {
    this.demoSeq += 1;
    this.startRecognize('demo://low-carbon-sample-' + Date.now() + '-' + this.demoSeq, true);
  }

  changeAmount(delta: number): void {
    if (this.result === null) {
      return;
    }
    const b = getBehaviorById(this.result.behaviorId);
    let n = this.amount + delta;
    if (n < 0) {
      n = 0;
    }
    this.amount = Math.round(n * 100) / 100;
    this.amountText = String(this.amount);
  }

  onAmountInput(text: string): void {
    this.amountText = text;
    const n = parseFloat(text);
    if (!isNaN(n) && n >= 0) {
      this.amount = n;
    }
  }

  async confirm(): Promise<void> {
    if (this.saving || this.result === null) {
      return;
    }
    if (this.amount <= 0) {
      showToast(this.getUIContext(), '请输入大于 0 的数量');
      return;
    }
    this.saving = true;
    const b = getBehaviorById(this.result.behaviorId);
    const r = await carbonRepo.addRecord(b, this.amount,
      'AI识图：' + this.result.matchedLabel, RecordSource.AI);
    showToast(this.getUIContext(), 'AI 已录入，减排 ' + r.reduction.toFixed(2) + ' kg，+' + r.points + ' 积分');
    if (r.newBadges.length > 0) {
      try {
        this.getUIContext().getPromptAction().showDialog({
          title: '🎉 解锁新徽章',
          message: '恭喜解锁：' + r.newBadges.join('、'),
          buttons: [{ text: '太棒了', color: Theme.PRIMARY }]
        });
      } catch (e) {
        // 弹窗参数异常导致抛错，忽略
      }
    }
    setTimeout(() => {
      this.getUIContext().getRouter().back();
    }, 500);
  }

  @Builder
  previewArea() {
    Column() {
      if (this.imageUri !== '' && !this.isDemo) {
        Image(this.imageUri)
          .width('100%')
          .height(220)
          .objectFit(ImageFit.Cover)
          .borderRadius(16)
      } else if (this.isDemo && this.result !== null) {
        Column() {
          Text(getBehaviorById(this.result.behaviorId).icon)
            .fontSize(72)
          Text('演示样例图片')
            .fontSize(12)
            .fontColor(Theme.TEXT_SUB)
            .margin({ top: 8 })
        }
        .width('100%')
        .height(220)
        .justifyContent(FlexAlign.Center)
        .backgroundColor(Theme.PRIMARY_LIGHT)
        .borderRadius(16)
      } else {
        Column() {
          Text('📷')
            .fontSize(56)
          Text('选择一张低碳行为照片')
            .fontSize(13)
            .fontColor(Theme.TEXT_SUB)
            .margin({ top: 10 })
          Text('如骑行、公交、光盘、旧物回收…')
            .fontSize(11)
            .fontColor(Theme.TEXT_SUB)
            .margin({ top: 4 })
        }
        .width('100%')
        .height(220)
        .justifyContent(FlexAlign.Center)
        .backgroundColor(Theme.BG)
        .borderRadius(16)
        .border({ width: 1.5, color: Theme.DIVIDER, radius: 16 })
      }
    }
    .width('100%')
  }

  @Builder
  recognizingTip() {
    Column() {
      LoadingProgress()
        .width(40)
        .height(40)
        .color(Theme.PRIMARY)
      Text('端侧 AI 正在识别低碳行为…')
        .fontSize(13)
        .fontColor(Theme.PRIMARY)
        .margin({ top: 10 })
      Text('图片仅在本机处理，不上传云端')
        .fontSize(11)
        .fontColor(Theme.TEXT_SUB)
        .margin({ top: 4 })
    }
    .width('100%')
    .padding(24)
    .justifyContent(FlexAlign.Center)
    .backgroundColor(Theme.PRIMARY_LIGHT)
    .borderRadius(16)
    .margin({ top: 12 })
  }

  @Builder
  resultCard() {
    Column() {
      // 识别结论
      Row() {
        Text(getBehaviorById(this.result!.behaviorId).icon)
          .fontSize(34)
          .width(58)
          .height(58)
          .textAlign(TextAlign.Center)
          .backgroundColor(Theme.PRIMARY_LIGHT)
          .borderRadius(29)
        Column() {
          Text('识别为：' + this.result!.matchedLabel)
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor(Theme.TEXT_MAIN)
          Text(this.result!.engine)
            .fontSize(11)
            .fontColor(Theme.TEXT_SUB)
            .margin({ top: 3 })
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)
        .margin({ left: 12 })
        Column() {
          Text((this.result!.confidence * 100).toFixed(0) + '%')
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor(Theme.PRIMARY)
          Text('置信度')
            .fontSize(10)
            .fontColor(Theme.TEXT_SUB)
        }
      }
      .width('100%')

      Stack({ alignContent: Alignment.Start }) {
        Column()
          .width('100%')
          .height(6)
          .backgroundColor(Theme.BG)
          .borderRadius(3)
        Column()
          .width((this.result!.confidence * 100).toFixed(0) + '%')
          .height(6)
          .backgroundColor(Theme.PRIMARY)
          .borderRadius(3)
      }
      .width('100%')
      .margin({ top: 10 })

      // 数量
      Column() {
        Text(getBehaviorById(this.result!.behaviorId).hint)
          .fontSize(12)
          .fontColor(Theme.TEXT_SUB)
          .width('100%')
          .margin({ bottom: 10 })
        Row() {
          Button('－')
            .width(44)
            .height(44)
            .fontSize(20)
            .backgroundColor(Theme.BG)
            .fontColor(Theme.TEXT_MAIN)
            .onClick(() => {
              this.changeAmount(-getBehaviorById(this.result!.behaviorId).step);
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
              this.changeAmount(getBehaviorById(this.result!.behaviorId).step);
            })
        }
        .width('100%')
        Row() {
          Text('单位：' + getBehaviorById(this.result!.behaviorId).unit)
            .fontSize(12)
            .fontColor(Theme.TEXT_SUB)
        }
        .width('100%')
        .margin({ top: 8 })
      }
      .width('100%')
      .margin({ top: 16 })

      // 核算
      Row() {
        Column() {
          Text('预计减排')
            .fontSize(12)
            .fontColor(Theme.TEXT_SUB)
          Text(calcReduction(getBehaviorById(this.result!.behaviorId).factor, this.amount).toFixed(3) + ' kg')
            .fontSize(19)
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
          Text('+' + calcPoints(calcReduction(getBehaviorById(this.result!.behaviorId).factor, this.amount)))
            .fontSize(19)
            .fontWeight(FontWeight.Bold)
            .fontColor(Theme.WARN)
            .margin({ top: 4 })
        }
        .alignItems(HorizontalAlign.End)
      }
      .width('100%')
      .margin({ top: 16 })
    }
    .width('100%')
    .padding(16)
    .backgroundColor(Color.White)
    .borderRadius(16)
    .margin({ top: 12 })
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
        Text('AI 识图记录')
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
          this.previewArea()

          // 选图操作
          Row() {
            Button('🖼️ 相册选择')
              .layoutWeight(1)
              .height(44)
              .fontSize(14)
              .backgroundColor(Theme.PRIMARY)
              .onClick(() => {
                this.pickFromGallery();
              })
            Button('✨ 演示样例')
              .layoutWeight(1)
              .height(44)
              .fontSize(14)
              .backgroundColor(Theme.BG)
              .fontColor(Theme.TEXT_MAIN)
              .margin({ left: 12 })
              .onClick(() => {
                this.useDemo();
              })
          }
          .width('100%')
          .margin({ top: 12 })

          if (this.recognizing) {
            this.recognizingTip()
          }

          if (!this.recognizing && this.result !== null) {
            this.resultCard()
          }

          Text('🔒 端侧 AI 能力：图片仅在本机完成识别，自动填充行为与数量，确认后即录入，全程无需联网。真机可升级为 Core Vision Kit 图像分类模型。')
            .fontSize(11)
            .fontColor(Theme.TEXT_SUB)
            .lineHeight(17)
            .width('100%')
            .margin({ top: 14, bottom: 12 })
        }
        .width('100%')
        .padding({ left: 14, right: 14 })
      }
      .layoutWeight(1)
      .scrollBar(BarState.Off)
      .align(Alignment.Top)

      if (!this.recognizing && this.result !== null) {
        Button('✅ 确认并自动录入')
          .width('100%')
          .height(48)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .backgroundColor(Theme.PRIMARY)
          .borderRadius(24)
          .margin({ left: 16, right: 16, top: 10, bottom: 14 })
          .enabled(!this.saving)
          .onClick(() => {
            this.confirm();
          })
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Theme.BG)
  }
}
