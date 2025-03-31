import { assert_exists } from '$lib/utils.js';


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

export function duration_to_mmss(duration: string): string {
    const res = duration.match('PT(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+)S)?');
    assert_exists(res, `duration is malformed '${duration}'`);

    let out = '';
    const h = res[1];
    const m = res[2];
    const s = res[3];
    if (h) {
        out += h + ':';
    }
    if (m) {
        out += m + ':';
    }
    if (s) {
        out += s.padStart(2, '0');
    }
    else if (m) {
        out += "00";
    }
    return out;
}

export function playlist_url(id: string) {
    return `https://www.youtube.com/playlist?list=${id}`;
}

export function channel_url(id:string) {
    return `https://www.youtube.com/channel/${id}`
}
