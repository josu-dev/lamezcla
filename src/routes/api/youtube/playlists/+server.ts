import { parse_json, response_error, response_json } from '$lib/utils/response.js';
import { get_playlists } from '$lib/youtube/index.js';
import * as v from 'valibot';
import type { RequestHandler } from './$types';


const get_schema = v.object({
    ids: v.array(v.pipe(v.string(), v.nonEmpty()))
});

export const POST: RequestHandler = async ({ request }) => {
    const parsed = await parse_json(get_schema, request);
    if (!parsed.success) {
        return response_error(400);
    }

    const ids = parsed.output.ids;
    const r = await get_playlists(ids);
    if (r.is_err) {
        console.error(r.error);
        return response_error(r.error.status);
    }

    const out = { data: r.value };
    return response_json(200, out);
};
