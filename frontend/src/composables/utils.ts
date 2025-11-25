import dayjs from 'dayjs';
import type {RGBAColor} from "@/composables/types";
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export function getComponentInstance(): ComponentInstance {
    return getCurrentInstance()!.proxy as ComponentInstance;
}

export function isEmptyString(str: string): boolean {
    return !str.trim().length;
}

export function genId(): string {
    return crypto.randomUUID();
}

export async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Не удалось скопировать текст в буфер обмена:', err);
        return false;
    }
}

export const timeout = (delay: number = 0) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

export function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function stringToTimestamp(timestamp: string) {
    return dayjs.utc(timestamp).local().valueOf();
}

export function stringToTimestampUTC(timestamp: string) {
    return dayjs.utc(timestamp).valueOf();
}


export function timestampToString(timestamp: number): string {
    return dayjs(timestamp).format("YYYY-MM-DDTHH:mm:ss.SSSSSS");
}

function _hexToFloat(color: string, position: number, brightness: number) {
    return parseFloat(Math.max(0,
        Math.min(1, parseInt(color.substring(position, position + 2), 16) / 255 * brightness)
    ).toFixed(2));
}

export function hexToRGBA(hex: string, alpha?: number, brightness: number = 1): RGBAColor {
    const r = _hexToFloat(hex, 1, brightness);
    const g = _hexToFloat(hex, 3, brightness);
    const b = _hexToFloat(hex, 5, brightness);
    let a = alpha == null ? _hexToFloat(hex, 7, 1) : alpha;
    isNaN(a) && (a = 1);
    return {r, g, b, a};
}

const _floatToHex = (color: number) => Math.round(Math.max(0, Math.min(255, color * 255)))
    .toString(16)
    .toUpperCase();

export function rgbaToHex(rgba: RGBAColor): string;
export function rgbaToHex(r: number, g: number, b: number, a: number): string;
export function rgbaToHex(r: any, g?: number, b?: number, a?: number): string {
    if (typeof r === 'object') {
        g = r.g;
        b = r.b;
        a = r.a;
        r = r.r;
    }
    return '#' + _floatToHex(r!) + _floatToHex(g!) + _floatToHex(b!) + _floatToHex(a!);
}

export function hexToRgbaString(hex: string, alpha?: number): string {
    const {r, g, b, a} = hexToRGBA(hex, alpha);
    return `rgba(${r * 255},${g * 255},${b * 255},${a})`;
}

const _mixColor = (c1: number, c2: number, percent: number): number => {
    return c1 + (c2 - c1) * percent;
};

export function mixColors(color1: string, color2: string, percent: number): string {
    const c1 = hexToRGBA(color1);
    const c2 = hexToRGBA(color2);
    const r = _mixColor(c1.r, c2.r, percent);
    const g = _mixColor(c1.g, c2.g, percent);
    const b = _mixColor(c1.b, c2.b, percent);
    return rgbaToHex(r, g, b, 1);
}

export function getContrastColor(hexColor) {
    hexColor = hexColor.replace('#', '');
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
}

export function getStartOfDay(date: number): number {
    const startOfDayUtc = dayjs.utc(date).startOf('day');
    return startOfDayUtc.valueOf();
}

export function loadImage(filename: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
        const image = new Image();
        image.src = filename;
        image.onload = () => {
            resolve(image);
        }
    });
}

export function bindAll(obj: Record<string, any>) {
    for (let k in obj) {
        typeof obj[k] == 'function' && (obj[k].bind(obj));
    }
    return obj;
}

export function deepAssign(
    target: {},
    path: string,
    value: any,
    changeFirstPathElementTo?: string,
) {
    const pathArray = path.split('.');
    if (pathArray.length) {
        changeFirstPathElementTo && (pathArray[0] = changeFirstPathElementTo);
        while (pathArray.length) {
            const prop = pathArray.shift();
            if (pathArray.length) {
                !target[prop] && (target[prop] = {});
                target = target[prop];
            } else {
                target[prop] = value;
            }
        }
    }
}

export function firstLetterUpperCase(s: string) {
    return s[0].toUpperCase() + s.substring(1).toLowerCase();
}

export const formatTime = (time: number) => {
    return dayjs(time * 1000).format("DD.MM.YYYY HH:mm");
}

export const formatDate = (time: number) => {
    return dayjs(time * 1000).format("DD.MM.YYYY");
}

export function jsonCopy(val: any) {
    return JSON.parse(JSON.stringify(val));
}
