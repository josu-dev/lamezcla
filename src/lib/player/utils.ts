import { assert, assert_exists } from '$lib/utils/index.js';


export function duration_to_seconds(duration: string): number {
    const res = duration.match('PT(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+)S)?');
    assert_exists(res, `duration is malformed '${duration}'`);

    let out = 0;
    const h = res[1];
    const m = res[2];
    const s = res[3];
    if (h) {
        out += 3600 * +h;
    }
    if (m) {
        out += 60 * +m;
    }
    if (s) {
        out += +s;
    }
    return out;
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

export function playlist_url(id: string) {
    return `https://www.youtube.com/playlist?list=${id}`;
}

export function channel_url(id: string) {
    return `https://www.youtube.com/channel/${id}`;
}
