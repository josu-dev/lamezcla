import * as localquery from '$lib/client/db/index.js';
import * as Model from '$lib/models/youtube.js';
import { try_fetch } from '$lib/utils/fetch.js';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types.js';

export const ssr = false;

export const load: PageLoad = async ({ params, fetch }) => {
    const [
        playlist, entries
    ] = await Promise.all([
        localquery.select_playlist(params.playlist_id),
        localquery.select_playlist_entries(params.playlist_id)
    ]);
    if (playlist === undefined) {
        return error(404, `Playlist with id '${params.playlist_id}' no loaded`);
    }

    if (entries.length > 0) {
        return {
            playlist: playlist,
            entries: entries
        };
    }

    const r_items = await try_fetch({
        fetch: fetch,
        url: `/api/youtube/${playlist.channel_id}/playlists/${playlist.id}`,
        parse_json: true,
    });
    if (r_items.is_err) {
        console.error(r_items.error);
        error(r_items.error instanceof Response ? r_items.error.status : 500);
    }

    const items: Model.PlaylistItem[] = (r_items.value as any).data;
    await localquery.insert_playlists_items(items);

    const ids: string[] = [];
    for (const item of items) {
        ids.push(item.video_id);
    }
    const r_videos = await try_fetch({
        fetch: fetch,
        url: `/api/youtube/videos`,
        json: { ids: ids },
        parse_json: true,
    });
    if (r_videos.is_err) {
        console.error(r_videos.error);
        error(r_videos.error instanceof Response ? r_videos.error.status : 500);
    }

    const videos_compact: Model.VideoCompact[] = (r_videos.value as any).data;
    await localquery.insert_videos(videos_compact);

    const new_entries = await localquery.select_playlist_entries(playlist.id);

    return {
        playlist: playlist,
        entries: new_entries
    };
};
