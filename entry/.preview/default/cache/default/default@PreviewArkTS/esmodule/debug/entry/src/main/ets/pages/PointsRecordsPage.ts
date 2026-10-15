if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface PointsRecordsPage_Params {
    balance?: number;
    records?: Array<PointRecord>;
}
import { Theme } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import type { PointRecord } from '../common/model/Models';
import { pointsRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/PointsRepository&";
import { formatDateTime } from "@normalized:N&&&entry/src/main/ets/common/utils/DateUtil&";
import { EmptyView } from "@normalized:N&&&entry/src/main/ets/view/components/CommonUI&";
class PointsRecordsPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__balance = new ObservedPropertySimplePU(0, this, "balance");
        this.__records = new ObservedPropertyObjectPU([], this, "records");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: PointsRecordsPage_Params) {
        if (params.balance !== undefined) {
            this.balance = params.balance;
        }
        if (params.records !== undefined) {
            this.records = params.records;
        }
    }
    updateStateVars(params: PointsRecordsPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__balance.purgeDependencyOnElmtId(rmElmtId);
        this.__records.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__balance.aboutToBeDeleted();
        this.__records.aboutToBeDeleted();
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
    private __records: ObservedPropertyObjectPU<Array<PointRecord>>;
    get records() {
        return this.__records.get();
    }
    set records(newValue: Array<PointRecord>) {
        this.__records.set(newValue);
    }
    async aboutToAppear(): Promise<void> {
        this.balance = await pointsRepo.getBalance();
        this.records = await pointsRepo.getPointRecords(500);
    }
    row(r: PointRecord, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(20:5)", "entry");
            Row.width('100%');
            Row.padding({ top: 9, bottom: 9 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(r.amount >= 0 ? '➕' : '🎁');
            Text.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(21:7)", "entry");
            Text.fontSize(20);
            Text.width(40);
            Text.height(40);
            Text.textAlign(TextAlign.Center);
            Text.backgroundColor(Theme.BG);
            Text.borderRadius(20);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(28:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
            Column.margin({ left: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(r.reason);
            Text.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(29:9)", "entry");
            Text.fontSize(14);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(formatDateTime(r.date));
            Text.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(34:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 3 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create((r.amount >= 0 ? '+' : '') + r.amount);
            Text.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(43:7)", "entry");
            Text.fontSize(15);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(r.amount >= 0 ? Theme.PRIMARY : Theme.DANGER);
        }, Text);
        Text.pop();
        Row.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(53:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(Theme.BG);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(54:7)", "entry");
            Row.width('100%');
            Row.height(48);
            Row.backgroundColor(Color.White);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(55:9)", "entry");
            Text.fontSize(28);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width(40);
            Text.onClick(() => {
                this.getUIContext().getRouter().back();
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('积分流水');
            Text.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(62:9)", "entry");
            Text.fontSize(17);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.layoutWeight(1);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('');
            Text.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(68:9)", "entry");
            Text.width(40);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(75:7)", "entry");
            Row.width('100%');
            Row.padding(16);
            Row.backgroundColor(Color.White);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('当前余额');
            Text.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(76:9)", "entry");
            Text.fontSize(13);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(79:9)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(String(this.balance) + ' 积分');
            Text.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(80:9)", "entry");
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.WARN);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.records.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new EmptyView(this, { icon: '📒', text: '暂无积分记录' }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/PointsRecordsPage.ets", line: 90, col: 9 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        icon: '📒',
                                        text: '暂无积分记录'
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    icon: '📒', text: '暂无积分记录'
                                });
                            }
                        }, { name: "EmptyView" });
                    }
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Scroll.create();
                        Scroll.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(92:9)", "entry");
                        Scroll.layoutWeight(1);
                        Scroll.scrollBar(BarState.Off);
                        Scroll.align(Alignment.Top);
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(93:11)", "entry");
                        Column.width('100%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(94:13)", "entry");
                        Column.width('100%');
                        Column.padding({ left: 14, right: 14 });
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(14);
                        Column.margin({ left: 12, right: 12, top: 12, bottom: 16 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const r = _item;
                            this.row.bind(this)(r);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Divider.create();
                                Divider.debugLine("entry/src/main/ets/pages/PointsRecordsPage.ets(97:17)", "entry");
                                Divider.color(Theme.DIVIDER);
                            }, Divider);
                        };
                        this.forEachUpdateFunction(elmtId, this.records, forEachItemGenFunction, (r: PointRecord) => String(r.id), false, false);
                    }, ForEach);
                    ForEach.pop();
                    Column.pop();
                    Column.pop();
                    Scroll.pop();
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
        return "PointsRecordsPage";
    }
}
registerNamedRoute(() => new PointsRecordsPage(undefined, {}), "", { bundleName: "com.example.carbonfootprint", moduleName: "entry", pagePath: "pages/PointsRecordsPage", pageFullPath: "entry/src/main/ets/pages/PointsRecordsPage", integratedHsp: "false", moduleType: "followWithHap" });
