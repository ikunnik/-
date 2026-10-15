if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface DashboardPage_Params {
    range?: string;
    lineData?: Array<ChartItem>;
    barData?: Array<ChartItem>;
    pieData?: Array<ChartItem>;
    rangeTotal?: number;
    rangeCount?: number;
    rangeAvg?: number;
    tick?: number;
    reloading?: boolean;
    ranges?: Array<string>;
}
import type common from "@ohos:app.ability.common";
import { Theme, RangeType, getRangeName, getCategoryMeta } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import { carbonRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/CarbonRepository&";
import { ensureDb } from "@normalized:N&&&entry/src/main/ets/data/db/CarbonDb&";
import type { CategoryStat, TrendPoint } from '../common/model/Models';
import { getBuckets } from "@normalized:N&&&entry/src/main/ets/common/utils/DateUtil&";
import { LineChart } from "@normalized:N&&&entry/src/main/ets/view/components/LineChart&";
import { BarChart } from "@normalized:N&&&entry/src/main/ets/view/components/BarChart&";
import { PieChart } from "@normalized:N&&&entry/src/main/ets/view/components/PieChart&";
import { ChartItem } from "@normalized:N&&&entry/src/main/ets/view/components/ChartItem&";
import { Card } from "@normalized:N&&&entry/src/main/ets/view/components/CommonUI&";
export class DashboardPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__range = new ObservedPropertySimplePU(RangeType.DAY, this, "range");
        this.__lineData = new ObservedPropertyObjectPU([], this, "lineData");
        this.__barData = new ObservedPropertyObjectPU([], this, "barData");
        this.__pieData = new ObservedPropertyObjectPU([], this, "pieData");
        this.__rangeTotal = new ObservedPropertySimplePU(0, this, "rangeTotal");
        this.__rangeCount = new ObservedPropertySimplePU(0, this, "rangeCount");
        this.__rangeAvg = new ObservedPropertySimplePU(0, this, "rangeAvg");
        this.__tick = new SynchedPropertySimpleOneWayPU(params.tick, this, "tick");
        this.reloading = false;
        this.ranges = [RangeType.DAY, RangeType.WEEK, RangeType.MONTH, RangeType.YEAR];
        this.setInitiallyProvidedValue(params);
        this.declareWatch("tick", this.onTickChange);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: DashboardPage_Params) {
        if (params.range !== undefined) {
            this.range = params.range;
        }
        if (params.lineData !== undefined) {
            this.lineData = params.lineData;
        }
        if (params.barData !== undefined) {
            this.barData = params.barData;
        }
        if (params.pieData !== undefined) {
            this.pieData = params.pieData;
        }
        if (params.rangeTotal !== undefined) {
            this.rangeTotal = params.rangeTotal;
        }
        if (params.rangeCount !== undefined) {
            this.rangeCount = params.rangeCount;
        }
        if (params.rangeAvg !== undefined) {
            this.rangeAvg = params.rangeAvg;
        }
        if (params.tick === undefined) {
            this.__tick.set(0);
        }
        if (params.reloading !== undefined) {
            this.reloading = params.reloading;
        }
        if (params.ranges !== undefined) {
            this.ranges = params.ranges;
        }
    }
    updateStateVars(params: DashboardPage_Params) {
        this.__tick.reset(params.tick);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__range.purgeDependencyOnElmtId(rmElmtId);
        this.__lineData.purgeDependencyOnElmtId(rmElmtId);
        this.__barData.purgeDependencyOnElmtId(rmElmtId);
        this.__pieData.purgeDependencyOnElmtId(rmElmtId);
        this.__rangeTotal.purgeDependencyOnElmtId(rmElmtId);
        this.__rangeCount.purgeDependencyOnElmtId(rmElmtId);
        this.__rangeAvg.purgeDependencyOnElmtId(rmElmtId);
        this.__tick.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__range.aboutToBeDeleted();
        this.__lineData.aboutToBeDeleted();
        this.__barData.aboutToBeDeleted();
        this.__pieData.aboutToBeDeleted();
        this.__rangeTotal.aboutToBeDeleted();
        this.__rangeCount.aboutToBeDeleted();
        this.__rangeAvg.aboutToBeDeleted();
        this.__tick.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __range: ObservedPropertySimplePU<string>;
    get range() {
        return this.__range.get();
    }
    set range(newValue: string) {
        this.__range.set(newValue);
    }
    private __lineData: ObservedPropertyObjectPU<Array<ChartItem>>;
    get lineData() {
        return this.__lineData.get();
    }
    set lineData(newValue: Array<ChartItem>) {
        this.__lineData.set(newValue);
    }
    private __barData: ObservedPropertyObjectPU<Array<ChartItem>>;
    get barData() {
        return this.__barData.get();
    }
    set barData(newValue: Array<ChartItem>) {
        this.__barData.set(newValue);
    }
    private __pieData: ObservedPropertyObjectPU<Array<ChartItem>>;
    get pieData() {
        return this.__pieData.get();
    }
    set pieData(newValue: Array<ChartItem>) {
        this.__pieData.set(newValue);
    }
    private __rangeTotal: ObservedPropertySimplePU<number>;
    get rangeTotal() {
        return this.__rangeTotal.get();
    }
    set rangeTotal(newValue: number) {
        this.__rangeTotal.set(newValue);
    }
    private __rangeCount: ObservedPropertySimplePU<number>;
    get rangeCount() {
        return this.__rangeCount.get();
    }
    set rangeCount(newValue: number) {
        this.__rangeCount.set(newValue);
    }
    private __rangeAvg: ObservedPropertySimplePU<number>;
    get rangeAvg() {
        return this.__rangeAvg.get();
    }
    set rangeAvg(newValue: number) {
        this.__rangeAvg.set(newValue);
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
    private ranges: Array<string>;
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
            await ensureDb(this.getUIContext().getHostContext() as common.Context);
            await this.loadCharts();
        }
        finally {
            this.reloading = false;
        }
    }
    /** 实际取数与绘图数据组装 */
    async loadCharts(): Promise<void> {
        const trend: Array<TrendPoint> = await carbonRepo.getTrend(this.range);
        const buckets = getBuckets(this.range);
        const start = buckets[0].startMs;
        const end = buckets[buckets.length - 1].endMs;
        const stats: Array<CategoryStat> = await carbonRepo.getCategoryStats(start, end);
        const records = await carbonRepo.getRecordsBetween(start, end);
        const lines: Array<ChartItem> = [];
        let total = 0;
        for (let i = 0; i < trend.length; i++) {
            lines.push(new ChartItem(trend[i].label, trend[i].value, Theme.PRIMARY));
            total += trend[i].value;
        }
        const bars: Array<ChartItem> = [];
        const pies: Array<ChartItem> = [];
        for (let i = 0; i < stats.length; i++) {
            const meta = getCategoryMeta(stats[i].category);
            bars.push(new ChartItem(meta.name, stats[i].reduction, meta.color));
            pies.push(new ChartItem(meta.name, stats[i].reduction, meta.color));
        }
        this.lineData = lines;
        this.barData = bars;
        this.pieData = pies;
        this.rangeTotal = Math.round(total * 100) / 100;
        this.rangeCount = records.length;
        this.rangeAvg = buckets.length > 0 ? Math.round(total / buckets.length * 100) / 100 : 0;
    }
    rangeChip(r: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(getRangeName(r));
            Text.fontSize(14);
            Text.layoutWeight(1);
            Text.height(34);
            Text.textAlign(TextAlign.Center);
            Text.borderRadius(17);
            Text.backgroundColor(this.range === r ? Theme.PRIMARY : Color.White);
            Text.fontColor(this.range === r ? Color.White : Theme.TEXT_SUB);
            Text.fontWeight(this.range === r ? FontWeight.Bold : FontWeight.Normal);
            Text.onClick(() => {
                this.range = r;
                this.reload();
            });
        }, Text);
        Text.pop();
    }
    summaryItem(value: string, label: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(value);
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(label);
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 3 });
        }, Text);
        Text.pop();
        Column.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(Theme.BG);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 16, bottom: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('数据看板');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('📂 历史');
            Text.fontSize(13);
            Text.fontColor(Theme.PRIMARY);
            Text.padding({ left: 10, right: 10, top: 6, bottom: 6 });
            Text.backgroundColor(Theme.PRIMARY_LIGHT);
            Text.borderRadius(14);
            Text.onClick(() => {
                this.getUIContext().getRouter().pushUrl({ url: 'pages/HistoryPage' });
            });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(4);
            Row.margin({ left: 12, right: 12 });
            Row.backgroundColor(Color.White);
            Row.borderRadius(20);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const r = _item;
                this.rangeChip.bind(this)(r);
            };
            this.forEachUpdateFunction(elmtId, this.ranges, forEachItemGenFunction, (r: string) => r, false, false);
        }, ForEach);
        ForEach.pop();
        Row.pop();
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
            Column.create();
            Column.width('100%');
            Column.margin({ left: 12, right: 12, top: 14 });
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new Card(this, {
                        innerPadding: 16,
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.width('100%');
                            }, Row);
                            this.summaryItem.bind(this)(this.rangeTotal.toFixed(1), '本' + getRangeName(this.range) + '减排(kg)');
                            this.summaryItem.bind(this)(String(this.rangeCount), '记录次数');
                            this.summaryItem.bind(this)(this.rangeAvg.toFixed(1), '日均减排(kg)');
                            Row.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/DashboardPage.ets", line: 147, col: 13 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            innerPadding: 16,
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.width('100%');
                                }, Row);
                                this.summaryItem.bind(this)(this.rangeTotal.toFixed(1), '本' + getRangeName(this.range) + '减排(kg)');
                                this.summaryItem.bind(this)(String(this.rangeCount), '记录次数');
                                this.summaryItem.bind(this)(this.rangeAvg.toFixed(1), '日均减排(kg)');
                                Row.pop();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        innerPadding: 16
                    });
                }
            }, { name: "Card" });
        }
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.margin({ left: 12, right: 12, top: 12 });
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new Card(this, {
                        innerPadding: 14,
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.width('100%');
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create('减排趋势（kgCO₂e）');
                                Text.fontSize(15);
                                Text.fontWeight(FontWeight.Bold);
                                Text.fontColor(Theme.TEXT_MAIN);
                                Text.width('100%');
                            }, Text);
                            Text.pop();
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new LineChart(this, { items: this.lineData }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/DashboardPage.ets", line: 167, col: 17 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                items: this.lineData
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            items: this.lineData
                                        });
                                    }
                                }, { name: "LineChart" });
                            }
                            Column.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/DashboardPage.ets", line: 160, col: 13 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            innerPadding: 14,
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                    Column.width('100%');
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('减排趋势（kgCO₂e）');
                                    Text.fontSize(15);
                                    Text.fontWeight(FontWeight.Bold);
                                    Text.fontColor(Theme.TEXT_MAIN);
                                    Text.width('100%');
                                }, Text);
                                Text.pop();
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new LineChart(this, { items: this.lineData }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/DashboardPage.ets", line: 167, col: 17 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    items: this.lineData
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                items: this.lineData
                                            });
                                        }
                                    }, { name: "LineChart" });
                                }
                                Column.pop();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        innerPadding: 14
                    });
                }
            }, { name: "Card" });
        }
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.margin({ left: 12, right: 12, top: 12 });
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new Card(this, {
                        innerPadding: 14,
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.width('100%');
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create('分类减排对比（kg）');
                                Text.fontSize(15);
                                Text.fontWeight(FontWeight.Bold);
                                Text.fontColor(Theme.TEXT_MAIN);
                                Text.width('100%');
                            }, Text);
                            Text.pop();
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new BarChart(this, { items: this.barData }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/DashboardPage.ets", line: 183, col: 17 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                items: this.barData
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            items: this.barData
                                        });
                                    }
                                }, { name: "BarChart" });
                            }
                            Column.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/DashboardPage.ets", line: 176, col: 13 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            innerPadding: 14,
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                    Column.width('100%');
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('分类减排对比（kg）');
                                    Text.fontSize(15);
                                    Text.fontWeight(FontWeight.Bold);
                                    Text.fontColor(Theme.TEXT_MAIN);
                                    Text.width('100%');
                                }, Text);
                                Text.pop();
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new BarChart(this, { items: this.barData }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/DashboardPage.ets", line: 183, col: 17 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    items: this.barData
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                items: this.barData
                                            });
                                        }
                                    }, { name: "BarChart" });
                                }
                                Column.pop();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        innerPadding: 14
                    });
                }
            }, { name: "Card" });
        }
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.margin({ left: 12, right: 12, top: 12, bottom: 16 });
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new Card(this, {
                        innerPadding: 14,
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.width('100%');
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create('分类减排占比');
                                Text.fontSize(15);
                                Text.fontWeight(FontWeight.Bold);
                                Text.fontColor(Theme.TEXT_MAIN);
                                Text.width('100%');
                            }, Text);
                            Text.pop();
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new PieChart(this, { items: this.pieData }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/DashboardPage.ets", line: 199, col: 17 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                items: this.pieData
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            items: this.pieData
                                        });
                                    }
                                }, { name: "PieChart" });
                            }
                            Column.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/DashboardPage.ets", line: 192, col: 13 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            innerPadding: 14,
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                    Column.width('100%');
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('分类减排占比');
                                    Text.fontSize(15);
                                    Text.fontWeight(FontWeight.Bold);
                                    Text.fontColor(Theme.TEXT_MAIN);
                                    Text.width('100%');
                                }, Text);
                                Text.pop();
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new PieChart(this, { items: this.pieData }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/DashboardPage.ets", line: 199, col: 17 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    items: this.pieData
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                items: this.pieData
                                            });
                                        }
                                    }, { name: "PieChart" });
                                }
                                Column.pop();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        innerPadding: 14
                    });
                }
            }, { name: "Card" });
        }
        Column.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
