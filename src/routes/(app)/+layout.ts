import * as localdb from '$lib/client/db/index.js';
import type { LayoutLoad } from './$types.js';

export const ssr = false;

export const load: LayoutLoad = async () => {
    const channels = await localdb.select_channels();

    return {
        channels: channels,
    };
};
