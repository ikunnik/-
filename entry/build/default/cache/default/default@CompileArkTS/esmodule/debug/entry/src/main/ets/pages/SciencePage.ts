if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface SciencePage_Params {
    filter?: string;
    list?: Array<ScienceArticle>;
    tabs?: Array<ScienceTab>;
}
import { Theme } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import type { ScienceArticle } from '../common/model/Models';
import { SCIENCE_ARTICLES, ScienceCategory } from "@normalized:N&&&entry/src/main/ets/common/constants/ScienceArticles&";
class ScienceTab {
    key: string;
    label: string;
    constructor(key: string, label: string) {
        this.key = key;
        this.label = label;
    }
}
export class SciencePage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__filter = new ObservedPropertySimplePU('全部', this, "filter");
        this.__list = new ObservedPropertyObjectPU(SCIENCE_ARTICLES, this, "list");
        this.tabs = [
            new ScienceTab('全部', '全部'),
            new ScienceTab(ScienceCategory.POLICY, '双碳政策'),
            new ScienceTab(ScienceCategory.CONCEPT, '基础概念'),
            new ScienceTab(ScienceCategory.TIPS, '减碳技巧')
        ];
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: SciencePage_Params) {
        if (params.filter !== undefined) {
            this.filter = params.filter;
        }
        if (params.list !== undefined) {
            this.list = params.list;
        }
        if (params.tabs !== undefined) {
            this.tabs = params.tabs;
        }
    }
    updateStateVars(params: SciencePage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__filter.purgeDependencyOnElmtId(rmElmtId);
        this.__list.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__filter.aboutToBeDeleted();
        this.__list.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __filter: ObservedPropertySimplePU<string>;
    get filter() {
        return this.__filter.get();
    }
    set filter(newValue: string) {
        this.__filter.set(newValue);
    }
    private __list: ObservedPropertyObjectPU<Array<ScienceArticle>>;
    get list() {
        return this.__list.get();
    }
    set list(newValue: Array<ScienceArticle>) {
        this.__list.set(newValue);
    }
    private tabs: Array<ScienceTab>;
    private applyFilter(key: string): void {
        this.filter = key;
        const arr: Array<ScienceArticle> = [];
        for (let i = 0; i < SCIENCE_ARTICLES.length; i++) {
            if (key === '全部' || SCIENCE_ARTICLES[i].category === key) {
                arr.push(SCIENCE_ARTICLES[i]);
            }
        }
        this.list = arr;
    }
    tabChip(t: ScienceTab, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(t.label);
            Text.fontSize(13);
            Text.padding({ left: 14, right: 14, top: 7, bottom: 7 });
            Text.margin({ right: 8 });
            Text.borderRadius(16);
            Text.backgroundColor(this.filter === t.key ? Theme.PRIMARY : Color.White);
            Text.fontColor(this.filter === t.key ? Color.White : Theme.TEXT_SUB);
            Text.onClick(() => {
                this.applyFilter(t.key);
            });
        }, Text);
        Text.pop();
    }
    articleCard(a: ScienceArticle, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(12);
            Row.backgroundColor(Color.White);
            Row.borderRadius(14);
            Row.margin({ bottom: 10 });
            Row.onClick(() => {
                this.getUIContext().getRouter().pushUrl({ url: 'pages/ArticleDetailPage', params: { id: a.id } });
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(a.icon);
            Text.fontSize(30);
            Text.width(52);
            Text.height(52);
            Text.textAlign(TextAlign.Center);
            Text.backgroundColor(Theme.PRIMARY_LIGHT);
            Text.borderRadius(14);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
            Column.margin({ left: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(a.title);
            Text.fontSize(15);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.maxLines(2);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(a.summary);
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 5 });
            Text.maxLines(2);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(a.category);
            Text.fontSize(10);
            Text.fontColor(Theme.PRIMARY);
            Text.backgroundColor(Theme.PRIMARY_LIGHT);
            Text.padding({ left: 8, right: 8, top: 3, bottom: 3 });
            Text.borderRadius(8);
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        Column.pop();
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
            Row.create();
            Row.width('100%');
            Row.padding({ left: 16, top: 18, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('双碳科普');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.scrollable(ScrollDirection.Horizontal);
            Scroll.scrollBar(BarState.Off);
            Scroll.width('100%');
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.padding({ left: 16, right: 16 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const t = _item;
                this.tabChip.bind(this)(t);
            };
            this.forEachUpdateFunction(elmtId, this.tabs, forEachItemGenFunction, (t: ScienceTab) => t.key, false, false);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        Scroll.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Off);
            Scroll.align(Alignment.Top);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 12, right: 12, top: 12, bottom: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const a = _item;
                this.articleCard.bind(this)(a);
            };
            this.forEachUpdateFunction(elmtId, this.list, forEachItemGenFunction, (a: ScienceArticle) => a.id, false, false);
        }, ForEach);
        ForEach.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
