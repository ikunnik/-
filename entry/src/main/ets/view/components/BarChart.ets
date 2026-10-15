/**
 * 柱状对比图（Canvas 自绘），用于各分类减排量对比
 */
import { ChartItem } from './ChartItem';
import { addRoundRectPath } from '../../common/utils/CanvasUtil';

@Component
export struct BarChart {
  @Prop @Watch('invalidate') items: Array<ChartItem> = [];
  private settings: RenderingContextSettings = new RenderingContextSettings(true);
  private context: CanvasRenderingContext2D = new CanvasRenderingContext2D(this.settings);
  @State private cw: number = 340;
  private ch: number = 200;

  invalidate(): void {
    this.draw();
  }

  draw(): void {
    const ctx = this.context;
    const w = this.cw;
    const h = this.ch;
    ctx.clearRect(0, 0, w, h);
    const data = this.items;
    if (data.length === 0) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('暂无数据', w / 2, h / 2);
      return;
    }
    let maxV = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].value > maxV) {
        maxV = data[i].value;
      }
    }
    if (maxV <= 0) {
      maxV = 1;
    }
    const padL: number = 12;
    const padR: number = 12;
    const padT: number = 22;
    const padB: number = 26;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const band = plotW / data.length;
    const barW = band * 0.46;

    ctx.strokeStyle = '#EEF1EF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(w - padR, padT);
    ctx.moveTo(padL, padT + plotH);
    ctx.lineTo(w - padR, padT + plotH);
    ctx.stroke();

    for (let i = 0; i < data.length; i++) {
      const cx = padL + band * i + band / 2;
      const barH = plotH * (data[i].value / maxV);
      const x = cx - barW / 2;
      const y = padT + plotH - barH;
      ctx.fillStyle = data[i].color;
      ctx.beginPath();
      addRoundRectPath(ctx, x, y, barW, Math.max(barH, 2), 4);
      ctx.fill();

      ctx.fillStyle = '#374151';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(data[i].value > 0 ? data[i].value.toFixed(1) : '0', cx, y - 3);

      ctx.fillStyle = '#6B7280';
      ctx.font = '10px sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(data[i].label, cx, padT + plotH + 6);
    }
  }

  build() {
    Canvas(this.context)
      .width('100%')
      .height(this.ch)
      .onReady(() => {
        this.draw();
      })
      .onAreaChange((oldValue: Area, newValue: Area) => {
        const w = Number(newValue.width);
        if (w > 0 && Math.abs(w - this.cw) > 1) {
          this.cw = w;
          this.draw();
        }
      })
  }
}
