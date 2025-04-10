import * as apiquery from '$lib/client/api/index.js';
import * as localquery from '$lib/client/db/index.js';
import { throw_as_500 } from '$lib/utils/response.js';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types.js';

export const ssr = false;

export const load: PageLoad = async ({ params, fetch }) => {
    let [
        playlist, entries
    ] = await Promise.all([
        localquery.select_playlist(params.playlist_id),
        localquery.select_playlist_entries(params.playlist_id)
    ]);
    if (playlist === undefined) {
        const r_playlist = await apiquery.get_playlist(params.playlist_id, fetch);
        if (r_playlist.is_err) {
            throw_as_500(r_playlist, `Playlist with id '${params.playlist_id}' couldn't be loaded`);
        }

        playlist = r_playlist.value;
        await localquery.insert_playlists([playlist]);
    }

    if (entries.length > 0) {
        return {
            playlist: playlist,
            entries: entries
        };
    }

    const r = await apiquery.get_playlist_entries(params.playlist_id, fetch, playlist.channel_id);
    if (r.is_err) {
        throw_as_500(r);
    }

    const { items, compact_videos } = r.value;
    await Promise.all([
        localquery.insert_playlists_items(items),
        localquery.insert_videos(compact_videos),
    ]);
    entries = await localquery.select_playlist_entries(params.playlist_id);

    if (entries.length === 0) {
        error(400, `Playlist with '${params.playlist_id}' is empty`);
    }

    return {
        playlist: playlist,
        entries: entries
    };
};
