import * as Model from '$lib/models/index.js';
import type { PropsNoChildren, PropsWithChildren } from '$lib/utils/index.js';


/**
 * Expose PlayerState constants for convenience. These constants can also be
 * accessed through the global YT object after the YouTube IFrame API is instantiated.
 *
 * @see https://developers.google.com/youtube/iframe_api_reference#onStateChange
 */
export const PLAYER_STATE = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
} as const;

/**
 * How the current track should repeat
 *
 * - 0 No repeat
 * - 1 Repeat in loop
 * - 2 Repear once
 */
export type PlayerRepeat = 0 | 1 | 2;


export type PlayerStateOptions = {
    target_id: string;
    height: number;
    width: number;
    autoplay: boolean;
    controls: boolean;
    start: undefined | number;
    end: undefined | number;
    muted: boolean;
    repeat: PlayerRepeat;
    volume: number;
    persist: boolean;
    persist_key: string;
    skip_on_unavailable: boolean;
};

export type PlayerStateOptionsInit = {
    target_id: string;
    height: number;
    width: number;
    autoplay?: undefined | boolean;
    controls?: undefined | boolean;
    start?: undefined | number;
    end?: undefined | number;
    muted?: undefined | boolean;
    repeat?: undefined | PlayerRepeat;
    volume?: undefined | number;
    persist?: undefined | boolean;
    skip_on_unavailable?: undefined | boolean;
};

export type PlayerProviderProps = PropsWithChildren<{
    audio_only?: boolean;
    options?: PlayerStateOptionsInit;
}>;

export type PlayerStaticProps = PropsNoChildren<{
    channel?: Model.Channel;
    video?: Model.Video;
    start_index?: number;
    playlist?: Model.Playlist;
    playlist_entries?: Model.PlaylistEntry[];
}>;

export type PlayerControlsGlobalProps = PropsNoChildren<{
    hide?: boolean;
    hide_on_routes?: string[];
}>;

export type PlayerControlsStaticProps = PropsNoChildren;

export type PlayerTracklistProps = PropsNoChildren<{
    channel?: Model.Channel;
    playlist: Model.Playlist;
    entries: Model.PlaylistEntry[];
    current_entry?: Model.StringId;
    on_select?: (value: Model.PlaylistEntry, index: number) => void;
}>;
