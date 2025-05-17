export type StringId = string;

export type StringUTC = string;

export type Image = {
    url: string;
    width: number;
    height: number;
};

export interface SyncableTrait {
    v: number;
}

export interface PlayCountableTrait {
    play_count: number;
}

export interface PositionableTrait {
    position: number;
}

export interface BaseChannel {
    id: StringId;
    handle?: string;
    title: string;
    img: undefined | Image;
    created_at: StringUTC;
    updated_at: StringUTC;
};

export interface YChannel extends BaseChannel, SyncableTrait {
    tag: 'y';
    v: number;
}

export interface LChannel extends BaseChannel {
    tag: 'l';
};

export type AnyChannel = YChannel | LChannel;

export interface BasePlaylist {
    id: StringId;
    channel_id: string;
    title: string;
    description: string;
    img: undefined | Image;
    item_count: number;
    sortable: boolean;
    play_count: number;
    created_at: string;
    updated_at: StringUTC;
};

export interface YPlaylist extends BasePlaylist, SyncableTrait {
    tag: 'y';
    privacy_status: string;
};

export interface LPlaylist extends BasePlaylist {
    tag: 'l';
    pinneable: boolean;
    deletable: boolean;
};

export type AnyPlaylist = YPlaylist | LPlaylist;

export const PLAYLIST_ITEM_FLAGS = {
    IS_UNAVAILABLE: 0,
    IS_DELETED: 1 << 0,
    IS_PUBLIC: 1 << 1,
    IS_UNLISTED: 1 << 2,
    IS_PRIVATE: 1 << 3,
} as const;

export interface PlaylistItemCompact extends PositionableTrait {
    id: StringId;
    playlist_id: string;
    video_id: string;
    flags: number;
    play_count: number;
    created_at: string;
};

export interface PlaylistItem extends PlaylistItemCompact {
    is_available: boolean;
    is_deleted: boolean;
    is_public: boolean;
    is_private: boolean;
    is_unlisted: boolean;
};

export const VIDEO_FLAGS = {
    NO_FLAGS: 0,
    IS_AVAILABLE: 1 << 0,
    IS_PUBLIC: 1 << 1,
    IS_UNLISTED: 1 << 2,
    IS_PRIVATE: 1 << 3,
    IS_EMBEDDABLE: 1 << 4,
} as const;

export type VideoCompact = {
    id: StringId;
    channel_id: string;
    flags: number;
    channel_title: string;
    title: string;
    img: undefined | Image;
    duration_s: number;
    play_count: number;
    created_at: string;
};

export type VideoCompactUnavailable = {
    id: StringId;
    flags: 0;
};

export type SomeVideoCompact = VideoCompact | VideoCompactUnavailable;

export type Duration = {
    s: number;
    m: number;
    h: number;
    d: number;
};

export interface Video extends VideoCompact {
    duration: Duration;
    is_available: boolean;
    is_public: boolean;
    is_private: boolean;
    is_unlisted: boolean;
    is_embeddable: boolean;
};

export type PlaylistEntry = {
    id: PlaylistItem['id'];
    item: PlaylistItem;
    video: Video;
};

export interface PinnedItemBase extends PositionableTrait {
    id: StringId;
    value_id: string;
    created_at: StringUTC;
    updated_at: StringUTC;
};

export interface PinnedChannel extends PinnedItemBase {
    tag: 'channel';
};

export interface PinnedYPlaylist extends PinnedItemBase {
    tag: 'yplaylist';
};

export interface PinnedLPlaylist extends PinnedItemBase {
    tag: 'lplaylist';
};

export interface PinnedVideo extends PinnedItemBase {
    tag: 'video';
};

export type PinnedItemMap = {
    channel: PinnedChannel;
    yplaylist: PinnedYPlaylist;
    lplaylist: PinnedLPlaylist;
    video: PinnedVideo;
};

export type PinnedItem = PinnedItemMap[keyof PinnedItemMap];

export type PinnedItemType = PinnedItem['tag'];

export type PinnedItemValueMap = {
    channel: YChannel;
    yplaylist: YPlaylist;
    lplaylist: LPlaylist;
    video: Video;
};

export type PinnedEntryMap = {
    [K in PinnedItemType]: {
        id: PinnedItem['id'];
        tag: K;
        item: PinnedItemMap[K];
        value: PinnedItemValueMap[K];
    }
};

export type PinnedEntry = PinnedEntryMap[keyof PinnedEntryMap];

export interface FollowedChannel extends PositionableTrait {
    id: StringId;
    channel_id: string;
    created_at: StringUTC;
};

export type FollowedEntry = {
    id: StringId;
    item: FollowedChannel;
    value: YChannel;
};

export interface PlayRecord {
    id: StringId;
    video_id: StringId;
    created_at: StringUTC;
}
