if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface HomePage_Params {
    overview?: OverviewData;
    recent?: Array<CarbonRecord>;
    tick?: number;
    reloading?: boolean;
}
import type common from "@ohos:app.ability.common";
import { Theme, CATEGORY_META } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import type { CategoryMeta } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import { carbonRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/CarbonRepository&";
import { ensureDb } from "@normalized:N&&&entry/src/main/ets/data/db/CarbonDb&";
import { OverviewData } from "@normalized:N&&&entry/src/main/ets/common/model/Models&";
import type { CarbonRecord } from "@normalized:N&&&entry/src/main/ets/common/model/Models&";
import { formatDateTime } from "@normalized:N&&&entry/src/main/ets/common/utils/DateUtil&";
import { Card, SectionTitle, EmptyView } from "@normalized:N&&&entry/src/main/ets/view/components/CommonUI&";
export class HomePage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__overview = new ObservedPropertyObjectPU(new OverviewData(), this, "overview");
        this.__recent = new ObservedPropertyObjectPU([], this, "recent");
        this.__tick = new SynchedPropertySimpleOneWayPU(params.tick, this, "tick");
        this.reloading = false;
        this.setInitiallyProvidedValue(params);
        this.declareWatch("tick", this.onTickChange);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: HomePage_Params) {
        if (params.overview !== undefined) {
            this.overview = params.overview;
        }
        if (params.recent !== undefined) {
            this.recent = params.recent;
        }
        if (params.tick === undefined) {
            this.__tick.set(0);
        }
        if (params.reloading !== undefined) {
            this.reloading = params.reloading;
        }
    }
    updateStateVars(params: HomePage_Params) {
        this.__tick.reset(params.tick);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__overview.purgeDependencyOnElmtId(rmElmtId);
        this.__recent.purgeDependencyOnElmtId(rmElmtId);
        this.__tick.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__overview.aboutToBeDeleted();
        this.__recent.aboutToBeDeleted();
        this.__tick.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __overview: ObservedPropertyObjectPU<OverviewData>;
    get overview() {
        return this.__overview.get();
    }
    set overview(newValue: OverviewData) {
        this.__overview.set(newValue);
    }
    private __recent: ObservedPropertyObjectPU<Array<CarbonRecord>>;
    get recent() {
        return this.__recent.get();
    }
    set recent(newValue: Array<CarbonRecord>) {
        this.__recent.set(newValue);
    }
    // 由 Index 通过 @Prop 直传（替代原 @StorageProp 监听，Tabs 懒加载下更可靠）
    private __tick: SynchedPropertySimpleOneWayPU<number>;
    get tick() {
        return this.__tick.get();
    }
    set tick(newValue: number) {
        this.__tick.set(newValue);
    }
    // 防止 refreshTick 自增导致的重复并发刷新
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
            // 兜底：Previewer 下 EntryAbility 不会执行，这里确保数据库已初始化
            await ensureDb(this.getUIContext().getHostContext() as common.Context);
            this.overview = await carbonRepo.getOverview();
            this.recent = await carbonRepo.getRecentRecords(5);
        }
        catch (err) {
            const e = err as Error;
            console.error('[CarbonFootprint] HomePage reload failed: ' + e.message);
        }
        finally {
            this.reloading = false;
        }
    }
    /** 累计减排自适应精度：大于 0 的小数值也能看清，避免 0.045 显示成 0.0 */
    totalText(): string {
        const v = this.overview.totalReduction;
        if (v >= 10) {
            return v.toFixed(1);
        }
        if (v >= 1) {
            return v.toFixed(2);
        }
        if (v > 0) {
            return v.toFixed(3);
        }
        return '0.0';
    }
    private goAdd(category: string): void {
        try {
            this.getUIContext().getRouter().pushUrl({
                url: 'pages/RecordAddPage',
                params: { category: category }
            });
        }
        catch (e) {
            // 路由跳转失败（参数/页面异常），忽略避免崩溃
        }
    }
    headerItem(value: string, label: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(value);
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(label);
            Text.fontSize(11);
            Text.fontColor('#E6FFF4');
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        Column.pop();
    }
    recordRow(r: CarbonRecord, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ top: 10, bottom: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(r.icon);
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
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
            Column.margin({ left: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(r.behaviorName);
            Text.fontSize(14);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.fontWeight(FontWeight.Medium);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(formatDateTime(r.date));
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 3 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.End);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('-' + r.reduction.toFixed(2) + ' kg');
            Text.fontSize(14);
            Text.fontColor(Theme.PRIMARY);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('+' + r.points + ' 积分');
            Text.fontSize(11);
            Text.fontColor(Theme.WARN);
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.width('100%');
            Scroll.height('100%');
            Scroll.align(Alignment.Top);
            Scroll.scrollBar(BarState.Off);
            Scroll.backgroundColor(Theme.BG);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ bottom: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // ===== 顶部绿色总览 =====
            Column.create();
            // ===== 顶部绿色总览 =====
            Column.width('100%');
            // ===== 顶部绿色总览 =====
            Column.padding({ left: 20, right: 20, top: 24, bottom: 24 });
            // ===== 顶部绿色总览 =====
            Column.alignItems(HorizontalAlign.Start);
            // ===== 顶部绿色总览 =====
            Column.linearGradient({
                angle: 135,
                colors: [['#26996B', 0.0], ['#3FCB8C', 1.0]]
            });
            // ===== 顶部绿色总览 =====
            Column.borderRadius({ bottomLeft: 24, bottomRight: 24 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🌍 碳足迹');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('累计减排量（kgCO₂e）');
            Text.fontSize(12);
            Text.fontColor('#E6FFF4');
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('全民绿色生活');
            Text.fontSize(11);
            Text.fontColor(Color.White);
            Text.padding({ left: 8, right: 8, top: 4, bottom: 4 });
            Text.borderRadius(12);
            Text.backgroundColor('#33FFFFFF');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.totalText());
            Text.fontSize(46);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
            Text.margin({ top: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 14 });
        }, Row);
        this.headerItem.bind(this)(this.overview.todayReduction.toFixed(2), '今日减排(kg)');
        this.headerItem.bind(this)(String(this.overview.totalPoints), '我的碳积分');
        this.headerItem.bind(this)(String(this.overview.streakDays) + '天', '连续打卡');
        Row.pop();
        // ===== 顶部绿色总览 =====
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // ===== 快捷录入 =====
            Column.create();
            // ===== 快捷录入 =====
            Column.width('100%');
            // ===== 快捷录入 =====
            Column.margin({ left: 12, right: 12, top: 14 });
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new Card(this, {
                        innerPadding: 16,
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.width('100%');
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.width('100%');
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create('记录低碳行为');
                                Text.fontSize(15);
                                Text.fontWeight(FontWeight.Bold);
                                Text.fontColor(Theme.TEXT_MAIN);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Blank.create();
                            }, Blank);
                            Blank.pop();
                            Row.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.width('100%');
                                Row.margin({ top: 14 });
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                ForEach.create();
                                const forEachItemGenFunction = _item => {
                                    const item = _item;
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.layoutWeight(1);
                                        Column.onClick(() => {
                                            this.goAdd(item.key);
                                        });
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(item.icon);
                                        Text.fontSize(26);
                                        Text.width(52);
                                        Text.height(52);
                                        Text.textAlign(TextAlign.Center);
                                        Text.backgroundColor(item.color + '1A');
                                        Text.borderRadius(26);
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(item.name);
                                        Text.fontSize(12);
                                        Text.fontColor(Theme.TEXT_MAIN);
                                        Text.margin({ top: 8 });
                                    }, Text);
                                    Text.pop();
                                    Column.pop();
                                };
                                this.forEachUpdateFunction(elmtId, CATEGORY_META, forEachItemGenFunction, (item: CategoryMeta) => item.key, false, false);
                            }, ForEach);
                            ForEach.pop();
                            Row.pop();
                            Column.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 178, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            innerPadding: 16,
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                    Column.width('100%');
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.width('100%');
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('记录低碳行为');
                                    Text.fontSize(15);
                                    Text.fontWeight(FontWeight.Bold);
                                    Text.fontColor(Theme.TEXT_MAIN);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Blank.create();
                                }, Blank);
                                Blank.pop();
                                Row.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.width('100%');
                                    Row.margin({ top: 14 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    ForEach.create();
                                    const forEachItemGenFunction = _item => {
                                        const item = _item;
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Column.create();
                                            Column.layoutWeight(1);
                                            Column.onClick(() => {
                                                this.goAdd(item.key);
                                            });
                                        }, Column);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(item.icon);
                                            Text.fontSize(26);
                                            Text.width(52);
                                            Text.height(52);
                                            Text.textAlign(TextAlign.Center);
                                            Text.backgroundColor(item.color + '1A');
                                            Text.borderRadius(26);
                                        }, Text);
                                        Text.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(item.name);
                                            Text.fontSize(12);
                                            Text.fontColor(Theme.TEXT_MAIN);
                                            Text.margin({ top: 8 });
                                        }, Text);
                                        Text.pop();
                                        Column.pop();
                                    };
                                    this.forEachUpdateFunction(elmtId, CATEGORY_META, forEachItemGenFunction, (item: CategoryMeta) => item.key, false, false);
                                }, ForEach);
                                ForEach.pop();
                                Row.pop();
                                Column.pop();
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
        // ===== 快捷录入 =====
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // ===== 趣味对照 =====
            Column.create();
            // ===== 趣味对照 =====
            Column.width('100%');
            // ===== 趣味对照 =====
            Column.margin({ left: 12, right: 12, top: 12 });
            // ===== 趣味对照 =====
            Column.onClick(() => {
                this.getUIContext().getRouter().pushUrl({ url: 'pages/CertificatePage' });
            });
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new Card(this, {
                        innerPadding: 14,
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.width('100%');
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create('🌳');
                                Text.fontSize(26);
                                Text.margin({ right: 10 });
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.alignItems(HorizontalAlign.Start);
                                Column.layoutWeight(1);
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create('累计减排相当于种下 ' + this.overview.treeCount + ' 棵树');
                                Text.fontSize(14);
                                Text.fontWeight(FontWeight.Bold);
                                Text.fontColor(Theme.TEXT_MAIN);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create('已坚持 ' + this.overview.recordDays + ' 天，记录 ' + this.overview.recordCount + ' 次低碳行为');
                                Text.fontSize(11);
                                Text.fontColor(Theme.TEXT_SUB);
                                Text.margin({ top: 4 });
                            }, Text);
                            Text.pop();
                            Column.pop();
                            Row.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 221, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            innerPadding: 14,
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.width('100%');
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('🌳');
                                    Text.fontSize(26);
                                    Text.margin({ right: 10 });
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                    Column.alignItems(HorizontalAlign.Start);
                                    Column.layoutWeight(1);
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('累计减排相当于种下 ' + this.overview.treeCount + ' 棵树');
                                    Text.fontSize(14);
                                    Text.fontWeight(FontWeight.Bold);
                                    Text.fontColor(Theme.TEXT_MAIN);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('已坚持 ' + this.overview.recordDays + ' 天，记录 ' + this.overview.recordCount + ' 次低碳行为');
                                    Text.fontSize(11);
                                    Text.fontColor(Theme.TEXT_SUB);
                                    Text.margin({ top: 4 });
                                }, Text);
                                Text.pop();
                                Column.pop();
                                Row.pop();
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
        // ===== 趣味对照 =====
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // ===== 最近记录 =====
            Column.create();
            // ===== 最近记录 =====
            Column.margin({ left: 12, right: 12, top: 18, bottom: 16 });
            // ===== 最近记录 =====
            Column.width('100%');
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new SectionTitle(this, {
                        title: '最近低碳记录',
                        moreText: '全部',
                        onMore: () => {
                            this.getUIContext().getRouter().pushUrl({ url: 'pages/HistoryPage' });
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 250, col: 11 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '最近低碳记录',
                            moreText: '全部',
                            onMore: () => {
                                this.getUIContext().getRouter().pushUrl({ url: 'pages/HistoryPage' });
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: '最近低碳记录',
                        moreText: '全部'
                    });
                }
            }, { name: "SectionTitle" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new Card(this, {
                        innerPadding: 14,
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                If.create();
                                if (this.recent.length === 0) {
                                    this.ifElseBranchUpdateFunction(0, () => {
                                        {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                if (isInitialRender) {
                                                    let componentCall = new EmptyView(this, { icon: '🍃', text: '还没有记录，点击上方分类开始吧' }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 259, col: 15 });
                                                    ViewPU.create(componentCall);
                                                    let paramsLambda = () => {
                                                        return {
                                                            icon: '🍃',
                                                            text: '还没有记录，点击上方分类开始吧'
                                                        };
                                                    };
                                                    componentCall.paramsGenerator_ = paramsLambda;
                                                }
                                                else {
                                                    this.updateStateVarsOfChildByElmtId(elmtId, {
                                                        icon: '🍃', text: '还没有记录，点击上方分类开始吧'
                                                    });
                                                }
                                            }, { name: "EmptyView" });
                                        }
                                    });
                                }
                                else {
                                    this.ifElseBranchUpdateFunction(1, () => {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Column.create();
                                            Column.width('100%');
                                        }, Column);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            ForEach.create();
                                            const forEachItemGenFunction = _item => {
                                                const r = _item;
                                                this.recordRow.bind(this)(r);
                                            };
                                            this.forEachUpdateFunction(elmtId, this.recent, forEachItemGenFunction, (r: CarbonRecord) => String(r.id), false, false);
                                        }, ForEach);
                                        ForEach.pop();
                                        Column.pop();
                                    });
                                }
                            }, If);
                            If.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 257, col: 11 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            innerPadding: 14,
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    If.create();
                                    if (this.recent.length === 0) {
                                        this.ifElseBranchUpdateFunction(0, () => {
                                            {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    if (isInitialRender) {
                                                        let componentCall = new EmptyView(this, { icon: '🍃', text: '还没有记录，点击上方分类开始吧' }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 259, col: 15 });
                                                        ViewPU.create(componentCall);
                                                        let paramsLambda = () => {
                                                            return {
                                                                icon: '🍃',
                                                                text: '还没有记录，点击上方分类开始吧'
                                                            };
                                                        };
                                                        componentCall.paramsGenerator_ = paramsLambda;
                                                    }
                                                    else {
                                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                                            icon: '🍃', text: '还没有记录，点击上方分类开始吧'
                                                        });
                                                    }
                                                }, { name: "EmptyView" });
                                            }
                                        });
                                    }
                                    else {
                                        this.ifElseBranchUpdateFunction(1, () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Column.create();
                                                Column.width('100%');
                                            }, Column);
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                ForEach.create();
                                                const forEachItemGenFunction = _item => {
                                                    const r = _item;
                                                    this.recordRow.bind(this)(r);
                                                };
                                                this.forEachUpdateFunction(elmtId, this.recent, forEachItemGenFunction, (r: CarbonRecord) => String(r.id), false, false);
                                            }, ForEach);
                                            ForEach.pop();
                                            Column.pop();
                                        });
                                    }
                                }, If);
                                If.pop();
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
        // ===== 最近记录 =====
        Column.pop();
        Column.pop();
        Scroll.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
