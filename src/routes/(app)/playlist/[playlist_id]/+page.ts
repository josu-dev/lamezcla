import { db } from '$data/local/db/index.js';
import { extract_videos, normalize_playlist_entries, SYNCHRONIZATION_ACTION, type SynchronizationAction } from '$data/local/shared.js';
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
    let store_playlist = false;
    if (playlist === undefined) {
        const r = await youtube.get_playlist(params.playlist_id, fetch);
        if (r.is_err) {
            load_error(r.error, {
                404: `Playlist with id '${params.playlist_id}' not found`,
                other: `Playlist with id '${params.playlist_id}' couldn't be loaded`
            });
        }

        playlist = r.value;
        store_playlist = true;
    }

    let channel = await db.select_channel_by_id(playlist.channel_id);
    if (channel === undefined) {
        const r = await youtube.get_channel(playlist.channel_id, fetch);
        if (r.is_err) {
            load_error(r.error, {
                404: `Channel with id '${playlist.channel_id}' not found`,
                other: `Channel with id '${playlist.channel_id}' couldn't be loaded`
            });
        }

        channel = r.value;
        channel.v = 0;
        await db.upsert_channel(channel);
    }

    let sync_action: SynchronizationAction = {
        tag: SYNCHRONIZATION_ACTION.NONE
    };
    if (channel.tag === 'y' && playlist.tag === 'y' && (channel.v > playlist.v || entries.length === 0)) {
        if (channel.v > playlist.v) {
            playlist.v = channel.v;
            store_playlist = true;
            sync_action = {
                tag: SYNCHRONIZATION_ACTION.HARD_REFRESH,
            };
        }
        else {
            sync_action = {
                tag: SYNCHRONIZATION_ACTION.RESUME,
                total_count: 0
            };
        }
        if (entries.length === 0) {
            const r = await youtube.get_playlist_entries(params.playlist_id, void 0, fetch);
            if (r.is_err) {
                load_error(r.error, {
                    404: `Items of playlist with id '${params.playlist_id}' couldn't be loaded`,
                    other: `Items of playlist with id '${params.playlist_id}' couldn't be loaded`
                });
            }

            if (r.value.next_page == undefined) {
                sync_action = {
                    tag: SYNCHRONIZATION_ACTION.NONE
                };
            }
            else {
                sync_action = {
                    tag: SYNCHRONIZATION_ACTION.RESUME,
                    next_page: r.value.next_page,
                    total_count: r.value.total_items
                };
            }

            const videos_compact_available: Array<Model.VideoCompact> = [];
            const video_id_to_video: Map<string, Model.Video> = new Map();
            extract_videos(r.value.videos, videos_compact_available, [], video_id_to_video);

            await Promise.all([
                db.upsert_playlists_items(r.value.items),
                db.upsert_videos(videos_compact_available),
            ]);

            entries = normalize_playlist_entries(r.value.items, video_id_to_video);
        }
        else {
            sync_action = {
                tag: SYNCHRONIZATION_ACTION.HARD_REFRESH
            };
        }
    }

    if (store_playlist) {
        await db.upsert_yplaylist(playlist as Model.YPlaylist);
    }

    return {
        channel: channel,
        playlist: playlist,
        entries: entries,
        entries_sync_action: sync_action
    };
};
