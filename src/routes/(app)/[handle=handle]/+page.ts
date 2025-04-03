import * as localquery from '$lib/client/db/index.js';
import * as Model from '$lib/models/youtube.js';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types.js';

export const ssr = false;

export const load: PageLoad = async ({ params, fetch }) => {
    const channel = await localquery.select_channel_by_handle(params.handle);
    if (channel === undefined) {
        return error(404, `Channel with handle '${params.handle}' no loaded`);
    }

    if (Date.now() - new Date(channel.updated_at).getTime() < 5 * 60 * 1000) {
        const playlists = await localquery.select_playlists_by_channel_id(channel.id);
        if (playlists === undefined) {
            console.log('broken');
            error(500);
        }

        if (playlists.length > 0) {
            return {
                channel: channel,
                playlists: playlists
            };
        }
    }

    const response = await fetch(`/api/youtube/${channel.id}/playlists`);
    if (!response.ok) {
        error(response.status);
    }

    const { data: playlists }: { data: Model.Playlist[]; } = await response.json();
    await localquery.insert_playlists(playlists);

    return {
        channel: channel,
        playlists: playlists,
    };
};
