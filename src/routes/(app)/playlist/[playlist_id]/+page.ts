import { localapi, localdb } from '$client/data/query/index.js';
import type { PageLoad } from './$types.js';


export const load: PageLoad = async ({ params, fetch }) => {
    let [
        playlist, entries
    ] = await Promise.all([
        localdb.select_playlist(params.playlist_id),
        localdb.select_playlist_entries(params.playlist_id)
    ]);
    let save_playlist = false;
    if (playlist === undefined) {
        const r = await localapi.get_playlist(params.playlist_id, fetch);
        if (r.is_err) {
            localapi.load_error(r.error, {
                404: `Playlist with id '${params.playlist_id}' not found`,
                other: `Playlist with id '${params.playlist_id}' couldn't be loaded`
            });
        }

        playlist = r.value;
        save_playlist = true;
    }

    let channel = await localdb.select_channel(playlist.channel_id);
    let save_channel = false;
    if (channel === undefined) {
        const r = await localapi.get_channel(playlist.channel_id, fetch);
        if (r.is_err) {
            localapi.load_error(r.error, {
                404: `Channel with id '${playlist.channel_id}' not found`,
                other: `Channel with id '${playlist.channel_id}' couldn't be loaded`
            });
        }

        channel = r.value;
        save_channel = true;
    }

    const refresh_entries = save_playlist || channel.v > playlist.v || entries.length === 0;

    if (channel.v > playlist.v) {
        playlist.v = channel.v;
        save_playlist = true;
    }

    if (refresh_entries) {
        const r = await localapi.get_playlist_entries(params.playlist_id, fetch);
        if (r.is_err) {
            localapi.load_error(r.error, {
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
            await localdb.delete_playlists_items(items_to_delete);
        }
        await Promise.all([
            localdb.upsert_playlists_items(items),
            localdb.upsert_videos(videos as any),
        ]);
        entries = await localdb.select_playlist_entries(params.playlist_id);
    }

    if (save_channel) {
        await localdb.upsert_channel(channel);
    }
    if (save_playlist) {
        await localdb.upsert_playlist(playlist);
    }

    return {
        channel: channel,
        playlist: playlist,
        entries: entries
    };
};
