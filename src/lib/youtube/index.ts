import { YOUTUBE_API_KEY } from '$env/static/private';
import type * as Models from '$lib/models/youtube.js';
import { VIDEO_FLAGS } from '$lib/models/youtube.js';
import { duration_to_seconds } from '$lib/player/utils.js';
import type { AsyncResult } from '$lib/utils/index.js';
import { assert, err, now_utc, ok } from '$lib/utils/index.js';
import type * as YTA from './api.types.js';

const MAX_RESULTS_PER_REQUEST = "50";
const BASE_API = `https://youtube.googleapis.com/youtube/v3`;
const ENDPOINT_CHANNEL = `/channels`;
const ENDPOINT_PLAYLIST = `/playlists`;
const ENDPOINT_PLAYLIST_ITEMS = `/playlistItems`;
const ENDPOINT_VIDEOS = `/videos`;

function build_api_url(endpoint: string, params: Record<string, string>) {
    const sp = new URLSearchParams(params);
    const url = `${BASE_API}${endpoint}?${sp.toString()}`;
    return url;
}

export async function fetch_api<T extends YTA.AnyResponse>(opts: YTA.FetchApiOptions<T>): AsyncResult<T, Response> {
    const params = { ...opts.others, part: opts.part.join(','), key: YOUTUBE_API_KEY };
    const url = build_api_url(opts.endpoint, params);
    const r = await fetch(url);
    if (!r.ok) {
        console.error(r);
        return err(r);
    }

    const data: T = await r.json();
    if (data.pageInfo.totalResults === 0) {
        console.warn('empty result', data);
    }

    return ok(data);
}

export async function get_channel_by_handle(handle: string): AsyncResult<Models.Channel, Response> {
    const data = await fetch_api<YTA.ChannelListResponse>({
        endpoint: ENDPOINT_CHANNEL,
        part: ['snippet', 'contentDetails', 'status'],
        others: {
            forHandle: handle
        }
    });
    if (data.is_err) {
        return data;
    }

    const channel = data.value.items[0];

    const out: Models.Channel = {
        id: channel.id,
        handle: channel.snippet.customUrl,
        title: channel.snippet.title,
        img: channel.snippet.thumbnails?.default,
        published_at: channel.snippet.publishedAt,
        updated_at: now_utc()
    };

    return ok(out);
}

function _get_channel_playlists(channel_id: string, page_token: undefined | string = undefined) {
    const others: Record<string, any> = {
        channelId: channel_id,
        maxResults: MAX_RESULTS_PER_REQUEST
    };
    if (page_token !== undefined) {
        others.pageToken = page_token;
    }

    return fetch_api<YTA.PlaylistListResponse>({
        endpoint: ENDPOINT_PLAYLIST,
        part: ["snippet", "player", "status", "contentDetails"],
        others: others
    });
}

// export async function get_channel_playlists(channel_id: string) {
//     const data = await _get_channel_playlists(channel_id);
//     if (data.is_err){
//         return data;
//     }

//     return ok(out);
// }

export async function get_channel_playlists_all(channel_id: string) {
    const out: Models.Playlist[] = [];
    let next_page: undefined | string;
    while (true) {
        const r = await _get_channel_playlists(channel_id, next_page);
        if (r.is_err) {
            return r;
        }

        const value = r.value;

        for (const item of value.items) {
            const p: Models.Playlist = {
                id: item.id,
                channel_id: item.snippet.channelId,
                description: item.snippet.description,
                img: item.snippet.thumbnails?.medium,
                item_count: item.contentDetails.itemCount,
                privacy_status: item.status.privacyStatus,
                published_at: item.snippet.publishedAt,
                updated_at: now_utc(),
                title: item.snippet.title,
            };
            out.push(p);
        }
        if (value.nextPageToken) {
            next_page = value.nextPageToken;
            continue;
        }
        break;
    }

    return ok(out);
}

async function _get_playlist_items(playlist_id: string, page_token: undefined | string = undefined) {
    const others: Record<string, any> = {
        playlistId: playlist_id,
        maxResults: MAX_RESULTS_PER_REQUEST
    };
    if (page_token !== undefined) {
        others.pageToken = page_token;
    }

    return fetch_api<YTA.PlaylistItemListResponse>({
        endpoint: ENDPOINT_PLAYLIST_ITEMS,
        part: ["snippet", "contentDetails", "status"],
        others: others
    });
}

// export async function get_playlist_items(playlist_id: string) {
//     const data = await _get_playlist_items(playlist_id);
//     if (data === undefined) {
//         return undefined;
//     }

//     return ok(out);
// }

export async function get_playlist_items_all(id: string) {
    const out: Models.PlaylistItem[] = [];
    let next_page: undefined | string;
    while (true) {
        const r = await _get_playlist_items(id, next_page);
        if (r.is_err) {
            return r;
        }

        const value = r.value;

        for (const item of value.items) {
            const p: Models.PlaylistItem = {
                id: item.id,
                playlist_id: item.snippet.playlistId,
                video_id: item.contentDetails.videoId,
                published_at: item.snippet.publishedAt,
                privacy_status: item.status.privacyStatus,
            };
            out.push(p);
        }
        if (value.nextPageToken) {
            next_page = value.nextPageToken;
            continue;
        }
        break;
    }

    return ok(out);
}

