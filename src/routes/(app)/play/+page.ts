import { db } from '$data/local/db/index.js';
import { load_error } from '$data/providers/utils.js';
import { youtube } from '$data/providers/youtube/client/index.js';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types.js';


function extract_params(url: URL) {
    const raw_video_id = url.searchParams.get('v');
    const raw_playlist_id = url.searchParams.get('l');
    const raw_index = url.searchParams.get('i');
    const is_video_id_valid = raw_video_id != null && raw_video_id.length > 0;
    const is_playlist_id_valid = raw_playlist_id != null && raw_playlist_id.length > 0;

    const index = raw_index == null ? 1 : parseInt(raw_index);
    const safe_index = isNaN(index) || !isFinite(index) || index < 1 ? 1 : index;

    if (!(is_playlist_id_valid || is_video_id_valid)) {
        return {
            video_id: undefined,
            playlist_id: undefined,
            index: safe_index,
        } as const;
    }

    if (is_playlist_id_valid) {
        return {
            video_id: is_video_id_valid ? raw_video_id! : undefined,
            playlist_id: raw_playlist_id!,
            index: safe_index,
        } as const;
    }

    return {
        video_id: raw_video_id!,
        playlist_id: undefined,
        index: safe_index,
    } as const;
}

// TODO: resolve computed, system and user playlists better, lookup object?
export const load: PageLoad = async ({ url, fetch }) => {
    const { video_id, playlist_id, index } = extract_params(url);

    if (playlist_id === undefined && video_id === undefined) {
        error(400, `Video id or Playlist id required`);
    }

    if (playlist_id === undefined) {
        const cached_video = await db.select_video_by_id(video_id);
        let video = cached_video;
        if (video === undefined) {
            const r = await youtube.get_video(video_id, fetch);
            if (r.is_err) {
                load_error(r.error, {
                    404: `Video with id '${video_id}' not found`,
                    other: `Video with id '${video_id}' couldn't be loaded`
                });
            }

            await db.upsert_videos([r.value]);
            video = (await db.select_video_by_id(video_id))!;
        }

        const channel = await db.select_channel_by_id(video.channel_id);

        return {
            channel: channel,
            single: true,
            video: video,
        } as const;
    }

    const [
        cached_playlist, cached_entries
    ] = await Promise.all([
        db.select_playlist_by_id(playlist_id),
        db.select_playlist_entries_by_id(playlist_id)
    ]);

    let playlist = cached_playlist;
    if (playlist === undefined) {
        const r = await youtube.get_playlist(playlist_id, fetch);
        if (r.is_err) {
            load_error(r.error, {
                404: `Playlist with id '${playlist_id}' not found`,
                other: `Playlist with id '${playlist_id}' couldn't be loaded`
            });
        }

        playlist = r.value;
    }

    let entries = cached_entries;
    if (playlist.tag === 'y' && entries.length === 0) {
        const r = await youtube.get_playlist_entries(playlist_id, fetch);
        if (r.is_err) {
            load_error(r.error, {
                other: `Entries of playlist with '${playlist_id}' couldn't be loaded`
            });
        }

        const { items, videos: some_compact_videos } = r.value;
        await Promise.all([
            db.upsert_playlists_items(items),
            db.upsert_videos(some_compact_videos as any),
        ]);
        entries = await db.select_playlist_entries_by_id(playlist_id);

        if (entries.length === 0) {
            error(400, `Playlist with '${playlist_id}' is empty`);
        }
    }

    let synced_index = index > entries.length ? entries.length : index;
    if (video_id !== undefined) {
        for (let i = 0; i < entries.length; i++) {
            if (entries[i].video.id === video_id) {
                synced_index = i + 1;
                break;
            }
        }
    }

    const channel = await db.select_channel_by_id(playlist.channel_id);

    return {
        channel: channel,
        single: false,
        playlist: playlist,
        entries: entries,
        start_index: synced_index,
    } as const;
};
