import { youtube } from '$lib/provider/index.js';
import { response_error, response_json } from '$lib/utils/response.js';
import type { RequestHandler } from './$types';


export const GET: RequestHandler = async ({ params }) => {
    const r = await youtube.get_channel_playlists_all(params.channel);
    if (r.is_err) {
        console.error(r.error);
        return response_error(r.error.status);
    }

    const out = { data: r.value };
    return response_json(200, out);
};
