import { localapi, localdb } from '$client/data/query/index.js';
import { is_video_compact_unavailable, map_local_video_to_video, unavailable_video } from '$client/data/query/localdb/shared.js';
import type * as Model from '$lib/models/index.js';
import type { AsyncResult } from '$lib/utils/results.js';
import { ok } from '$lib/utils/results.js';


export async function refresh_local_channel(id: string): AsyncResult<Model.Channel, unknown> {
    const r_channel = await localapi.get_channel(id, fetch);
    if (r_channel.is_err) {
        return r_channel;
    }

    const channel = r_channel.value;
    const channel_local = await localdb.select_channel(id);
    if (channel_local !== undefined) {
        channel.v = channel_local.v += 1;
    }
    await localdb.upsert_channel(channel);

    return ok(channel);
}


export async function refresh_local_channel_and_playlists(id: string) {
    const [r_channel, r_playlists] = await Promise.all([
        localapi.get_channel(id, fetch),
        localapi.get_channel_playlists(id, fetch),
    ]);
    if (r_channel.is_err) {
        return r_channel;
    }
    if (r_playlists.is_err) {
        return r_playlists;
    }

    const channel_new = r_channel.value;
    const playlists_new = r_playlists.value;

    const [channel_local, playlists_local] = await Promise.all([
        localdb.select_channel(id),
        localdb.select_playlists_by_channel_id(id),
    ]);

    const version = (channel_local === undefined ? 1 : channel_local.v) + 1;
    channel_new.v = version;

    const playlists_new_ids: Set<string> = new Set();
    const playlists_to_delete: string[] = [];
    for (const p of playlists_new) {
        playlists_new_ids.add(p.id);
    }

    for (const p of playlists_local) {
        if (playlists_new_ids.has(p.id)) {
            continue;
        }
        playlists_to_delete.push(p.id);
    }

    await localdb.delete_playlists(playlists_to_delete);

    await Promise.all([
        localdb.upsert_channel(channel_new),
        localdb.upsert_playlists(playlists_new),
    ]);

    const out = {
        channel: channel_new,
        playlists: playlists_new
    };

    return ok(out);
}


export async function refresh_local_playlist_and_items(id: string) {
    const [r_playlist, r_entries, channel_local, playlist_local, items_local] = await Promise.all([
        localapi.get_playlist(id, fetch),
        localapi.get_playlist_entries(id, fetch),
        localdb.select_channel(id),
        localdb.select_playlist(id),
        localdb.select_playlists_items_by_playlist(id)
    ]);
    if (r_playlist.is_err) {
        return r_playlist;
    }
    if (r_entries.is_err) {
        return r_entries;
    }

    const playlist_new = r_playlist.value;
    const { items: items_new, videos: some_compact_videos } = r_entries.value;

    let version = playlist_local === undefined ? 1 : playlist_local.v;
    if (channel_local !== undefined) {
        version = channel_local.v;
    }
    playlist_new.v = version;

    const items_ids_new: Set<string> = new Set();
    for (const item of items_new) {
        item.v = version;
        items_ids_new.add(item.id);
    }

    const items_ids_to_delete: string[] = [];
    for (const item of items_local) {
        if (items_ids_new.has(item.id)) {
            continue;
        }
        items_ids_to_delete.push(item.id);
    }

    if (items_ids_to_delete.length > 0) {
        await localdb.delete_playlists_items(items_ids_to_delete);
    }

    const compact_videos: Model.VideoCompact[] = [];
    const videos: Model.Video[] = [];
    const video_id_to_video: Map<string, Model.Video> = new Map();
    for (const v of some_compact_videos) {
        let video: Model.Video;
        if (is_video_compact_unavailable(v)) {
            video = unavailable_video(v.id);
        }
        else {
            compact_videos.push(v);
            video = map_local_video_to_video(v);
        }
        videos.push(video);
        video_id_to_video.set(video.id, video);
    }

    await Promise.all([
        localdb.upsert_playlist(playlist_new),
        localdb.upsert_playlists_items(items_new),
        localdb.upsert_videos(compact_videos),
    ]);

    const entries_out: Model.PlaylistEntry[] = [];
    for (const item of items_new) {
        const v = video_id_to_video.get(item.video_id);
        if (v === undefined) {
            entries_out.push({
                item: item,
                video: unavailable_video(item.video_id)
            });
        } else {
            entries_out.push({
                item: item,
                video: v
            });
        }
    }

    const out = {
        playlist: playlist_new,
        entries: entries_out
    };

    return ok(out);
}
