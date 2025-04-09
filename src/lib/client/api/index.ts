import * as Model from '$lib/models/index.js';
import type { FetchFn } from '$lib/utils/fetch.js';
import { try_fetch } from '$lib/utils/fetch.js';
import { err, ok } from '$lib/utils/results.js';


export async function get_channel(id: string, fetch: FetchFn) {
    const r_channel = await try_fetch({
        fetch: fetch,
        url: `/api/youtube/${id}`,
        parse_json: true,
    });
    if (r_channel.is_err) {
        return r_channel;
    }

    const channel: Model.Channel = (r_channel.value as any).data;

    return ok(channel);
}

export async function get_channel_playlists(id: string, fetch: FetchFn) {
    const r_playlists = await try_fetch({
        fetch: fetch,
        url: `/api/youtube/${id}/playlists`,
        parse_json: true,
    });
    if (r_playlists.is_err) {
        return r_playlists;
    }

    const out: Model.Playlist[] = (r_playlists.value as any).data;

    return ok(out);
}

export async function get_playlist(id: string, fetch: FetchFn) {
    const r_playlists = await try_fetch({
        fetch: fetch,
        url: `/api/youtube/playlists`,
        json: { ids: [id] },
        parse_json: true,
    });
    if (r_playlists.is_err) {
        return r_playlists;
    }

    const playlists: Model.Playlist[] = (r_playlists.value as any).data;
    if (playlists.length === 0) {
        return err('empty');
    }

    return ok(playlists[0]);
}

export async function get_playlist_entries(id: string, fetch: FetchFn, channel_id: string,) {
    const r_items = await try_fetch({
        fetch: fetch,
        url: `/api/youtube/${channel_id}/playlists/${id}`,
        parse_json: true,
    });
    if (r_items.is_err) {
        return r_items;
    }

    const items: Model.PlaylistItem[] = (r_items.value as any).data;
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
        return r_videos;
    }

    const compact_videos: Model.VideoCompact[] = (r_videos.value as any).data;
    const out = {
        items: items,
        compact_videos: compact_videos,
    };
    return ok(out);
}

export async function get_video(id: string, fetch: FetchFn) {
    const r_video = await try_fetch({
        fetch: fetch,
        url: `/api/youtube/videos`,
        json: { ids: [id] },
        parse_json: true,
    });
    if (r_video.is_err) {
        return r_video;
    }

    const videos: Model.VideoCompact[] = (r_video.value as any).data;
    if (videos.length === 0) {
        return err('empty');
    }

    return ok(videos[0]);
}
