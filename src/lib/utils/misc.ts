import { assert } from './asserts.js';


export function noop() { }

export function now_utc() {
    return new Date().toISOString();
}

export function seconds_to_ddhhmmss(value: number): string {
    assert(!(isNaN(value) || value < 0 || !isFinite(value)), `value isn't seconds '${value}'`);

    const d = Math.floor(value / 86_400);
    const h = Math.floor((value % 86_400) / 3_600);
    const m = Math.floor((value % 3_600) / 60);
    const s = value % 60;

    if (d) {
        return d + (h < 10 ? ':0' : ':') + h + (m < 10 ? ':0' : ':') + m + (s < 10 ? ':0' : ':') + s;
    }
    if (h) {
        return h + (m < 10 ? ':0' : ':') + m + (s < 10 ? ':0' : ':') + s;
    }
    if (m) {
        return m + (s < 10 ? ':0' : ':') + s;
    }
    return s + '';
}

export function seconds_to_hhmmss(value: number): string {
    assert(!(isNaN(value) || value < 0 || !isFinite(value)), `value isn't seconds '${value}'`);

    const h = Math.floor(value / 3_600);
    const m = Math.floor((value % 3_600) / 60);
    const s = value % 60;

    if (h) {
        return h + (m < 10 ? ':0' : ':') + m + (s < 10 ? ':0' : ':') + s;
    }
    if (m) {
        return m + (s < 10 ? ':0' : ':') + s;
    }
    return s + '';
}

export function uuid() {
    return crypto.randomUUID();
}
