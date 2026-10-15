if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Index_Params {
    currentIndex?: number;
    tick?: number;
}
import { HomePage } from "@normalized:N&&&entry/src/main/ets/pages/HomePage&";
import { DashboardPage } from "@normalized:N&&&entry/src/main/ets/pages/DashboardPage&";
import { TasksPage } from "@normalized:N&&&entry/src/main/ets/pages/TasksPage&";
import { SciencePage } from "@normalized:N&&&entry/src/main/ets/pages/SciencePage&";
import { MinePage } from "@normalized:N&&&entry/src/main/ets/pages/MinePage&";
import { Theme } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
class Index extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__currentIndex = new ObservedPropertySimplePU(0, this, "currentIndex");
        this.__tick = new ObservedPropertySimplePU(0, this, "tick");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Index_Params) {
        if (params.currentIndex !== undefined) {
            this.currentIndex = params.currentIndex;
        }
        if (params.tick !== undefined) {
            this.tick = params.tick;
        }
    }
    updateStateVars(params: Index_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__currentIndex.purgeDependencyOnElmtId(rmElmtId);
        this.__tick.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__currentIndex.aboutToBeDeleted();
        this.__tick.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __currentIndex: ObservedPropertySimplePU<number>;
    get currentIndex() {
        return this.__currentIndex.get();
    }
    set currentIndex(newValue: number) {
        this.__currentIndex.set(newValue);
    }
    private __tick: ObservedPropertySimplePU<number>;
    get tick() {
        return this.__tick.get();
    }
    set tick(newValue: number) {
        this.__tick.set(newValue);
    }
    aboutToAppear(): void {
        // 只在键不存在时初始化，绝不能无条件重置（会覆盖二级页面保存时的自增）
        if (AppStorage.get<number>('refreshTick') === undefined) {
            AppStorage.setOrCreate('refreshTick', 0);
        }
    }
    // 从录入页等二级页面返回时，把 AppStorage 的最新计数同步给各 Tab 子页
    onPageShow(): void {
        const cur = AppStorage.get<number>('refreshTick') ?? 0;
        if (cur !== this.tick) {
            this.tick = cur;
        }
    }
    private tabName(i: number): string {
        const names: Array<string> = ['首页', '看板', '任务', '科普', '我的'];
        return names[i];
    }
    private tabIcon(i: number): string {
        const icons: Array<string> = ['🏠', '📊', '🎯', '📖', '👤'];
        return icons[i];
    }
    tabBar(index: number, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.justifyContent(FlexAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.tabIcon(index));
            Text.fontSize(22);
            Text.fontColor(this.currentIndex === index ? Theme.PRIMARY : '#9CA3AF');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.tabName(index));
            Text.fontSize(11);
            Text.margin({ top: 2 });
            Text.fontColor(this.currentIndex === index ? Theme.PRIMARY : '#9CA3AF');
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
            Tabs.create({ barPosition: BarPosition.End });
            Tabs.barHeight(60);
            Tabs.scrollable(false);
            Tabs.onChange((index: number) => {
                this.currentIndex = index;
                // 切换 Tab 时也刷新一次对应页面数据
                const cur = (AppStorage.get<number>('refreshTick') ?? 0) + 1;
                AppStorage.setOrCreate('refreshTick', cur);
                this.tick = cur;
            });
        }, Tabs);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new HomePage(this, { tick: this.tick }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 67, col: 11 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {
                                    tick: this.tick
                                };
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                tick: this.tick
                            });
                        }
                    }, { name: "HomePage" });
                }
            });
            TabContent.tabBar({ builder: () => {
                    this.tabBar.call(this, 0);
                } });
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new DashboardPage(this, { tick: this.tick }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 72, col: 11 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {
                                    tick: this.tick
                                };
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                tick: this.tick
                            });
                        }
                    }, { name: "DashboardPage" });
                }
            });
            TabContent.tabBar({ builder: () => {
                    this.tabBar.call(this, 1);
                } });
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new TasksPage(this, { tick: this.tick }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 77, col: 11 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {
                                    tick: this.tick
                                };
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                tick: this.tick
                            });
                        }
                    }, { name: "TasksPage" });
                }
            });
            TabContent.tabBar({ builder: () => {
                    this.tabBar.call(this, 2);
                } });
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new SciencePage(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 82, col: 11 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {};
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {});
                        }
                    }, { name: "SciencePage" });
                }
            });
            TabContent.tabBar({ builder: () => {
                    this.tabBar.call(this, 3);
                } });
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new MinePage(this, { tick: this.tick }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 87, col: 11 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {
                                    tick: this.tick
                                };
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                tick: this.tick
                            });
                        }
                    }, { name: "MinePage" });
                }
            });
            TabContent.tabBar({ builder: () => {
                    this.tabBar.call(this, 4);
                } });
        }, TabContent);
        TabContent.pop();
        Tabs.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "Index";
    }
}
registerNamedRoute(() => new Index(undefined, {}), "", { bundleName: "com.example.carbonfootprint", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
