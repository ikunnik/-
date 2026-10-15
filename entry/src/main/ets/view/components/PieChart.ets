/**
 * 环形占比图（Canvas 自绘）+ 右侧图例，用于分类占比
 */
import { ChartItem } from './ChartItem';
import { addRoundRectPath } from '../../common/utils/CanvasUtil';

@Component
export struct PieChart {
  @Prop @Watch('invalidate') items: Array<ChartItem> = [];
  private settings: RenderingContextSettings = new RenderingContextSettings(true);
  private context: CanvasRenderingContext2D = new CanvasRenderingContext2D(this.settings);
  @State private cw: number = 340;
  private ch: number = 170;

  invalidate(): void {
    this.draw();
  }

  draw(): void {
    const ctx = this.context;
    const w = this.cw;
    const h = this.ch;
    ctx.clearRect(0, 0, w, h);
    const data = this.items;
    let total = 0;
    for (let i = 0; i < data.length; i++) {
      total += data[i].value;
    }
    if (total <= 0) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('暂无数据', w / 2, h / 2);
      return;
    }

    const cx = w * 0.28;
    const cy = h / 2;
    const r = Math.min(cx, h / 2) - 12;
    const innerR = r * 0.6;
    let start = -Math.PI / 2;

    for (let i = 0; i < data.length; i++) {
      if (data[i].value <= 0) {
        continue;
      }
      const ang = data[i].value / total * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, start + ang);
      ctx.arc(cx, cy, innerR, start + ang, start, true);
      ctx.closePath();
      ctx.fillStyle = data[i].color;
      ctx.fill();
      start += ang;
    }

    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toFixed(1), cx, cy - 6);
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '9px sans-serif';
    ctx.fillText('kgCO₂e', cx, cy + 12);

    const legendX = w * 0.54;
    const rowH = 24;
    let ly = (h - data.length * rowH) / 2;
    for (let i = 0; i < data.length; i++) {
      const pct = (data[i].value / total * 100).toFixed(0) + '%';
      ctx.fillStyle = data[i].color;
      ctx.beginPath();
      addRoundRectPath(ctx, legendX, ly, 11, 11, 3);
      ctx.fill();

      ctx.fillStyle = '#374151';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(data[i].label, legendX + 17, ly + 5);

      ctx.fillStyle = '#6B7280';
      ctx.textAlign = 'right';
      ctx.fillText(pct, w - 8, ly + 5);
      ly += rowH;
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
