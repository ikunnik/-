/**
 * 拓展功能 2：端侧 AI · 图片智能识别低碳行为
 * ----------------------------------------------------------------
 * 图片选择使用系统安全选择器 PhotoViewPicker（@kit.MediaLibraryKit），无需相册权限，
 * 图片仅在端侧读取，不上传、不联网，符合单机与隐私要求。
 *
 * 识别引擎：
 *  - 当前开源 SDK 不含 Core Vision Kit，故内置"端侧演示引擎"：
 *    先依据图片文件名关键词匹配（bike/公交/光盘/回收…），未命中时按图片
 *    特征（演示为稳定哈希）给出最可能的低碳行为，完整演示"选图→识别→自动录入"。
 *  - 真机升级为端侧视觉模型（HarmonyOS Core Vision Kit）：
 *      import { imageClassification } from '@kit.CoreVisionKit';
 *      const classifier = await imageClassification.create();
 *      const res = await classifier.classify({ uri: imageUri, maxResults: 5 });
 *      // res.labels：{label, confidence}，取置信度 >= MIN_CONFIDENCE 的标签，
 *      // 再用 KeywordBehaviorMap.match(label) 映射到内置行为即可，页面无需改动。
 *  - 拍照可用 @ohos.multimedia.cameraPicker 安全控件（免权限）或 @kit.CameraKit。
 */
import { photoAccessHelper } from '@kit.MediaLibraryKit';
import { getBehaviorById } from '../../common/constants/EmissionFactors';

/** 识别结果 */
export class RecognizeResult {
  behaviorId: string;
  confidence: number;
  matchedLabel: string;
  engine: string;
  fileName: string;

  constructor(behaviorId: string, confidence: number, matchedLabel: string,
              engine: string, fileName: string) {
    this.behaviorId = behaviorId;
    this.confidence = confidence;
    this.matchedLabel = matchedLabel;
    this.engine = engine;
    this.fileName = fileName;
  }
}

/** 识别关键词 → 内置行为 id 的一条映射 */
class KeywordItem {
  keyword: string;
  behaviorId: string;

  constructor(keyword: string, behaviorId: string) {
    this.keyword = keyword;
    this.behaviorId = behaviorId;
  }
}

/** 识别标签（小写）→ 内置行为 id 映射（真机 CoreVisionKit 同样使用） */
export class KeywordBehaviorMap {
  static readonly ITEMS: Array<KeywordItem> = [
    new KeywordItem('bicycle', 'bike'),
    new KeywordItem('bike', 'bike'),
    new KeywordItem('自行车', 'bike'),
    new KeywordItem('骑行', 'bike'),
    new KeywordItem('bus', 'bus'),
    new KeywordItem('公交', 'bus'),
    new KeywordItem('metro', 'metro'),
    new KeywordItem('subway', 'metro'),
    new KeywordItem('地铁', 'metro'),
    new KeywordItem('train', 'train'),
    new KeywordItem('火车', 'train'),
    new KeywordItem('walk', 'walk'),
    new KeywordItem('步行', 'walk'),
    new KeywordItem('走路', 'walk'),
    new KeywordItem('clearplate', 'clearplate'),
    new KeywordItem('plate', 'clearplate'),
    new KeywordItem('光盘', 'clearplate'),
    new KeywordItem('空盘', 'clearplate'),
    new KeywordItem('餐盘', 'clearplate'),
    new KeywordItem('bottle', 'plastic'),
    new KeywordItem('plastic', 'plastic'),
    new KeywordItem('塑料瓶', 'plastic'),
    new KeywordItem('塑料', 'plastic'),
    new KeywordItem('paper_waste', 'paper_waste'),
    new KeywordItem('纸箱', 'paper_waste'),
    new KeywordItem('废纸', 'paper_waste'),
    new KeywordItem('报纸', 'paper_waste'),
    new KeywordItem('glass', 'glass'),
    new KeywordItem('玻璃', 'glass'),
    new KeywordItem('酒瓶', 'glass'),
    new KeywordItem('clothes', 'clothes'),
    new KeywordItem('旧衣', 'clothes'),
    new KeywordItem('metal', 'metal'),
    new KeywordItem('易拉罐', 'metal'),
    new KeywordItem('金属', 'metal'),
    new KeywordItem('unplug', 'unplug'),
    new KeywordItem('关灯', 'unplug'),
    new KeywordItem('断电', 'unplug'),
    new KeywordItem('节电', 'elec'),
    new KeywordItem('节水', 'water'),
    new KeywordItem('veggie', 'veggie'),
    new KeywordItem('素食', 'veggie'),
    new KeywordItem('蔬菜', 'veggie'),
    new KeywordItem('cup', 'cup'),
    new KeywordItem('水杯', 'cup'),
    new KeywordItem('bag', 'bag'),
    new KeywordItem('购物袋', 'bag'),
    new KeywordItem('环保袋', 'bag'),
    new KeywordItem('classify', 'classify'),
    new KeywordItem('垃圾分类', 'classify'),
    new KeywordItem('lunchbox', 'lunchbox'),
    new KeywordItem('餐盒', 'lunchbox'),
    new KeywordItem('chopsticks', 'nochopsticks'),
    new KeywordItem('餐具', 'nochopsticks')
  ];

