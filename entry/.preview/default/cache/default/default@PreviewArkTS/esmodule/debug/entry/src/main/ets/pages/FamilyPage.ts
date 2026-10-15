if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface FamilyPage_Params {
    totals?: Array<MemberTotal>;
    stats?: Array<CategoryStat>;
    members?: Array<FamilyMember>;
    totalReduction?: number;
    totalPoints?: number;
    memberCount?: number;
    syncing?: boolean;
    showAdd?: boolean;
    addName?: string;
    addRole?: string;
    autoSync?: boolean;
    lastSync?: number;
}
import { Theme, getCategoryMeta } from "@normalized:N&&&entry/src/main/ets/common/constants/AppConstants&";
import type { MemberTotal, CategoryStat, FamilyMember } from '../common/model/Models';
import { familyRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/FamilyRepository&";
import { showToast } from "@normalized:N&&&entry/src/main/ets/common/utils/ToastUtil&";
import { formatWeight } from "@normalized:N&&&entry/src/main/ets/common/utils/CalcUtil&";
class RoleOption {
    role: string;
    avatar: string;
    device: string;
    constructor(role: string, avatar: string, device: string) {
        this.role = role;
        this.avatar = avatar;
        this.device = device;
    }
}
const ROLE_OPTIONS: Array<RoleOption> = [
    new RoleOption('爸爸', '👨', 'HUAWEI Mate 手机'),
    new RoleOption('妈妈', '👩', 'HUAWEI MatePad 平板'),
    new RoleOption('孩子', '👧', 'HUAWEI WATCH 手表'),
    new RoleOption('家人', '👦', 'HUAWEI 手机')
];
class FamilyPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__totals = new ObservedPropertyObjectPU([], this, "totals");
        this.__stats = new ObservedPropertyObjectPU([], this, "stats");
        this.__members = new ObservedPropertyObjectPU([], this, "members");
        this.__totalReduction = new ObservedPropertySimplePU(0, this, "totalReduction");
        this.__totalPoints = new ObservedPropertySimplePU(0, this, "totalPoints");
        this.__memberCount = new ObservedPropertySimplePU(0, this, "memberCount");
        this.__syncing = new ObservedPropertySimplePU(false, this, "syncing");
        this.__showAdd = new ObservedPropertySimplePU(false, this, "showAdd");
        this.__addName = new ObservedPropertySimplePU('', this, "addName");
        this.__addRole = new ObservedPropertySimplePU('爸爸', this, "addRole");
        this.__autoSync = new ObservedPropertySimplePU(true, this, "autoSync");
        this.__lastSync = new ObservedPropertySimplePU(0, this, "lastSync");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: FamilyPage_Params) {
        if (params.totals !== undefined) {
            this.totals = params.totals;
        }
        if (params.stats !== undefined) {
            this.stats = params.stats;
        }
        if (params.members !== undefined) {
            this.members = params.members;
        }
        if (params.totalReduction !== undefined) {
            this.totalReduction = params.totalReduction;
        }
        if (params.totalPoints !== undefined) {
            this.totalPoints = params.totalPoints;
        }
        if (params.memberCount !== undefined) {
            this.memberCount = params.memberCount;
        }
        if (params.syncing !== undefined) {
            this.syncing = params.syncing;
        }
        if (params.showAdd !== undefined) {
            this.showAdd = params.showAdd;
        }
        if (params.addName !== undefined) {
            this.addName = params.addName;
        }
        if (params.addRole !== undefined) {
            this.addRole = params.addRole;
        }
        if (params.autoSync !== undefined) {
            this.autoSync = params.autoSync;
        }
        if (params.lastSync !== undefined) {
            this.lastSync = params.lastSync;
        }
    }
    updateStateVars(params: FamilyPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__totals.purgeDependencyOnElmtId(rmElmtId);
        this.__stats.purgeDependencyOnElmtId(rmElmtId);
        this.__members.purgeDependencyOnElmtId(rmElmtId);
        this.__totalReduction.purgeDependencyOnElmtId(rmElmtId);
        this.__totalPoints.purgeDependencyOnElmtId(rmElmtId);
        this.__memberCount.purgeDependencyOnElmtId(rmElmtId);
        this.__syncing.purgeDependencyOnElmtId(rmElmtId);
        this.__showAdd.purgeDependencyOnElmtId(rmElmtId);
        this.__addName.purgeDependencyOnElmtId(rmElmtId);
        this.__addRole.purgeDependencyOnElmtId(rmElmtId);
        this.__autoSync.purgeDependencyOnElmtId(rmElmtId);
        this.__lastSync.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__totals.aboutToBeDeleted();
        this.__stats.aboutToBeDeleted();
        this.__members.aboutToBeDeleted();
        this.__totalReduction.aboutToBeDeleted();
        this.__totalPoints.aboutToBeDeleted();
        this.__memberCount.aboutToBeDeleted();
        this.__syncing.aboutToBeDeleted();
        this.__showAdd.aboutToBeDeleted();
        this.__addName.aboutToBeDeleted();
        this.__addRole.aboutToBeDeleted();
        this.__autoSync.aboutToBeDeleted();
        this.__lastSync.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __totals: ObservedPropertyObjectPU<Array<MemberTotal>>;
    get totals() {
        return this.__totals.get();
    }
    set totals(newValue: Array<MemberTotal>) {
        this.__totals.set(newValue);
    }
    private __stats: ObservedPropertyObjectPU<Array<CategoryStat>>;
    get stats() {
        return this.__stats.get();
    }
    set stats(newValue: Array<CategoryStat>) {
        this.__stats.set(newValue);
    }
    private __members: ObservedPropertyObjectPU<Array<FamilyMember>>;
    get members() {
        return this.__members.get();
    }
    set members(newValue: Array<FamilyMember>) {
        this.__members.set(newValue);
    }
    private __totalReduction: ObservedPropertySimplePU<number>;
    get totalReduction() {
        return this.__totalReduction.get();
    }
    set totalReduction(newValue: number) {
        this.__totalReduction.set(newValue);
    }
    private __totalPoints: ObservedPropertySimplePU<number>;
    get totalPoints() {
        return this.__totalPoints.get();
    }
    set totalPoints(newValue: number) {
        this.__totalPoints.set(newValue);
    }
    private __memberCount: ObservedPropertySimplePU<number>;
    get memberCount() {
        return this.__memberCount.get();
    }
    set memberCount(newValue: number) {
        this.__memberCount.set(newValue);
    }
    private __syncing: ObservedPropertySimplePU<boolean>;
    get syncing() {
        return this.__syncing.get();
    }
    set syncing(newValue: boolean) {
        this.__syncing.set(newValue);
    }
    private __showAdd: ObservedPropertySimplePU<boolean>;
    get showAdd() {
        return this.__showAdd.get();
    }
    set showAdd(newValue: boolean) {
        this.__showAdd.set(newValue);
    }
    private __addName: ObservedPropertySimplePU<string>;
    get addName() {
        return this.__addName.get();
    }
    set addName(newValue: string) {
        this.__addName.set(newValue);
    }
    private __addRole: ObservedPropertySimplePU<string>;
    get addRole() {
        return this.__addRole.get();
    }
    set addRole(newValue: string) {
        this.__addRole.set(newValue);
    }
    private __autoSync: ObservedPropertySimplePU<boolean>;
    get autoSync() {
        return this.__autoSync.get();
    }
    set autoSync(newValue: boolean) {
        this.__autoSync.set(newValue);
    }
    private __lastSync: ObservedPropertySimplePU<number>;
    get lastSync() {
        return this.__lastSync.get();
    }
    set lastSync(newValue: number) {
        this.__lastSync.set(newValue);
    }
    async aboutToAppear(): Promise<void> {
        await familyRepo.ensureSeed();
        this.autoSync = await familyRepo.isAutoSyncEnabled();
        await this.reload();
    }
    onPageShow(): void {
        this.reload();
    }
    async reload(): Promise<void> {
        this.totals = await familyRepo.getMemberTotals();
        this.stats = await familyRepo.getFamilyCategoryStats();
        this.members = await familyRepo.getMembers();
        const all = await familyRepo.getFamilyTotals();
        this.totalReduction = all[0];
        this.totalPoints = all[1];
        this.memberCount = all[3];
        this.lastSync = await familyRepo.getLastSyncTime();
    }
    /** 最近同步时间的友好展示 */
    lastSyncText(): string {
        if (this.lastSync <= 0) {
            return '尚未同步';
        }
        const d = new Date(this.lastSync);
        const hh = d.getHours() < 10 ? '0' + d.getHours() : String(d.getHours());
        const mm = d.getMinutes() < 10 ? '0' + d.getMinutes() : String(d.getMinutes());
        return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + hh + ':' + mm;
    }
    /** 切换「启动自动同步」开关 */
    async toggleAutoSync(): Promise<void> {
        const next = !this.autoSync;
        this.autoSync = next;
        await familyRepo.setAutoSyncEnabled(next);
        showToast(this.getUIContext(), next ? '已开启启动自动同步' : '已关闭启动自动同步');
    }
    getMemberById(id: number): FamilyMember | null {
        for (let i = 0; i < this.members.length; i++) {
            if (this.members[i].id === id) {
                return this.members[i];
            }
        }
        return null;
    }
    async sync(): Promise<void> {
        if (this.syncing) {
            return;
        }
        this.syncing = true;
        // 模拟超级终端发现与同步的耗时
        setTimeout(async () => {
            const n = await familyRepo.discoverAndSync();
            await this.reload();
            this.syncing = false;
            showToast(this.getUIContext(), '已连接 ' + n + ' 台家人设备，数据同步完成');
        }, 900);
    }
    async doAddMember(): Promise<void> {
        const name = this.addName.trim();
        if (name === '') {
            showToast(this.getUIContext(), '请输入家人昵称');
            return;
        }
        let avatar = '👦';
        let device = 'HUAWEI 手机';
        for (let i = 0; i < ROLE_OPTIONS.length; i++) {
            if (ROLE_OPTIONS[i].role === this.addRole) {
                avatar = ROLE_OPTIONS[i].avatar;
                device = ROLE_OPTIONS[i].device;
            }
        }
        await familyRepo.addMember(name, avatar, this.addRole, device);
        this.showAdd = false;
        this.addName = '';
        await this.reload();
        showToast(this.getUIContext(), '已通过超级终端添加家庭成员：' + name);
    }
    async removeMember(m: MemberTotal): Promise<void> {
        const mem = this.getMemberById(m.memberId);
        if (mem === null) {
            return;
        }
        try {
            const res = await this.getUIContext().getPromptAction().showDialog({
                title: '移除家庭成员',
                message: '确定移除「' + m.name + '」及其同步数据吗？',
                buttons: [
                    { text: '取消', color: Theme.TEXT_SUB },
                    { text: '移除', color: Theme.DANGER }
                ]
            });
            if (res.index === 1) {
                await familyRepo.removeMember(m.memberId);
                await this.reload();
                showToast(this.getUIContext(), '已移除');
            }
        }
        catch (e) {
            // 弹窗或移除失败，忽略避免崩溃
        }
    }
    memberRow(m: MemberTotal, rank: number, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/FamilyPage.ets(152:5)", "entry");
            Row.width('100%');
            Row.padding({ top: 10, bottom: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.debugLine("entry/src/main/ets/pages/FamilyPage.ets(153:7)", "entry");
            Stack.width(50);
            Stack.height(50);
            Stack.margin({ right: 12 });
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(m.avatar);
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(154:9)", "entry");
            Text.fontSize(26);
            Text.width(50);
            Text.height(50);
            Text.textAlign(TextAlign.Center);
            Text.backgroundColor(m.isSelf ? Theme.PRIMARY_LIGHT : Theme.BG);
            Text.borderRadius(25);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(String(rank));
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(161:9)", "entry");
            Text.fontSize(10);
            Text.fontColor(Color.White);
            Text.backgroundColor(Theme.WARN);
            Text.width(18);
            Text.height(18);
            Text.textAlign(TextAlign.Center);
            Text.borderRadius(9);
            Text.position({ x: 34, y: 0 });
        }, Text);
        Text.pop();
        Stack.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FamilyPage.ets(175:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/FamilyPage.ets(176:9)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(m.name);
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(177:11)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (m.isSelf) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('本机');
                        Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(182:13)", "entry");
                        Text.fontSize(9);
                        Text.fontColor(Theme.PRIMARY);
                        Text.backgroundColor(Theme.PRIMARY_LIGHT);
                        Text.padding({ left: 5, right: 5, top: 1, bottom: 1 });
                        Text.borderRadius(6);
                        Text.margin({ left: 6 });
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.getMemberById(m.memberId) === null ? '当前设备' :
                (this.getMemberById(m.memberId)!.device +
                    (this.getMemberById(m.memberId)!.online ? ' · 已连接' : ' · 未连接')));
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(191:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 3 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FamilyPage.ets(201:7)", "entry");
            Column.alignItems(HorizontalAlign.End);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(formatWeight(m.reduction));
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(202:9)", "entry");
            Text.fontSize(15);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.PRIMARY);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(m.points + ' 积分 · ' + m.count + ' 次');
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(206:9)", "entry");
            Text.fontSize(10);
            Text.fontColor(Theme.TEXT_SUB);
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (!m.isSelf) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('🗑️');
                        Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(214:9)", "entry");
                        Text.fontSize(16);
                        Text.padding(8);
                        Text.onClick(() => {
                            this.removeMember(m);
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
    categoryBar(s: CategoryStat, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FamilyPage.ets(228:5)", "entry");
            Column.width('100%');
            Column.margin({ bottom: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/FamilyPage.ets(229:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(getCategoryMeta(s.category).icon);
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(230:9)", "entry");
            Text.fontSize(16);
            Text.margin({ right: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(getCategoryMeta(s.category).name);
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(233:9)", "entry");
            Text.fontSize(13);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(formatWeight(s.reduction));
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(237:9)", "entry");
            Text.fontSize(13);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(getCategoryMeta(s.category).color);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create({ alignContent: Alignment.Start });
            Stack.debugLine("entry/src/main/ets/pages/FamilyPage.ets(243:7)", "entry");
            Stack.width('100%');
            Stack.margin({ top: 6 });
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FamilyPage.ets(244:9)", "entry");
            Column.width('100%');
            Column.height(8);
            Column.backgroundColor(Theme.BG);
            Column.borderRadius(4);
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FamilyPage.ets(249:9)", "entry");
            Column.width(this.totalReduction <= 0 ? '0%' :
                (s.reduction / this.totalReduction * 100).toFixed(1) + '%');
            Column.height(8);
            Column.backgroundColor(getCategoryMeta(s.category).color);
            Column.borderRadius(4);
        }, Column);
        Column.pop();
        Stack.pop();
        Column.pop();
    }
    addDialog(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FamilyPage.ets(265:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#80000000');
            Column.justifyContent(FlexAlign.Center);
            Column.onClick(() => {
                this.showAdd = false;
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FamilyPage.ets(266:7)", "entry");
            Column.width('84%');
            Column.padding(22);
            Column.backgroundColor(Color.White);
            Column.borderRadius(18);
            Column.onClick(() => {
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('添加家庭成员');
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(267:9)", "entry");
            Text.fontSize(17);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.margin({ bottom: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.addName, placeholder: '家人昵称，如：爸爸' });
            TextInput.debugLine("entry/src/main/ets/pages/FamilyPage.ets(272:9)", "entry");
            TextInput.width('100%');
            TextInput.height(44);
            TextInput.backgroundColor(Theme.BG);
            TextInput.borderRadius(12);
            TextInput.onChange((v: string) => {
                this.addName = v;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/FamilyPage.ets(280:9)", "entry");
            Row.width('100%');
            Row.margin({ top: 14 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const opt = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(opt.avatar + ' ' + opt.role);
                    Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(282:13)", "entry");
                    Text.fontSize(13);
                    Text.padding({ left: 10, right: 10, top: 7, bottom: 7 });
                    Text.borderRadius(16);
                    Text.backgroundColor(this.addRole === opt.role ? Theme.PRIMARY : Theme.BG);
                    Text.fontColor(this.addRole === opt.role ? Color.White : Theme.TEXT_SUB);
                    Text.margin({ right: 8 });
                    Text.onClick(() => {
                        this.addRole = opt.role;
                    });
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, ROLE_OPTIONS, forEachItemGenFunction, (opt: RoleOption) => opt.role, false, false);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/FamilyPage.ets(296:9)", "entry");
            Row.width('100%');
            Row.margin({ top: 20 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('取消');
            Button.debugLine("entry/src/main/ets/pages/FamilyPage.ets(297:11)", "entry");
            Button.layoutWeight(1);
            Button.height(40);
            Button.backgroundColor(Theme.BG);
            Button.fontColor(Theme.TEXT_SUB);
            Button.onClick(() => {
                this.showAdd = false;
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('📡 连接并添加');
            Button.debugLine("entry/src/main/ets/pages/FamilyPage.ets(305:11)", "entry");
            Button.layoutWeight(1);
            Button.height(40);
            Button.backgroundColor(Theme.PRIMARY);
            Button.margin({ left: 12 });
            Button.onClick(() => {
                this.doAddMember();
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
        Column.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.debugLine("entry/src/main/ets/pages/FamilyPage.ets(334:5)", "entry");
            Stack.width('100%');
            Stack.height('100%');
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FamilyPage.ets(335:7)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(Theme.BG);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部导航
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/FamilyPage.ets(337:9)", "entry");
            // 顶部导航
            Row.width('100%');
            // 顶部导航
            Row.height(48);
            // 顶部导航
            Row.padding({ left: 8, right: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(338:11)", "entry");
            Text.fontSize(28);
            Text.fontColor(Color.White);
            Text.width(40);
            Text.onClick(() => {
                this.getUIContext().getRouter().back();
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('家庭空间 · 超级终端');
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(345:11)", "entry");
            Text.fontSize(17);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
            Text.layoutWeight(1);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('＋');
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(351:11)", "entry");
            Text.fontSize(24);
            Text.fontColor(Color.White);
            Text.width(40);
            Text.textAlign(TextAlign.Center);
            Text.onClick(() => {
                this.addName = '';
                this.showAdd = true;
            });
        }, Text);
        Text.pop();
        // 顶部导航
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/FamilyPage.ets(365:9)", "entry");
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Off);
            Scroll.align(Alignment.Top);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FamilyPage.ets(366:11)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 家庭总览
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FamilyPage.ets(368:13)", "entry");
            // 家庭总览
            Column.width('100%');
            // 家庭总览
            Column.padding(18);
            // 家庭总览
            Column.alignItems(HorizontalAlign.Start);
            // 家庭总览
            Column.linearGradient({ angle: 135, colors: [['#26996B', 0.0], ['#3FCB8C', 1.0]] });
            // 家庭总览
            Column.borderRadius({ bottomLeft: 24, bottomRight: 24 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/FamilyPage.ets(369:15)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🏡 家庭低碳总览');
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(370:17)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('共 ' + this.memberCount + ' 位成员');
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(375:17)", "entry");
            Text.fontSize(12);
            Text.fontColor('#E6FFF4');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/FamilyPage.ets(380:15)", "entry");
            Row.width('100%');
            Row.margin({ top: 16 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FamilyPage.ets(381:17)", "entry");
            Column.layoutWeight(1);
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(formatWeight(this.totalReduction));
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(382:19)", "entry");
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('家庭累计减排');
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(386:19)", "entry");
            Text.fontSize(11);
            Text.fontColor('#E6FFF4');
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FamilyPage.ets(393:17)", "entry");
            Column.layoutWeight(1);
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(String(this.totalPoints));
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(394:19)", "entry");
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('家庭碳积分');
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(398:19)", "entry");
            Text.fontSize(11);
            Text.fontColor('#E6FFF4');
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.syncing ? '正在同步家人设备…' : '📡 超级终端一键同步');
            Button.debugLine("entry/src/main/ets/pages/FamilyPage.ets(409:15)", "entry");
            Button.width('100%');
            Button.height(44);
            Button.fontSize(15);
            Button.fontWeight(FontWeight.Bold);
            Button.backgroundColor(Color.White);
            Button.fontColor(Theme.PRIMARY);
            Button.borderRadius(22);
            Button.margin({ top: 18 });
            Button.enabled(!this.syncing);
            Button.onClick(() => {
                this.sync();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 启动自动同步开关
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/FamilyPage.ets(424:15)", "entry");
            // 启动自动同步开关
            Row.width('100%');
            // 启动自动同步开关
            Row.padding({ top: 10, bottom: 10, left: 12, right: 12 });
            // 启动自动同步开关
            Row.backgroundColor('#1F8F62');
            // 启动自动同步开关
            Row.borderRadius(14);
            // 启动自动同步开关
            Row.margin({ top: 10 });
            // 启动自动同步开关
            Row.onClick(() => {
                this.toggleAutoSync();
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.autoSync ? '🔄' : '⏸️');
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(425:17)", "entry");
            Text.fontSize(16);
            Text.margin({ right: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FamilyPage.ets(428:17)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('启动时自动同步');
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(429:19)", "entry");
            Text.fontSize(13);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Theme.PRIMARY);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('上次同步：' + this.lastSyncText());
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(433:19)", "entry");
            Text.fontSize(11);
            Text.fontColor('#DFF6EA');
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.autoSync ? '已开启' : '已关闭');
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(440:17)", "entry");
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
            Text.backgroundColor(this.autoSync ? Theme.PRIMARY : '#8AB8A2');
            Text.padding({ left: 10, right: 10, top: 4, bottom: 4 });
            Text.borderRadius(12);
        }, Text);
        Text.pop();
        // 启动自动同步开关
        Row.pop();
        // 家庭总览
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 成员减排排行
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FamilyPage.ets(464:13)", "entry");
            // 成员减排排行
            Column.width('100%');
            // 成员减排排行
            Column.padding(14);
            // 成员减排排行
            Column.backgroundColor(Color.White);
            // 成员减排排行
            Column.borderRadius(16);
            // 成员减排排行
            Column.margin({ left: 12, right: 12, top: 14 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/FamilyPage.ets(465:15)", "entry");
            Row.width('100%');
            Row.margin({ bottom: 6 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('👨‍👩‍👧‍👦 家庭成员减排排行');
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(466:17)", "entry");
            Text.fontSize(15);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, index?: number) => {
                const m = _item;
                this.memberRow.bind(this)(m, (index === undefined ? 0 : index) + 1);
            };
            this.forEachUpdateFunction(elmtId, this.totals, forEachItemGenFunction, (m: MemberTotal) => String(m.memberId), true, false);
        }, ForEach);
        ForEach.pop();
        // 成员减排排行
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 家庭分类占比
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FamilyPage.ets(484:13)", "entry");
            // 家庭分类占比
            Column.width('100%');
            // 家庭分类占比
            Column.padding(14);
            // 家庭分类占比
            Column.backgroundColor(Color.White);
            // 家庭分类占比
            Column.borderRadius(16);
            // 家庭分类占比
            Column.margin({ left: 12, right: 12, top: 14 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('家庭分类减排构成');
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(485:15)", "entry");
            Text.fontSize(15);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width('100%');
            Text.margin({ bottom: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const s = _item;
                this.categoryBar.bind(this)(s);
            };
            this.forEachUpdateFunction(elmtId, this.stats, forEachItemGenFunction, (s: CategoryStat) => s.category, false, false);
        }, ForEach);
        ForEach.pop();
        // 家庭分类占比
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 真机接入说明
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/FamilyPage.ets(502:13)", "entry");
            // 真机接入说明
            Column.width('100%');
            // 真机接入说明
            Column.padding(14);
            // 真机接入说明
            Column.backgroundColor(Color.White);
            // 真机接入说明
            Column.borderRadius(16);
            // 真机接入说明
            Column.margin({ left: 12, right: 12, top: 14, bottom: 20 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🔗 真机多设备同步（接入点已预留）');
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(503:15)", "entry");
            Text.fontSize(13);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Theme.TEXT_MAIN);
            Text.width('100%');
            Text.margin({ bottom: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('当前为单机模拟模式。在登录同一华为账号、完成分布式组网的多台设备上，可通过 @kit.DistributedServiceKit 的 deviceManager 发现可信设备，并用 @kit.ArkData 的 distributedKVStore / distributedDataObject 同步各设备减排数据，家庭合并统计逻辑无需改动。');
            Text.debugLine("entry/src/main/ets/pages/FamilyPage.ets(509:15)", "entry");
            Text.fontSize(12);
            Text.fontColor(Theme.TEXT_SUB);
            Text.lineHeight(19);
            Text.width('100%');
        }, Text);
        Text.pop();
        // 真机接入说明
        Column.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.showAdd) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.addDialog.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Stack.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "FamilyPage";
    }
}
registerNamedRoute(() => new FamilyPage(undefined, {}), "", { bundleName: "com.example.carbonfootprint", moduleName: "entry", pagePath: "pages/FamilyPage", pageFullPath: "entry/src/main/ets/pages/FamilyPage", integratedHsp: "false", moduleType: "followWithHap" });
