import { db } from '$data/local/db/index.js';
import type { Model } from '$data/models/index.js';
import { load_error } from '$data/providers/utils.js';
import { youtube } from '$data/providers/youtube/client/index.js';
import type { PageLoad } from './$types.js';


export const load: PageLoad = async ({ params, fetch }) => {
    let [
        playlist, entries
    ] = await Promise.all([
        db.select_playlist_by_id(params.playlist_id),
        db.select_playlist_entries_by_id(params.playlist_id)
    ]);
    let save_playlist = false;
    if (playlist === undefined) {
        const r = await youtube.get_playlist(params.playlist_id, fetch);
        if (r.is_err) {
            load_error(r.error, {
                404: `Playlist with id '${params.playlist_id}' not found`,
                other: `Playlist with id '${params.playlist_id}' couldn't be loaded`
            });
        }

        playlist = r.value;
        save_playlist = true;
    }

    let channel = await db.select_channel_by_id(playlist.channel_id);
    let save_channel = false;
    if (channel === undefined) {
        const r = await youtube.get_channel(playlist.channel_id, fetch);
        if (r.is_err) {
            load_error(r.error, {
                404: `Channel with id '${playlist.channel_id}' not found`,
                other: `Channel with id '${playlist.channel_id}' couldn't be loaded`
            });
        }

        channel = r.value;
        save_channel = true;
    }

    if (channel.tag === 'y' && playlist.tag === 'y' && (channel.v > playlist.v || entries.length === 0 || save_playlist)) {
        if (channel.v > playlist.v) {
            playlist.v = channel.v;
            save_playlist = true;
        }

        const r = await youtube.get_playlist_entries(params.playlist_id, fetch);
        if (r.is_err) {
            load_error(r.error, {
                404: `Items of playlist with id '${params.playlist_id}' couldn't be loaded`,
                other: `Items of playlist with id '${params.playlist_id}' couldn't be loaded`
            });
        }

        const { items, videos } = r.value;
        const items_ids: Set<string> = new Set();
        for (const item of items) {
            items_ids.add(item.id);
        }
        const items_to_delete: string[] = [];
        for (const e of entries) {
            if (items_ids.has(e.item.id)) {
                continue;
            }

            items_to_delete.push(e.item.id);
        }
        if (items_to_delete.length > 0) {
            await db.delete_playlists_items_by_ids(items_to_delete);
        }
        await Promise.all([
            db.upsert_playlists_items(items),
            db.upsert_videos(videos as any),
        ]);
        entries = await db.select_playlist_entries_by_id(params.playlist_id);
    }

    if (save_channel) {
        await db.upsert_channel(channel);
    }
    if (save_playlist) {
        await db.upsert_yplaylist(playlist as Model.YPlaylist);
    }

    return {
        channel: channel,
        playlist: playlist,
        entries: entries
    };
};
