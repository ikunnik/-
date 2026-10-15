if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface PieChart_Params {
    items?: Array<ChartItem>;
    settings?: RenderingContextSettings;
    context?: CanvasRenderingContext2D;
    cw?: number;
    ch?: number;
}
import type { ChartItem } from './ChartItem';
import { addRoundRectPath } from "@normalized:N&&&entry/src/main/ets/common/utils/CanvasUtil&";
export class PieChart extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__items = new SynchedPropertyObjectOneWayPU(params.items, this, "items");
        this.settings = new RenderingContextSettings(true);
        this.context = new CanvasRenderingContext2D(this.settings);
        this.__cw = new ObservedPropertySimplePU(340, this, "cw");
        this.ch = 170;
        this.setInitiallyProvidedValue(params);
        this.declareWatch("items", this.invalidate);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: PieChart_Params) {
        if (params.items === undefined) {
            this.__items.set([]);
        }
        if (params.settings !== undefined) {
            this.settings = params.settings;
        }
        if (params.context !== undefined) {
            this.context = params.context;
        }
        if (params.cw !== undefined) {
            this.cw = params.cw;
        }
        if (params.ch !== undefined) {
            this.ch = params.ch;
        }
    }
    updateStateVars(params: PieChart_Params) {
        this.__items.reset(params.items);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__items.purgeDependencyOnElmtId(rmElmtId);
        this.__cw.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__items.aboutToBeDeleted();
        this.__cw.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __items: SynchedPropertySimpleOneWayPU<Array<ChartItem>>;
    get items() {
        return this.__items.get();
    }
    set items(newValue: Array<ChartItem>) {
        this.__items.set(newValue);
    }
    private settings: RenderingContextSettings;
    private context: CanvasRenderingContext2D;
    private __cw: ObservedPropertySimplePU<number>;
    get cw() {
        return this.__cw.get();
    }
    set cw(newValue: number) {
        this.__cw.set(newValue);
    }
    private ch: number;
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
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Canvas.create(this.context);
            Canvas.debugLine("entry/src/main/ets/view/components/PieChart.ets(91:5)", "entry");
            Canvas.width('100%');
            Canvas.height(this.ch);
            Canvas.onReady(() => {
                this.draw();
            });
            Canvas.onAreaChange((oldValue: Area, newValue: Area) => {
                const w = Number(newValue.width);
                if (w > 0 && Math.abs(w - this.cw) > 1) {
                    this.cw = w;
                    this.draw();
                }
            });
        }, Canvas);
        Canvas.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
