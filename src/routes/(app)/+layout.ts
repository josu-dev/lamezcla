import { localdb } from '$client/data/query/index.js';
import type { LayoutLoad } from './$types.js';


export const ssr = false;

export const load: LayoutLoad = async () => {
    const followed = await localdb.select_followed_entries();
    const pinned = await localdb.select_pinned_entries();

    return {
        followed: followed,
        pinned: pinned,
    };
};
