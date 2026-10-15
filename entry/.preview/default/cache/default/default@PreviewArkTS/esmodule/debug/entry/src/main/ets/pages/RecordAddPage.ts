if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface RecordAddPage_Params {
    category?: string;
    behaviors?: Array<BehaviorType>;
    selectedId?: string;
    amount?: number;
    amountText?: string;
    note?: string;
    saving?: boolean;
    listEnterDir?: number;
    listAnimKey?: number;
    listOffsetX?: number;
    listOpacity?: number;
    animating?: boolean;
    thanksVisible?: boolean;
    thanksBehavior?: string;
    thanksAmount?: number;
    thanksUnit?: string;
    thanksReduction?: number;
    thanksPoints?: number;
    thanksBadges?: Array<string>;
}
import hilog from "@ohos:hilog";
import type common from "@ohos:app.ability.common";
import { Theme, CATEGORY_META } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import type { CategoryMeta } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import { getBehaviorsByCategory, getBehaviorById } from "@normalized:N&&&entry/src/main/ets/common/constants/EmissionFactors&";
import { RecordSource } from "@normalized:N&&&entry/src/main/ets/common/model/Models&";
import type { BehaviorType } from "@normalized:N&&&entry/src/main/ets/common/model/Models&";
import { calcReduction, calcPoints } from "@normalized:N&&&entry/src/main/ets/common/utils/CalcUtil&";
import { carbonRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/CarbonRepository&";
import { ensureDb } from "@normalized:N&&&entry/src/main/ets/data/db/CarbonDb&";
import { showToast } from "@normalized:N&&&entry/src/main/ets/common/utils/ToastUtil&";
const DOMAIN: number = 0x0000;
class AddPageParams {
    category: string = '';
}
class RecordAddPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__category = new ObservedPropertySimplePU('travel', this, "category");
        this.__behaviors = new ObservedPropertyObjectPU([], this, "behaviors");
        this.__selectedId = new ObservedPropertySimplePU('walk', this, "selectedId");
        this.__amount = new ObservedPropertySimplePU(1, this, "amount");
        this.__amountText = new ObservedPropertySimplePU('1', this, "amountText");
        this.__note = new ObservedPropertySimplePU('', this, "note");
        this.__saving = new ObservedPropertySimplePU(false, this, "saving");
        this.__listEnterDir = new ObservedPropertySimplePU(1, this, "listEnterDir");
        this.__listAnimKey = new ObservedPropertySimplePU(0, this, "listAnimKey");
        this.__listOffsetX = new ObservedPropertySimplePU(0, this, "listOffsetX");
        this.__listOpacity = new ObservedPropertySimplePU(1, this, "listOpacity");
        this.__animating = new ObservedPropertySimplePU(false, this, "animating");
        this.__thanksVisible = new ObservedPropertySimplePU(false, this, "thanksVisible");
        this.__thanksBehavior = new ObservedPropertySimplePU('', this, "thanksBehavior");
        this.__thanksAmount = new ObservedPropertySimplePU(0, this, "thanksAmount");
        this.__thanksUnit = new ObservedPropertySimplePU('', this, "thanksUnit");
        this.__thanksReduction = new ObservedPropertySimplePU(0, this, "thanksReduction");
        this.__thanksPoints = new ObservedPropertySimplePU(0, this, "thanksPoints");
        this.__thanksBadges = new ObservedPropertyObjectPU([], this, "thanksBadges");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: RecordAddPage_Params) {
        if (params.category !== undefined) {
            this.category = params.category;
        }
        if (params.behaviors !== undefined) {
            this.behaviors = params.behaviors;
        }
        if (params.selectedId !== undefined) {
            this.selectedId = params.selectedId;
        }
        if (params.amount !== undefined) {
            this.amount = params.amount;
        }
        if (params.amountText !== undefined) {
            this.amountText = params.amountText;
        }
        if (params.note !== undefined) {
            this.note = params.note;
        }
        if (params.saving !== undefined) {
            this.saving = params.saving;
        }
        if (params.listEnterDir !== undefined) {
            this.listEnterDir = params.listEnterDir;
        }
        if (params.listAnimKey !== undefined) {
            this.listAnimKey = params.listAnimKey;
        }
        if (params.listOffsetX !== undefined) {
            this.listOffsetX = params.listOffsetX;
        }
        if (params.listOpacity !== undefined) {
            this.listOpacity = params.listOpacity;
        }
        if (params.animating !== undefined) {
            this.animating = params.animating;
        }
        if (params.thanksVisible !== undefined) {
            this.thanksVisible = params.thanksVisible;
        }
        if (params.thanksBehavior !== undefined) {
            this.thanksBehavior = params.thanksBehavior;
        }
        if (params.thanksAmount !== undefined) {
            this.thanksAmount = params.thanksAmount;
        }
        if (params.thanksUnit !== undefined) {
            this.thanksUnit = params.thanksUnit;
        }
        if (params.thanksReduction !== undefined) {
            this.thanksReduction = params.thanksReduction;
        }
        if (params.thanksPoints !== undefined) {
            this.thanksPoints = params.thanksPoints;
        }
        if (params.thanksBadges !== undefined) {
            this.thanksBadges = params.thanksBadges;
        }
    }
    updateStateVars(params: RecordAddPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__category.purgeDependencyOnElmtId(rmElmtId);
        this.__behaviors.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedId.purgeDependencyOnElmtId(rmElmtId);
        this.__amount.purgeDependencyOnElmtId(rmElmtId);
        this.__amountText.purgeDependencyOnElmtId(rmElmtId);
        this.__note.purgeDependencyOnElmtId(rmElmtId);
        this.__saving.purgeDependencyOnElmtId(rmElmtId);
        this.__listEnterDir.purgeDependencyOnElmtId(rmElmtId);
        this.__listAnimKey.purgeDependencyOnElmtId(rmElmtId);
        this.__listOffsetX.purgeDependencyOnElmtId(rmElmtId);
        this.__listOpacity.purgeDependencyOnElmtId(rmElmtId);
        this.__animating.purgeDependencyOnElmtId(rmElmtId);
        this.__thanksVisible.purgeDependencyOnElmtId(rmElmtId);
        this.__thanksBehavior.purgeDependencyOnElmtId(rmElmtId);
        this.__thanksAmount.purgeDependencyOnElmtId(rmElmtId);
        this.__thanksUnit.purgeDependencyOnElmtId(rmElmtId);
        this.__thanksReduction.purgeDependencyOnElmtId(rmElmtId);
        this.__thanksPoints.purgeDependencyOnElmtId(rmElmtId);
        this.__thanksBadges.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__category.aboutToBeDeleted();
        this.__behaviors.aboutToBeDeleted();
        this.__selectedId.aboutToBeDeleted();
        this.__amount.aboutToBeDeleted();
        this.__amountText.aboutToBeDeleted();
        this.__note.aboutToBeDeleted();
        this.__saving.aboutToBeDeleted();
        this.__listEnterDir.aboutToBeDeleted();
        this.__listAnimKey.aboutToBeDeleted();
        this.__listOffsetX.aboutToBeDeleted();
        this.__listOpacity.aboutToBeDeleted();
        this.__animating.aboutToBeDeleted();
        this.__thanksVisible.aboutToBeDeleted();
        this.__thanksBehavior.aboutToBeDeleted();
        this.__thanksAmount.aboutToBeDeleted();
        this.__thanksUnit.aboutToBeDeleted();
        this.__thanksReduction.aboutToBeDeleted();
        this.__thanksPoints.aboutToBeDeleted();
        this.__thanksBadges.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __category: ObservedPropertySimplePU<string>;
    get category() {
        return this.__category.get();
    }
    set category(newValue: string) {
        this.__category.set(newValue);
    }
    private __behaviors: ObservedPropertyObjectPU<Array<BehaviorType>>;
    get behaviors() {
        return this.__behaviors.get();
    }
    set behaviors(newValue: Array<BehaviorType>) {
        this.__behaviors.set(newValue);
    }
    private __selectedId: ObservedPropertySimplePU<string>;
    get selectedId() {
        return this.__selectedId.get();
    }
    set selectedId(newValue: string) {
        this.__selectedId.set(newValue);
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
    private __note: ObservedPropertySimplePU<string>;
    get note() {
        return this.__note.get();
    }
    set note(newValue: string) {
        this.__note.set(newValue);
    }
    private __saving: ObservedPropertySimplePU<boolean>;
    get saving() {
        return this.__saving.get();
    }
    set saving(newValue: boolean) {
        this.__saving.set(newValue);
    }
    // 分类切换动画：列表入场方向（1=向右滑入，-1=向左滑入）与动画 key
    private __listEnterDir: ObservedPropertySimplePU<number>;
    get listEnterDir() {
        return this.__listEnterDir.get();
    }
    set listEnterDir(newValue: number) {
        this.__listEnterDir.set(newValue);
    }
    private __listAnimKey: ObservedPropertySimplePU<number>;
    get listAnimKey() {
        return this.__listAnimKey.get();
    }
    set listAnimKey(newValue: number) {
        this.__listAnimKey.set(newValue);
    }
    private __listOffsetX: ObservedPropertySimplePU<number>;
    get listOffsetX() {
        return this.__listOffsetX.get();
    }
    set listOffsetX(newValue: number) {
        this.__listOffsetX.set(newValue);
    }
    private __listOpacity: ObservedPropertySimplePU<number>;
    get listOpacity() {
        return this.__listOpacity.get();
    }
    set listOpacity(newValue: number) {
        this.__listOpacity.set(newValue);
    }
    private __animating: ObservedPropertySimplePU<boolean>;
    get animating() {
        return this.__animating.get();
    }
    set animating(newValue: boolean) {
        this.__animating.set(newValue);
    }
    // 感谢弹窗状态
    private __thanksVisible: ObservedPropertySimplePU<boolean>;
    get thanksVisible() {
        return this.__thanksVisible.get();
    }
    set thanksVisible(newValue: boolean) {
        this.__thanksVisible.set(newValue);
    }
    private __thanksBehavior: ObservedPropertySimplePU<string>;
    get thanksBehavior() {
        return this.__thanksBehavior.get();
    }
    set thanksBehavior(newValue: string) {
        this.__thanksBehavior.set(newValue);
    }
    private __thanksAmount: ObservedPropertySimplePU<number>;
    get thanksAmount() {
        return this.__thanksAmount.get();
    }
    set thanksAmount(newValue: number) {
        this.__thanksAmount.set(newValue);
    }
    private __thanksUnit: ObservedPropertySimplePU<string>;
    get thanksUnit() {
        return this.__thanksUnit.get();
    }
    set thanksUnit(newValue: string) {
        this.__thanksUnit.set(newValue);
    }
    private __thanksReduction: ObservedPropertySimplePU<number>;
    get thanksReduction() {
        return this.__thanksReduction.get();
    }
    set thanksReduction(newValue: number) {
        this.__thanksReduction.set(newValue);
    }
    private __thanksPoints: ObservedPropertySimplePU<number>;
    get thanksPoints() {
        return this.__thanksPoints.get();
    }
    set thanksPoints(newValue: number) {
        this.__thanksPoints.set(newValue);
    }
    private __thanksBadges: ObservedPropertyObjectPU<Array<string>>;
    get thanksBadges() {
        return this.__thanksBadges.get();
    }
    set thanksBadges(newValue: Array<string>) {
        this.__thanksBadges.set(newValue);
    }
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
            hilog.info(DOMAIN, 'CarbonFootprint', 'Saved. thisRecord=%{public}s kg, dbTotal=%{public}s kg', result.reduction.toFixed(3), String(savedTotal));
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
        }
        catch (err) {
            const e = err as Error;
            hilog.error(DOMAIN, 'CarbonFootprint', 'Save failed: %{public}s', e.message);
            const reason = e.message === undefined || e.message === '' ? '未知错误' : e.message;
            showToast(this.getUIContext(), '保存失败：' + reason);
        }
        finally {
            this.saving = false;
        }
    }
    /** 关闭感谢弹窗并返回上一页 */
    closeThanks(): void {
        this.thanksVisible = false;
        this.thanksBadges = [];
        this.getUIContext().getRouter().back();
    }
    categoryChip(item: CategoryMeta, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(item.icon + ' ' + item.name);
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(179:5)", "entry");
            globalThis.Context.animation({ duration: 220, curve: Curve.EaseInOut });
            Text.fontSize(13);
            Text.padding({ left: 12, right: 12, top: 7, bottom: 7 });
            Text.borderRadius(16);
            Text.backgroundColor(this.category === item.key ? item.color : Color.White);
            Text.fontColor(this.category === item.key ? Color.White : Theme.TEXT_SUB);
            Text.margin({ right: 8 });
            globalThis.Context.animation(null);
            Text.onClick(() => {
                this.switchCategory(item.key);
            });
        }, Text);
        Text.pop();
    }
    behaviorItem(b: BehaviorType, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(194:5)", "entry");
            Row.width('100%');
            Row.padding(12);
            Row.margin({ bottom: 8 });
            Row.borderRadius(12);
            Row.backgroundColor(this.selectedId === b.id ? Theme.PRIMARY_LIGHT : Color.White);
            Row.border({
                width: this.selectedId === b.id ? 1.5 : 1,
                color: this.selectedId === b.id ? Theme.PRIMARY : Theme.DIVIDER
            });
            Row.onClick(() => {
                this.selectBehavior(b);
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(b.icon);
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(195:7)", "entry");
            Text.fontSize(22);
            Text.width(42);
            Text.height(42);
            Text.textAlign(TextAlign.Center);
            Text.backgroundColor(Theme.BG);
            Text.borderRadius(21);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(202:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
            Column.margin({ left: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(b.name);
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(203:9)", "entry");
            Text.fontSize(14);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.fontWeight(FontWeight.Medium);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('每' + b.unit + '约减排 ' + b.factor + ' kg');
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(207:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 3 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Radio.create({ value: b.id, group: 'behavior' });
            Radio.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(216:7)", "entry");
            Radio.checked(this.selectedId === b.id);
            Radio.enabled(false);
        }, Radio);
        Row.pop();
    }
    /** 感谢弹窗：附插图 + 文案 + 本次入账明细 */
    thanksOverlay(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create({ alignContent: Alignment.Center });
            Stack.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(237:5)", "entry");
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 半透明遮罩
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(239:7)", "entry");
            // 半透明遮罩
            Column.width('100%');
            // 半透明遮罩
            Column.height('100%');
            // 半透明遮罩
            Column.backgroundColor('#66000000');
            // 半透明遮罩
            Column.onClick(() => {
            });
        }, Column);
        // 半透明遮罩
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(246:7)", "entry");
            Column.width('84%');
            Column.padding({ top: 20, bottom: 20, left: 18, right: 18 });
            Column.backgroundColor(Color.White);
            Column.borderRadius(20);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.carbonfootprint", "moduleName": "entry" });
            Image.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(247:9)", "entry");
            Image.width(150);
            Image.height(150);
            Image.objectFit(ImageFit.Contain);
            Image.margin({ bottom: 6 });
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('记录保存成功！感谢你的低碳行动，减排贡献已计入碳足迹');
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(253:9)", "entry");
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.textAlign(TextAlign.Center);
            Text.lineHeight(26);
            Text.width('100%');
            Text.margin({ bottom: 14 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 入账明细
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(263:9)", "entry");
            // 入账明细
            Column.width('100%');
            // 入账明细
            Column.padding(14);
            // 入账明细
            Column.backgroundColor(Theme.PRIMARY_LIGHT);
            // 入账明细
            Column.borderRadius(14);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(264:11)", "entry");
            Row.width('100%');
            Row.margin({ bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('记录行为');
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(265:13)", "entry");
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(268:13)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.thanksBehavior + ' ' + this.thanksAmount + this.thanksUnit);
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(269:13)", "entry");
            Text.fontSize(13);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(277:11)", "entry");
            Row.width('100%');
            Row.margin({ bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('本次减排');
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(278:13)", "entry");
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(281:13)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.thanksReduction.toFixed(3) + ' kg CO2e');
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(282:13)", "entry");
            Text.fontSize(13);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(290:11)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('获得积分');
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(291:13)", "entry");
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(294:13)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('+' + this.thanksPoints);
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(295:13)", "entry");
            Text.fontSize(13);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Theme.WARN);
        }, Text);
        Text.pop();
        Row.pop();
        // 入账明细
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.thanksBadges.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('🎉 解锁新徽章：' + this.thanksBadges.join('、'));
                        Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(308:11)", "entry");
                        Text.fontSize(12);
                        Text.fontColor(Theme.WARN);
                        Text.textAlign(TextAlign.Center);
                        Text.margin({ top: 12 });
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('继续低碳');
            Button.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(315:9)", "entry");
            Button.width('100%');
            Button.height(44);
            Button.fontSize(15);
            Button.fontWeight(FontWeight.Bold);
            Button.backgroundColor(Theme.PRIMARY);
            Button.borderRadius(22);
            Button.margin({ top: 18 });
            Button.onClick(() => {
                this.closeThanks();
            });
        }, Button);
        Button.pop();
        Column.pop();
        Stack.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(335:5)", "entry");
            Stack.width('100%');
            Stack.height('100%');
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(336:7)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(Theme.BG);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部导航
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(338:9)", "entry");
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
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(339:11)", "entry");
            Text.fontSize(28);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width(40);
            Text.onClick(() => {
                this.getUIContext().getRouter().back();
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('记录低碳行为');
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(346:11)", "entry");
            Text.fontSize(17);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.layoutWeight(1);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('');
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(352:11)", "entry");
            Text.width(40);
        }, Text);
        Text.pop();
        // 顶部导航
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(360:9)", "entry");
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Off);
            Scroll.align(Alignment.Top);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(361:1)", "entry");
            Column.width('100%');
            Column.padding({ bottom: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // AI 图片识别入口
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(363:11)", "entry");
            // AI 图片识别入口
            Row.width('100%');
            // AI 图片识别入口
            Row.padding(12);
            // AI 图片识别入口
            Row.backgroundColor(Color.White);
            // AI 图片识别入口
            Row.borderRadius(16);
            // AI 图片识别入口
            Row.margin({ left: 12, right: 12, top: 12 });
            // AI 图片识别入口
            Row.onClick(() => {
                this.getUIContext().getRouter().pushUrl({ url: 'pages/AiRecognizePage' });
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('📷');
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(364:13)", "entry");
            Text.fontSize(24);
            Text.width(44);
            Text.height(44);
            Text.textAlign(TextAlign.Center);
            Text.backgroundColor(Theme.PRIMARY_LIGHT);
            Text.borderRadius(22);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(371:13)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
            Column.margin({ left: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('AI 图片智能识别');
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(372:15)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('拍张照自动识别行为并填充数量，端侧处理不上传');
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(376:15)", "entry");
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 3 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('›');
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(384:13)", "entry");
            Text.fontSize(22);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        // AI 图片识别入口
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 分类
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(398:13)", "entry");
            // 分类
            Row.width('100%');
            // 分类
            Row.margin({ top: 10, bottom: 4 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(399:15)", "entry");
            Scroll.scrollable(ScrollDirection.Horizontal);
            Scroll.scrollBar(BarState.Off);
            Scroll.width('100%');
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(400:17)", "entry");
            Row.padding({ left: 4, right: 4 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const item = _item;
                this.categoryChip.bind(this)(item);
            };
            this.forEachUpdateFunction(elmtId, CATEGORY_META, forEachItemGenFunction, (item: CategoryMeta) => item.key, false, false);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        Scroll.pop();
        // 分类
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 数量输入（置于分类下方首屏可见，方便快速记录多公里）
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(415:13)", "entry");
            // 数量输入（置于分类下方首屏可见，方便快速记录多公里）
            Column.width('100%');
            // 数量输入（置于分类下方首屏可见，方便快速记录多公里）
            Column.padding(14);
            // 数量输入（置于分类下方首屏可见，方便快速记录多公里）
            Column.backgroundColor(Color.White);
            // 数量输入（置于分类下方首屏可见，方便快速记录多公里）
            Column.borderRadius(16);
            // 数量输入（置于分类下方首屏可见，方便快速记录多公里）
            Column.margin({ left: 12, right: 12, top: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(getBehaviorById(this.selectedId).hint);
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(416:15)", "entry");
            Text.fontSize(13);
            Text.fontColor(Theme.TEXT_SUB);
            Text.width('100%');
            Text.margin({ bottom: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(421:15)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('－');
            Button.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(422:17)", "entry");
            Button.width(44);
            Button.height(44);
            Button.fontSize(20);
            Button.backgroundColor(Theme.BG);
            Button.fontColor(Theme.TEXT_MAIN);
            Button.onClick(() => {
                this.changeAmount(-getBehaviorById(this.selectedId).step);
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.amountText });
            TextInput.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(431:17)", "entry");
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
            Button.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(443:17)", "entry");
            Button.width(44);
            Button.height(44);
            Button.fontSize(20);
            Button.backgroundColor(Theme.BG);
            Button.fontColor(Theme.TEXT_MAIN);
            Button.onClick(() => {
                this.changeAmount(getBehaviorById(this.selectedId).step);
            });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 快捷加量：按步长倍数一键累加（步行即 +1/+5/+10 公里）
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(455:15)", "entry");
            // 快捷加量：按步长倍数一键累加（步行即 +1/+5/+10 公里）
            Row.width('100%');
            // 快捷加量：按步长倍数一键累加（步行即 +1/+5/+10 公里）
            Row.margin({ top: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('快捷');
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(456:17)", "entry");
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ right: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const m = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('+' + m);
                    Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(461:19)", "entry");
                    Text.fontSize(13);
                    Text.fontWeight(FontWeight.Medium);
                    Text.fontColor(Theme.PRIMARY);
                    Text.backgroundColor(Theme.PRIMARY_LIGHT);
                    Text.padding({ left: 14, right: 14, top: 6, bottom: 6 });
                    Text.borderRadius(14);
                    Text.margin({ right: 8 });
                    Text.onClick(() => {
                        this.quickAdd(m);
                    });
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, [1, 5, 10], forEachItemGenFunction, (m: number) => String(m), false, false);
        }, ForEach);
        ForEach.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(473:17)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('单位：' + getBehaviorById(this.selectedId).unit);
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(474:17)", "entry");
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        // 快捷加量：按步长倍数一键累加（步行即 +1/+5/+10 公里）
        Row.pop();
        // 数量输入（置于分类下方首屏可见，方便快速记录多公里）
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 行为类型（切换分类时按方向滑动淡入）
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(488:13)", "entry");
            globalThis.Context.animation({
                duration: this.animating ? 240 : 0,
                curve: Curve.EaseInOut
            });
            // 行为类型（切换分类时按方向滑动淡入）
            Column.width('100%');
            // 行为类型（切换分类时按方向滑动淡入）
            Column.padding({ left: 12, right: 12, top: 4 });
            // 行为类型（切换分类时按方向滑动淡入）
            Column.opacity(this.listOpacity);
            // 行为类型（切换分类时按方向滑动淡入）
            Column.translate({ x: this.listOffsetX });
            globalThis.Context.animation(null);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const b = _item;
                this.behaviorItem.bind(this)(b);
            };
            this.forEachUpdateFunction(elmtId, this.behaviors, forEachItemGenFunction, (b: BehaviorType) => b.id, false, false);
        }, ForEach);
        ForEach.pop();
        // 行为类型（切换分类时按方向滑动淡入）
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 实时核算结果
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(503:13)", "entry");
            // 实时核算结果
            Row.width('100%');
            // 实时核算结果
            Row.padding(16);
            // 实时核算结果
            Row.backgroundColor(Theme.PRIMARY_LIGHT);
            // 实时核算结果
            Row.borderRadius(16);
            // 实时核算结果
            Row.margin({ left: 12, right: 12, top: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(504:15)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('本次减排量');
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(505:17)", "entry");
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(calcReduction(getBehaviorById(this.selectedId).factor, this.amount).toFixed(3) + ' kg');
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(508:17)", "entry");
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.PRIMARY);
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(516:15)", "entry");
            Column.alignItems(HorizontalAlign.End);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('可获积分');
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(517:17)", "entry");
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('+' + calcPoints(calcReduction(getBehaviorById(this.selectedId).factor, this.amount)));
            Text.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(520:17)", "entry");
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.WARN);
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        Column.pop();
        // 实时核算结果
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 备注
            TextArea.create({ placeholder: '备注（可选）：如步行上下班、随手关灯…', text: this.note });
            TextArea.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(535:13)", "entry");
            // 备注
            TextArea.width('100%');
            // 备注
            TextArea.height(70);
            // 备注
            TextArea.fontSize(13);
            // 备注
            TextArea.backgroundColor(Color.White);
            // 备注
            TextArea.borderRadius(16);
            // 备注
            TextArea.padding(12);
            // 备注
            TextArea.margin({ left: 12, right: 12, top: 12 });
            // 备注
            TextArea.onChange((v: string) => {
                this.note = v;
            });
        }, TextArea);
        Column.pop();
        Scroll.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 保存按钮
            Button.createWithLabel(this.saving ? '保存中…' : '💾 保存记录');
            Button.debugLine("entry/src/main/ets/pages/RecordAddPage.ets(555:9)", "entry");
            // 保存按钮
            Button.width('100%');
            // 保存按钮
            Button.height(48);
            // 保存按钮
            Button.fontSize(16);
            // 保存按钮
            Button.fontWeight(FontWeight.Bold);
            // 保存按钮
            Button.backgroundColor(this.saving ? Theme.TEXT_SUB : Theme.PRIMARY);
            // 保存按钮
            Button.borderRadius(24);
            // 保存按钮
            Button.margin({ left: 16, right: 16, top: 10, bottom: 14 });
            // 保存按钮
            Button.enabled(!this.saving);
            // 保存按钮
            Button.onClick(() => {
                this.save();
            });
        }, Button);
        // 保存按钮
        Button.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 感谢弹窗
            if (this.thanksVisible) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.thanksOverlay.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Stack.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "RecordAddPage";
    }
}
registerNamedRoute(() => new RecordAddPage(undefined, {}), "", { bundleName: "com.example.carbonfootprint", moduleName: "entry", pagePath: "pages/RecordAddPage", pageFullPath: "entry/src/main/ets/pages/RecordAddPage", integratedHsp: "false", moduleType: "followWithHap" });
