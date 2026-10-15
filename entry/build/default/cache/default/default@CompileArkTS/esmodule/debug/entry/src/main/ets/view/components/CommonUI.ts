if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface EmptyView_Params {
    icon?: string;
    text?: string;
}
interface StatMini_Params {
    icon?: string;
    value?: string;
    label?: string;
    color?: string;
}
interface SectionTitle_Params {
    title?: string;
    moreText?: string;
    onMore?: () => void;
}
interface Card_Params {
    innerPadding?: number;
    content?: () => void;
}
import { Theme } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
function EmptyBuilder(parent = null) {
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender) => {
        Column.create();
    }, Column);
    Column.pop();
}
export class Card extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__innerPadding = new SynchedPropertySimpleOneWayPU(params.innerPadding, this, "innerPadding");
        this.content = EmptyBuilder;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Card_Params) {
        if (params.innerPadding === undefined) {
            this.__innerPadding.set(14);
        }
        if (params.content !== undefined) {
            this.content = params.content;
        }
    }
    updateStateVars(params: Card_Params) {
        this.__innerPadding.reset(params.innerPadding);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__innerPadding.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__innerPadding.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __innerPadding: SynchedPropertySimpleOneWayPU<number>;
    get innerPadding() {
        return this.__innerPadding.get();
    }
    set innerPadding(newValue: number) {
        this.__innerPadding.set(newValue);
    }
    private __content;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.backgroundColor(Theme.CARD);
            Column.borderRadius(16);
            Column.padding(this.innerPadding);
            Column.shadow({
                radius: 8,
                color: '#11000000',
                offsetX: 0,
                offsetY: 2
            });
        }, Column);
        this.content.bind(this)();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
export class SectionTitle extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__title = new SynchedPropertySimpleOneWayPU(params.title, this, "title");
        this.__moreText = new SynchedPropertySimpleOneWayPU(params.moreText, this, "moreText");
        this.onMore = (): void => {
        };
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: SectionTitle_Params) {
        if (params.title === undefined) {
            this.__title.set('');
        }
        if (params.moreText === undefined) {
            this.__moreText.set('');
        }
        if (params.onMore !== undefined) {
            this.onMore = params.onMore;
        }
    }
    updateStateVars(params: SectionTitle_Params) {
        this.__title.reset(params.title);
        this.__moreText.reset(params.moreText);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__title.purgeDependencyOnElmtId(rmElmtId);
        this.__moreText.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__title.aboutToBeDeleted();
        this.__moreText.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __title: SynchedPropertySimpleOneWayPU<string>;
    get title() {
        return this.__title.get();
    }
    set title(newValue: string) {
        this.__title.set(newValue);
    }
    private __moreText: SynchedPropertySimpleOneWayPU<string>;
    get moreText() {
        return this.__moreText.get();
    }
    set moreText(newValue: string) {
        this.__moreText.set(newValue);
    }
    private onMore: () => void;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.vertical(true);
            Divider.height(16);
            Divider.width(3);
            Divider.color(Theme.PRIMARY);
            Divider.borderRadius(2);
            Divider.margin({ right: 8 });
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.title);
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.moreText !== '') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.moreText + ' >');
                        Text.fontSize(12);
                        Text.fontColor(Theme.TEXT_SUB);
                        Text.onClick(() => {
                            this.onMore();
                        });
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
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
export class StatMini extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__icon = new SynchedPropertySimpleOneWayPU(params.icon, this, "icon");
        this.__value = new SynchedPropertySimpleOneWayPU(params.value, this, "value");
        this.__label = new SynchedPropertySimpleOneWayPU(params.label, this, "label");
        this.__color = new SynchedPropertySimpleOneWayPU(params.color, this, "color");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: StatMini_Params) {
        if (params.icon === undefined) {
            this.__icon.set('');
        }
        if (params.value === undefined) {
            this.__value.set('');
        }
        if (params.label === undefined) {
            this.__label.set('');
        }
        if (params.color === undefined) {
            this.__color.set(Theme.PRIMARY);
        }
    }
    updateStateVars(params: StatMini_Params) {
        this.__icon.reset(params.icon);
        this.__value.reset(params.value);
        this.__label.reset(params.label);
        this.__color.reset(params.color);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__icon.purgeDependencyOnElmtId(rmElmtId);
        this.__value.purgeDependencyOnElmtId(rmElmtId);
        this.__label.purgeDependencyOnElmtId(rmElmtId);
        this.__color.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__icon.aboutToBeDeleted();
        this.__value.aboutToBeDeleted();
        this.__label.aboutToBeDeleted();
        this.__color.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __icon: SynchedPropertySimpleOneWayPU<string>;
    get icon() {
        return this.__icon.get();
    }
    set icon(newValue: string) {
        this.__icon.set(newValue);
    }
    private __value: SynchedPropertySimpleOneWayPU<string>;
    get value() {
        return this.__value.get();
    }
    set value(newValue: string) {
        this.__value.set(newValue);
    }
    private __label: SynchedPropertySimpleOneWayPU<string>;
    get label() {
        return this.__label.get();
    }
    set label(newValue: string) {
        this.__label.set(newValue);
    }
    private __color: SynchedPropertySimpleOneWayPU<string>;
    get color() {
        return this.__color.get();
    }
    set color(newValue: string) {
        this.__color.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
            Column.padding({ top: 12, bottom: 12 });
            Column.backgroundColor(Theme.BG);
            Column.borderRadius(12);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.icon);
            Text.fontSize(22);
            Text.margin({ bottom: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.value);
            Text.fontSize(17);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.maxLines(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.label);
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 2 });
            Text.maxLines(1);
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
export class EmptyView extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__icon = new SynchedPropertySimpleOneWayPU(params.icon, this, "icon");
        this.__text = new SynchedPropertySimpleOneWayPU(params.text, this, "text");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: EmptyView_Params) {
        if (params.icon === undefined) {
            this.__icon.set('🍃');
        }
        if (params.text === undefined) {
            this.__text.set('暂无数据');
        }
    }
    updateStateVars(params: EmptyView_Params) {
        this.__icon.reset(params.icon);
        this.__text.reset(params.text);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__icon.purgeDependencyOnElmtId(rmElmtId);
        this.__text.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__icon.aboutToBeDeleted();
        this.__text.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __icon: SynchedPropertySimpleOneWayPU<string>;
    get icon() {
        return this.__icon.get();
    }
    set icon(newValue: string) {
        this.__icon.set(newValue);
    }
    private __text: SynchedPropertySimpleOneWayPU<string>;
    get text() {
        return this.__text.get();
    }
    set text(newValue: string) {
        this.__text.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ top: 40, bottom: 40 });
            Column.justifyContent(FlexAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.icon);
            Text.fontSize(42);
            Text.margin({ bottom: 10 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.text);
            Text.fontSize(13);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
