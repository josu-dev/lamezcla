import type { Model } from '$data/models/index.js';
import type { FetchFn } from '$lib/utils/index.js';
import { err, now_utc, ok, try_fetch } from '$lib/utils/index.js';
import type * as ModelsAPI from '../shared.js';


export async function get_channel(id: string, fetch: FetchFn) {
    const r = await try_fetch({
        fetch: fetch,
        url: `/api/youtube/${id}`,
        parse_json: true,
    });
    if (r.is_err) {
        return r;
    }

    const channel: ModelsAPI.Channel = (r.value as any).data;
    const out: Model.YChannel = {
        ...channel,
        tag: 'y',
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

    const playlists: ModelsAPI.Playlist[] = (r.value as any).data;
    const out: Model.YPlaylist[] = [];
    for (const p of playlists) {
        out.push({
            ...p,
            tag: 'y',
            v: 1,
            play_count: 0,
            updated_at: now_utc(),
            sortable: false,
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

    const playlists: ModelsAPI.Playlist[] = (r.value as any).data;
    if (playlists.length === 0) {
        return err({ type: "response" as const, value: new Response(null, { status: 404 }) });
    }

    const out: Model.YPlaylist = {
        ...playlists[0],
        tag: 'y',
        v: 1,
        play_count: 0,
        updated_at: now_utc(),
        sortable: true,
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

    const compact_items: ModelsAPI.PlaylistItemCompact[] = (r_items.value as any).data;
    const out_compact_items: Model.PlaylistItemCompact[] = new Array(compact_items.length);
    const ids: string[] = [];
    for (let i = 0; i < compact_items.length; i++) {
        const item = compact_items[i];
        ids.push(item.video_id);
        // @ts-expect-error reuse object
        item.play_count = 0;
        out_compact_items[i] = item as Model.PlaylistItemCompact;
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

    const compact_videos: ModelsAPI.SomeVideoCompact[] = (r_videos.value as any).data;
    const out_compact_videos: Model.SomeVideoCompact[] = new Array(compact_videos.length);
    for (let i = 0; i < compact_videos.length; i++) {
        const v = compact_videos[i];
        if (v.flags !== 0) {
            // @ts-expect-error reuse object
            v.play_count = 0;
        }
        out_compact_videos[i] = v as Model.SomeVideoCompact;

    }

    const out = {
        items: out_compact_items,
        videos: out_compact_videos,
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

    const videos: ModelsAPI.SomeVideoCompact[] = (r_video.value as any).data;
    if (videos.length === 0) {
        return err({ type: "response" as const, value: new Response(null, { status: 404 }) });
    }

    const video = videos[0];
    if (video.flags === 0) {
        return err({ type: "response" as const, value: new Response(null, { status: 404 }) });
    }

    const out: Model.VideoCompact = {
        ...video as Model.VideoCompact
    };

    return ok(out);
}
