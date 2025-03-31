import { dev } from '$app/environment';
import { YOUTUBE_HANDLE } from '$env/static/private';
import { read_json, save_json } from '$lib/server/utils.js';
import type { Preview } from '$lib/server/yt/index.js';
import { get_preview } from '$lib/server/yt/index.js';


export async function load() {
    let value: Preview;
    if (dev) {
        value = await read_json(
            import.meta.url.replace('+page.server.ts', 'channel.json').replace('file:///', ''),
        );
    }
    else {
        value = await get_preview(YOUTUBE_HANDLE);
        if (dev) {
            await save_json(
                import.meta.url.replace('+page.server.ts', 'channel.json').replace('file:///', ''),
                value
            );
        }
    }

    return {
        preview: value,
    };
};
