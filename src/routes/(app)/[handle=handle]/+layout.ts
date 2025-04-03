import * as localquery from '$lib/client/db/index.js';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types.js';

export const ssr = false;

export const load: LayoutLoad = async ({ params, fetch }) => {
    const channels = await localquery.select_channels();
    if (channels.length === 0) {
        return error(404, `No channels loaded`);
    }

    return {
        channels: channels
    };
};
