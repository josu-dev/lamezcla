import * as Model from '$lib/models/index.js';


export type Channel = Pick<Model.Channel, 'id' | 'handle' | 'img' | 'published_at' | 'title'>;

export type Playlist = Pick<Model.Playlist, 'id' | 'channel_id' | 'description' | 'img' | 'item_count' | 'privacy_status' | 'published_at' | 'title'>;

export type PlaylistItem = Pick<Model.PlaylistItem, 'id' | 'playlist_id' | 'video_id' | 'position' | 'privacy_status' | 'published_at'>;

export type VideoCompact = Model.VideoCompact;

export type VideoCompactUnavailable = Model.VideoCompactUnavailable;

export type SomeVideoCompact = VideoCompact | VideoCompactUnavailable;
