/**
 * 画布绘制工具
 */

/**
 * 向当前路径添加圆角矩形。
 * 替代 CanvasRenderingContext2D.roundRect（该 API 自 API 20 才提供，
 * 当前项目兼容版本为 API 12），改用 API 8 起即可用的 arcTo 手工构造圆角。
 */
export function addRoundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number,
                                 w: number, h: number, r: number): void {
  const radius: number = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
