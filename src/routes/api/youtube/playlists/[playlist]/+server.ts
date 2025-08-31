import { youtube } from '$data/providers/youtube/server/index.js';
import { endpoint_error, endpoint_json } from '$lib/utils/index.js';
import * as v from 'valibot';
import type { RequestHandler } from './$types.js';


const search_params_schema = v.object({
    page_token: v.optional(v.string()),
    page_count: v.optional(v.pipe(v.string(), v.transform((input) => parseInt(input, 10)), v.integer(), v.minValue(1), v.maxValue(10)))
});

export const GET: RequestHandler = async ({ params, url }) => {
    const rsp = v.safeParse(search_params_schema, {
        page_token: url.searchParams.get('page_token') ?? void 0,
        page_count: url.searchParams.get('page_count') ?? void 0,
    });
    if (!rsp.success) {
        return endpoint_error(400);
    }

    const r = await youtube.get_playlist_items(params.playlist, rsp.output.page_token, rsp.output.page_count ?? 2);
    if (r.is_err) {
        return endpoint_error(r.error.status);
    }

    const out = { data: r.value };
    return endpoint_json(200, out);
};
