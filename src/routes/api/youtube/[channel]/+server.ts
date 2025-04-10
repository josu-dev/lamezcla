import { response_error, response_json } from '$lib/utils/response.js';
import { get_channel, get_channel_by_handle } from '$lib/youtube/index.js';
import type { RequestHandler } from './$types.js';


export const GET: RequestHandler = async ({ params }) => {
    let get: typeof get_channel;
    if (params.channel.startsWith('@')) {
        get = get_channel_by_handle;
    }
    else {
        get = get_channel;
    }

    const r = await get(params.channel);
    if (r.is_err) {
        console.error(r.error);
        return response_error(r.error.status);
    }

    const out = { data: r.value };
    return response_json(200, out);
};
