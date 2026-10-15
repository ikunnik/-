# 碳足迹 · 全民绿色生活（碳积分与减排指南）

一款基于 **OpenHarmony / HarmonyOS（ArkTS + ArkUI）** 的**单机版**碳足迹记录应用。
通过量化日常低碳行为的减排贡献，结合碳积分激励，帮助用户养成绿色生活习惯，响应国家“碳达峰、碳中和”战略。

- 技术栈：ArkTS（严格模式）+ ArkUI（Stage 模型）
- 运行平台：HarmonyOS（API 26 / DevEco Studio 26）
- 数据存储：本地关系型数据库 `@kit.ArkData` relationalStore（**全程离线，不上传任何数据**）
- 第三方依赖：**零运行时三方库**（图表使用 Canvas 自绘，避免网络依赖）

---

## 一、核心功能

| 模块 | 说明 |
| --- | --- |
| 1. 低碳行为核算 | 手动录入**绿色出行 / 节水节电 / 旧物回收 / 光盘行动**四大类共 26 种行为，内置碳排放因子库，按“数量 × 因子”自动计算减排量（kgCO₂e）并累计个人碳足迹 |
| 2. 数据可视化看板 | Canvas 自绘**折线图 / 柱状图 / 环形图**，支持**日 / 周 / 月 / 年**切换；历史记录支持分类、时间筛选与按日分组 |
| 3. 碳积分激励体系 | 每日低碳任务（进度 + 领取）、积分流水、10 枚虚拟低碳徽章自动解锁、200 积分兑换 1 棵低碳树并生成电子证书 |
| 4. 双碳科普专栏 | 内置 10 篇图文科普（双碳政策 / 基础概念 / 减碳技巧），可分类浏览 |
| 5. 本地数据管理 | 一键 JSON 全量备份、低碳行为 / 积分流水 CSV 报表导出（系统保存选择器，可存到文件管理或电脑）、本地沙箱备份 |

### 内置规则
- 积分：每减排 **1 kgCO₂e = 10 积分**；首次记录额外奖励 20 分。
- 植树：**200 积分兑换 1 棵低碳树**，生成带编号的荣誉证书。
- 每日任务：每日 0 点重置，完成后手动领取积分。
- 徽章：根据累计减排、记录次数、连续天数、分类次数等自动解锁。

---

## 二、创新拓展功能（已预留接入位置，默认关闭）

代码位于 `entry/src/main/ets/features/`，各桩文件均含 `ENABLED = false` 开关与**详细接入步骤注释**，
随附《拓展功能实现思路.md》说明完整方案：

1. `features/terminal/SuperTerminal.ets` —— 超级终端多设备同步、家庭碳积分合并
2. `features/ai/BehaviorRecognizer.ets` —— 端侧 AI 图片智能识别低碳行为
3. `features/platform/CarbonInclusiveClient.ets` —— 模拟城市碳普惠接口、积分互通与权益兑换
4. `features/smart/SmartService.ets` —— 个性化任务推送、生活建议、成果社交分享

> 「我的」页底部设有“鸿蒙特色拓展（预留）”入口，接入时把对应 `ENABLED` 置为 `true` 并按注释补全即可。

---

## 三、目录结构

```
CarbonFootprint/
├─ build.ps1 / setup.ps1        # 命令行构建 / 依赖安装脚本
├─ AppScope/                    # 应用级配置与图标
└─ entry/src/main/
   ├─ module.json5
   ├─ resources/base/profile/main_pages.json   # 路由表
   └─ ets/
      ├─ entryability/EntryAbility.ets         # 入口：初始化数据库后加载首页
      ├─ common/
      │  ├─ model/Models.ets                   # 全部数据模型（class）
      │  ├─ constants/                         # 因子库 / 每日任务 / 徽章 / 科普文章 / 主题
      │  └─ utils/                             # 日期、计算、Toast、导出工具
      ├─ data/
      │  ├─ db/CarbonDb.ets                    # 数据库建表（6 张表）
      │  └─ repository/                        # 碳记录 / 积分 数据仓库（单例）
      ├─ view/components/                      # 通用组件 + Canvas 图表
      ├─ pages/                               # 13 个页面（5 个 Tab + 8 个路由页）
      └─ features/                            # 4 个拓展功能桩（默认关闭）
```

### 数据表
`carbon_records`（碳记录）、`point_records`（积分流水）、`task_records`（每日任务进度）、
`user_badges`（徽章）、`certificates`（植树证书）、`meta`（积分余额 / 昵称等键值）。

---

## 四、用 DevEco Studio 运行（推荐）

> ⚠️ **hvigor 强制工程路径只能包含英文字符。** 本工程位于 `D:\HarmonyProjects\CarbonFootprint`，
> **请直接用 DevEco Studio 打开该目录**，不要移动到含中文的路径（如 `C:\Users\坤坤\...`），否则会报
> `00306003 Invalid project path`。

1. 打开 **DevEco Studio**（本工程基于 26.0.0，API 26 / HarmonyOS 26.0.0）。
2. 菜单 `File → Open`，选择 `D:\HarmonyProjects\CarbonFootprint`。
3. 首次打开等待 **Sync**（自动执行 ohpm install，需联网；如失败可手动运行 `setup.ps1`）。
4. 运行设备：
   - **真机**：用数据线连接 HarmonyOS 手机，在 `File → Project Structure → Signing Configs`
     勾选 **Automatically generate signature（自动签名）**，登录华为账号后点 ▶ 运行。
   - **模拟器**：`Device Manager` 创建本地模拟器后运行。
5. 命令行构建（可选）：
   ```powershell
   .\build.ps1 debug
   ```
   产物：`entry/build/default/outputs/default/entry-default-unsigned.hap`（未签名，真机需在 IDE 配置签名）。

---

## 五、使用指引

1. 首页点选四大分类图标 → 选择具体低碳行为 → 输入数量 → 自动显示减排量与积分 → 保存。
2. 「看板」查看日/周/月/年趋势与分类占比；「历史」按分类/时间筛选、删除（删除自动回滚积分）。
3. 「任务」完成每日任务并领取积分；积分可在「植树证书」兑换、在「徽章墙」查看成就。
4. 「科普」学习双碳政策与减碳技巧；「我的 → 数据备份与导出」留存数据。
5. 数据保存在本机，卸载应用会清除，请定期导出 JSON 备份。

---

## 六、说明
- 排放因子为科普参考值，用于个人减排量估算，不代表官方核证口径，可在
  `common/constants/EmissionFactors.ets` 中按需更新。
- 本项目为竞赛单机版，未内置真实服务端；平台对接、分布式同步等能力为预留桩。
