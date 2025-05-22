import { assert } from './asserts.js';


export function ev_prevent_default(ev: Event) {
    ev.preventDefault();
}

export function is_play_prevented(e: Event) {
    const source_el = e.target as HTMLElement;
    const listener_el = e.currentTarget as HTMLElement;
    const no_play_el = source_el.closest('[data-no-play]');
    const out = listener_el.contains(no_play_el);
    return out;
}

/**
 * @see https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
 */
export function is_mobile(): boolean {
    const re_1 = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i;
    const re_2 = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i;
    // @ts-expect-error uses deprecated properties
    const value: string = navigator.userAgent || navigator.vendor || window.opera;
    const out = re_1.test(value) || re_2.test(value.slice(0, 4));
    return out;
};

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

export function wait(seconds: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1000);
    });
}
