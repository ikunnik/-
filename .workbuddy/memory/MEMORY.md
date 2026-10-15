# 项目长期约定 · CarbonFootprint

## 技术栈
- **OpenHarmony** ArkTS（Stage 模型），runtimeOS = OpenHarmony，compileSdk/targetSdk = `"26.0.0"`，compatibleSdkVersion = `12`
- SDK 根目录：**`D:\openhongm`**（用户已装好的官方 OpenHarmony SDK，version 26.0.0.38 / metaVersion 3.0.2）。
  路径同时写在两处，**必须一致**，否则 IDE 报"版本值不正确"但命令行能构建成功（两套 SDK 各走各的）：
  - `local.properties` 的 `sdk.dir=D\:\\openhongm`
  - IDE 设置 `oh.sdk.location`：`C:\Users\坤坤\AppData\Roaming\Huawei\DevEcoStudio26.0\options\other.xml`
  结构为 `<sdkRoot>/26.0.0/<组件>` + `<sdkRoot>/licenses/`，**没有 `default` 层级**（官方模板即如此）。
- OpenHarmony SDK 无 `phone` 设备类型，`module.json5` 的 deviceTypes 用 `default`/`tablet`/`2in1`
- `hvigor-config.json5` 与 `oh-package.json5` 的 `modelVersion` 必须是 **6.0.0**（5.0.0 不支持字符串版本号 → 00303315）
- 本地库：`relationalStore`（`@kit.ArkData`），单例在 `data/db/CarbonDb.ets`
- UI：ArkUI 声明式，无状态管理框架，仅用 `AppStorage` 做跨页面刷新通知

## 跨页面刷新约定（第六轮重构后的最终方案）
**不要让 Tabs 深层子组件直接 `@StorageProp` + `@Watch` 监听 AppStorage——Tabs/TabContent 懒加载下 @Watch 不保证触发。**
正确架构：
```
二级页面保存成功 ─自增→ AppStorage.refreshTick
Index.onPageShow ─同步→ Index.@State tick
Index ─@Prop 直传→ HomePage/Dashboard/Tasks/Mine({ tick })
子页：@Prop @Watch('onTick') tick → reload()
```
- 子页签名统一：`@Prop @Watch('onTickChange') tick: number = 0;`
- `Index.onPageShow` 只在值变化时同步 tick（`cur !== this.tick`）
- Tabs `.onChange` 切页时自增 AppStorage 并同步 tick（保持切页即刷新）
- 子页 `reload()` 带 `reloading` 并发锁 + `ensureDb()` 兜底
- 写入方（RecordAddPage 保存、领任务奖励）仍自增 AppStorage.refreshTick

## 数据库约定
- `getStore()` 在 DB 未初始化时**抛异常**。Previewer 不执行 `EntryAbility`，所以所有取数入口都要先 `await ensureDb(getContext(this) as common.Context)`。
- **不要用事务**：`addPoints` / `claimTask` / `exchangeCertificate` 都刻意不用 `beginTrans()`。ArkData 异步事务与异步 SQL 混用易触发事务嵌套/状态残留，而这几处操作本身幂等（`setMeta` 是 upsert），不需要原子性。**别再加回去。**

## ArkTS 踩坑清单（血泪）
1. **调用不存在的方法不会编译报错**，只在运行时炸。写任何 API 前先查 SDK 声明：
   `C:/Program Files/Huawei/DevEco Studio/sdk/default/openharmony/ets/api/@ohos.data.relationalStore.d.ts` 等。
2. **`AppStorage` v1 没有 `has()` / `keys()`**（那是 v2 才有）。判断键存在只能用 `AppStorage.get(k) !== undefined`。
   v1 可用：`get` / `setOrCreate` / `delete` / `link` / `hasLink`。
3. **`@Builder` 方法不能带参数**。多处复用的布局内联展开，或抽成 `@Component`。
4. **`.key()` 接收 string**，传 number 报类型错误。
5. **`TransitionEffect.translate({x})` 接收 string**（`'36px'`），不能传数字。
6. **`.transition()` 依赖组件真实增删**，用 `.key()` 强刷不可靠。要动画就用 `@State` + `.animation()` 驱动。
7. **嵌套 `Stack { Column {} }` 注意闭合括号**，漏一个会报 `'}' expected` + `Cannot find name 'build'`。
8. **`rollback(txId)` 全小写**（异步版），`rollBack()` 大写 B（同步版）。SDK 里两个都有。
9. **已废弃 API 一律用组件级 UIContext 写法**（API 12+）：
   - `router.back/pushUrl/getParams` → `this.getUIContext().getRouter().xxx`
   - `getContext(this)` → `this.getUIContext().getHostContext()`
   - `promptAction.showToast/showDialog` → `this.getUIContext().getPromptAction().xxx`
   - `UIContext` 从 `@kit.ArkUI` 导出；**`common.UIAbilityContext` 上没有 `getPromptAction()`**。
   - 组件外的工具函数（如 `ToastUtil`）没有 `this`，需把 `UIContext` 作为参数传入。

## 编译警告的性质
- `COMPILE RESULT:FAIL {ERROR:0 WARN:282}` 里的 **WARN 不阻断 HAP 导出**，别当报错处理。
- 真正阻断命令行导出的是 `PackageHap` 的 `00308018 spawn java ENOENT`（终端无 JDK），与代码无关。
- `signingConfigs: []` 为空是正常的，签名由 DevEco Studio 自动签名管理。
- "Function may throw exceptions. Special handling is required." 是对 `@throws` API 调用的静态提示，
  集中在 data 层。**不要批量包 try/catch**——会把真实异常吞掉。属常态，不影响功能。

## 构建验证
```bash
cd D:/HarmonyProjects2/CarbonFootprint
DEVECO_SDK_HOME="C:/Program Files/Huawei/DevEco Studio/sdk" \
  "C:/Program Files/Huawei/DevEco Studio/tools/hvigor/bin/hvigorw.bat" \
  --mode module -p product=default assembleHap --no-daemon
```
- `DEVECO_SDK_HOME` 指向 **`.../sdk`（父目录）**，不是 `sdk/default`。
- **不要用反斜杠转义**，会被拼成 `C://Program Files//...` 导致找不到。
- 只看 `:entry:default@CompileArkTS ... Finished` 判断代码是否编译通过。
- `PackageHap` 阶段报 `00308018 spawn java ENOENT` 是命令行缺 JDK 的签名问题，**与代码无关**，忽略；在 DevEco Studio 里点 Run 会用内置 JDK 正常出包。
- 校验插图资源是否编译进去：`find entry/build -name "<资源名>*"`。资源名必须仅含小写字母/数字/下划线（AI 生图落地名是中文带时间戳，必须重命名）。

## 测试环境注意
- **Previewer（预览器）不支持数据库**，且不执行 `EntryAbility`。验证数据链路必须用真机或模拟器，否则会误判。
- 小减排量行为（如节约用水 50 升仅 0.045 kg）在首页会被 `toFixed` 舍入成 0.0，看起来像"没保存"。测试请用减排量大的行为（如节约用电 1 度 = 0.785 kg）。