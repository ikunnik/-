if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface SmartPage_Params {
    stats?: Array<CategoryStat>;
    overview?: OverviewData;
    focus?: FocusTask;
    tips?: Array<SmartTip>;
}
import type common from "@ohos:app.ability.common";
import { Theme } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import { OverviewData } from "@normalized:N&&&entry/src/main/ets/common/model/Models&";
import type { CategoryStat } from "@normalized:N&&&entry/src/main/ets/common/model/Models&";
import { carbonRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/CarbonRepository&";
import { smartService, FocusTask, CategorySnapshot } from "@normalized:N&&&entry/src/main/ets/features/smart/SmartService&";
import type { SmartTip } from "@normalized:N&&&entry/src/main/ets/features/smart/SmartService&";
import { showToast } from "@normalized:N&&&entry/src/main/ets/common/utils/ToastUtil&";
import { formatWeight } from "@normalized:N&&&entry/src/main/ets/common/utils/CalcUtil&";
class AddPageParams {
    category: string = '';
}
class SmartPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__stats = new ObservedPropertyObjectPU([], this, "stats");
        this.__overview = new ObservedPropertyObjectPU(new OverviewData(), this, "overview");
        this.__focus = new ObservedPropertyObjectPU(new FocusTask('travel', 'task_travel', '🚲', '今日重点', '正在生成…'), this, "focus");
        this.__tips = new ObservedPropertyObjectPU([], this, "tips");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: SmartPage_Params) {
        if (params.stats !== undefined) {
            this.stats = params.stats;
        }
        if (params.overview !== undefined) {
            this.overview = params.overview;
        }
        if (params.focus !== undefined) {
            this.focus = params.focus;
        }
        if (params.tips !== undefined) {
            this.tips = params.tips;
        }
    }
    updateStateVars(params: SmartPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__stats.purgeDependencyOnElmtId(rmElmtId);
        this.__overview.purgeDependencyOnElmtId(rmElmtId);
        this.__focus.purgeDependencyOnElmtId(rmElmtId);
        this.__tips.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__stats.aboutToBeDeleted();
        this.__overview.aboutToBeDeleted();
        this.__focus.aboutToBeDeleted();
        this.__tips.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __stats: ObservedPropertyObjectPU<Array<CategoryStat>>;
    get stats() {
        return this.__stats.get();
    }
    set stats(newValue: Array<CategoryStat>) {
        this.__stats.set(newValue);
    }
    private __overview: ObservedPropertyObjectPU<OverviewData>;
    get overview() {
        return this.__overview.get();
    }
    set overview(newValue: OverviewData) {
        this.__overview.set(newValue);
    }
    private __focus: ObservedPropertyObjectPU<FocusTask>;
    get focus() {
        return this.__focus.get();
    }
    set focus(newValue: FocusTask) {
        this.__focus.set(newValue);
    }
    private __tips: ObservedPropertyObjectPU<Array<SmartTip>>;
    get tips() {
        return this.__tips.get();
    }
    set tips(newValue: Array<SmartTip>) {
        this.__tips.set(newValue);
    }
    async aboutToAppear(): Promise<void> {
        await this.reload();
    }
    onPageShow(): void {
        this.reload();
    }
    async reload(): Promise<void> {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).getTime();
        const end = now.getTime() + 86400000;
        this.stats = await carbonRepo.getCategoryStats(start, end);
        this.overview = await carbonRepo.getOverview();
        this.focus = smartService.buildFocus(this.stats);
        const snap: Array<CategorySnapshot> = [];
        for (let i = 0; i < this.stats.length; i++) {
            snap.push(new CategorySnapshot(this.stats[i].category, this.stats[i].reduction));
        }
        this.tips = smartService.buildTips(snap);
    }
    async sendReminder(): Promise<void> {
        const ok = await smartService.pushLocalNotification('🌱 今日低碳提醒', this.focus.title.replace('今日重点：', '') + '：' + this.focus.desc);
        if (ok) {
            showToast(this.getUIContext(), '已发送本地通知，请在通知栏查看');
        }
        else {
            showToast(this.getUIContext(), '通知未开启，请在系统设置中允许本应用通知');
        }
    }
    async share(): Promise<void> {
        const ctx = this.getUIContext().getHostContext() as common.UIAbilityContext;
        const text = smartService.buildShareText(this.overview);
        const ok = await smartService.shareText(ctx, text);
        if (!ok) {
            showToast(this.getUIContext(), '未找到可分享的应用，可先复制文案');
        }
    }
    async copyShare(): Promise<void> {
        const text = smartService.buildShareText(this.overview);
        const ok = await smartService.copyText(text);
        showToast(this.getUIContext(), ok ? '成果文案已复制，去粘贴分享吧' : '复制失败');
    }
    tipCard(t: SmartTip, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ top: 10, bottom: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(t.icon);
            Text.fontSize(24);
            Text.width(44);
            Text.height(44);
            Text.textAlign(TextAlign.Center);
            Text.backgroundColor(Theme.PRIMARY_LIGHT);
            Text.borderRadius(22);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
            Column.margin({ left: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(t.title);
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(t.content);
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
            Text.lineHeight(18);
            Text.margin({ top: 3 });
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
    }
    shareCell(icon: string, label: string, value: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(icon);
            Text.fontSize(18);
            Text.margin({ bottom: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(value);
            Text.fontSize(17);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(label);
            Text.fontSize(10);
            Text.fontColor('#E6FFF4');
            Text.margin({ top: 2 });
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
            // 顶部导航
            Row.create();
            // 顶部导航
            Row.width('100%');
            // 顶部导航
            Row.height(48);
            // 顶部导航
            Row.padding({ left: 8, right: 8 });
            // 顶部导航
            Row.backgroundColor(Color.White);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.fontSize(28);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width(40);
            Text.onClick(() => {
                this.getUIContext().getRouter().back();
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('智能服务');
            Text.fontSize(17);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.layoutWeight(1);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('');
            Text.width(40);
        }, Text);
        Text.pop();
        // 顶部导航
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
            // 今日个性化重点
            Column.create();
            // 今日个性化重点
            Column.width('100%');
            // 今日个性化重点
            Column.padding(14);
            // 今日个性化重点
            Column.backgroundColor(Color.White);
            // 今日个性化重点
            Column.borderRadius(16);
            // 今日个性化重点
            Column.margin({ left: 12, right: 12, top: 14 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🎯 今日个性化任务');
            Text.fontSize(15);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('按你近 7 天数据推荐');
            Text.fontSize(10);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.focus.icon);
            Text.fontSize(34);
            Text.width(56);
            Text.height(56);
            Text.textAlign(TextAlign.Center);
            Text.backgroundColor(Theme.PRIMARY_LIGHT);
            Text.borderRadius(28);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
            Column.margin({ left: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.focus.title);
            Text.fontSize(15);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.focus.desc);
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
            Text.lineHeight(18);
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('立即去完成');
            Button.width('100%');
            Button.height(40);
            Button.fontSize(14);
            Button.backgroundColor(Theme.PRIMARY);
            Button.borderRadius(20);
            Button.margin({ top: 12 });
            Button.onClick(() => {
                const params: AddPageParams = { category: this.focus.category };
                this.getUIContext().getRouter().pushUrl({ url: 'pages/RecordAddPage', params: params });
            });
        }, Button);
        Button.pop();
        // 今日个性化重点
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 生活建议
            Column.create();
            // 生活建议
            Column.width('100%');
            // 生活建议
            Column.padding({ left: 14, right: 14 });
            // 生活建议
            Column.backgroundColor(Color.White);
            // 生活建议
            Column.borderRadius(16);
            // 生活建议
            Column.margin({ left: 12, right: 12, top: 14 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('💡 低碳生活建议');
            Text.fontSize(15);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width('100%');
            Text.margin({ bottom: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const t = _item;
                this.tipCard.bind(this)(t);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Divider.create();
                    Divider.color(Theme.DIVIDER);
                }, Divider);
            };
            this.forEachUpdateFunction(elmtId, this.tips, forEachItemGenFunction, (t: SmartTip) => t.id, false, false);
        }, ForEach);
        ForEach.pop();
        // 生活建议
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 智能提醒
            Column.create();
            // 智能提醒
            Column.width('100%');
            // 智能提醒
            Column.padding(14);
            // 智能提醒
            Column.backgroundColor(Color.White);
            // 智能提醒
            Column.borderRadius(16);
            // 智能提醒
            Column.margin({ left: 12, right: 12, top: 14 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('📩 智能提醒');
            Text.fontSize(15);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width('100%');
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('立即发送今日低碳提醒');
            Button.width('100%');
            Button.height(42);
            Button.fontSize(14);
            Button.backgroundColor(Theme.PRIMARY);
            Button.borderRadius(21);
            Button.onClick(() => {
                this.sendReminder();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('真机可通过 reminderAgent 设置每日定时提醒（如每天 20:00），代码已预留，见 SmartService。');
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.lineHeight(16);
            Text.width('100%');
            Text.margin({ top: 8 });
        }, Text);
        Text.pop();
        // 智能提醒
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 成果分享卡片
            Column.create();
            // 成果分享卡片
            Column.width('100%');
            // 成果分享卡片
            Column.padding(14);
            // 成果分享卡片
            Column.backgroundColor(Color.White);
            // 成果分享卡片
            Column.borderRadius(16);
            // 成果分享卡片
            Column.margin({ left: 12, right: 12, top: 14, bottom: 20 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(20);
            Column.alignItems(HorizontalAlign.Start);
            Column.linearGradient({ angle: 135, colors: [['#26996B', 0.0], ['#3FCB8C', 1.0]] });
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🌱 我的低碳成绩单');
            Text.fontSize(17);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 16 });
        }, Row);
        this.shareCell.bind(this)('⚖️', '累计减排', formatWeight(this.overview.totalReduction));
        this.shareCell.bind(this)('🪙', '碳积分', String(this.overview.totalPoints));
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 14 });
        }, Row);
        this.shareCell.bind(this)('🏅', '徽章', String(this.overview.badgeCount));
        this.shareCell.bind(this)('🌳', '认种树木', String(this.overview.treeCount));
        this.shareCell.bind(this)('🔥', '连续打卡', this.overview.streakDays + ' 天');
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('碳足迹 · 全民绿色生活');
            Text.fontSize(11);
            Text.fontColor('#E6FFF4');
            Text.width('100%');
            Text.textAlign(TextAlign.Center);
            Text.margin({ top: 16 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('📤 分享成果');
            Button.layoutWeight(1);
            Button.height(42);
            Button.fontSize(14);
            Button.backgroundColor(Theme.PRIMARY);
            Button.onClick(() => {
                this.share();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('📋 复制文案');
            Button.layoutWeight(1);
            Button.height(42);
            Button.fontSize(14);
            Button.backgroundColor(Theme.BG);
            Button.fontColor(Theme.TEXT_MAIN);
            Button.margin({ left: 12 });
            Button.onClick(() => {
                this.copyShare();
            });
        }, Button);
        Button.pop();
        Row.pop();
        // 成果分享卡片
        Column.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "SmartPage";
    }
}
registerNamedRoute(() => new SmartPage(undefined, {}), "", { bundleName: "com.example.carbonfootprint", moduleName: "entry", pagePath: "pages/SmartPage", pageFullPath: "entry/src/main/ets/pages/SmartPage", integratedHsp: "false", moduleType: "followWithHap" });