function _get_videos(ids: string[]) {
    assert(ids.length > 0 && ids.length < 51, "ids must be at least 1 and at much 50");
    const others: Record<string, any> = {
        id: ids.join(","),
        maxResults: MAX_RESULTS_PER_REQUEST
    };

    return fetch_api<YTA.VideoListResponse>({
        endpoint: ENDPOINT_VIDEOS,
        part: ["contentDetails", "snippet", "player", "statistics", "status"],
        others: others
    });
}

export function extract_video_flags(video: YTA.Video): number {
    let flags = 0;

    if (video.status !== undefined) {
        if (video.status.uploadStatus === 'processed' || video.processingDetails.processingStatus === 'uploaded') {
            flags |= VIDEO_FLAGS.IS_AVAILABLE;
        }

        switch (video.status.privacyStatus) {
            case 'public':
                flags |= VIDEO_FLAGS.IS_PUBLIC;
                break;
            case 'unlisted':
                flags |= VIDEO_FLAGS.IS_UNLISTED;
                break;
            case 'private':
                flags |= VIDEO_FLAGS.IS_PRIVATE;
                break;
        }

        if (video.status.embeddable) {
            flags |= VIDEO_FLAGS.IS_EMBEDDABLE;
        }
    }

    return flags;
}

function create_video_unavailable(id: string): Models.VideoCompactUnavailable {
    return {
        id: id,
        flags: 0
    };
}

export async function get_videos(ids: string[]) {
    const out: Models.SomeVideo[] = [];
    const id_to_vid: Map<string, Models.VideoCompact> = new Map();
    let i = 0;
    while (i < ids.length) {
        const slice = ids.slice(i, i + 50);
        i += slice.length;
        const r = await _get_videos(slice);
        if (r.is_err) {
            return r;
        }

        const value = r.value;
        for (const item of value.items) {
            const v: Models.VideoCompact = {
                id: item.id,
                flags: extract_video_flags(item),
                channel_id: item.snippet.channelId,
                channel_title: item.snippet.channelTitle,
                img: item.snippet.thumbnails?.medium,
                published_at: item.snippet.publishedAt,
                title: item.snippet.title,
                total_seconds: duration_to_seconds(item.contentDetails.duration),
            };
            id_to_vid.set(v.id, v);
        }
    }

    for (const id of ids) {
        const v = id_to_vid.get(id);
        if (v === undefined) {
            out.push(create_video_unavailable(id));
        }
        else {
            out.push(v);
        }
    }

    return ok(out);
}


// export async function get_preview(channel_handle: string): Promise<any> {
//     const r_channel = await get_channel_by_handle(channel_handle);
//     if (r_channel === undefined) {
//         return {};
//     }

//     const tosave: Preview = {
//         channel: {
//             id: r_channel.id,
//             handle: r_channel.snippet.customUrl,
//             title: r_channel.snippet.title,
//         },
//         playlists: []
//     };

//     const channel_id = r_channel.id;
//     const r_playlists = await get_channel_playlists(channel_id);
//     if (r_playlists === undefined) {
//         return {};
//     }


//     for (const r_playlist of r_playlists) {
//         const playlist: YTT.Playlist = {
//             id: r_playlist.id,
//             channel_id: r_playlist.snippet.channelId,
//             title: r_playlist.snippet.title,
//             description: r_playlist.snippet.description,
//             published_at: r_playlist.snippet.publishedAt,
//             privacy_status: r_playlist.status.privacyStatus,
//             item_count: r_playlist.contentDetails.itemCount
//         };
//         const r_playlist_items = await get_playlist_items(r_playlist.id);
//         if (r_playlist_items === undefined) {
//             continue;
//         }

//         const items: YTT.PlaylistItem[] = [];
//         const ids: string[] = [];
//         for (const r_item of r_playlist_items) {
//             const item: YTT.PlaylistItem = {
//                 id: r_item.id,
//                 playlist_id: playlist.id,
//                 video_id: r_item.contentDetails.videoId,
//                 privacy_status: r_item.status.privacyStatus,
//                 available: true,
//                 published_at: r_item.snippet.publishedAt,
//             };
//             items.push(item);
//             ids.push(item.video_id);
//         }
//         const r_videos = await get_videos(ids);
//         const videos: (undefined | YTT.Video)[] = [];
//         if (r_videos === undefined) {
//             for (const item of items) {
//                 item.available = false;
//             }
//         }
//         else {
//             let item_i = 0;
//             let video_i = 0;
//             while (video_i < r_videos.length) {
//                 const item = items[item_i];
//                 const r_video = r_videos[video_i];

//                 if (item.video_id === r_video.id) {
//                     const video: YTT.Video = {
//                         id: r_video.id,
//                         channel_id: r_video.snippet.channelId,
//                         channel_title: r_video.snippet.channelTitle,
//                         title: r_video.snippet.title,
//                         duration: r_video.contentDetails.duration,
//                         privacy_status: r_video.status.privacyStatus,
//                         embeddable: r_video.status.embeddable,
//                         published_at: r_video.snippet.publishedAt,
//                     };
//                     videos.push(video);
//                     item_i += 1;
//                     video_i += 1;
//                 }
//                 else {
//                     videos.push(undefined);
//                     item_i += 1;
//                 }
//             }
//             for (; item_i < items.length; item_i++) {
//                 videos.push(undefined);
//             }
//         }


//         tosave.playlists.push({
//             playlist: playlist,
//             items: items,
//             videos: videos,
//         });
//     }
//     return tosave;
// }
