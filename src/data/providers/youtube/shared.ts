import * as Model from '$data/models/index.js';


export type Channel = Pick<
    Model.YChannel,
    'id' | 'handle' | 'img' | 'created_at' | 'title'
>;

export type Playlist = Pick<
    Model.YPlaylist,
    'id' | 'channel_id' | 'description' | 'img' | 'item_count' | 'privacy_status' | 'created_at' | 'title'
>;

export type PlaylistItemCompact = Pick<
    Model.PlaylistItemCompact,
    'id' | 'playlist_id' | 'video_id' | 'flags' | 'position' | 'created_at'
>;

export type VideoCompact = Pick<
    Model.VideoCompact,
    'id' | 'channel_id' | 'flags' | 'channel_title' | 'title' | 'img' | 'duration_s' | 'created_at'
>;

export type VideoCompactUnavailable = Model.VideoCompactUnavailable;

export type SomeVideoCompact = VideoCompact | VideoCompactUnavailable;
