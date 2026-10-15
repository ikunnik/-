if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface HistoryPage_Params {
    category?: string;
    rangeDays?: number;
    groups?: Array<RecordGroup>;
    totalReduction?: number;
    count?: number;
    categoryChips?: Array<FilterChip>;
    timeChips?: Array<FilterChip>;
}
import { Theme, CATEGORY_META } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import { carbonRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/CarbonRepository&";
import type { CarbonRecord } from '../common/model/Models';
import { formatDate, startOfDay, formatDateTime } from "@normalized:N&&&entry/src/main/ets/common/utils/DateUtil&";
import { showToast } from "@normalized:N&&&entry/src/main/ets/common/utils/ToastUtil&";
import { EmptyView } from "@normalized:N&&&entry/src/main/ets/view/components/CommonUI&";
class RecordGroup {
    dateStr: string;
    title: string;
    items: Array<CarbonRecord>;
    constructor(dateStr: string, title: string, items: Array<CarbonRecord>) {
        this.dateStr = dateStr;
        this.title = title;
        this.items = items;
    }
}
class FilterChip {
    key: string;
    label: string;
    color: string;
    constructor(key: string, label: string, color: string) {
        this.key = key;
        this.label = label;
        this.color = color;
    }
}
class HistoryPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__category = new ObservedPropertySimplePU('', this, "category");
        this.__rangeDays = new ObservedPropertySimplePU(0, this, "rangeDays");
        this.__groups = new ObservedPropertyObjectPU([], this, "groups");
        this.__totalReduction = new ObservedPropertySimplePU(0, this, "totalReduction");
        this.__count = new ObservedPropertySimplePU(0, this, "count");
        this.categoryChips = [
            new FilterChip('', '全部', Theme.PRIMARY)
        ];
        this.timeChips = [
            new FilterChip('0', '全部时间', Theme.PRIMARY),
            new FilterChip('7', '近7天', Theme.PRIMARY),
            new FilterChip('30', '近30天', Theme.PRIMARY)
        ];
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: HistoryPage_Params) {
        if (params.category !== undefined) {
            this.category = params.category;
        }
        if (params.rangeDays !== undefined) {
            this.rangeDays = params.rangeDays;
        }
        if (params.groups !== undefined) {
            this.groups = params.groups;
        }
        if (params.totalReduction !== undefined) {
            this.totalReduction = params.totalReduction;
        }
        if (params.count !== undefined) {
            this.count = params.count;
        }
        if (params.categoryChips !== undefined) {
            this.categoryChips = params.categoryChips;
        }
        if (params.timeChips !== undefined) {
            this.timeChips = params.timeChips;
        }
    }
    updateStateVars(params: HistoryPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__category.purgeDependencyOnElmtId(rmElmtId);
        this.__rangeDays.purgeDependencyOnElmtId(rmElmtId);
        this.__groups.purgeDependencyOnElmtId(rmElmtId);
        this.__totalReduction.purgeDependencyOnElmtId(rmElmtId);
        this.__count.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__category.aboutToBeDeleted();
        this.__rangeDays.aboutToBeDeleted();
        this.__groups.aboutToBeDeleted();
        this.__totalReduction.aboutToBeDeleted();
        this.__count.aboutToBeDeleted();
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
    private __rangeDays: ObservedPropertySimplePU<number>; // 0=全部
    get rangeDays() {
        return this.__rangeDays.get();
    }
    set rangeDays(newValue: number) {
        this.__rangeDays.set(newValue);
    }
    private __groups: ObservedPropertyObjectPU<Array<RecordGroup>>;
    get groups() {
        return this.__groups.get();
    }
    set groups(newValue: Array<RecordGroup>) {
        this.__groups.set(newValue);
    }
    private __totalReduction: ObservedPropertySimplePU<number>;
    get totalReduction() {
        return this.__totalReduction.get();
    }
    set totalReduction(newValue: number) {
        this.__totalReduction.set(newValue);
    }
    private __count: ObservedPropertySimplePU<number>;
    get count() {
        return this.__count.get();
    }
    set count(newValue: number) {
        this.__count.set(newValue);
    }
    private categoryChips: Array<FilterChip>;
    private timeChips: Array<FilterChip>;
    aboutToAppear(): void {
        const metaChips: Array<FilterChip> = [new FilterChip('', '全部', Theme.PRIMARY)];
        for (let i = 0; i < CATEGORY_META.length; i++) {
            metaChips.push(new FilterChip(CATEGORY_META[i].key, CATEGORY_META[i].name, CATEGORY_META[i].color));
        }
        this.categoryChips = metaChips;
        this.reload();
    }
    private dayTitle(dateStr: string): string {
        const now = new Date();
        const today = startOfDay(now);
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        if (dateStr === formatDate(today)) {
            return '今天';
        }
        else if (dateStr === formatDate(yesterday)) {
            return '昨天';
        }
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return parseInt(parts[1], 10) + '月' + parseInt(parts[2], 10) + '日';
        }
        return dateStr;
    }
    private rangeStart(): number {
        if (this.rangeDays === 0) {
            return 0;
        }
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (this.rangeDays - 1));
        return start.getTime();
    }
    async reload(): Promise<void> {
        const start = this.rangeStart();
        const end = Date.now() + 86400000;
        const records = await carbonRepo.getRecordsByCategory(this.category, start, end, 2000);
        let total = 0;
        const grouped: Array<RecordGroup> = [];
        for (let i = 0; i < records.length; i++) {
            const r = records[i];
            total += r.reduction;
            if (grouped.length === 0 || grouped[grouped.length - 1].dateStr !== r.dateStr) {
                grouped.push(new RecordGroup(r.dateStr, this.dayTitle(r.dateStr), []));
            }
            grouped[grouped.length - 1].items.push(r);
        }
        this.groups = grouped;
        this.totalReduction = Math.round(total * 1000) / 1000;
        this.count = records.length;
    }
    private confirmDelete(id: number): void {
        try {
            this.getUIContext().getPromptAction().showDialog({
                title: '删除记录',
                message: '删除后将同步回滚该条记录的积分，是否继续？',
                buttons: [
                    { text: '取消', color: Theme.TEXT_SUB },
                    { text: '删除', color: Theme.DANGER }
                ]
            }).then((res) => {
                if (res.index === 1) {
                    carbonRepo.deleteRecord(id).then(() => {
                        showToast(this.getUIContext(), '已删除');
                        this.reload();
                        const cur = AppStorage.get<number>('refreshTick') ?? 0;
                        AppStorage.setOrCreate('refreshTick', cur + 1);
                    });
                }
            });
        }
        catch (e) {
            // 弹窗参数异常导致抛错，忽略
        }
    }
    chipRow(list: Array<FilterChip>, isCategory: boolean, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/HistoryPage.ets(129:5)", "entry");
            Scroll.scrollable(ScrollDirection.Horizontal);
            Scroll.scrollBar(BarState.Off);
            Scroll.width('100%');
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/HistoryPage.ets(130:7)", "entry");
            Row.padding({ left: 2, right: 2 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const c = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(c.label);
                    Text.debugLine("entry/src/main/ets/pages/HistoryPage.ets(132:11)", "entry");
                    Text.fontSize(13);
                    Text.padding({ left: 14, right: 14, top: 7, bottom: 7 });
                    Text.margin({ right: 8 });
                    Text.borderRadius(16);
                    Text.backgroundColor(this.isSelected(c.key, isCategory) ? c.color : Color.White);
                    Text.fontColor(this.isSelected(c.key, isCategory) ? Color.White : Theme.TEXT_SUB);
                    Text.onClick(() => {
                        if (isCategory) {
                            this.category = c.key;
                        }
                        else {
                            this.rangeDays = parseInt(c.key, 10);
                        }
                        this.reload();
                    });
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, list, forEachItemGenFunction, (c: FilterChip) => c.key, false, false);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        Scroll.pop();
    }
    private isSelected(key: string, isCategory: boolean): boolean {
        return isCategory ? this.category === key : String(this.rangeDays) === key;
    }
    recordRow(r: CarbonRecord, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/HistoryPage.ets(162:5)", "entry");
            Row.width('100%');
            Row.padding({ top: 9, bottom: 9 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(r.icon);
            Text.debugLine("entry/src/main/ets/pages/HistoryPage.ets(163:7)", "entry");
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
            Column.debugLine("entry/src/main/ets/pages/HistoryPage.ets(170:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
            Column.margin({ left: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(r.behaviorName);
            Text.debugLine("entry/src/main/ets/pages/HistoryPage.ets(171:9)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(formatDateTime(r.date) + '  ' + r.amount + r.unit + (r.note !== '' ? ' · ' + r.note : ''));
            Text.debugLine("entry/src/main/ets/pages/HistoryPage.ets(175:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 3 });
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/HistoryPage.ets(186:7)", "entry");
            Column.alignItems(HorizontalAlign.End);
            Column.onClick(() => {
                this.confirmDelete(r.id);
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('-' + r.reduction.toFixed(2) + 'kg');
            Text.debugLine("entry/src/main/ets/pages/HistoryPage.ets(187:9)", "entry");
            Text.fontSize(13);
            Text.fontColor(Theme.PRIMARY);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('删除');
            Text.debugLine("entry/src/main/ets/pages/HistoryPage.ets(191:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(Theme.DANGER);
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/HistoryPage.ets(206:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(Theme.BG);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/HistoryPage.ets(207:7)", "entry");
            Row.width('100%');
            Row.height(48);
            Row.backgroundColor(Color.White);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.debugLine("entry/src/main/ets/pages/HistoryPage.ets(208:9)", "entry");
            Text.fontSize(28);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width(40);
            Text.onClick(() => {
                this.getUIContext().getRouter().back();
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('历史记录');
            Text.debugLine("entry/src/main/ets/pages/HistoryPage.ets(215:9)", "entry");
            Text.fontSize(17);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.layoutWeight(1);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('');
            Text.debugLine("entry/src/main/ets/pages/HistoryPage.ets(221:9)", "entry");
            Text.width(40);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/HistoryPage.ets(228:7)", "entry");
            Column.width('100%');
            Column.padding(12);
            Column.backgroundColor(Color.White);
            Column.margin({ bottom: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/HistoryPage.ets(229:9)", "entry");
            Column.width('100%');
        }, Column);
        this.chipRow.bind(this)(this.categoryChips, true);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/HistoryPage.ets(233:9)", "entry");
            Column.width('100%');
            Column.margin({ top: 8 });
        }, Column);
        this.chipRow.bind(this)(this.timeChips, false);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/HistoryPage.ets(238:9)", "entry");
            Row.width('100%');
            Row.margin({ top: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('共 ' + this.count + ' 条记录');
            Text.debugLine("entry/src/main/ets/pages/HistoryPage.ets(239:11)", "entry");
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/HistoryPage.ets(242:11)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('累计减排 ' + this.totalReduction.toFixed(2) + ' kg');
            Text.debugLine("entry/src/main/ets/pages/HistoryPage.ets(243:11)", "entry");
            Text.fontSize(12);
            Text.fontColor(Theme.PRIMARY);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.groups.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new EmptyView(this, { icon: '🔍', text: '该条件下暂无记录' }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HistoryPage.ets", line: 257, col: 9 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        icon: '🔍',
                                        text: '该条件下暂无记录'
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    icon: '🔍', text: '该条件下暂无记录'
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
                        Scroll.debugLine("entry/src/main/ets/pages/HistoryPage.ets(259:9)", "entry");
                        Scroll.layoutWeight(1);
                        Scroll.scrollBar(BarState.Off);
                        Scroll.align(Alignment.Top);
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/pages/HistoryPage.ets(260:11)", "entry");
                        Column.padding({ left: 12, right: 12, bottom: 16 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const g = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.debugLine("entry/src/main/ets/pages/HistoryPage.ets(262:15)", "entry");
                                Column.width('100%');
                                Column.margin({ bottom: 12 });
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(g.title);
                                Text.debugLine("entry/src/main/ets/pages/HistoryPage.ets(263:17)", "entry");
                                Text.fontSize(13);
                                Text.fontWeight(FontWeight.Bold);
                                Text.fontColor(Theme.TEXT_SUB);
                                Text.width('100%');
                                Text.margin({ bottom: 6 });
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.debugLine("entry/src/main/ets/pages/HistoryPage.ets(269:17)", "entry");
                                Column.width('100%');
                                Column.padding({ left: 14, right: 14 });
                                Column.backgroundColor(Color.White);
                                Column.borderRadius(14);
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                ForEach.create();
                                const forEachItemGenFunction = _item => {
                                    const r = _item;
                                    this.recordRow.bind(this)(r);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Divider.create();
                                        Divider.debugLine("entry/src/main/ets/pages/HistoryPage.ets(272:21)", "entry");
                                        Divider.color(Theme.DIVIDER);
                                    }, Divider);
                                };
                                this.forEachUpdateFunction(elmtId, g.items, forEachItemGenFunction, (r: CarbonRecord) => String(r.id), false, false);
                            }, ForEach);
                            ForEach.pop();
                            Column.pop();
                            Column.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.groups, forEachItemGenFunction, (g: RecordGroup) => g.dateStr, false, false);
                    }, ForEach);
                    ForEach.pop();
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
        return "HistoryPage";
    }
}
registerNamedRoute(() => new HistoryPage(undefined, {}), "", { bundleName: "com.example.carbonfootprint", moduleName: "entry", pagePath: "pages/HistoryPage", pageFullPath: "entry/src/main/ets/pages/HistoryPage", integratedHsp: "false", moduleType: "followWithHap" });
