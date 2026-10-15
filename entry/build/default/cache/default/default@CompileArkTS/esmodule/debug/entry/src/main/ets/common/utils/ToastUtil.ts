import type { UIContext } from "@ohos:arkui.UIContext";
/** 弹轻提示。uiContext 取自调用组件的 this.getUIContext() */
export function showToast(uiContext: UIContext, msg: string): void {
    try {
        uiContext.getPromptAction().showToast({
            message: msg,
            duration: 2200
        });
    }
    catch (e) {
    }
}
