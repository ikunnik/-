if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface BarChart_Params {
    items?: Array<ChartItem>;
    settings?: RenderingContextSettings;
    context?: CanvasRenderingContext2D;
    cw?: number;
    ch?: number;
}
import type { ChartItem } from './ChartItem';
import { addRoundRectPath } from "@normalized:N&&&entry/src/main/ets/common/utils/CanvasUtil&";
export class BarChart extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__items = new SynchedPropertyObjectOneWayPU(params.items, this, "items");
        this.settings = new RenderingContextSettings(true);
        this.context = new CanvasRenderingContext2D(this.settings);
        this.__cw = new ObservedPropertySimplePU(340, this, "cw");
        this.ch = 200;
        this.setInitiallyProvidedValue(params);
        this.declareWatch("items", this.invalidate);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: BarChart_Params) {
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
    updateStateVars(params: BarChart_Params) {
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
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Canvas.create(this.context);
            Canvas.debugLine("entry/src/main/ets/view/components/BarChart.ets(84:5)", "entry");
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
