import { YOUTUBE_API_KEY } from '$env/static/private';
import { assert } from '$lib/utils.js';
import type * as YTA from './api_types.js';
import type * as YTT from './out_types.js';
export type * from './out_types.js';

export type Preview = {
    channel: YTT.Channel,
    playlists: {
        playlist: YTT.Playlist,
        items: YTT.PlaylistItem[],
        videos: (undefined | YTT.Video)[];
    }[];
};

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

export async function fetch_api<T extends YTA.AnyResponse>(opts: YTA.FetchApiOptions<T>): Promise<undefined | T> {
    const params = { ...opts.others, part: opts.part.join(','), key: YOUTUBE_API_KEY };
    const url = build_api_url(opts.endpoint, params);
    const r = await fetch(url);
    if (!r.ok) {
        console.error(r);
        return undefined;
    }

    const data: T = await r.json();
    if (data.pageInfo.totalResults === 0) {
        console.warn('empty result', data);
    }

    return data;
}

export async function get_channel_id_by_handle(handle: string) {
    const data = await fetch_api<YTA.ChannelListResponse>({
        endpoint: ENDPOINT_CHANNEL,
        part: ['snippet', 'contentDetails', 'status'],
        others: {
            forHandle: handle
        }
    });
    if (data === undefined) {
        return undefined;
    }

    const channel = data.items[0];
    return channel;
}

export async function get_channel_playlists(channel_id: string) {
    const data = await fetch_api<YTA.PlaylistListResponse>({
        endpoint: ENDPOINT_PLAYLIST,
        part: ["snippet", "player", "status", "contentDetails"],
        others: {
            channelId: channel_id,
            maxResults: "50"
        }
    });
    if (data === undefined) {
        return undefined;
    }

    const playlists = data.items;

    return playlists;
}

export async function get_playlist_items(playlist_id: string) {
    const data = await fetch_api<YTA.PlaylistItemListResponse>({
        endpoint: ENDPOINT_PLAYLIST_ITEMS,
        part: ["snippet", "contentDetails", "status"],
        others: {
            playlistId: playlist_id,
            maxResults: "50"
        }
    });
    if (data === undefined) {
        return undefined;
    }

    const items = data.items;

    return items;
}

export async function get_videos(ids: string[]) {
    assert(ids.length > 0 && ids.length < 51, "ids must be at least 1 and at much 50");

    const data = await fetch_api<YTA.VideoListResponse>({
        endpoint: ENDPOINT_VIDEOS,
        part: ["contentDetails", "snippet", "player", "statistics", "status"],
        others: {
            id: ids.join(","),
            maxResults: "50"
        }
    });
    if (data === undefined) {
        return undefined;
    }

    const videos = data.items;
    return videos;
}


export async function get_preview(channel_handle: string): Promise<any> {
    const r_channel = await get_channel_id_by_handle(channel_handle);
    if (r_channel === undefined) {
        return {};
    }

    const tosave: Preview = {
        channel: {
            id: r_channel.id,
            handle: r_channel.snippet.customUrl,
            title: r_channel.snippet.title,
        },
        playlists: []
    };

    const channel_id = r_channel.id;
    const r_playlists = await get_channel_playlists(channel_id);
    if (r_playlists === undefined) {
        return {};
    }


    for (const r_playlist of r_playlists) {
        const playlist: YTT.Playlist = {
            id: r_playlist.id,
            channel_id: r_playlist.snippet.channelId,
            title: r_playlist.snippet.title,
            description: r_playlist.snippet.description,
            published_at: r_playlist.snippet.publishedAt,
            privacy_status: r_playlist.status.privacyStatus,
            item_count: r_playlist.contentDetails.itemCount
        };
        const r_playlist_items = await get_playlist_items(r_playlist.id);
        if (r_playlist_items === undefined) {
            continue;
        }

        const items: YTT.PlaylistItem[] = [];
        const ids: string[] = [];
        for (const r_item of r_playlist_items) {
            const item: YTT.PlaylistItem = {
                id: r_item.id,
                playlist_id: playlist.id,
                video_id: r_item.contentDetails.videoId,
                privacy_status: r_item.status.privacyStatus,
                available: true,
                published_at: r_item.snippet.publishedAt,
            };
            items.push(item);
            ids.push(item.video_id);
        }
        const r_videos = await get_videos(ids);
        const videos: (undefined | YTT.Video)[] = [];
        if (r_videos === undefined) {
            for (const item of items) {
                item.available = false;
            }
        }
        else {
            let item_i = 0;
            let video_i = 0;
            while (video_i < r_videos.length) {
                const item = items[item_i];
                const r_video = r_videos[video_i];

                if (item.video_id === r_video.id) {
                    const video: YTT.Video = {
                        id: r_video.id,
                        channel_id: r_video.snippet.channelId,
                        channel_title: r_video.snippet.channelTitle,
                        title: r_video.snippet.title,
                        duration: r_video.contentDetails.duration,
                        privacy_status: r_video.status.privacyStatus,
                        embeddable: r_video.status.embeddable,
                        published_at: r_video.snippet.publishedAt,
                    };
                    videos.push(video);
                    item_i += 1;
                    video_i += 1;
                }
                else {
                    videos.push(undefined);
                    item_i += 1;
                }
            }
            for (; item_i < items.length; item_i++) {
                videos.push(undefined);
            }
        }


        tosave.playlists.push({
            playlist: playlist,
            items: items,
            videos: videos,
        });
    }
    return tosave;
}
