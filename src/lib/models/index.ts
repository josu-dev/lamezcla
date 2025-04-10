import type * as Y from './youtube.js';


export * from './youtube.js';


export type PinnedPlaylist = {
    type: 'playlist',
    pinned_id: string,
};

export type PinnedPlaylistCustom = {
    type: 'playlist_custom',
    pinned_id: string,
};

export type PinnedChannel = {
    type: 'channel',
    pinned_id: string,
};

export type PinnedVideo = {
    type: 'video',
    pinned_id: string,
};

export type PinnedItemBase = {
    id: string,
    pinned_at: Y.StringUTC,
    updated_at: Y.StringUTC,
    position: number,
};

export type PinnedItemMap = {
    channel: PinnedItemBase & PinnedChannel,
    playlist: PinnedItemBase & PinnedPlaylist,
    playlist_custom: PinnedItemBase & PinnedPlaylistCustom,
    video: PinnedItemBase & PinnedVideo,
};

export type PinnedItem = PinnedItemMap[keyof PinnedItemMap];

export type PinnedItemType = PinnedItem['type'];

export type PinnedItemValueMap = {
    channel: Y.Channel,
    playlist: Y.Playlist,
    playlist_custom: Y.Playlist;
    video: Y.Video,
};

export type PinnedEntryMap = {
    [K in PinnedItemType]: {
        type: K,
        item: PinnedItemMap[K],
        value: PinnedItemValueMap[K],
    }
};

export type PinnedEntry = PinnedEntryMap[keyof PinnedEntryMap];


export type FollowedChannel = {
    id: string,
    channel_id: string,
    position: number,
    followed_at: Y.StringUTC,
};

export type FollowedEntry = {
    id: string,
    item: FollowedChannel,
    value: Y.Channel,
};
