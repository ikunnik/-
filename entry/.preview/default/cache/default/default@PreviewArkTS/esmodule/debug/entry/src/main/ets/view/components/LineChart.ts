if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface LineChart_Params {
    items?: Array<ChartItem>;
    settings?: RenderingContextSettings;
    context?: CanvasRenderingContext2D;
    cw?: number;
    ch?: number;
}
import type { ChartItem } from './ChartItem';
export class LineChart extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__items = new SynchedPropertyObjectOneWayPU(params.items, this, "items");
        this.settings = new RenderingContextSettings(true);
        this.context = new CanvasRenderingContext2D(this.settings);
        this.__cw = new ObservedPropertySimplePU(340, this, "cw");
        this.ch = 180;
        this.setInitiallyProvidedValue(params);
        this.declareWatch("items", this.invalidate);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: LineChart_Params) {
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
    updateStateVars(params: LineChart_Params) {
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
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Canvas.create(this.context);
            Canvas.debugLine("entry/src/main/ets/view/components/LineChart.ets(120:5)", "entry");
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
