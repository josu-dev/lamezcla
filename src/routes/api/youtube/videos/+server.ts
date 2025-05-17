import { youtube } from '$data/providers/youtube/server/index.js';
import { endpoint_error, endpoint_json, parse_request } from '$lib/utils/index.js';
import * as v from 'valibot';
import type { RequestHandler } from './$types';


const get_schema = v.object({
    ids: v.array(v.pipe(v.string(), v.nonEmpty()))
});

export const POST: RequestHandler = async ({ request }) => {
    const parsed = await parse_request(get_schema, request);
    if (!parsed.success) {
        return endpoint_error(400);
    }

    const ids = parsed.output.ids;
    const r = await youtube.get_videos(ids);
    if (r.is_err) {
        return endpoint_error(r.error.status);
    }

    const out = { data: r.value };
    return endpoint_json(200, out);
};
