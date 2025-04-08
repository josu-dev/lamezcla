import * as apiquery from '$lib/client/api/index.js';
import * as localquery from '$lib/client/db/index.js';
import type { Err } from '$lib/utils/results.js';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types.js';


export const ssr = false;

function throw_as_500(e: Err<unknown>, msg?: string): never {
    error(e.error instanceof Response ? e.error.status : 500, msg);
}

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

export const load: PageLoad = async ({ url, fetch }) => {
    const { video_id, playlist_id, index } = extract_params(url);

    if (playlist_id === undefined && video_id === undefined) {
        error(400, `Video id or Playlist id required`);
    }

    if (playlist_id === undefined) {
        const cached_video = await localquery.select_video(video_id);
        let video = cached_video;
        if (video === undefined) {
            const r = await apiquery.get_video(video_id, fetch);
            if (r.is_err) {
                throw_as_500(r);
            }

            await localquery.insert_videos([r.value]);
            video = (await localquery.select_video(video_id))!;
        }

        return {
            single: true,
            video: video,
        } as const;
    }

    const [
        cached_playlist, cached_entries
    ] = await Promise.all([
        localquery.select_playlist(playlist_id),
        localquery.select_playlist_entries(playlist_id)
    ]);

    let playlist = cached_playlist;
    if (playlist === undefined) {
        const r = await apiquery.get_playlist(playlist_id, fetch);
        if (r.is_err) {
            throw_as_500(r);
        }

        playlist = r.value;
    }

    let entries = cached_entries;
    if (entries.length === 0) {
        const r = await apiquery.get_playlist_entries(playlist_id, fetch, playlist.channel_id);
        if (r.is_err) {
            throw_as_500(r);
        }

        const { items, compact_videos } = r.value;
        await Promise.all([
            localquery.insert_playlists_items(items),
            localquery.insert_videos(compact_videos),
        ]);
        entries = await localquery.select_playlist_entries(playlist_id);

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

    return {
        single: false,
        playlist: playlist,
        entries: entries,
        start_index: synced_index,
    } as const;
};
