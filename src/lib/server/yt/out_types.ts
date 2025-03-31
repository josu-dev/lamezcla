export type { StringId } from './api_types.js';

export type Channel = {
    id: string;
    handle: string;
    title: string;
};

export type Playlist = {
    id: string;
    channel_id: string;
    title: string;
    description: string;
    published_at: string;
    privacy_status: string;
    item_count: number;
};

export type PlaylistItem = {
    id: string;
    playlist_id: string;
    video_id: string;
    privacy_status: string;
    available: boolean;
    published_at: string;
};

export type Video = {
    id: string;
    channel_id: string;
    channel_title: string;
    title: string;
    duration: string;
    privacy_status: string;
    embeddable: boolean;
    published_at: string;
};
