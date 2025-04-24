import { youtube } from '$lib/provider/index.js';
import { endpoint_error, endpoint_json } from '$lib/utils/index.js';
import type { RequestHandler } from './$types.js';


export const GET: RequestHandler = async ({ params }) => {
    let get: typeof youtube.get_channel;
    if (params.channel.startsWith('@')) {
        get = youtube.get_channel_by_handle;
    }
    else {
        get = youtube.get_channel;
    }

    const r = await get(params.channel);
    if (r.is_err) {
        return endpoint_error(r.error.status);
    }
    if (r.value === undefined) {
        return endpoint_error(404);
    }

    const out = { data: r.value };
    return endpoint_json(200, out);
};
