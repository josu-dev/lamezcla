import * as localquery from '$lib/client/db/index.js';
import { error } from '@sveltejs/kit';

export const ssr = false;

export async function load({ url }) {
    const video_id = url.searchParams.get('v');
    const playlist_id = url.searchParams.get('l');

    if (playlist_id == null || playlist_id.length == 0) {
        error(400, `Malformed playlist id '${playlist_id}'`);
    }

    const [
        playlist, entries
    ] = await Promise.all([
        localquery.select_playlist(playlist_id),
        localquery.select_playlist_entries(playlist_id)
    ]);
    if (playlist === undefined || entries.length === 0) {
        return error(404, `Playlist with id '${playlist_id}' no loaded`);
    }

    return {
        playlist: playlist,
        entries: entries
    };
};
