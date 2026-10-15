if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface BadgesPage_Params {
    dateMap?: Map<string, string>;
    unlockedCount?: number;
}
import { Theme } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import type { BadgeDef } from '../common/model/Models';
import { BADGES } from "@normalized:N&&&entry/src/main/ets/common/constants/Badges&";
import { pointsRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/PointsRepository&";
class BadgesPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__dateMap = new ObservedPropertyObjectPU(new Map<string, string>(), this, "dateMap");
        this.__unlockedCount = new ObservedPropertySimplePU(0, this, "unlockedCount");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: BadgesPage_Params) {
        if (params.dateMap !== undefined) {
            this.dateMap = params.dateMap;
        }
        if (params.unlockedCount !== undefined) {
            this.unlockedCount = params.unlockedCount;
        }
    }
    updateStateVars(params: BadgesPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__dateMap.purgeDependencyOnElmtId(rmElmtId);
        this.__unlockedCount.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__dateMap.aboutToBeDeleted();
        this.__unlockedCount.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __dateMap: ObservedPropertyObjectPU<Map<string, string>>;
    get dateMap() {
        return this.__dateMap.get();
    }
    set dateMap(newValue: Map<string, string>) {
        this.__dateMap.set(newValue);
    }
    private __unlockedCount: ObservedPropertySimplePU<number>;
    get unlockedCount() {
        return this.__unlockedCount.get();
    }
    set unlockedCount(newValue: number) {
        this.__unlockedCount.set(newValue);
    }
    async aboutToAppear(): Promise<void> {
        const badges = await pointsRepo.getUnlockedBadges();
        const map = new Map<string, string>();
        for (let i = 0; i < badges.length; i++) {
            map.set(badges[i].badgeId, badges[i].dateStr);
        }
        this.dateMap = map;
        this.unlockedCount = badges.length;
    }
    badgeCell(b: BadgeDef, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/BadgesPage.ets(24:5)", "entry");
            Column.width('100%');
            Column.backgroundColor(this.dateMap.has(b.id) ? Theme.PRIMARY_LIGHT : '#F9FAFB');
            Column.borderRadius(14);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.debugLine("entry/src/main/ets/pages/BadgesPage.ets(25:7)", "entry");
            Stack.width(64);
            Stack.height(64);
            Stack.margin({ top: 14 });
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(b.icon);
            Text.debugLine("entry/src/main/ets/pages/BadgesPage.ets(26:9)", "entry");
            Text.fontSize(40);
            Text.opacity(this.dateMap.has(b.id) ? 1.0 : 0.3);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (!this.dateMap.has(b.id)) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('🔒');
                        Text.debugLine("entry/src/main/ets/pages/BadgesPage.ets(30:11)", "entry");
                        Text.fontSize(16);
                        Text.position({ right: 0, bottom: 0 });
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
        Stack.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(b.name);
            Text.debugLine("entry/src/main/ets/pages/BadgesPage.ets(39:7)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(this.dateMap.has(b.id) ? Theme.TEXT_MAIN : Theme.TEXT_SUB);
            Text.margin({ top: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(b.desc);
            Text.debugLine("entry/src/main/ets/pages/BadgesPage.ets(44:7)", "entry");
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 4, left: 8, right: 8 });
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.dateMap.has(b.id) ? '解锁于 ' + this.dateMap.get(b.id) : '未解锁');
            Text.debugLine("entry/src/main/ets/pages/BadgesPage.ets(49:7)", "entry");
            Text.fontSize(10);
            Text.fontColor(this.dateMap.has(b.id) ? Theme.PRIMARY : Theme.TEXT_SUB);
            Text.margin({ top: 6, bottom: 12 });
        }, Text);
        Text.pop();
        Column.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/BadgesPage.ets(60:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(Theme.BG);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/BadgesPage.ets(61:7)", "entry");
            Row.width('100%');
            Row.height(48);
            Row.backgroundColor(Color.White);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.debugLine("entry/src/main/ets/pages/BadgesPage.ets(62:9)", "entry");
            Text.fontSize(28);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width(40);
            Text.onClick(() => {
                this.getUIContext().getRouter().back();
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('低碳徽章墙');
            Text.debugLine("entry/src/main/ets/pages/BadgesPage.ets(69:9)", "entry");
            Text.fontSize(17);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.layoutWeight(1);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('');
            Text.debugLine("entry/src/main/ets/pages/BadgesPage.ets(75:9)", "entry");
            Text.width(40);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/BadgesPage.ets(82:7)", "entry");
            Row.width('100%');
            Row.padding({ left: 16, top: 12, bottom: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🏅 已解锁 ' + this.unlockedCount + ' / ' + BADGES.length + ' 枚徽章');
            Text.debugLine("entry/src/main/ets/pages/BadgesPage.ets(83:9)", "entry");
            Text.fontSize(13);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/BadgesPage.ets(90:7)", "entry");
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Off);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Grid.create();
            Grid.debugLine("entry/src/main/ets/pages/BadgesPage.ets(91:9)", "entry");
            Grid.columnsTemplate('1fr 1fr');
            Grid.columnsGap(12);
            Grid.rowsGap(12);
            Grid.padding({ left: 12, right: 12, bottom: 16 });
            Grid.width('100%');
        }, Grid);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const b = _item;
                {
                    const itemCreation2 = (elmtId, isInitialRender) => {
                        GridItem.create(() => { }, false);
                        GridItem.debugLine("entry/src/main/ets/pages/BadgesPage.ets(93:13)", "entry");
                    };
                    const observedDeepRender = () => {
                        this.observeComponentCreation2(itemCreation2, GridItem);
                        this.badgeCell.bind(this)(b);
                        GridItem.pop();
                    };
                    observedDeepRender();
                }
            };
            this.forEachUpdateFunction(elmtId, BADGES, forEachItemGenFunction, (b: BadgeDef) => b.id, false, false);
        }, ForEach);
        ForEach.pop();
        Grid.pop();
        Scroll.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "BadgesPage";
    }
}
registerNamedRoute(() => new BadgesPage(undefined, {}), "", { bundleName: "com.example.carbonfootprint", moduleName: "entry", pagePath: "pages/BadgesPage", pageFullPath: "entry/src/main/ets/pages/BadgesPage", integratedHsp: "false", moduleType: "followWithHap" });
