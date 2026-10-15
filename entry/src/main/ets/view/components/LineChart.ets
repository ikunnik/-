/**
 * 折线趋势图（Canvas 自绘，无三方依赖）
 */
import { ChartItem } from './ChartItem';

@Component
export struct LineChart {
  @Prop @Watch('invalidate') items: Array<ChartItem> = [];
  private settings: RenderingContextSettings = new RenderingContextSettings(true);
  private context: CanvasRenderingContext2D = new CanvasRenderingContext2D(this.settings);
  @State private cw: number = 340;
  private ch: number = 180;

  invalidate(): void {
    this.draw();
  }

  drawEmpty(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('暂无数据，快去记录低碳行为吧', w / 2, h / 2);
  }

  draw(): void {
    const ctx = this.context;
    const w = this.cw;
    const h = this.ch;
    ctx.clearRect(0, 0, w, h);
    const data = this.items;
    if (data.length === 0) {
      this.drawEmpty(ctx, w, h);
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
    const padL: number = 36;
    const padR: number = 12;
    const padT: number = 18;
    const padB: number = 24;
    const plotW: number = w - padL - padR;
    const plotH: number = h - padT - padB;
    const xAt = (i: number): number => {
      if (data.length === 1) {
        return padL + plotW / 2;
      }
      return padL + plotW * i / (data.length - 1);
    };
    const yAt = (v: number): number => {
      return padT + plotH * (1 - v / maxV);
    };

    ctx.strokeStyle = '#EEF1EF';
    ctx.fillStyle = '#9CA3AF';
    ctx.lineWidth = 1;
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let g = 0; g <= 4; g++) {
      const v = maxV * g / 4;
      const y = yAt(v);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();
      ctx.fillText(v.toFixed(g === 4 ? 0 : 1), padL - 4, y);
    }

    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(data[0].value));
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(xAt(i), yAt(data[i].value));
    }
    ctx.lineTo(xAt(data.length - 1), padT + plotH);
    ctx.lineTo(xAt(0), padT + plotH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
    grad.addColorStop(0, 'rgba(46,158,107,0.28)');
    grad.addColorStop(1, 'rgba(46,158,107,0.02)');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(data[0].value));
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(xAt(i), yAt(data[i].value));
    }
    ctx.strokeStyle = '#2E9E6B';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#2E9E6B';
    for (let i = 0; i < data.length; i++) {
      ctx.beginPath();
      ctx.arc(xAt(i), yAt(data[i].value), 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const step = data.length > 8 ? 2 : 1;
    for (let i = 0; i < data.length; i++) {
      if (i % step === 0 || i === data.length - 1) {
        ctx.fillText(data[i].label, xAt(i), padT + plotH + 6);
      }
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
