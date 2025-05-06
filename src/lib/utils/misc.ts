import { assert } from './asserts.js';


export function is_play_prevented(e: Event) {
    const source_el = e.target as HTMLElement;
    const listener_el = e.currentTarget as HTMLElement;
    const no_play_el = source_el.closest('[data-no-play]');
    const out = listener_el.contains(no_play_el);
    return out;
}

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

export function seconds_to_human(value: number): string {
    const days = Math.floor(value / 86400);
    const hours = Math.floor((value % 86400) / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    const out =
        (days ? days + " d " : "") +
        (hours ? hours + " hr " : "") +
        (minutes ? minutes + " min " : "") +
        (seconds ? seconds + " sec" : "");

    return out;
}

export function uuidv4(): string {
    const out = crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint8Array(18)), b => b.toString(16).padStart(2, '0')).join('');
    return out;
}
