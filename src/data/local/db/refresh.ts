import { expand_video_compact, normalize_playlist_entries, unavailable_video, video_compact_is_unavailable } from '$data/local/shared.js';
import type { Model } from '$data/models/index.js';
import { youtube } from '$data/providers/youtube/client/index.js';
import type { AsyncOptional, AsyncResult, Optional } from '$lib/utils/index.js';
import { ok } from '$lib/utils/index.js';
import { select_channel_by_id, upsert_channel } from './channels.js';
import { delete_playlists_items_by_ids, select_playlist_items_by_playlist_id, upsert_playlists_items } from './playlists_items.js';
import { upsert_videos } from './videos.js';
import { delete_yplaylists_by_ids, select_yplaylist_by_id, select_yplaylists_by_channel_id, upsert_yplaylist, upsert_yplaylists } from './yplaylists.js';


export async function refresh_local_channel(id: string): AsyncResult<Model.AnyChannel, unknown> {
    const r_channel = await youtube.get_channel(id, fetch);
    if (r_channel.is_err) {
        return r_channel;
    }

    const channel = r_channel.value;
    const channel_local = await select_channel_by_id(id) as Optional<Model.YChannel>;
    if (channel_local !== undefined) {
        channel.v = channel_local.v += 1;
    }
    await upsert_channel(channel);

    return ok(channel);
}


export async function refresh_local_channel_and_playlists(id: string) {
    const [r_channel, r_playlists] = await Promise.all([
        youtube.get_channel(id, fetch),
        youtube.get_channel_playlists(id, fetch),
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
        select_channel_by_id(id) as AsyncOptional<Model.YChannel>,
        select_yplaylists_by_channel_id(id),
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

    await delete_yplaylists_by_ids(playlists_to_delete);

    await Promise.all([
        upsert_channel(channel_new),
        upsert_yplaylists(playlists_new),
    ]);

    const out = {
        channel: channel_new,
        playlists: playlists_new
    };

    return ok(out);
}


export async function refresh_local_playlist_and_items(id: string) {
    const [r_playlist, r_entries, channel_local, playlist_local, items_local] = await Promise.all([
        youtube.get_playlist(id, fetch),
        youtube.get_playlist_entries(id, fetch),
        select_channel_by_id(id) as AsyncOptional<Model.YChannel>,
        select_yplaylist_by_id(id),
        select_playlist_items_by_playlist_id(id)
    ]);
    if (r_playlist.is_err) {
        return r_playlist;
    }
    if (r_entries.is_err) {
        return r_entries;
    }

    const playlist_new = r_playlist.value;
    const { items: compact_items, videos: some_compact_videos } = r_entries.value;

    let version = playlist_local === undefined ? 1 : playlist_local.v;
    if (channel_local !== undefined) {
        version = channel_local.v;
    }
    playlist_new.v = version;

    const items_ids_new: Set<string> = new Set();
    for (const item of compact_items) {
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
        await delete_playlists_items_by_ids(items_ids_to_delete);
    }

    const compact_videos: Model.VideoCompact[] = [];
    const videos: Model.Video[] = [];
    const video_id_to_video: Map<string, Model.Video> = new Map();
    for (const v of some_compact_videos) {
        let video: Model.Video;
        if (video_compact_is_unavailable(v)) {
            video = unavailable_video(v.id);
        }
        else {
            compact_videos.push(v);
            video = expand_video_compact(v);
        }
        videos.push(video);
        video_id_to_video.set(video.id, video);
    }

    const entries_out = normalize_playlist_entries(compact_items, video_id_to_video);

    await Promise.all([
        upsert_yplaylist(playlist_new),
        upsert_playlists_items(compact_items),
        upsert_videos(compact_videos)
    ]);

    const out = {
        playlist: playlist_new,
        entries: entries_out
    };

    return ok(out);
}
