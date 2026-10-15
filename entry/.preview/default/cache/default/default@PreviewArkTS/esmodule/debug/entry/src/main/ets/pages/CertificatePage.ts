if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface CertificatePage_Params {
    balance?: number;
    treeCount?: number;
    owner?: string;
    certs?: Array<Certificate>;
    exchangeNum?: number;
    nums?: Array<number>;
}
import { Theme, PointRule } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import type { Certificate } from '../common/model/Models';
import { pointsRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/PointsRepository&";
import { carbonRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/CarbonRepository&";
import { showToast } from "@normalized:N&&&entry/src/main/ets/common/utils/ToastUtil&";
import { EmptyView } from "@normalized:N&&&entry/src/main/ets/view/components/CommonUI&";
class CertificatePage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__balance = new ObservedPropertySimplePU(0, this, "balance");
        this.__treeCount = new ObservedPropertySimplePU(0, this, "treeCount");
        this.__owner = new ObservedPropertySimplePU('低碳行者', this, "owner");
        this.__certs = new ObservedPropertyObjectPU([], this, "certs");
        this.__exchangeNum = new ObservedPropertySimplePU(1, this, "exchangeNum");
        this.nums = [1, 3, 5, 10];
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: CertificatePage_Params) {
        if (params.balance !== undefined) {
            this.balance = params.balance;
        }
        if (params.treeCount !== undefined) {
            this.treeCount = params.treeCount;
        }
        if (params.owner !== undefined) {
            this.owner = params.owner;
        }
        if (params.certs !== undefined) {
            this.certs = params.certs;
        }
        if (params.exchangeNum !== undefined) {
            this.exchangeNum = params.exchangeNum;
        }
        if (params.nums !== undefined) {
            this.nums = params.nums;
        }
    }
    updateStateVars(params: CertificatePage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__balance.purgeDependencyOnElmtId(rmElmtId);
        this.__treeCount.purgeDependencyOnElmtId(rmElmtId);
        this.__owner.purgeDependencyOnElmtId(rmElmtId);
        this.__certs.purgeDependencyOnElmtId(rmElmtId);
        this.__exchangeNum.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__balance.aboutToBeDeleted();
        this.__treeCount.aboutToBeDeleted();
        this.__owner.aboutToBeDeleted();
        this.__certs.aboutToBeDeleted();
        this.__exchangeNum.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __balance: ObservedPropertySimplePU<number>;
    get balance() {
        return this.__balance.get();
    }
    set balance(newValue: number) {
        this.__balance.set(newValue);
    }
    private __treeCount: ObservedPropertySimplePU<number>;
    get treeCount() {
        return this.__treeCount.get();
    }
    set treeCount(newValue: number) {
        this.__treeCount.set(newValue);
    }
    private __owner: ObservedPropertySimplePU<string>;
    get owner() {
        return this.__owner.get();
    }
    set owner(newValue: string) {
        this.__owner.set(newValue);
    }
    private __certs: ObservedPropertyObjectPU<Array<Certificate>>;
    get certs() {
        return this.__certs.get();
    }
    set certs(newValue: Array<Certificate>) {
        this.__certs.set(newValue);
    }
    private __exchangeNum: ObservedPropertySimplePU<number>;
    get exchangeNum() {
        return this.__exchangeNum.get();
    }
    set exchangeNum(newValue: number) {
        this.__exchangeNum.set(newValue);
    }
    private nums: Array<number>;
    async aboutToAppear(): Promise<void> {
        await this.reload();
    }
    async reload(): Promise<void> {
        this.balance = await pointsRepo.getBalance();
        this.treeCount = await pointsRepo.getTreeCount();
        this.owner = await pointsRepo.getOwnerName();
        this.certs = await pointsRepo.getCertificates();
    }
    async exchange(): Promise<void> {
        const cost = this.exchangeNum * PointRule.POINTS_PER_TREE;
        if (this.balance < cost) {
            showToast(this.getUIContext(), '积分不足，继续记录低碳行为积攒积分吧');
            return;
        }
        const cert = await pointsRepo.exchangeCertificate(this.exchangeNum);
        if (cert !== null) {
            showToast(this.getUIContext(), '成功兑换 ' + this.exchangeNum + ' 棵低碳树！');
            await carbonRepo.refreshBadges();
            await this.reload();
            const cur = AppStorage.get<number>('refreshTick') ?? 0;
            AppStorage.setOrCreate('refreshTick', cur + 1);
        }
        else {
            showToast(this.getUIContext(), '兑换失败，积分不足');
        }
    }
    numChip(n: number, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(n + ' 棵');
            Text.debugLine("entry/src/main/ets/pages/CertificatePage.ets(49:5)", "entry");
            Text.fontSize(14);
            Text.layoutWeight(1);
            Text.height(38);
            Text.textAlign(TextAlign.Center);
            Text.borderRadius(19);
            Text.backgroundColor(this.exchangeNum === n ? Theme.PRIMARY : Color.White);
            Text.fontColor(this.exchangeNum === n ? Color.White : Theme.TEXT_SUB);
            Text.fontWeight(this.exchangeNum === n ? FontWeight.Bold : FontWeight.Normal);
            Text.onClick(() => {
                this.exchangeNum = n;
            });
        }, Text);
        Text.pop();
    }
    certificateCard(c: Certificate, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/CertificatePage.ets(65:5)", "entry");
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor('#F2FBF5');
            Column.borderRadius(16);
            Column.border({ width: 1.5, color: '#9BD8B6' });
            Column.margin({ bottom: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🌳 全民低碳植树荣誉证书');
            Text.debugLine("entry/src/main/ets/pages/CertificatePage.ets(66:7)", "entry");
            Text.fontSize(15);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#2E7D52');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/CertificatePage.ets(70:7)", "entry");
            Row.width('100%');
            Row.margin({ top: 14 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🌲');
            Text.debugLine("entry/src/main/ets/pages/CertificatePage.ets(71:9)", "entry");
            Text.fontSize(46);
            Text.margin({ right: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/CertificatePage.ets(74:9)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('持有人：' + c.owner);
            Text.debugLine("entry/src/main/ets/pages/CertificatePage.ets(75:11)", "entry");
            Text.fontSize(13);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('以低碳行动兑换 ' + c.treeCount + ' 棵低碳树');
            Text.debugLine("entry/src/main/ets/pages/CertificatePage.ets(78:11)", "entry");
            Text.fontSize(13);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('为应对气候变化贡献一份绿色力量');
            Text.debugLine("entry/src/main/ets/pages/CertificatePage.ets(82:11)", "entry");
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.debugLine("entry/src/main/ets/pages/CertificatePage.ets(92:7)", "entry");
            Divider.color('#CDEAD9');
            Divider.margin({ top: 12, bottom: 10 });
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/CertificatePage.ets(95:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('编号：' + c.code);
            Text.debugLine("entry/src/main/ets/pages/CertificatePage.ets(96:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(c.dateStr);
            Text.debugLine("entry/src/main/ets/pages/CertificatePage.ets(100:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/CertificatePage.ets(115:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(Theme.BG);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/CertificatePage.ets(116:7)", "entry");
            Row.width('100%');
            Row.height(48);
            Row.backgroundColor(Color.White);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.debugLine("entry/src/main/ets/pages/CertificatePage.ets(117:9)", "entry");
            Text.fontSize(28);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width(40);
            Text.onClick(() => {
                this.getUIContext().getRouter().back();
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('植树证书');
            Text.debugLine("entry/src/main/ets/pages/CertificatePage.ets(124:9)", "entry");
            Text.fontSize(17);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.layoutWeight(1);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('');
            Text.debugLine("entry/src/main/ets/pages/CertificatePage.ets(130:9)", "entry");
            Text.width(40);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/CertificatePage.ets(137:7)", "entry");
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Off);
            Scroll.align(Alignment.Top);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/CertificatePage.ets(138:9)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 兑换区
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/CertificatePage.ets(140:11)", "entry");
            // 兑换区
            Column.width('100%');
            // 兑换区
            Column.padding(16);
            // 兑换区
            Column.backgroundColor(Color.White);
            // 兑换区
            Column.borderRadius(16);
            // 兑换区
            Column.margin({ left: 12, right: 12, top: 14 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/CertificatePage.ets(141:13)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/CertificatePage.ets(142:15)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('我的积分');
            Text.debugLine("entry/src/main/ets/pages/CertificatePage.ets(143:17)", "entry");
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(String(this.balance));
            Text.debugLine("entry/src/main/ets/pages/CertificatePage.ets(146:17)", "entry");
            Text.fontSize(26);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.WARN);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/CertificatePage.ets(153:15)", "entry");
            Column.alignItems(HorizontalAlign.End);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('已种树');
            Text.debugLine("entry/src/main/ets/pages/CertificatePage.ets(154:17)", "entry");
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(String(this.treeCount) + ' 棵');
            Text.debugLine("entry/src/main/ets/pages/CertificatePage.ets(157:17)", "entry");
            Text.fontSize(26);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.PRIMARY);
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('选择兑换数量（每棵 ' + PointRule.POINTS_PER_TREE + ' 积分）');
            Text.debugLine("entry/src/main/ets/pages/CertificatePage.ets(166:13)", "entry");
            Text.fontSize(13);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width('100%');
            Text.margin({ top: 16, bottom: 10 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/CertificatePage.ets(171:13)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const n = _item;
                this.numChip.bind(this)(n);
            };
            this.forEachUpdateFunction(elmtId, this.nums, forEachItemGenFunction, (n: number) => String(n), false, false);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('🌳 兑换 ' + this.exchangeNum + ' 棵，消耗 ' +
                (this.exchangeNum * PointRule.POINTS_PER_TREE) + ' 积分');
            Button.debugLine("entry/src/main/ets/pages/CertificatePage.ets(178:13)", "entry");
            Button.width('100%');
            Button.height(46);
            Button.fontSize(15);
            Button.fontWeight(FontWeight.Bold);
            Button.backgroundColor(Theme.PRIMARY);
            Button.borderRadius(23);
            Button.margin({ top: 16 });
            Button.onClick(() => {
                this.exchange();
            });
        }, Button);
        Button.pop();
        // 兑换区
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 证书列表
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/CertificatePage.ets(198:11)", "entry");
            // 证书列表
            Row.width('100%');
            // 证书列表
            Row.padding({ left: 16, top: 16, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('我的证书');
            Text.debugLine("entry/src/main/ets/pages/CertificatePage.ets(199:13)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        // 证书列表
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.certs.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new EmptyView(this, { icon: '🌱', text: '还没有证书，用积分兑换第一棵树吧' }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/CertificatePage.ets", line: 208, col: 13 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        icon: '🌱',
                                        text: '还没有证书，用积分兑换第一棵树吧'
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    icon: '🌱', text: '还没有证书，用积分兑换第一棵树吧'
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
                        Column.debugLine("entry/src/main/ets/pages/CertificatePage.ets(210:13)", "entry");
                        Column.width('100%');
                        Column.padding({ left: 12, right: 12, bottom: 16 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const c = _item;
                            this.certificateCard.bind(this)(c);
                        };
                        this.forEachUpdateFunction(elmtId, this.certs, forEachItemGenFunction, (c: Certificate) => c.code, false, false);
                    }, ForEach);
                    ForEach.pop();
                    Column.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "CertificatePage";
    }
}
registerNamedRoute(() => new CertificatePage(undefined, {}), "", { bundleName: "com.example.carbonfootprint", moduleName: "entry", pagePath: "pages/CertificatePage", pageFullPath: "entry/src/main/ets/pages/CertificatePage", integratedHsp: "false", moduleType: "followWithHap" });
