/**
 * 日期与时间区间工具
 */
export function pad(n: number): string {
    return n < 10 ? '0' + n : '' + n;
}
/** 格式化为 yyyy-MM-dd */
export function formatDate(d: Date): string {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
/** 格式化时间戳为 yyyy-MM-dd */
export function formatDateByMs(ms: number): string {
    return formatDate(new Date(ms));
}
/** 格式化为 MM-dd HH:mm */
export function formatDateTime(ms: number): string {
    const d = new Date(ms);
    return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}
export function todayStr(): string {
    return formatDate(new Date());
}
/** 当天 0 点 */
export function startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
/** 时间桶（用于趋势聚合） */
export class TimeBucket {
    label: string;
    startMs: number;
    endMs: number;
    key: string;
    constructor(label: string, startMs: number, endMs: number, key: string) {
        this.label = label;
        this.startMs = startMs;
        this.endMs = endMs;
        this.key = key;
    }
    contains(ms: number): boolean {
        return ms >= this.startMs && ms < this.endMs;
    }
}
/** 近 N 天，按天 */
function dayBuckets(count: number): Array<TimeBucket> {
    const list: Array<TimeBucket> = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
        let label = (d.getMonth() + 1) + '/' + d.getDate();
        if (i === 0) {
            label = '今天';
        }
        list.push(new TimeBucket(label, start.getTime(), end.getTime(), formatDate(d)));
    }
    return list;
}
/** 近 N 周，以周一为起点 */
function weekBuckets(count: number): Array<TimeBucket> {
    const list: Array<TimeBucket> = [];
    const now = new Date();
    const today = startOfDay(now);
    const dow = (today.getDay() + 6) % 7; // 周一为 0
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dow);
    for (let i = count - 1; i >= 0; i--) {
        const start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() - i * 7);
        const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
        const label = (start.getMonth() + 1) + '/' + start.getDate();
        list.push(new TimeBucket(label, start.getTime(), end.getTime(), formatDate(start)));
    }
    return list;
}
/** 近 N 个月，按月 */
function monthBuckets(count: number, withYear: boolean): Array<TimeBucket> {
    const list: Array<TimeBucket> = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        let label = (d.getMonth() + 1) + '月';
        if (withYear && d.getFullYear() !== now.getFullYear()) {
            label = (d.getFullYear() % 100) + '/' + (d.getMonth() + 1);
        }
        list.push(new TimeBucket(label, start.getTime(), end.getTime(), d.getFullYear() + '-' + pad(d.getMonth() + 1)));
    }
    return list;
}
/** 按时间维度生成趋势桶 */
export function getBuckets(range: string): Array<TimeBucket> {
    if (range === 'day') {
        return dayBuckets(7);
    }
    else if (range === 'week') {
        return weekBuckets(8);
    }
    else if (range === 'month') {
        return monthBuckets(6, false);
    }
    else {
        return monthBuckets(12, true);
    }
}
/** 依据有记录的日期集合（yyyy-MM-dd）计算连续打卡天数（今天未记录则从昨天起算） */
export function calcStreakDays(dayList: Array<string>): number {
    let streak = 0;
    const now = new Date();
    let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (!dayList.includes(formatDate(cursor))) {
        cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
    }
    while (dayList.includes(formatDate(cursor))) {
        streak++;
        cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
    }
    return streak;
}
