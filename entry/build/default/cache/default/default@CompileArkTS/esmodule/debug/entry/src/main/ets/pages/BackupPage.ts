if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface BackupPage_Params {
    recordCount?: number;
    pointCount?: number;
    badgeCount?: number;
    certCount?: number;
    busy?: boolean;
    lastBackupPath?: string;
    context?: common.UIAbilityContext | null;
}
import type common from "@ohos:app.ability.common";
import { Theme } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import { carbonRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/CarbonRepository&";
import { pointsRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/PointsRepository&";
import { ExportUtil, SaveResult } from "@normalized:N&&&entry/src/main/ets/common/utils/ExportUtil&";
import { showToast } from "@normalized:N&&&entry/src/main/ets/common/utils/ToastUtil&";
class BackupPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__recordCount = new ObservedPropertySimplePU(0, this, "recordCount");
        this.__pointCount = new ObservedPropertySimplePU(0, this, "pointCount");
        this.__badgeCount = new ObservedPropertySimplePU(0, this, "badgeCount");
        this.__certCount = new ObservedPropertySimplePU(0, this, "certCount");
        this.__busy = new ObservedPropertySimplePU(false, this, "busy");
        this.__lastBackupPath = new ObservedPropertySimplePU('', this, "lastBackupPath");
        this.context = null;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: BackupPage_Params) {
        if (params.recordCount !== undefined) {
            this.recordCount = params.recordCount;
        }
        if (params.pointCount !== undefined) {
            this.pointCount = params.pointCount;
        }
        if (params.badgeCount !== undefined) {
            this.badgeCount = params.badgeCount;
        }
        if (params.certCount !== undefined) {
            this.certCount = params.certCount;
        }
        if (params.busy !== undefined) {
            this.busy = params.busy;
        }
        if (params.lastBackupPath !== undefined) {
            this.lastBackupPath = params.lastBackupPath;
        }
        if (params.context !== undefined) {
            this.context = params.context;
        }
    }
    updateStateVars(params: BackupPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__recordCount.purgeDependencyOnElmtId(rmElmtId);
        this.__pointCount.purgeDependencyOnElmtId(rmElmtId);
        this.__badgeCount.purgeDependencyOnElmtId(rmElmtId);
        this.__certCount.purgeDependencyOnElmtId(rmElmtId);
        this.__busy.purgeDependencyOnElmtId(rmElmtId);
        this.__lastBackupPath.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__recordCount.aboutToBeDeleted();
        this.__pointCount.aboutToBeDeleted();
        this.__badgeCount.aboutToBeDeleted();
        this.__certCount.aboutToBeDeleted();
        this.__busy.aboutToBeDeleted();
        this.__lastBackupPath.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __recordCount: ObservedPropertySimplePU<number>;
    get recordCount() {
        return this.__recordCount.get();
    }
    set recordCount(newValue: number) {
        this.__recordCount.set(newValue);
    }
    private __pointCount: ObservedPropertySimplePU<number>;
    get pointCount() {
        return this.__pointCount.get();
    }
    set pointCount(newValue: number) {
        this.__pointCount.set(newValue);
    }
    private __badgeCount: ObservedPropertySimplePU<number>;
    get badgeCount() {
        return this.__badgeCount.get();
    }
    set badgeCount(newValue: number) {
        this.__badgeCount.set(newValue);
    }
    private __certCount: ObservedPropertySimplePU<number>;
    get certCount() {
        return this.__certCount.get();
    }
    set certCount(newValue: number) {
        this.__certCount.set(newValue);
    }
    private __busy: ObservedPropertySimplePU<boolean>;
    get busy() {
        return this.__busy.get();
    }
    set busy(newValue: boolean) {
        this.__busy.set(newValue);
    }
    private __lastBackupPath: ObservedPropertySimplePU<string>;
    get lastBackupPath() {
        return this.__lastBackupPath.get();
    }
    set lastBackupPath(newValue: string) {
        this.__lastBackupPath.set(newValue);
    }
    private context: common.UIAbilityContext | null;
    async aboutToAppear(): Promise<void> {
        this.context = this.getUIContext().getHostContext() as common.UIAbilityContext;
        this.recordCount = (await carbonRepo.getAllRecords()).length;
        this.pointCount = (await pointsRepo.getAllPointRecords()).length;
        this.badgeCount = (await pointsRepo.getUnlockedBadges()).length;
        this.certCount = (await pointsRepo.getCertificates()).length;
    }
    private async handleResult(r: number, okMsg: string): Promise<void> {
        if (r === SaveResult.SUCCESS) {
            showToast(this.getUIContext(), okMsg);
        }
        else if (r === SaveResult.ERROR) {
            showToast(this.getUIContext(), '操作失败，请重试');
        }
    }
    async doAutoBackup(): Promise<void> {
        if (this.busy || this.context === null) {
            return;
        }
        this.busy = true;
        try {
            const path = await ExportUtil.autoBackupToSandbox(this.context);
            this.lastBackupPath = path;
            showToast(this.getUIContext(), '已在本地生成备份');
        }
        catch (e) {
            showToast(this.getUIContext(), '备份失败');
        }
        this.busy = false;
    }
    async doExportBackup(): Promise<void> {
        if (this.busy || this.context === null) {
            return;
        }
        this.busy = true;
        const r = await ExportUtil.exportBackup(this.context);
        await this.handleResult(r, '备份文件已保存');
        this.busy = false;
    }
    async doExportRecordsCsv(): Promise<void> {
        if (this.busy || this.context === null) {
            return;
        }
        this.busy = true;
        const r = await ExportUtil.exportRecordsCsv(this.context);
        await this.handleResult(r, '统计报表已保存');
        this.busy = false;
    }
    async doExportPointsCsv(): Promise<void> {
        if (this.busy || this.context === null) {
            return;
        }
        this.busy = true;
        const r = await ExportUtil.exportPointsCsv(this.context);
        await this.handleResult(r, '积分报表已保存');
        this.busy = false;
    }
    statItem(value: string, label: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(value);
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.PRIMARY);
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
    actionRow(icon: string, title: string, desc: string, action: () => void, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(12);
            Row.backgroundColor(Color.White);
            Row.borderRadius(14);
            Row.margin({ bottom: 10 });
            Row.onClick(action);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(icon);
            Text.fontSize(22);
            Text.width(42);
            Text.height(42);
            Text.textAlign(TextAlign.Center);
            Text.backgroundColor(Theme.PRIMARY_LIGHT);
            Text.borderRadius(21);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
            Column.margin({ left: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(title);
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(desc);
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('›');
            Text.fontSize(20);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
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
            Row.height(48);
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
            Text.create('数据备份与导出');
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
            // 数据概览
            Column.create();
            // 数据概览
            Column.width('100%');
            // 数据概览
            Column.padding(16);
            // 数据概览
            Column.backgroundColor(Color.White);
            // 数据概览
            Column.borderRadius(16);
            // 数据概览
            Column.margin({ left: 12, right: 12, top: 14 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('本地数据概览');
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width('100%');
            Text.margin({ bottom: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.statItem.bind(this)(String(this.recordCount), '低碳记录');
        this.statItem.bind(this)(String(this.pointCount), '积分流水');
        this.statItem.bind(this)(String(this.badgeCount), '徽章');
        this.statItem.bind(this)(String(this.certCount), '证书');
        Row.pop();
        // 数据概览
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('备份与导出');
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width('100%');
            Text.padding({ left: 16, top: 18, bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 12, right: 12 });
        }, Column);
        this.actionRow.bind(this)('💾', '本地快速备份', '在应用沙箱生成一份 JSON 备份', () => {
            this.doAutoBackup();
        });
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 12, right: 12 });
        }, Column);
        this.actionRow.bind(this)('📤', '导出 JSON 全量备份', '选择保存位置，含碳数据/积分/徽章/证书', () => {
            this.doExportBackup();
        });
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 12, right: 12 });
        }, Column);
        this.actionRow.bind(this)('📊', '导出低碳行为报表(CSV)', '可用 Excel 打开，便于统计分析', () => {
            this.doExportRecordsCsv();
        });
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 12, right: 12 });
        }, Column);
        this.actionRow.bind(this)('🧾', '导出积分流水报表(CSV)', '积分获取与兑换明细', () => {
            this.doExportPointsCsv();
        });
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.lastBackupPath !== '') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding(12);
                        Column.backgroundColor(Theme.PRIMARY_LIGHT);
                        Column.borderRadius(12);
                        Column.margin({ left: 12, right: 12 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('✅ 最近一次本地备份');
                        Text.fontSize(12);
                        Text.fontColor(Theme.TEXT_SUB);
                        Text.width('100%');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.lastBackupPath);
                        Text.fontSize(11);
                        Text.fontColor(Theme.TEXT_SUB);
                        Text.width('100%');
                        Text.margin({ top: 4 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(14);
            Column.backgroundColor(Color.White);
            Column.borderRadius(16);
            Column.margin({ left: 12, right: 12, top: 6, bottom: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('📌 数据说明');
            Text.fontSize(13);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width('100%');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('· 本应用为单机版，所有数据保存在本地数据库（carbon_footprint.db），不上传服务器。\n' +
                '· 建议定期导出 JSON 备份留存；卸载应用会清除本地数据。\n' +
                '· 从备份恢复、超级终端家庭同步等能力已预留接入位置，详见随附《拓展功能实现思路》。');
            Text.fontSize(12);
            Text.lineHeight(20);
            Text.fontColor(Theme.TEXT_SUB);
            Text.width('100%');
            Text.margin({ top: 8 });
        }, Text);
        Text.pop();
        Column.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "BackupPage";
    }
}
registerNamedRoute(() => new BackupPage(undefined, {}), "", { bundleName: "com.example.carbonfootprint", moduleName: "entry", pagePath: "pages/BackupPage", pageFullPath: "entry/src/main/ets/pages/BackupPage", integratedHsp: "false", moduleType: "followWithHap" });
