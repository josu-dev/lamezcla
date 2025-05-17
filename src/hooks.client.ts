import * as db from '$data/local/db/index.js';
import type { ClientInit } from '@sveltejs/kit';


export const init: ClientInit = async () => {
    await db.init();
};
