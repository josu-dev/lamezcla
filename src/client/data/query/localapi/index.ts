import type * as Model from '$lib/models/index.js';
import type * as ApiModel from '$lib/provider/youtube/index.js';
import type { FetchFn } from '$lib/utils/fetch.js';
import { err, now_utc, ok, try_fetch } from '$lib/utils/index.js';


export async function get_channel(id: string, fetch: FetchFn) {
    const r = await try_fetch({
        fetch: fetch,
        url: `/api/youtube/${id}`,
        parse_json: true,
    });
    if (r.is_err) {
        return r;
    }

    const channel: ApiModel.Channel = (r.value as any).data;
    const out: Model.Channel = {
        ...channel,
        v: 1,
        updated_at: now_utc(),
    };

    return ok(out);
}

export async function get_channel_playlists(id: string, fetch: FetchFn) {
    const r = await try_fetch({
        fetch: fetch,
        url: `/api/youtube/${id}/playlists`,
        parse_json: true,
    });
    if (r.is_err) {
        return r;
    }

    const playlists: ApiModel.Playlist[] = (r.value as any).data;
    const out: Model.Playlist[] = [];
    for (const p of playlists) {
        out.push({
            ...p,
            v: 1,
            updated_at: now_utc()
        });
    }

    return ok(out);
}

export async function get_playlist(id: string, fetch: FetchFn) {
    const r = await try_fetch({
        fetch: fetch,
        url: `/api/youtube/playlists`,
        json: { ids: [id] },
        parse_json: true,
    });
    if (r.is_err) {
        return r;
    }

    const playlists: ApiModel.Playlist[] = (r.value as any).data;
    if (playlists.length === 0) {
        return err(new Response(null, { status: 404 }));
    }

    const out: Model.Playlist = {
        ...playlists[0],
        v: 1,
        updated_at: now_utc(),
    };

    return ok(out);
}

export async function get_playlist_entries(id: string, fetch: FetchFn) {
    const r_items = await try_fetch({
        fetch: fetch,
        url: `/api/youtube/playlists/${id}`,
        parse_json: true,
    });
    if (r_items.is_err) {
        return r_items;
    }

    const compact_items: ApiModel.PlaylistItemCompact[] = (r_items.value as any).data;
    const ids: string[] = [];
    for (const item of compact_items) {
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

    const compact_videos: ApiModel.SomeVideoCompact[] = (r_videos.value as any).data;
    const out = {
        items: compact_items,
        videos: compact_videos,
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

    const videos: ApiModel.SomeVideoCompact[] = (r_video.value as any).data;
    if (videos.length === 0) {
        return err(new Response(null, { status: 404 }));
    }

    const video = videos[0];
    if (video.flags === 0) {
        return err(new Response(null, { status: 404 }));
    }

    const out: Model.VideoCompact = {
        ...video as Model.VideoCompact
    };

    return ok(out);
}
