import type AbilityConstant from "@ohos:app.ability.AbilityConstant";
import hilog from "@ohos:hilog";
import UIAbility from "@ohos:app.ability.UIAbility";
import type Want from "@ohos:app.ability.Want";
import type window from "@ohos:window";
import { initDb } from "@normalized:N&&&entry/src/main/ets/data/db/CarbonDb&";
import { familyRepo } from "@normalized:N&&&entry/src/main/ets/data/repository/FamilyRepository&";
const DOMAIN: number = 0x0000;
export default class EntryAbility extends UIAbility {
    onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
        hilog.info(DOMAIN, 'CarbonFootprint', '%{public}s', 'Ability onCreate');
    }
    onDestroy(): void {
        hilog.info(DOMAIN, 'CarbonFootprint', '%{public}s', 'Ability onDestroy');
    }
    onWindowStageCreate(windowStage: window.WindowStage): void {
        // 先初始化本地数据库，再加载首页，保证页面取数前数据库已就绪
        initDb(this.context).then(() => {
            windowStage.loadContent('pages/Index', (err) => {
                if (err.code) {
                    hilog.error(DOMAIN, 'CarbonFootprint', 'Load content failed: %{public}s', JSON.stringify(err));
                    return;
                }
                hilog.info(DOMAIN, 'CarbonFootprint', '%{public}s', 'Load content succeeded.');
            });
            // 页面加载后异步执行家庭设备自动同步，不阻塞首屏
            this.autoSyncFamily();
        }).catch((err: Error) => {
            hilog.error(DOMAIN, 'CarbonFootprint', 'Init DB failed: %{public}s', err.message);
            // 兜底：即使数据库异常也加载页面
            windowStage.loadContent('pages/Index', (): void => {
            });
        });
    }
    /** 启动后自动同步家人设备数据（受「启动时自动同步」开关控制） */
    private async autoSyncFamily(): Promise<void> {
        try {
            const n = await familyRepo.autoSyncOnLaunch();
            if (n > 0) {
                hilog.info(DOMAIN, 'CarbonFootprint', '%{public}s', 'Auto sync family devices: %{public}d', n);
                // 同步可能更新了家庭合并统计，通知各 Tab 页刷新
                const cur = AppStorage.get<number>('refreshTick') ?? 0;
                AppStorage.setOrCreate('refreshTick', cur + 1);
            }
        }
        catch (err) {
            const e = err as Error;
            hilog.error(DOMAIN, 'CarbonFootprint', 'Auto sync failed: %{public}s', e.message);
        }
    }
    onWindowStageDestroy(): void {
        hilog.info(DOMAIN, 'CarbonFootprint', '%{public}s', 'Ability onWindowStageDestroy');
    }
    onForeground(): void {
        hilog.info(DOMAIN, 'CarbonFootprint', '%{public}s', 'Ability onForeground');
    }
    onBackground(): void {
        hilog.info(DOMAIN, 'CarbonFootprint', '%{public}s', 'Ability onBackground');
    }
}
