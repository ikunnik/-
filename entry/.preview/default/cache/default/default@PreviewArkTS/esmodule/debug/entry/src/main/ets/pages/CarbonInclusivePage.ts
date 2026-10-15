if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface CarbonInclusivePage_Params {
    localPoints?: number;
    remotePoints?: number;
    lastSync?: number;
    benefits?: Array<Benefit>;
    orders?: Array<BenefitOrder>;
    syncing?: boolean;
}
import { Theme } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import type { BenefitOrder } from '../common/model/Models';
import { carbonInclusiveClient } from "@normalized:N&&&entry/src/main/ets/features/platform/CarbonInclusiveClient&";
import type { Benefit } from "@normalized:N&&&entry/src/main/ets/features/platform/CarbonInclusiveClient&";
import { platformRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/PlatformRepository&";
import { pointsRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/PointsRepository&";
import { showToast } from "@normalized:N&&&entry/src/main/ets/common/utils/ToastUtil&";
import { formatDateTime } from "@normalized:N&&&entry/src/main/ets/common/utils/DateUtil&";
class CarbonInclusivePage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__localPoints = new ObservedPropertySimplePU(0, this, "localPoints");
        this.__remotePoints = new ObservedPropertySimplePU(0, this, "remotePoints");
        this.__lastSync = new ObservedPropertySimplePU(0, this, "lastSync");
        this.__benefits = new ObservedPropertyObjectPU([], this, "benefits");
        this.__orders = new ObservedPropertyObjectPU([], this, "orders");
        this.__syncing = new ObservedPropertySimplePU(false, this, "syncing");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: CarbonInclusivePage_Params) {
        if (params.localPoints !== undefined) {
            this.localPoints = params.localPoints;
        }
        if (params.remotePoints !== undefined) {
            this.remotePoints = params.remotePoints;
        }
        if (params.lastSync !== undefined) {
            this.lastSync = params.lastSync;
        }
        if (params.benefits !== undefined) {
            this.benefits = params.benefits;
        }
        if (params.orders !== undefined) {
            this.orders = params.orders;
        }
        if (params.syncing !== undefined) {
            this.syncing = params.syncing;
        }
    }
    updateStateVars(params: CarbonInclusivePage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__localPoints.purgeDependencyOnElmtId(rmElmtId);
        this.__remotePoints.purgeDependencyOnElmtId(rmElmtId);
        this.__lastSync.purgeDependencyOnElmtId(rmElmtId);
        this.__benefits.purgeDependencyOnElmtId(rmElmtId);
        this.__orders.purgeDependencyOnElmtId(rmElmtId);
        this.__syncing.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__localPoints.aboutToBeDeleted();
        this.__remotePoints.aboutToBeDeleted();
        this.__lastSync.aboutToBeDeleted();
        this.__benefits.aboutToBeDeleted();
        this.__orders.aboutToBeDeleted();
        this.__syncing.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __localPoints: ObservedPropertySimplePU<number>;
    get localPoints() {
        return this.__localPoints.get();
    }
    set localPoints(newValue: number) {
        this.__localPoints.set(newValue);
    }
    private __remotePoints: ObservedPropertySimplePU<number>;
    get remotePoints() {
        return this.__remotePoints.get();
    }
    set remotePoints(newValue: number) {
        this.__remotePoints.set(newValue);
    }
    private __lastSync: ObservedPropertySimplePU<number>;
    get lastSync() {
        return this.__lastSync.get();
    }
    set lastSync(newValue: number) {
        this.__lastSync.set(newValue);
    }
    private __benefits: ObservedPropertyObjectPU<Array<Benefit>>;
    get benefits() {
        return this.__benefits.get();
    }
    set benefits(newValue: Array<Benefit>) {
        this.__benefits.set(newValue);
    }
    private __orders: ObservedPropertyObjectPU<Array<BenefitOrder>>;
    get orders() {
        return this.__orders.get();
    }
    set orders(newValue: Array<BenefitOrder>) {
        this.__orders.set(newValue);
    }
    private __syncing: ObservedPropertySimplePU<boolean>;
    get syncing() {
        return this.__syncing.get();
    }
    set syncing(newValue: boolean) {
        this.__syncing.set(newValue);
    }
    async aboutToAppear(): Promise<void> {
        this.benefits = await carbonInclusiveClient.listBenefits();
        await this.reload();
    }
    onPageShow(): void {
        this.reload();
    }
    async reload(): Promise<void> {
        this.localPoints = await pointsRepo.getBalance();
        this.remotePoints = await platformRepo.getRemotePoints();
        this.lastSync = await platformRepo.getLastSync();
        this.orders = await platformRepo.getOrders();
    }
    async sync(): Promise<void> {
        if (this.syncing) {
            return;
        }
        this.syncing = true;
        await carbonInclusiveClient.mockDelay(800);
        const remote = await platformRepo.syncFromLocal();
        await this.reload();
        this.syncing = false;
        showToast(this.getUIContext(), '已上报同步，平台碳币 ' + remote);
    }
    async exchange(b: Benefit): Promise<void> {
        if (this.localPoints < b.points) {
            showToast(this.getUIContext(), '积分不足，再积累 ' + (b.points - this.localPoints) + ' 积分');
            return;
        }
        try {
            const res = await this.getUIContext().getPromptAction().showDialog({
                title: '兑换权益',
                message: '确认用 ' + b.points + ' 积分兑换「' + b.name + '」吗？',
                buttons: [
                    { text: '取消', color: Theme.TEXT_SUB },
                    { text: '确认兑换', color: Theme.PRIMARY }
                ]
            });
            if (res.index !== 1) {
                return;
            }
        }
        catch (e) {
            return;
        }
        await carbonInclusiveClient.mockDelay(600);
        const order = await platformRepo.exchangeBenefit(b);
        if (order === null) {
            showToast(this.getUIContext(), '兑换失败，积分不足');
            return;
        }
        await this.reload();
        try {
            this.getUIContext().getPromptAction().showDialog({
                title: '🎉 兑换成功',
                message: '「' + b.name + '」核销码：' + order.code + '\n可在我的权益中查看使用',
                buttons: [{ text: '好的', color: Theme.PRIMARY }]
            });
        }
        catch (e) {
            // 弹窗参数异常导致抛错，忽略
        }
    }
    benefitCard(b: Benefit, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(87:5)", "entry");
            Column.width('100%');
            Column.height(150);
            Column.padding(10);
            Column.backgroundColor(Color.White);
            Column.borderRadius(14);
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(b.icon);
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(88:7)", "entry");
            Text.fontSize(34);
            Text.margin({ top: 4, bottom: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(b.name);
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(91:7)", "entry");
            Text.fontSize(13);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.maxLines(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(b.desc);
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(96:7)", "entry");
            Text.fontSize(10);
            Text.fontColor(Theme.TEXT_SUB);
            Text.lineHeight(14);
            Text.height(28);
            Text.margin({ top: 4, bottom: 6 });
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(b.points + ' 积分');
            Button.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(103:7)", "entry");
            Button.width('100%');
            Button.height(30);
            Button.fontSize(12);
            Button.backgroundColor(this.localPoints >= b.points ? Theme.PRIMARY : Theme.DIVIDER);
            Button.fontColor(this.localPoints >= b.points ? Color.White : Theme.TEXT_SUB);
            Button.onClick(() => {
                this.exchange(b);
            });
        }, Button);
        Button.pop();
        Column.pop();
    }
    orderRow(o: BenefitOrder, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(123:5)", "entry");
            Row.width('100%');
            Row.padding({ top: 10, bottom: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(o.icon);
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(124:7)", "entry");
            Text.fontSize(24);
            Text.width(44);
            Text.height(44);
            Text.textAlign(TextAlign.Center);
            Text.backgroundColor(Theme.BG);
            Text.borderRadius(22);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(131:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
            Column.margin({ left: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(o.name);
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(132:9)", "entry");
            Text.fontSize(13);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('核销码 ' + o.code);
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(136:9)", "entry");
            Text.fontSize(10);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 3 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(formatDateTime(o.date));
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(140:9)", "entry");
            Text.fontSize(10);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('-' + o.points);
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(148:7)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.DANGER);
        }, Text);
        Text.pop();
        Row.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(158:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(Theme.BG);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部导航
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(160:7)", "entry");
            // 顶部导航
            Row.width('100%');
            // 顶部导航
            Row.height(48);
            // 顶部导航
            Row.padding({ left: 8, right: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(161:9)", "entry");
            Text.fontSize(28);
            Text.fontColor(Color.White);
            Text.width(40);
            Text.onClick(() => {
                this.getUIContext().getRouter().back();
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('城市碳普惠平台');
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(168:9)", "entry");
            Text.fontSize(17);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
            Text.layoutWeight(1);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('');
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(174:9)", "entry");
            Text.width(40);
        }, Text);
        Text.pop();
        // 顶部导航
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(181:7)", "entry");
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Off);
            Scroll.align(Alignment.Top);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(182:9)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 平台账户卡
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(184:11)", "entry");
            // 平台账户卡
            Column.width('100%');
            // 平台账户卡
            Column.padding(18);
            // 平台账户卡
            Column.alignItems(HorizontalAlign.Start);
            // 平台账户卡
            Column.linearGradient({ angle: 135, colors: [['#2563B0', 0.0], ['#3FCB8C', 1.0]] });
            // 平台账户卡
            Column.borderRadius({ bottomLeft: 24, bottomRight: 24 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(185:13)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🏙️ 城市碳普惠平台');
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(186:15)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('模拟对接');
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(191:15)", "entry");
            Text.fontSize(10);
            Text.fontColor(Theme.PRIMARY);
            Text.backgroundColor(Color.White);
            Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
            Text.borderRadius(8);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(199:13)", "entry");
            Row.width('100%');
            Row.margin({ top: 14 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(200:15)", "entry");
            Column.layoutWeight(1);
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(String(this.localPoints));
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(201:17)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('App 碳积分');
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(205:17)", "entry");
            Text.fontSize(11);
            Text.fontColor('#E6FFF4');
            Text.margin({ top: 3 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('⇄');
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(212:15)", "entry");
            Text.fontSize(22);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(215:15)", "entry");
            Column.layoutWeight(1);
            Column.alignItems(HorizontalAlign.End);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(String(this.remotePoints));
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(216:17)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('平台碳币');
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(220:17)", "entry");
            Text.fontSize(11);
            Text.fontColor('#E6FFF4');
            Text.margin({ top: 3 });
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.lastSync === 0 ? '尚未同步，点击下方按钮上报积分' : '上次同步：' + formatDateTime(this.lastSync));
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(230:13)", "entry");
            Text.fontSize(11);
            Text.fontColor('#E6FFF4');
            Text.width('100%');
            Text.margin({ top: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.syncing ? '正在同步…' : '🔄 一键同步积分到平台');
            Button.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(235:13)", "entry");
            Button.width('100%');
            Button.height(42);
            Button.fontSize(14);
            Button.fontWeight(FontWeight.Bold);
            Button.backgroundColor(Color.White);
            Button.fontColor(Theme.PRIMARY);
            Button.borderRadius(21);
            Button.margin({ top: 12 });
            Button.enabled(!this.syncing);
            Button.onClick(() => {
                this.sync();
            });
        }, Button);
        Button.pop();
        // 平台账户卡
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 权益商城
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(256:11)", "entry");
            // 权益商城
            Column.width('100%');
            // 权益商城
            Column.padding(14);
            // 权益商城
            Column.backgroundColor(Color.White);
            // 权益商城
            Column.borderRadius(16);
            // 权益商城
            Column.margin({ left: 12, right: 12, top: 14 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(257:13)", "entry");
            Row.width('100%');
            Row.margin({ bottom: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🎁 低碳权益商城');
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(258:15)", "entry");
            Text.fontSize(15);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('我的积分 ' + this.localPoints);
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(263:15)", "entry");
            Text.fontSize(12);
            Text.fontColor(Theme.WARN);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Grid.create();
            Grid.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(269:13)", "entry");
            Grid.columnsTemplate('1fr 1fr');
            Grid.columnsGap(10);
            Grid.rowsGap(10);
            Grid.height(Math.ceil(this.benefits.length / 2) * 158);
            Grid.width('100%');
        }, Grid);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const b = _item;
                {
                    const itemCreation2 = (elmtId, isInitialRender) => {
                        GridItem.create(() => { }, false);
                        GridItem.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(271:17)", "entry");
                    };
                    const observedDeepRender = () => {
                        this.observeComponentCreation2(itemCreation2, GridItem);
                        this.benefitCard.bind(this)(b);
                        GridItem.pop();
                    };
                    observedDeepRender();
                }
            };
            this.forEachUpdateFunction(elmtId, this.benefits, forEachItemGenFunction, (b: Benefit) => b.id, false, false);
        }, ForEach);
        ForEach.pop();
        Grid.pop();
        // 权益商城
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 我的权益/兑换记录
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(289:11)", "entry");
            // 我的权益/兑换记录
            Column.width('100%');
            // 我的权益/兑换记录
            Column.padding(14);
            // 我的权益/兑换记录
            Column.backgroundColor(Color.White);
            // 我的权益/兑换记录
            Column.borderRadius(16);
            // 我的权益/兑换记录
            Column.margin({ left: 12, right: 12, top: 14, bottom: 20 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('📒 我的兑换记录');
            Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(290:13)", "entry");
            Text.fontSize(15);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width('100%');
            Text.margin({ bottom: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.orders.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(297:15)", "entry");
                        Column.width('100%');
                        Column.padding({ top: 24, bottom: 24 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('🎫');
                        Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(298:17)", "entry");
                        Text.fontSize(38);
                        Text.margin({ bottom: 8 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('还没有兑换记录，快去用积分兑换权益吧');
                        Text.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(301:17)", "entry");
                        Text.fontSize(12);
                        Text.fontColor(Theme.TEXT_SUB);
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const o = _item;
                            this.orderRow.bind(this)(o);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Divider.create();
                                Divider.debugLine("entry/src/main/ets/pages/CarbonInclusivePage.ets(310:17)", "entry");
                                Divider.color(Theme.DIVIDER);
                            }, Divider);
                        };
                        this.forEachUpdateFunction(elmtId, this.orders, forEachItemGenFunction, (o: BenefitOrder) => String(o.id), false, false);
                    }, ForEach);
                    ForEach.pop();
                });
            }
        }, If);
        If.pop();
        // 我的权益/兑换记录
        Column.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "CarbonInclusivePage";
    }
}
registerNamedRoute(() => new CarbonInclusivePage(undefined, {}), "", { bundleName: "com.example.carbonfootprint", moduleName: "entry", pagePath: "pages/CarbonInclusivePage", pageFullPath: "entry/src/main/ets/pages/CarbonInclusivePage", integratedHsp: "false", moduleType: "followWithHap" });
