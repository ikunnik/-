if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface FactorLibraryPage_Params {
}
import { Theme, CATEGORY_META } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import type { CategoryMeta } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import { getBehaviorsByCategory } from "@normalized:N&&&entry/src/main/ets/common/constants/EmissionFactors&";
import type { BehaviorType } from '../common/model/Models';
class FactorLibraryPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: FactorLibraryPage_Params) {
    }
    updateStateVars(params: FactorLibraryPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(9:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(Theme.BG);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(10:7)", "entry");
            Row.width('100%');
            Row.height(48);
            Row.backgroundColor(Color.White);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(11:9)", "entry");
            Text.fontSize(28);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width(40);
            Text.onClick(() => {
                this.getUIContext().getRouter().back();
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('碳排放因子库');
            Text.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(18:9)", "entry");
            Text.fontSize(17);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.layoutWeight(1);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('');
            Text.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(24:9)", "entry");
            Text.width(40);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('内置参考排放因子，用于自动核算每一项低碳行为的减排量（kgCO₂e）。数据为科普参考值，可随研究更新。');
            Text.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(31:7)", "entry");
            Text.fontSize(12);
            Text.lineHeight(19);
            Text.fontColor(Theme.TEXT_SUB);
            Text.width('100%');
            Text.padding({ left: 16, right: 16, top: 12, bottom: 10 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(38:7)", "entry");
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Off);
            Scroll.align(Alignment.Top);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(39:9)", "entry");
            Column.width('100%');
            Column.padding({ bottom: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const cat = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(41:13)", "entry");
                    Column.width('100%');
                    Column.padding({ left: 12, right: 12 });
                    Column.margin({ bottom: 12 });
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create();
                    Row.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(42:15)", "entry");
                    Row.width('100%');
                    Row.margin({ bottom: 8 });
                }, Row);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(cat.icon + ' ' + cat.name);
                    Text.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(43:17)", "entry");
                    Text.fontSize(14);
                    Text.fontWeight(FontWeight.Bold);
                    Text.fontColor(cat.color);
                }, Text);
                Text.pop();
                Row.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(50:15)", "entry");
                    Column.width('100%');
                    Column.padding({ left: 12, right: 12 });
                    Column.backgroundColor(Color.White);
                    Column.borderRadius(14);
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    ForEach.create();
                    const forEachItemGenFunction = _item => {
                        const b = _item;
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Row.create();
                            Row.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(52:19)", "entry");
                            Row.width('100%');
                            Row.padding({ top: 9, bottom: 9 });
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(b.icon);
                            Text.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(53:21)", "entry");
                            Text.fontSize(20);
                            Text.width(38);
                            Text.height(38);
                            Text.textAlign(TextAlign.Center);
                            Text.backgroundColor(Theme.BG);
                            Text.borderRadius(19);
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Column.create();
                            Column.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(60:21)", "entry");
                            Column.alignItems(HorizontalAlign.Start);
                            Column.layoutWeight(1);
                            Column.margin({ left: 10 });
                        }, Column);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(b.name);
                            Text.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(61:23)", "entry");
                            Text.fontSize(13);
                            Text.fontColor(Theme.TEXT_MAIN);
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(b.hint);
                            Text.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(64:23)", "entry");
                            Text.fontSize(11);
                            Text.fontColor(Theme.TEXT_SUB);
                            Text.margin({ top: 2 });
                            Text.maxLines(1);
                            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        }, Text);
                        Text.pop();
                        Column.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(b.factor + ' kg/' + b.unit);
                            Text.debugLine("entry/src/main/ets/pages/FactorLibraryPage.ets(74:21)", "entry");
                            Text.fontSize(12);
                            Text.fontColor(Theme.PRIMARY);
                            Text.fontWeight(FontWeight.Bold);
                        }, Text);
                        Text.pop();
                        Row.pop();
                    };
                    this.forEachUpdateFunction(elmtId, getBehaviorsByCategory(cat.key), forEachItemGenFunction, (b: BehaviorType) => b.id, false, false);
                }, ForEach);
                ForEach.pop();
                Column.pop();
                Column.pop();
            };
            this.forEachUpdateFunction(elmtId, CATEGORY_META, forEachItemGenFunction, (cat: CategoryMeta) => cat.key, false, false);
        }, ForEach);
        ForEach.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "FactorLibraryPage";
    }
}
registerNamedRoute(() => new FactorLibraryPage(undefined, {}), "", { bundleName: "com.example.carbonfootprint", moduleName: "entry", pagePath: "pages/FactorLibraryPage", pageFullPath: "entry/src/main/ets/pages/FactorLibraryPage", integratedHsp: "false", moduleType: "followWithHap" });
