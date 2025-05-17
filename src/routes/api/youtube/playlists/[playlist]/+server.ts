import { youtube } from '$data/providers/youtube/server/index.js';
import { endpoint_error, endpoint_json } from '$lib/utils/index.js';
import type { RequestHandler } from './$types.js';


export const GET: RequestHandler = async ({ params }) => {
    const r = await youtube.get_playlist_items_all(params.playlist);
    if (r.is_err) {
        return endpoint_error(r.error.status);
    }

    const out = { data: r.value };
    return endpoint_json(200, out);
};
