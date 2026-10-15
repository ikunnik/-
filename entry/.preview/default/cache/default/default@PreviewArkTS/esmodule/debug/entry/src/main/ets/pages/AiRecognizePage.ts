if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface AiRecognizePage_Params {
    imageUri?: string;
    isDemo?: boolean;
    recognizing?: boolean;
    result?: RecognizeResult | null;
    amount?: number;
    amountText?: string;
    saving?: boolean;
    demoSeq?: number;
}
import { Theme } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import { RecordSource } from "@normalized:N&&&entry/src/main/ets/common/model/Models&";
import { getBehaviorById } from "@normalized:N&&&entry/src/main/ets/common/constants/EmissionFactors&";
import { behaviorRecognizer } from "@normalized:N&&&entry/src/main/ets/features/ai/BehaviorRecognizer&";
import type { RecognizeResult } from "@normalized:N&&&entry/src/main/ets/features/ai/BehaviorRecognizer&";
import { carbonRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/CarbonRepository&";
import { calcReduction, calcPoints } from "@normalized:N&&&entry/src/main/ets/common/utils/CalcUtil&";
import { showToast } from "@normalized:N&&&entry/src/main/ets/common/utils/ToastUtil&";
class AiRecognizePage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__imageUri = new ObservedPropertySimplePU('', this, "imageUri");
        this.__isDemo = new ObservedPropertySimplePU(false, this, "isDemo");
        this.__recognizing = new ObservedPropertySimplePU(false, this, "recognizing");
        this.__result = new ObservedPropertyObjectPU(null, this, "result");
        this.__amount = new ObservedPropertySimplePU(1, this, "amount");
        this.__amountText = new ObservedPropertySimplePU('1', this, "amountText");
        this.__saving = new ObservedPropertySimplePU(false, this, "saving");
        this.__demoSeq = new ObservedPropertySimplePU(0, this, "demoSeq");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: AiRecognizePage_Params) {
        if (params.imageUri !== undefined) {
            this.imageUri = params.imageUri;
        }
        if (params.isDemo !== undefined) {
            this.isDemo = params.isDemo;
        }
        if (params.recognizing !== undefined) {
            this.recognizing = params.recognizing;
        }
        if (params.result !== undefined) {
            this.result = params.result;
        }
        if (params.amount !== undefined) {
            this.amount = params.amount;
        }
        if (params.amountText !== undefined) {
            this.amountText = params.amountText;
        }
        if (params.saving !== undefined) {
            this.saving = params.saving;
        }
        if (params.demoSeq !== undefined) {
            this.demoSeq = params.demoSeq;
        }
    }
    updateStateVars(params: AiRecognizePage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__imageUri.purgeDependencyOnElmtId(rmElmtId);
        this.__isDemo.purgeDependencyOnElmtId(rmElmtId);
        this.__recognizing.purgeDependencyOnElmtId(rmElmtId);
        this.__result.purgeDependencyOnElmtId(rmElmtId);
        this.__amount.purgeDependencyOnElmtId(rmElmtId);
        this.__amountText.purgeDependencyOnElmtId(rmElmtId);
        this.__saving.purgeDependencyOnElmtId(rmElmtId);
        this.__demoSeq.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__imageUri.aboutToBeDeleted();
        this.__isDemo.aboutToBeDeleted();
        this.__recognizing.aboutToBeDeleted();
        this.__result.aboutToBeDeleted();
        this.__amount.aboutToBeDeleted();
        this.__amountText.aboutToBeDeleted();
        this.__saving.aboutToBeDeleted();
        this.__demoSeq.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __imageUri: ObservedPropertySimplePU<string>;
    get imageUri() {
        return this.__imageUri.get();
    }
    set imageUri(newValue: string) {
        this.__imageUri.set(newValue);
    }
    private __isDemo: ObservedPropertySimplePU<boolean>;
    get isDemo() {
        return this.__isDemo.get();
    }
    set isDemo(newValue: boolean) {
        this.__isDemo.set(newValue);
    }
    private __recognizing: ObservedPropertySimplePU<boolean>;
    get recognizing() {
        return this.__recognizing.get();
    }
    set recognizing(newValue: boolean) {
        this.__recognizing.set(newValue);
    }
    private __result: ObservedPropertyObjectPU<RecognizeResult | null>;
    get result() {
        return this.__result.get();
    }
    set result(newValue: RecognizeResult | null) {
        this.__result.set(newValue);
    }
    private __amount: ObservedPropertySimplePU<number>;
    get amount() {
        return this.__amount.get();
    }
    set amount(newValue: number) {
        this.__amount.set(newValue);
    }
    private __amountText: ObservedPropertySimplePU<string>;
    get amountText() {
        return this.__amountText.get();
    }
    set amountText(newValue: string) {
        this.__amountText.set(newValue);
    }
    private __saving: ObservedPropertySimplePU<boolean>;
    get saving() {
        return this.__saving.get();
    }
    set saving(newValue: boolean) {
        this.__saving.set(newValue);
    }
    private __demoSeq: ObservedPropertySimplePU<number>;
    get demoSeq() {
        return this.__demoSeq.get();
    }
    set demoSeq(newValue: number) {
        this.__demoSeq.set(newValue);
    }
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
        const r = await carbonRepo.addRecord(b, this.amount, 'AI识图：' + this.result.matchedLabel, RecordSource.AI);
        showToast(this.getUIContext(), 'AI 已录入，减排 ' + r.reduction.toFixed(2) + ' kg，+' + r.points + ' 积分');
        if (r.newBadges.length > 0) {
            try {
                this.getUIContext().getPromptAction().showDialog({
                    title: '🎉 解锁新徽章',
                    message: '恭喜解锁：' + r.newBadges.join('、'),
                    buttons: [{ text: '太棒了', color: Theme.PRIMARY }]
                });
            }
            catch (e) {
                // 弹窗参数异常导致抛错，忽略
            }
        }
        setTimeout(() => {
            this.getUIContext().getRouter().back();
        }, 500);
    }
    previewArea(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(102:5)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.imageUri !== '' && !this.isDemo) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Image.create(this.imageUri);
                        Image.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(104:9)", "entry");
                        Image.width('100%');
                        Image.height(220);
                        Image.objectFit(ImageFit.Cover);
                        Image.borderRadius(16);
                    }, Image);
                });
            }
            else if (this.isDemo && this.result !== null) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(110:9)", "entry");
                        Column.width('100%');
                        Column.height(220);
                        Column.justifyContent(FlexAlign.Center);
                        Column.backgroundColor(Theme.PRIMARY_LIGHT);
                        Column.borderRadius(16);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(getBehaviorById(this.result.behaviorId).icon);
                        Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(111:11)", "entry");
                        Text.fontSize(72);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('演示样例图片');
                        Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(113:11)", "entry");
                        Text.fontSize(12);
                        Text.fontColor(Theme.TEXT_SUB);
                        Text.margin({ top: 8 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(124:9)", "entry");
                        Column.width('100%');
                        Column.height(220);
                        Column.justifyContent(FlexAlign.Center);
                        Column.backgroundColor(Theme.BG);
                        Column.borderRadius(16);
                        Column.border({ width: 1.5, color: Theme.DIVIDER, radius: 16 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('📷');
                        Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(125:11)", "entry");
                        Text.fontSize(56);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('选择一张低碳行为照片');
                        Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(127:11)", "entry");
                        Text.fontSize(13);
                        Text.fontColor(Theme.TEXT_SUB);
                        Text.margin({ top: 10 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('如骑行、公交、光盘、旧物回收…');
                        Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(131:11)", "entry");
                        Text.fontSize(11);
                        Text.fontColor(Theme.TEXT_SUB);
                        Text.margin({ top: 4 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    recognizingTip(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(149:5)", "entry");
            Column.width('100%');
            Column.padding(24);
            Column.justifyContent(FlexAlign.Center);
            Column.backgroundColor(Theme.PRIMARY_LIGHT);
            Column.borderRadius(16);
            Column.margin({ top: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            LoadingProgress.create();
            LoadingProgress.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(150:7)", "entry");
            LoadingProgress.width(40);
            LoadingProgress.height(40);
            LoadingProgress.color(Theme.PRIMARY);
        }, LoadingProgress);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('端侧 AI 正在识别低碳行为…');
            Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(154:7)", "entry");
            Text.fontSize(13);
            Text.fontColor(Theme.PRIMARY);
            Text.margin({ top: 10 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('图片仅在本机处理，不上传云端');
            Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(158:7)", "entry");
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        Column.pop();
    }
    resultCard(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(173:5)", "entry");
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor(Color.White);
            Column.borderRadius(16);
            Column.margin({ top: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 识别结论
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(175:7)", "entry");
            // 识别结论
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(getBehaviorById(this.result!.behaviorId).icon);
            Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(176:9)", "entry");
            Text.fontSize(34);
            Text.width(58);
            Text.height(58);
            Text.textAlign(TextAlign.Center);
            Text.backgroundColor(Theme.PRIMARY_LIGHT);
            Text.borderRadius(29);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(183:9)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
            Column.margin({ left: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('识别为：' + this.result!.matchedLabel);
            Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(184:11)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.result!.engine);
            Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(188:11)", "entry");
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 3 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(196:9)", "entry");
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create((this.result!.confidence * 100).toFixed(0) + '%');
            Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(197:11)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.PRIMARY);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('置信度');
            Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(201:11)", "entry");
            Text.fontSize(10);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        Column.pop();
        // 识别结论
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create({ alignContent: Alignment.Start });
            Stack.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(208:7)", "entry");
            Stack.width('100%');
            Stack.margin({ top: 10 });
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(209:9)", "entry");
            Column.width('100%');
            Column.height(6);
            Column.backgroundColor(Theme.BG);
            Column.borderRadius(3);
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(214:9)", "entry");
            Column.width((this.result!.confidence * 100).toFixed(0) + '%');
            Column.height(6);
            Column.backgroundColor(Theme.PRIMARY);
            Column.borderRadius(3);
        }, Column);
        Column.pop();
        Stack.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 数量
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(224:7)", "entry");
            // 数量
            Column.width('100%');
            // 数量
            Column.margin({ top: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(getBehaviorById(this.result!.behaviorId).hint);
            Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(225:9)", "entry");
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
            Text.width('100%');
            Text.margin({ bottom: 10 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(230:9)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('－');
            Button.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(231:11)", "entry");
            Button.width(44);
            Button.height(44);
            Button.fontSize(20);
            Button.backgroundColor(Theme.BG);
            Button.fontColor(Theme.TEXT_MAIN);
            Button.onClick(() => {
                this.changeAmount(-getBehaviorById(this.result!.behaviorId).step);
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.amountText });
            TextInput.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(240:11)", "entry");
            TextInput.type(InputType.Number);
            TextInput.layoutWeight(1);
            TextInput.height(44);
            TextInput.textAlign(TextAlign.Center);
            TextInput.fontSize(18);
            TextInput.fontWeight(FontWeight.Bold);
            TextInput.backgroundColor(Theme.BG);
            TextInput.margin({ left: 10, right: 10 });
            TextInput.onChange((v: string) => {
                this.onAmountInput(v);
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('＋');
            Button.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(252:11)", "entry");
            Button.width(44);
            Button.height(44);
            Button.fontSize(20);
            Button.backgroundColor(Theme.BG);
            Button.fontColor(Theme.TEXT_MAIN);
            Button.onClick(() => {
                this.changeAmount(getBehaviorById(this.result!.behaviorId).step);
            });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(263:9)", "entry");
            Row.width('100%');
            Row.margin({ top: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('单位：' + getBehaviorById(this.result!.behaviorId).unit);
            Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(264:11)", "entry");
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        Row.pop();
        // 数量
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 核算
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(275:7)", "entry");
            // 核算
            Row.width('100%');
            // 核算
            Row.margin({ top: 16 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(276:9)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('预计减排');
            Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(277:11)", "entry");
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(calcReduction(getBehaviorById(this.result!.behaviorId).factor, this.amount).toFixed(3) + ' kg');
            Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(280:11)", "entry");
            Text.fontSize(19);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.PRIMARY);
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(288:9)", "entry");
            Column.alignItems(HorizontalAlign.End);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('可获积分');
            Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(289:11)", "entry");
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('+' + calcPoints(calcReduction(getBehaviorById(this.result!.behaviorId).factor, this.amount)));
            Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(292:11)", "entry");
            Text.fontSize(19);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.WARN);
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        Column.pop();
        // 核算
        Row.pop();
        Column.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(311:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(Theme.BG);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部导航
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(313:7)", "entry");
            // 顶部导航
            Row.width('100%');
            // 顶部导航
            Row.height(48);
            // 顶部导航
            Row.padding({ left: 8, right: 8 });
            // 顶部导航
            Row.backgroundColor(Color.White);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(314:9)", "entry");
            Text.fontSize(28);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width(40);
            Text.onClick(() => {
                this.getUIContext().getRouter().back();
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('AI 识图记录');
            Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(321:9)", "entry");
            Text.fontSize(17);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.layoutWeight(1);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('');
            Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(327:9)", "entry");
            Text.width(40);
        }, Text);
        Text.pop();
        // 顶部导航
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(335:7)", "entry");
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Off);
            Scroll.align(Alignment.Top);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(336:9)", "entry");
            Column.width('100%');
            Column.padding({ left: 14, right: 14 });
        }, Column);
        this.previewArea.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 选图操作
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(340:11)", "entry");
            // 选图操作
            Row.width('100%');
            // 选图操作
            Row.margin({ top: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('🖼️ 相册选择');
            Button.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(341:13)", "entry");
            Button.layoutWeight(1);
            Button.height(44);
            Button.fontSize(14);
            Button.backgroundColor(Theme.PRIMARY);
            Button.onClick(() => {
                this.pickFromGallery();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('✨ 演示样例');
            Button.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(349:13)", "entry");
            Button.layoutWeight(1);
            Button.height(44);
            Button.fontSize(14);
            Button.backgroundColor(Theme.BG);
            Button.fontColor(Theme.TEXT_MAIN);
            Button.margin({ left: 12 });
            Button.onClick(() => {
                this.useDemo();
            });
        }, Button);
        Button.pop();
        // 选图操作
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.recognizing) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.recognizingTip.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (!this.recognizing && this.result !== null) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.resultCard.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🔒 端侧 AI 能力：图片仅在本机完成识别，自动填充行为与数量，确认后即录入，全程无需联网。真机可升级为 Core Vision Kit 图像分类模型。');
            Text.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(371:11)", "entry");
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.lineHeight(17);
            Text.width('100%');
            Text.margin({ top: 14, bottom: 12 });
        }, Text);
        Text.pop();
        Column.pop();
        Scroll.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (!this.recognizing && this.result !== null) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('✅ 确认并自动录入');
                        Button.debugLine("entry/src/main/ets/pages/AiRecognizePage.ets(386:9)", "entry");
                        Button.width('100%');
                        Button.height(48);
                        Button.fontSize(16);
                        Button.fontWeight(FontWeight.Bold);
                        Button.backgroundColor(Theme.PRIMARY);
                        Button.borderRadius(24);
                        Button.margin({ left: 16, right: 16, top: 10, bottom: 14 });
                        Button.enabled(!this.saving);
                        Button.onClick(() => {
                            this.confirm();
                        });
                    }, Button);
                    Button.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "AiRecognizePage";
    }
}
registerNamedRoute(() => new AiRecognizePage(undefined, {}), "", { bundleName: "com.example.carbonfootprint", moduleName: "entry", pagePath: "pages/AiRecognizePage", pageFullPath: "entry/src/main/ets/pages/AiRecognizePage", integratedHsp: "false", moduleType: "followWithHap" });
