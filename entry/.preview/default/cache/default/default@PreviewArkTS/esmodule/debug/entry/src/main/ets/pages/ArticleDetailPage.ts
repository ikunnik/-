if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ArticleDetailPage_Params {
    article?: ScienceArticle | null;
    paragraphs?: Array<string>;
}
import { Theme } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import type { ScienceArticle } from '../common/model/Models';
import { getArticleById } from "@normalized:N&&&entry/src/main/ets/common/constants/ScienceArticles&";
class ArticleParams {
    id: string = '';
}
class ArticleDetailPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__article = new ObservedPropertyObjectPU(null, this, "article");
        this.paragraphs = [];
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ArticleDetailPage_Params) {
        if (params.article !== undefined) {
            this.article = params.article;
        }
        if (params.paragraphs !== undefined) {
            this.paragraphs = params.paragraphs;
        }
    }
    updateStateVars(params: ArticleDetailPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__article.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__article.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __article: ObservedPropertyObjectPU<ScienceArticle | null>;
    get article() {
        return this.__article.get();
    }
    set article(newValue: ScienceArticle | null) {
        this.__article.set(newValue);
    }
    private paragraphs: Array<string>;
    aboutToAppear(): void {
        const p = this.getUIContext().getRouter().getParams() as ArticleParams;
        let id = '';
        if (p !== null && p !== undefined) {
            id = p.id;
        }
        const a = getArticleById(id);
        if (a !== null) {
            this.article = a;
            const parts = a.content.split('\n');
            const arr: Array<string> = [];
            for (let i = 0; i < parts.length; i++) {
                const trimmed = parts[i].trim();
                if (trimmed !== '') {
                    arr.push(trimmed);
                }
            }
            this.paragraphs = arr;
        }
    }
    header(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/ArticleDetailPage.ets(38:5)", "entry");
            Column.width('100%');
            Column.padding({ top: 20, bottom: 20 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.article?.icon ?? '📖');
            Text.debugLine("entry/src/main/ets/pages/ArticleDetailPage.ets(39:7)", "entry");
            Text.fontSize(56);
            Text.width(96);
            Text.height(96);
            Text.textAlign(TextAlign.Center);
            Text.backgroundColor(Theme.PRIMARY_LIGHT);
            Text.borderRadius(24);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.article?.category ?? '');
            Text.debugLine("entry/src/main/ets/pages/ArticleDetailPage.ets(46:7)", "entry");
            Text.fontSize(11);
            Text.fontColor(Theme.PRIMARY);
            Text.backgroundColor(Theme.PRIMARY_LIGHT);
            Text.padding({ left: 10, right: 10, top: 4, bottom: 4 });
            Text.borderRadius(10);
            Text.margin({ top: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.article?.title ?? '');
            Text.debugLine("entry/src/main/ets/pages/ArticleDetailPage.ets(53:7)", "entry");
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.textAlign(TextAlign.Center);
            Text.margin({ top: 12, left: 12, right: 12 });
        }, Text);
        Text.pop();
        Column.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/ArticleDetailPage.ets(65:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(Theme.BG);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/ArticleDetailPage.ets(66:7)", "entry");
            Row.width('100%');
            Row.height(48);
            Row.backgroundColor(Color.White);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.debugLine("entry/src/main/ets/pages/ArticleDetailPage.ets(67:9)", "entry");
            Text.fontSize(28);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width(40);
            Text.onClick(() => {
                this.getUIContext().getRouter().back();
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('科普详情');
            Text.debugLine("entry/src/main/ets/pages/ArticleDetailPage.ets(74:9)", "entry");
            Text.fontSize(17);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.layoutWeight(1);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('');
            Text.debugLine("entry/src/main/ets/pages/ArticleDetailPage.ets(80:9)", "entry");
            Text.width(40);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.article === null) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('文章不存在');
                        Text.debugLine("entry/src/main/ets/pages/ArticleDetailPage.ets(88:9)", "entry");
                        Text.fontSize(14);
                        Text.fontColor(Theme.TEXT_SUB);
                        Text.margin({ top: 40 });
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Scroll.create();
                        Scroll.debugLine("entry/src/main/ets/pages/ArticleDetailPage.ets(93:9)", "entry");
                        Scroll.layoutWeight(1);
                        Scroll.scrollBar(BarState.Off);
                        Scroll.align(Alignment.Top);
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/pages/ArticleDetailPage.ets(94:11)", "entry");
                        Column.width('100%');
                    }, Column);
                    this.header.bind(this)();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/pages/ArticleDetailPage.ets(96:13)", "entry");
                        Column.width('100%');
                        Column.padding(16);
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(16);
                        Column.margin({ left: 12, right: 12, bottom: 24 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = (_item, index: number) => {
                            const text = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(text);
                                Text.debugLine("entry/src/main/ets/pages/ArticleDetailPage.ets(98:17)", "entry");
                                Text.fontSize(15);
                                Text.lineHeight(26);
                                Text.fontColor('#374151');
                                Text.width('100%');
                                Text.margin({ bottom: 14 });
                            }, Text);
                            Text.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.paragraphs, forEachItemGenFunction, (text: string, index: number) => String(index), true, true);
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
        return "ArticleDetailPage";
    }
}
registerNamedRoute(() => new ArticleDetailPage(undefined, {}), "", { bundleName: "com.example.carbonfootprint", moduleName: "entry", pagePath: "pages/ArticleDetailPage", pageFullPath: "entry/src/main/ets/pages/ArticleDetailPage", integratedHsp: "false", moduleType: "followWithHap" });
