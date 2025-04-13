import { youtube } from '$lib/provider/index.js';
import { response_error, response_json } from '$lib/utils/response.js';
import type { RequestHandler } from './$types.js';


export const GET: RequestHandler = async ({ params }) => {
    const r = await youtube.get_playlist_items_all(params.playlist);
    if (r.is_err) {
        console.error(r.error);
        return response_error(r.error.status);
    }

    const out = { data: r.value };
    return response_json(200, out);
};
