import type { PlaylistItem, Video } from '$lib/server/yt/out_types.js';
export type * from '$lib/server/yt/out_types.js';

export type TrackId = PlaylistItem['id'];

export type Track = {
    item: PlaylistItem;
    video: Video | undefined;
};
