if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface TasksPage_Params {
    balance?: number;
    badgeCount?: number;
    treeCount?: number;
    taskVMs?: Array<TaskVM>;
    tick?: number;
    reloading?: boolean;
}
import type common from "@ohos:app.ability.common";
import { Theme } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import type { TaskDef, TaskRecord } from '../common/model/Models';
import { DAILY_TASKS } from "@normalized:N&&&entry/src/main/ets/common/constants/DailyTasks&";
import { pointsRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/PointsRepository&";
import { ensureDb } from "@normalized:N&&&entry/src/main/ets/data/db/CarbonDb&";
import { todayStr } from "@normalized:N&&&entry/src/main/ets/common/utils/DateUtil&";
import { showToast } from "@normalized:N&&&entry/src/main/ets/common/utils/ToastUtil&";
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
export class TasksPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__balance = new ObservedPropertySimplePU(0, this, "balance");
        this.__badgeCount = new ObservedPropertySimplePU(0, this, "badgeCount");
        this.__treeCount = new ObservedPropertySimplePU(0, this, "treeCount");
        this.__taskVMs = new ObservedPropertyObjectPU([], this, "taskVMs");
        this.__tick = new SynchedPropertySimpleOneWayPU(params.tick, this, "tick");
        this.reloading = false;
        this.setInitiallyProvidedValue(params);
        this.declareWatch("tick", this.onTickChange);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: TasksPage_Params) {
        if (params.balance !== undefined) {
            this.balance = params.balance;
        }
        if (params.badgeCount !== undefined) {
            this.badgeCount = params.badgeCount;
        }
        if (params.treeCount !== undefined) {
            this.treeCount = params.treeCount;
        }
        if (params.taskVMs !== undefined) {
            this.taskVMs = params.taskVMs;
        }
        if (params.tick === undefined) {
            this.__tick.set(0);
        }
        if (params.reloading !== undefined) {
            this.reloading = params.reloading;
        }
    }
    updateStateVars(params: TasksPage_Params) {
        this.__tick.reset(params.tick);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__balance.purgeDependencyOnElmtId(rmElmtId);
        this.__badgeCount.purgeDependencyOnElmtId(rmElmtId);
        this.__treeCount.purgeDependencyOnElmtId(rmElmtId);
        this.__taskVMs.purgeDependencyOnElmtId(rmElmtId);
        this.__tick.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__balance.aboutToBeDeleted();
        this.__badgeCount.aboutToBeDeleted();
        this.__treeCount.aboutToBeDeleted();
        this.__taskVMs.aboutToBeDeleted();
        this.__tick.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
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
    private __taskVMs: ObservedPropertyObjectPU<Array<TaskVM>>;
    get taskVMs() {
        return this.__taskVMs.get();
    }
    set taskVMs(newValue: Array<TaskVM>) {
        this.__taskVMs.set(newValue);
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
            await this.loadTasks();
        }
        finally {
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
        }
        else {
            showToast(this.getUIContext(), '该任务已领取过了');
        }
    }
    taskCard(vm: TaskVM, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(12);
            Row.backgroundColor(Color.White);
            Row.borderRadius(14);
            Row.margin({ bottom: 10 });
            Row.onClick(() => {
                this.claim(vm);
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(vm.def.icon);
            Text.fontSize(26);
            Text.width(48);
            Text.height(48);
            Text.textAlign(TextAlign.Center);
            Text.backgroundColor(Theme.BG);
            Text.borderRadius(24);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
            Column.margin({ left: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(vm.def.name);
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('+' + vm.def.points + ' 积分');
            Text.fontSize(12);
            Text.fontColor(Theme.WARN);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(vm.def.desc);
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 4 });
            Text.width('100%');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Progress.create({ value: vm.progress, total: vm.def.goal, type: ProgressType.Linear });
            Progress.color(Theme.PRIMARY);
            Progress.backgroundColor(Theme.DIVIDER);
            Progress.layoutWeight(1);
            Progress.height(8);
        }, Progress);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(vm.progress + '/' + vm.def.goal);
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.width(42);
            Text.textAlign(TextAlign.End);
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(vm.claimed ? '已领取' : (vm.progress >= vm.def.goal ? '领取' : '进行中'));
            Button.width(64);
            Button.height(34);
            Button.fontSize(13);
            Button.backgroundColor(vm.claimed ? Theme.DIVIDER : (vm.progress >= vm.def.goal ? Theme.PRIMARY : Theme.BG));
            Button.fontColor(vm.claimed ? Theme.TEXT_SUB : (vm.progress >= vm.def.goal ? Color.White : Theme.TEXT_SUB));
            Button.enabled(!vm.claimed && vm.progress >= vm.def.goal);
        }, Button);
        Button.pop();
        Row.pop();
    }
    entryCard(icon: string, name: string, desc: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(10);
            Row.backgroundColor(Color.White);
            Row.borderRadius(12);
            Row.margin({ bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(icon);
            Text.fontSize(22);
            Text.width(40);
            Text.height(40);
            Text.textAlign(TextAlign.Center);
            Text.backgroundColor(Theme.PRIMARY_LIGHT);
            Text.borderRadius(20);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
            Column.margin({ left: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(name);
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(desc);
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('›');
            Text.fontSize(20);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        Row.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(Theme.BG);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Off);
            Scroll.align(Alignment.Top);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 积分概览
            Column.create();
            // 积分概览
            Column.width('100%');
            // 积分概览
            Column.alignItems(HorizontalAlign.Start);
            // 积分概览
            Column.padding(20);
            // 积分概览
            Column.linearGradient({ angle: 135, colors: [['#F59E0B', 0.0], ['#F7B955', 1.0]] });
            // 积分概览
            Column.borderRadius({ bottomLeft: 24, bottomRight: 24 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('我的碳积分');
            Text.fontSize(13);
            Text.fontColor('#E6FFF4');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(String(this.balance));
            Text.fontSize(44);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🏅 徽章 ' + this.badgeCount + ' 枚');
            Text.fontSize(12);
            Text.fontColor(Color.White);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🌳 植树 ' + this.treeCount + ' 棵');
            Text.fontSize(12);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        Row.pop();
        // 积分概览
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 今日任务
            Column.create();
            // 今日任务
            Column.width('100%');
            // 今日任务
            Column.padding(12);
            // 今日任务
            Column.margin({ top: 14 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🎯 今日低碳任务');
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('每日 0 点重置');
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const vm = _item;
                this.taskCard.bind(this)(vm);
            };
            this.forEachUpdateFunction(elmtId, this.taskVMs, forEachItemGenFunction, (vm: TaskVM) => vm.def.id, false, false);
        }, ForEach);
        ForEach.pop();
        // 今日任务
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 积分激励
            Column.create();
            // 积分激励
            Column.width('100%');
            // 积分激励
            Column.padding(12);
            // 积分激励
            Column.margin({ bottom: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🎁 积分激励');
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width('100%');
            Text.margin({ bottom: 10 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.onClick(() => {
                this.getUIContext().getRouter().pushUrl({ url: 'pages/CertificatePage' });
            });
        }, Column);
        this.entryCard.bind(this)('🌳', '植树证书', '200 积分兑换 1 棵低碳树');
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.onClick(() => {
                this.getUIContext().getRouter().pushUrl({ url: 'pages/BadgesPage' });
            });
        }, Column);
        this.entryCard.bind(this)('🏅', '低碳徽章墙', '查看已解锁的虚拟徽章');
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.onClick(() => {
                this.getUIContext().getRouter().pushUrl({ url: 'pages/PointsRecordsPage' });
            });
        }, Column);
        this.entryCard.bind(this)('📒', '积分流水', '查看积分获取与兑换明细');
        Column.pop();
        // 积分激励
        Column.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