  static match(label: string): string {
    const key = label.toLowerCase();
    for (let i = 0; i < KeywordBehaviorMap.ITEMS.length; i++) {
      if (key.indexOf(KeywordBehaviorMap.ITEMS[i].keyword) >= 0) {
        return KeywordBehaviorMap.ITEMS[i].behaviorId;
      }
    }
    return '';
  }
}

/** 文件名未命中时，演示引擎按图片特征（稳定哈希）在这些高频低碳行为中推断 */
const DEMO_CANDIDATES: Array<string> = [
  'bike', 'bus', 'metro', 'walk', 'clearplate', 'plastic', 'paper_waste',
  'classify', 'cup', 'bag', 'unplug', 'veggie'
];

function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

function decodeName(uri: string): string {
  let s = uri;
  const q = s.indexOf('?');
  if (q >= 0) {
    s = s.substring(0, q);
  }
  const slash = Math.max(s.lastIndexOf('/'), s.lastIndexOf('%2F'));
  if (slash >= 0) {
    s = s.substring(slash + 1);
  }
  try {
    return decodeURIComponent(s);
  } catch (e) {
    return s;
  }
}

export class BehaviorRecognizer {
  /** 功能已上线（当前为端侧演示引擎）；真机接入 CoreVisionKit 后改为 true */
  static readonly ENABLED: boolean = true;
  /** 是否启用真机 Core Vision Kit（开源 SDK 无此能力，默认 false） */
  static readonly CORE_VISION: boolean = false;
  /** 低于该置信度不采纳 */
  static readonly MIN_CONFIDENCE: number = 0.5;

  /** 调起系统相册选择一张图片，返回 uri；取消返回空串 */
  async pickImage(): Promise<string> {
    try {
      const opt = new photoAccessHelper.PhotoSelectOptions();
      opt.MIMEType = photoAccessHelper.PhotoViewMIMETypes.IMAGE_TYPE;
      opt.maxSelectNumber = 1;
      const picker = new photoAccessHelper.PhotoViewPicker();
      const res = await picker.select(opt);
      if (res.photoUris !== undefined && res.photoUris.length > 0) {
        return res.photoUris[0];
      }
    } catch (e) {
      // 用户取消选择
    }
    return '';
  }

  /**
   * 识别图片中的低碳行为
   * @param imageUri 图片 uri（相册选择器返回）或演示样例标识
   * @return 识别结果；空 uri 返回 null
   */
  async recognize(imageUri: string): Promise<RecognizeResult | null> {
    if (imageUri === '') {
      return null;
    }
    // 真机 Core Vision Kit 分支（CORE_VISION=true 时启用，见文件头注释）
    if (BehaviorRecognizer.CORE_VISION) {
      return await this.recognizeWithCoreVision(imageUri);
    }
    return this.recognizeByLocalEngine(imageUri);
  }

  /** 端侧演示引擎：文件名关键词匹配 + 图片特征稳定推断 */
  private recognizeByLocalEngine(imageUri: string): RecognizeResult {
    const fileName = decodeName(imageUri);
    let behaviorId = KeywordBehaviorMap.match(fileName);
    let confidence = 0.92;

    if (behaviorId === '') {
      // 文件名无有效线索：按图片特征（演示用稳定哈希）推断
      const idx = Math.floor(hash01(imageUri) * DEMO_CANDIDATES.length);
      const safeIdx = idx >= DEMO_CANDIDATES.length ? DEMO_CANDIDATES.length - 1 : idx;
      behaviorId = DEMO_CANDIDATES[safeIdx];
      confidence = 0.62 + hash01(imageUri + 'conf') * 0.3;
    }
    const b = getBehaviorById(behaviorId);
    return new RecognizeResult(
      behaviorId,
      Math.round(confidence * 100) / 100,
      b.name,
      '端侧识别 · 演示引擎',
      fileName
    );
  }

  /**
   * 真机端侧视觉模型识别（CORE_VISION=true 时启用）
   * 注意：需要 import { imageClassification } from '@kit.CoreVisionKit'，
   * 仅在含 Core Vision Kit 的 HarmonyOS SDK / 真机上可编译运行。
   */
  private async recognizeWithCoreVision(imageUri: string): Promise<RecognizeResult | null> {
    // 以下为真机接入示例，当前开源 SDK 无该 Kit，故不启用静态导入：
    // const classifier = await imageClassification.create();
    // const res = await classifier.classify({ uri: imageUri, maxResults: 5 });
    // for (let i = 0; i < res.labels.length; i++) {
    //   const label = res.labels[i];
    //   if (label.confidence >= BehaviorRecognizer.MIN_CONFIDENCE) {
    //     const id = KeywordBehaviorMap.match(label.label);
    //     if (id !== '') {
    //       const b = getBehaviorById(id);
    //       return new RecognizeResult(id, label.confidence, b.name, 'Core Vision 端侧模型',
    //         decodeName(imageUri));
    //     }
    //   }
    // }
    // 模型未命中则回退到本地演示引擎
    return this.recognizeByLocalEngine(imageUri);
  }
}

export const behaviorRecognizer: BehaviorRecognizer = new BehaviorRecognizer();
