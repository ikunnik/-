/**
 * 拓展功能 3：城市碳普惠平台对接（模拟）· 积分互通与权益兑换
 * ----------------------------------------------------------------
 * 当前为【本地 Mock 模式】：权益目录与"网络"结果由本地生成，不发起真实请求，
 * 可完整演示"积分上报同步 → 碳币互通 → 权益商城兑换 → 生成兑换码"。
 * 本地持久化（订单、平台余额）在 data/repository/PlatformRepository.ets。
 *
 * 真机对接城市碳普惠平台：
 * 1. 权限：module.json5 申请 ohos.permission.INTERNET。
 * 2. 网络：@kit.NetworkKit 的 http.createHttp()，
 *    GET  /carbon/account          查询平台账户与碳币余额
 *    POST /carbon/points/sync      上报积分（带本地记录 uuid+日期做幂等）
 *    GET  /carbon/benefits         权益目录
 *    POST /carbon/benefits/order   权益兑换，返回核销码
 * 3. 口径：本应用 1 kgCO₂e = 10 积分；按平台汇率换算"碳币"（本演示按 1:1）。
 * 4. 安全：HTTPS + 应用签名校验 / 令牌（AccessToken）；密钥放服务端，不入包。
 */

/** 可兑换的平台权益 */
export class Benefit {
  id: string;
  name: string;
  points: number;
  desc: string;
  icon: string;

  constructor(id: string, name: string, points: number, desc: string, icon: string) {
    this.id = id;
    this.name = name;
    this.points = points;
    this.desc = desc;
    this.icon = icon;
  }
}

/** 接口调用结果 */
export class ApiResult {
  success: boolean;
  message: string;

  constructor(success: boolean, message: string) {
    this.success = success;
    this.message = message;
  }
}

export class CarbonInclusiveClient {
  /** 功能已上线（本地 Mock 模式）；真机接入改为 'remote' */
  static readonly ENABLED: boolean = true;
  static readonly MODE: string = 'mock';
  /** 平台服务地址（真机替换为城市碳普惠平台地址） */
  baseUrl: string = 'https://carbon-service.example.gov.cn';

  /** 权益目录（真机由 GET /carbon/benefits 返回） */
  async listBenefits(): Promise<Array<Benefit>> {
    const list: Array<Benefit> = [
      new Benefit('b1', '公交地铁乘车券', 500, '兑换 1 张 2 元公共交通乘车券', '🚌'),
      new Benefit('b2', '公园门票折扣', 800, '城市公园门票立减 10 元', '🏞️'),
      new Benefit('b3', '共享骑行月卡', 1200, '共享单车 30 天骑行月卡', '🚲'),
      new Benefit('b4', '充电服务优惠券', 900, '新能源充电 10 元抵扣券', '🔋'),
      new Benefit('b5', '环保周边礼包', 2000, '帆布袋、绿植、环保餐具套装', '🎁'),
      new Benefit('b6', '绿色超市券', 1500, '绿色有机食品专区 20 元券', '🛒'),
      new Benefit('b7', '公益植树认养', 3000, '认养 1 棵树并获电子证书', '🌳'),
      new Benefit('b8', '碳普惠纪念徽章', 300, '城市低碳达人电子纪念徽章', '🏅')
    ];
    return list;
  }

  /** 模拟平台接口处理耗时（真机由网络耗时决定） */
  async mockDelay(ms: number): Promise<void> {
    return new Promise((resolve: () => void) => {
      setTimeout(resolve, ms);
    });
  }
}

export const carbonInclusiveClient: CarbonInclusiveClient = new CarbonInclusiveClient();
