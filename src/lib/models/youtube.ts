export type StringId = string;

export type StringNumber = `${number}`;

export type StringUTC = string;

export type Image = {
    url: string,
    width: number,
    height: number,
};

export type Channel = {
    id: StringId;
    handle: string;
    title: string;
    img: undefined | Image;
    published_at: StringUTC;
    updated_at: StringUTC;
};

export type Playlist = {
    id: string;
    channel_id: string;
    description: string;
    img: undefined | Image;
    item_count: number;
    privacy_status: string;
    published_at: string;
    updated_at: StringUTC;
    title: string;
};

export type PlaylistItem = {
    id: string;
    playlist_id: string;
    video_id: string;
    position: number;
    privacy_status: string;
    published_at: string;
};

export const VIDEO_FLAGS = {
    IS_AVAILABLE: 1 << 0,
    IS_PUBLIC: 1 << 1,
    IS_UNLISTED: 1 << 2,
    IS_PRIVATE: 1 << 3,
    IS_EMBEDDABLE: 1 << 4,
} as const;

export type VideoCompact = {
    id: string;
    flags: number,
    channel_id: string;
    channel_title: string;
    img: undefined | Image;
    published_at: string;
    title: string;
    total_seconds: number;
};

export type VideoCompactUnavailable = {
    id: string,
    flags: 0,
};

export type Duration = {
    s: number;
    m: number;
    h: number;
    d: number;
};

export type Video = VideoCompact & {
    duration: Duration;
    is_available: boolean;
    is_public: boolean;
    is_private: boolean;
    is_unlisted: boolean;
    is_embeddable: boolean;
};

export type SomeVideo = VideoCompact | VideoCompactUnavailable;

export type PlaylistEntry = {
    item: PlaylistItem,
    video: Video;
};
