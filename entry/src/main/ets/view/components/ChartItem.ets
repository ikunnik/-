/**
 * 图表通用数据项
 */
export class ChartItem {
  label: string;
  value: number;
  color: string;

  constructor(label: string, value: number, color: string) {
    this.label = label;
    this.value = value;
    this.color = color;
  }
}
