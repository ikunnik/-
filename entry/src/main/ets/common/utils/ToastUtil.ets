/**
 * 全局轻提示
 *
 * 【为什么带 uiContext 参数】原先直接用全局 promptAction.showToast，
 * 但该 API 已废弃，需改用组件级 this.getUIContext().getPromptAction()。
 * 由于本函数在组件之外（无 this），由调用方把 UIContext 传进来。
 */
import { UIContext } from '@kit.ArkUI';

/** 弹轻提示。uiContext 取自调用组件的 this.getUIContext() */
export function showToast(uiContext: UIContext, msg: string): void {
  try {
    uiContext.getPromptAction().showToast({
      message: msg,
      duration: 2200
    });
  } catch (e) {
  }
}
