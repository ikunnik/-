if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface MinePage_Params {
    owner?: string;
    balance?: number;
    badgeCount?: number;
    treeCount?: number;
    editing?: boolean;
    inputName?: string;
    tick?: number;
    reloading?: boolean;
}
import type common from "@ohos:app.ability.common";
import { Theme } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import { pointsRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/PointsRepository&";
import { ensureDb } from "@normalized:N&&&entry/src/main/ets/data/db/CarbonDb&";
import { showToast } from "@normalized:N&&&entry/src/main/ets/common/utils/ToastUtil&";
export class MinePage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__owner = new ObservedPropertySimplePU('低碳行者', this, "owner");
        this.__balance = new ObservedPropertySimplePU(0, this, "balance");
        this.__badgeCount = new ObservedPropertySimplePU(0, this, "badgeCount");
        this.__treeCount = new ObservedPropertySimplePU(0, this, "treeCount");
        this.__editing = new ObservedPropertySimplePU(false, this, "editing");
        this.__inputName = new ObservedPropertySimplePU('', this, "inputName");
        this.__tick = new SynchedPropertySimpleOneWayPU(params.tick, this, "tick");
        this.reloading = false;
        this.setInitiallyProvidedValue(params);
        this.declareWatch("tick", this.onTickChange);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: MinePage_Params) {
        if (params.owner !== undefined) {
            this.owner = params.owner;
        }
        if (params.balance !== undefined) {
            this.balance = params.balance;
        }
        if (params.badgeCount !== undefined) {
            this.badgeCount = params.badgeCount;
        }
        if (params.treeCount !== undefined) {
            this.treeCount = params.treeCount;
        }
        if (params.editing !== undefined) {
            this.editing = params.editing;
        }
        if (params.inputName !== undefined) {
            this.inputName = params.inputName;
        }
        if (params.tick === undefined) {
            this.__tick.set(0);
        }
        if (params.reloading !== undefined) {
            this.reloading = params.reloading;
        }
    }
    updateStateVars(params: MinePage_Params) {
        this.__tick.reset(params.tick);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__owner.purgeDependencyOnElmtId(rmElmtId);
        this.__balance.purgeDependencyOnElmtId(rmElmtId);
        this.__badgeCount.purgeDependencyOnElmtId(rmElmtId);
        this.__treeCount.purgeDependencyOnElmtId(rmElmtId);
        this.__editing.purgeDependencyOnElmtId(rmElmtId);
        this.__inputName.purgeDependencyOnElmtId(rmElmtId);
        this.__tick.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__owner.aboutToBeDeleted();
        this.__balance.aboutToBeDeleted();
        this.__badgeCount.aboutToBeDeleted();
        this.__treeCount.aboutToBeDeleted();
        this.__editing.aboutToBeDeleted();
        this.__inputName.aboutToBeDeleted();
        this.__tick.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __owner: ObservedPropertySimplePU<string>;
    get owner() {
        return this.__owner.get();
    }
    set owner(newValue: string) {
        this.__owner.set(newValue);
    }
    private __balance: ObservedPropertySimplePU<number>;
    get balance() {
        return this.__balance.get();
    }
    set balance(newValue: number) {
        this.__balance.set(newValue);
    }
    private __badgeCount: ObservedPropertySimplePU<number>;
    get badgeCount() {
        return this.__badgeCount.get();
    }
    set badgeCount(newValue: number) {
        this.__badgeCount.set(newValue);
    }
    private __treeCount: ObservedPropertySimplePU<number>;
    get treeCount() {
        return this.__treeCount.get();
    }
    set treeCount(newValue: number) {
        this.__treeCount.set(newValue);
    }
    private __editing: ObservedPropertySimplePU<boolean>;
    get editing() {
        return this.__editing.get();
    }
    set editing(newValue: boolean) {
        this.__editing.set(newValue);
    }
    private __inputName: ObservedPropertySimplePU<string>;
    get inputName() {
        return this.__inputName.get();
    }
    set inputName(newValue: string) {
        this.__inputName.set(newValue);
    }
    // 由 Index 通过 @Prop 直传（替代原 @StorageProp 监听，Tabs 懒加载下更可靠）
    private __tick: SynchedPropertySimpleOneWayPU<number>;
    get tick() {
        return this.__tick.get();
    }
    set tick(newValue: number) {
        this.__tick.set(newValue);
    }
    private reloading: boolean;
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
            // 兜底：确保数据库已初始化
            await ensureDb(this.getUIContext().getHostContext() as common.Context);
            this.owner = await pointsRepo.getOwnerName();
            this.balance = await pointsRepo.getBalance();
            this.badgeCount = (await pointsRepo.getUnlockedBadges()).length;
            this.treeCount = await pointsRepo.getTreeCount();
        }
        finally {
            this.reloading = false;
        }
    }
    openEdit(): void {
        this.inputName = this.owner;
        this.editing = true;
    }
    async confirmName(): Promise<void> {
        const n = this.inputName.trim();
        if (n === '') {
            showToast(this.getUIContext(), '昵称不能为空');
            return;
        }
        await pointsRepo.setOwnerName(n);
        this.owner = n;
        this.editing = false;
        showToast(this.getUIContext(), '昵称已更新');
    }
    cell(icon: string, name: string, extra: string, url: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ top: 12, bottom: 12, left: 4, right: 4 });
            Row.onClick(() => {
                this.getUIContext().getRouter().pushUrl({ url: url });
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(icon);
            Text.fontSize(20);
            Text.width(38);
            Text.height(38);
            Text.textAlign(TextAlign.Center);
            Text.backgroundColor(Theme.BG);
            Text.borderRadius(19);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(name);
            Text.fontSize(14);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.layoutWeight(1);
            Text.margin({ left: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(extra);
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ right: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('›');
            Text.fontSize(20);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        Row.pop();
    }
    futureCell(icon: string, name: string, url: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ top: 10, bottom: 10, left: 4, right: 4 });
            Row.onClick(() => {
                this.getUIContext().getRouter().pushUrl({ url: url });
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(icon);
            Text.fontSize(18);
            Text.width(34);
            Text.height(34);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(name);
            Text.fontSize(13);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.layoutWeight(1);
            Text.margin({ left: 10 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('已上线');
            Text.fontSize(10);
            Text.fontColor(Theme.PRIMARY);
            Text.backgroundColor(Theme.PRIMARY_LIGHT);
            Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
            Text.borderRadius(8);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('›');
            Text.fontSize(18);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ left: 6 });
        }, Text);
        Text.pop();
        Row.pop();
    }
    editDialog(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#80000000');
            Column.justifyContent(FlexAlign.Center);
            Column.onClick(() => {
                this.editing = false;
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('82%');
            Column.padding(22);
            Column.backgroundColor(Color.White);
            Column.borderRadius(18);
            Column.onClick(() => {
                // 阻止点击卡片时关闭弹窗
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('设置昵称');
            Text.fontSize(17);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.margin({ bottom: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.inputName, placeholder: '请输入昵称' });
            TextInput.width('100%');
            TextInput.height(44);
            TextInput.backgroundColor(Theme.BG);
            TextInput.borderRadius(12);
            TextInput.onChange((v: string) => {
                this.inputName = v;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 18 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('取消');
            Button.layoutWeight(1);
            Button.height(40);
            Button.backgroundColor(Theme.BG);
            Button.fontColor(Theme.TEXT_SUB);
            Button.onClick(() => {
                this.editing = false;
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('保存');
            Button.layoutWeight(1);
            Button.height(40);
            Button.backgroundColor(Theme.PRIMARY);
            Button.margin({ left: 12 });
            Button.onClick(() => {
                this.confirmName();
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
        Column.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.width('100%');
            Stack.height('100%');
            Stack.alignContent(Alignment.Center);
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.width('100%');
            Scroll.height('100%');
            Scroll.scrollBar(BarState.Off);
            Scroll.align(Alignment.Top);
            Scroll.backgroundColor(Theme.BG);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 个人卡片
            Column.create();
            // 个人卡片
            Column.width('100%');
            // 个人卡片
            Column.padding(20);
            // 个人卡片
            Column.alignItems(HorizontalAlign.Start);
            // 个人卡片
            Column.linearGradient({ angle: 135, colors: [['#26996B', 0.0], ['#3FCB8C', 1.0]] });
            // 个人卡片
            Column.borderRadius({ bottomLeft: 24, bottomRight: 24 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🌱');
            Text.fontSize(30);
            Text.width(64);
            Text.height(64);
            Text.textAlign(TextAlign.Center);
            Text.backgroundColor('#FFFFFF33');
            Text.borderRadius(32);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
            Column.margin({ left: 14 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.onClick(() => {
                this.openEdit();
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.owner);
            Text.fontSize(19);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(' ✏️');
            Text.fontSize(13);
            Text.margin({ left: 6 });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('点击昵称可修改');
            Text.fontSize(11);
            Text.fontColor('#E6FFF4');
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 18 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(String(this.balance));
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('碳积分');
            Text.fontSize(11);
            Text.fontColor('#E6FFF4');
            Text.margin({ top: 3 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(String(this.badgeCount));
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('徽章');
            Text.fontSize(11);
            Text.fontColor('#E6FFF4');
            Text.margin({ top: 3 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(String(this.treeCount));
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('种树');
            Text.fontSize(11);
            Text.fontColor('#E6FFF4');
            Text.margin({ top: 3 });
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        // 个人卡片
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 功能
            Column.create();
            // 功能
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 12, right: 12 });
            Column.backgroundColor(Color.White);
            Column.borderRadius(16);
            Column.margin({ left: 12, right: 12, top: 16 });
        }, Column);
        this.cell.bind(this)('🏅', '低碳徽章墙', '', 'pages/BadgesPage');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color(Theme.DIVIDER);
        }, Divider);
        this.cell.bind(this)('🌳', '植树证书', '', 'pages/CertificatePage');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color(Theme.DIVIDER);
        }, Divider);
        this.cell.bind(this)('📒', '积分流水', '', 'pages/PointsRecordsPage');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color(Theme.DIVIDER);
        }, Divider);
        this.cell.bind(this)('🧮', '碳排放因子库', '26 项', 'pages/FactorLibraryPage');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color(Theme.DIVIDER);
        }, Divider);
        this.cell.bind(this)('💾', '数据备份与导出', '', 'pages/BackupPage');
        Column.pop();
        // 功能
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 拓展能力预告
            Column.create();
            // 拓展能力预告
            Column.width('100%');
            // 拓展能力预告
            Column.padding({ left: 12, right: 12 });
            // 拓展能力预告
            Column.margin({ top: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 6 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🚀 鸿蒙特色能力');
            Text.fontSize(15);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 12, right: 12 });
            Column.backgroundColor(Color.White);
            Column.borderRadius(16);
        }, Column);
        this.futureCell.bind(this)('📡', '超级终端·家庭碳积分合并', 'pages/FamilyPage');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color(Theme.DIVIDER);
        }, Divider);
        this.futureCell.bind(this)('📷', '端侧 AI 图片智能识别', 'pages/AiRecognizePage');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color(Theme.DIVIDER);
        }, Divider);
        this.futureCell.bind(this)('🏙️', '城市碳普惠平台对接', 'pages/CarbonInclusivePage');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color(Theme.DIVIDER);
        }, Divider);
        this.futureCell.bind(this)('📢', '智能服务·提醒建议与分享', 'pages/SmartPage');
        Column.pop();
        // 拓展能力预告
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('碳足迹 · 全民绿色生活 v1.0.0（单机版）\n响应“双碳”战略，践行低碳生活');
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.textAlign(TextAlign.Center);
            Text.width('100%');
            Text.margin({ top: 22, bottom: 20 });
        }, Text);
        Text.pop();
        Column.pop();
        Scroll.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.editing) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.editDialog.bind(this)();
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
}
