import { db } from '$data/local/db/index.js';
import type { LayoutLoad } from './$types.js';


export const ssr = false;

export const load: LayoutLoad = async () => {
    const followed = await db.select_followed_entries();
    const pinned = await db.select_pinned_entries();

    return {
        followed: followed,
        pinned: pinned,
    };
};
