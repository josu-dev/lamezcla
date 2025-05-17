import type { TryFetchError } from '$lib/utils/index.js';
import { throw_http_error } from '$lib/utils/index.js';


export function load_error(value: TryFetchError, msg: { [K: number]: string, other: string; }): never {
    if (value.type === 'response') {
        throw_http_error(value.value, msg[value.value.status] ?? msg.other);
    }
    throw_http_error(500, msg.other);
}
