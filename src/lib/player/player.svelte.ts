import type * as Model from "$lib/models/index.js";
import type { Optional } from '$lib/utils/index.js';
import { assert, create_context } from '$lib/utils/index.js';
import type * as IFrameAPI from "./iframe_api.js";
// @ts-expect-error types missing, its fine
import YoutubePlayer from "youtube-player";


/**
 * Expose PlayerState constants for convenience. These constants can also be
 * accessed through the global YT object after the YouTube IFrame API is instantiated.
 *
 * @see https://developers.google.com/youtube/iframe_api_reference#onStateChange
 */
const PLAYER_STATE = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
} as const;

const POLL_IFRAME_INTERVAL = 500;

export type PlayerStateProps = {
    target_id: string | undefined;
    height: number;
    width: number;
    autoplay: boolean;
    controls: boolean;
    loop: boolean;
    muted: boolean;
    start: number;
    skip_on_unavailable: boolean;
    volume: number;
};

const DEFAULT_PROPS = {
    target_id: undefined,
    height: 0,
    width: 0,
    autoplay: true,
    controls: false,
    loop: false,
    muted: false,
    skip_on_unavailable: true,
    start: 0,
    volume: 25,
} satisfies PlayerStateProps;

/**
 * How the current track should repeat
 *
 * - 0 No repeat
 * - 1 Repeat in loop
 * - 2 Repear once
 */
export type PlayerRepeat = 0 | 1 | 2;

type PlayerInternalState = {
    entry_i: number;
    is_mode_list: boolean;
    is_mode_single: boolean;
    is_muted: boolean;
    is_paused: boolean;
    is_playing: boolean;
    repeat: PlayerRepeat;
    time_current: number,
    time_duration: number,
    volume: number,
} & ({
    is_unplayable: true;
    video_id: undefined;
} | {
    is_unplayable: false;
    video_id: string;
});

type CurrentTrack = {
    index: number,
    time_duration: number,
    time_current: number,
    time_percentage: number,
    unavailable: boolean,
} & ({
    unplayable: true,
    video?: Model.Video,
    entry?: Model.PlaylistEntry,
} | {
    unplayable: false,
    video: Model.Video,
    entry?: Model.PlaylistEntry,
});

class PlayerState {
    // @ts-expect-error its initilized inside effect
    #player: IFrameAPI.PlayerInstance;
    #not_ready: boolean;
    // @ts-expect-error its initilized inside effect
    #iframe: HTMLIFrameElement;
    #poll_iframe_id: Optional<number>;

    #props: Required<PlayerStateProps>;
    #state: PlayerInternalState;
    #entries: Model.PlaylistEntry[];

    #s_playlist: undefined | Model.Playlist = $state();
    #s_entries: Model.PlaylistEntry[] = $state([]);
    #s_current: CurrentTrack = $state({
        index: -1,
        time_current: 0,
        time_duration: 100,
        time_percentage: 0,
        unplayable: true,
        unavailable: false,
        video: undefined,
        entry: undefined,
    });
    #s_curr_i: number = $state(-1);
    #s_prev_entry = $derived.by(() => {
        if (this.#s_curr_i < 1 || this.#s_curr_i > this.#s_entries.length) {
            return undefined;
        }
        return this.#s_entries[this.#s_curr_i - 1];
    });
    #s_next_entry = $derived.by(() => {
        if (this.#s_curr_i < 0 || this.#s_curr_i > (this.#entries.length - 2)) {
            return undefined;
        }
        return this.#s_entries[this.#s_curr_i + 1];
    });

    #s_is_muted = $state(false);
    #s_is_paused = $state(false);
    #s_is_playing = $state(false);
    #s_repeat = $state(0);
    #s_volume = $state(25);

    constructor(props: Partial<PlayerStateProps>) {
        this.#not_ready = true;
        this.#props = { ...DEFAULT_PROPS, ...props };
        this.#state = {
            entry_i: -1,
            is_mode_single: false,
            is_mode_list: false,
            is_muted: this.#props.muted,
            is_paused: false,
            is_playing: false,
            is_unplayable: true,
            repeat: 0,
            time_current: 0,
            time_duration: 100,
            video_id: undefined,
            volume: this.#props.volume,
        };
        this.#entries = [];

        const options = {
            height: this.#props.height,
            width: this.#props.width,
            playerVars: {
                autoplay: this.#props.autoplay ? 1 : 0,
                controls: this.#props.controls ? 1 : 0,
                loop: this.#props.loop ? 1 : 0,
                start: this.#props.start,
                enablejsapi: 1,
            },
        } satisfies IFrameAPI.PlayerOptions;

        this.#s_is_muted = this.#props.muted;

        $effect(() => {
            const player = YoutubePlayer(this.#props.target_id, options);
            player.on("ready", this.#player_on_ready);
            player.on("error", this.#player_on_error);
            player.on("stateChange", this.#player_on_state_change);
            player.on("playbackRateChange", this.#player_on_playback_rate_change);
            player.on("playbackQualityChange", this.#player_on_playback_quality_change);

            return () => {
                this.#not_ready = true;
                if (this.#player !== undefined) {
                    this.#player.destroy();
                }
                clearInterval(this.#poll_iframe_id);
            };
        });
    }

    #player_on_ready = (ev: IFrameAPI.ReadyEvent): void => {
        this.#player = ev.target;
        this.#not_ready = false;
        this.#iframe = this.#player.getIframe();

        // sync state
        this.#player.setVolume(this.#state.volume);
        if (this.#state.is_muted) {
            this.#player.mute();
        }
        this.#poll_iframe_id = setInterval(this.#on_iframe_poll, POLL_IFRAME_INTERVAL);

        // autoplay
        this.#play();
    };

    #player_on_error = (ev: IFrameAPI.ErrorEvent): void => {
        if (ev.data !== 101 && ev.data !== 150) {
            return;
        }

        if (this.#state.is_mode_list && this.#props.skip_on_unavailable) {
            this.next_track();
            return;
        }

        this.#state.is_playing = false;
        this.#s_current.unavailable = true;
        this.#s_is_playing = false;
    };

    #player_on_state_change = (ev: IFrameAPI.StateChangeEvent): void => {
        switch (ev.data) {
            case PLAYER_STATE.ENDED: {
                this.#state.is_playing = false;
                this.#s_is_playing = false;
                switch (this.#state.repeat) {
                    case 0: {
                        this.next_track();
                        break;
                    }
                    case 1: {
                        this.#player.playVideo();
                        break;
                    }
                    case 2: {
                        this.#state.repeat = 0;
                        this.#s_repeat = 0;
                        this.#player.playVideo();
                        break;
                    }
                }
                break;
            }
            case PLAYER_STATE.PLAYING: {
                this.#state.is_paused = false;
                this.#state.is_playing = true;
                this.#s_is_paused = false;
                this.#s_is_playing = true;
                this.#s_current.unavailable = false;
                break;
            }
            case PLAYER_STATE.PAUSED: {
                this.#state.is_paused = true;
                this.#state.is_playing = false;
                this.#s_is_paused = true;
                this.#s_is_playing = false;
                break;
            }
            default:
        }
    };

    #player_on_playback_rate_change = (ev: IFrameAPI.PlaybackRateChangeEvent): void => {
        // parent cb
    };

    #player_on_playback_quality_change = (ev: IFrameAPI.PlaybackQualityChangeEvent): void => {
        // parent cb
    };

    #on_iframe_poll = () => {
        if (this.#not_ready) {
            return;
        }

        const time = this.#player.getCurrentTime() ?? 100;
        const duration = this.#player.getDuration() ?? 100;
        this.#s_current.time_current = this.#state.time_current = Math.floor(time);
        this.#s_current.time_duration = this.#state.time_duration = Math.ceil(duration);
        this.#s_current.time_percentage = time / duration;
    };

    #play = (): void => {
        if (this.#not_ready || this.#state.is_unplayable) {
            return;
        }

        // this is needed because the loadVideoById function always starts playing,
        // even if you have set autoplay to 1 whereas the cueVideoById function
        // never starts autoplaying
        if (this.#props.autoplay) {
            this.#player.loadVideoById(this.#state.video_id);
        } else {
            this.#player.cueVideoById(this.#state.video_id);
        }
    };

    play = (video_id: string): void => {
        this.#state.video_id = video_id;
        this.#state.is_mode_list = false;
        this.#state.is_mode_single = true;
        this.#state.is_unplayable = false;
        this.#play();
    };

    play_by_index = (index: number): void => {
        assert(index > 0 && index <= this.#entries.length, `Invalid playlist index '${index}'`);

        const i = index - 1;
        const e = this.#entries[i];

        this.#state.entry_i = i;
        this.#state.video_id = e.video.id;
        this.#state.is_mode_list = true;
        this.#state.is_mode_single = false;

        this.#s_curr_i = i;
        this.#s_current.index = index;
        this.#s_current.entry = e;
        this.#s_current.unavailable = !(e.video.is_available && e.video.is_embeddable);
        this.#s_current.unplayable = false;
        this.#s_current.video = e.video;
        this.#play();
    };

    set_playlist = (value: Model.Playlist): void => {
        this.#s_playlist = value;
    };

    set_entries = (value: Model.PlaylistEntry[]): void => {
        const valid = [];
        for (const e of value) {
            if (e.video.is_available && e.video.is_embeddable) {
                valid.push(e);
            }
        }

        this.#entries = valid;
        this.#state.is_mode_list = true;
        this.#state.is_mode_single = false;
        this.#state.is_unplayable = false;
        this.#s_entries = [...valid];
        this.#s_curr_i = 0;
    };

    shuffle = (): void => {
        this.#entries.sort(() => Math.random() - 0.5);
        this.#s_entries = [...this.#entries];
        this.play_by_index(1);
    };

    prev_track = (): void => {
        const prev_i = (this.#state.entry_i - 1) % this.#entries.length;
        this.play_by_index(prev_i + 1);
    };

    next_track = (): void => {
        const next_i = (this.#state.entry_i + 1) % this.#entries.length;
        this.play_by_index(next_i + 1);
    };

    toggle_play = (): void => {
        if (this.#state.is_playing) {
            this.#player.pauseVideo();
        }
        else {
            this.#player.playVideo();
        }
    };

    toggle_mute = (): void => {
        if (this.#state.is_muted) {
            this.#player.unMute();
            this.#state.is_muted = false;
            this.#s_is_muted = false;
        }
        else {
            this.#player.mute();
            this.#state.is_muted = true;
            this.#s_is_muted = true;
        }
    };

    seek_to = (value: number): void => {
        assert(value >= 0 && value <= this.#state.time_duration, `Invalid duration passed in '${value}'`);
        this.#player.seekTo(value, true);
    };

    seek_to_percentage = (value: number): void => {
        assert(value >= 0 && value <= 100, `Invalid percent passed in '${value}'`);
        const seconds = Math.floor(this.#state.time_duration * value * 0.01);
        assert(seconds > 0 && seconds <= this.#state.time_duration, `Invalid duration passed in '${seconds}'`);
        this.#player.seekTo(seconds, true);
    };

    set_repeat = (value: PlayerRepeat): void => {
        this.#state.repeat = value;
        this.#s_repeat = value;
    };

    set_volume = (value: number): void => {
        assert(value >= 0 && value <= 100, `Invalid volume passed in '${value}'`);
        this.#state.volume = value;
        this.#player.setVolume(value);
        this.#s_volume = value;
    };

    // eslint-disable-next-line no-unused-private-class-members
    #move_to = (id: string): boolean => {
        if (this.#not_ready) {
            return false;
        }
        const target = document.getElementById(id);
        if (target == null) {
            return false;
        }
        target.appendChild(this.#iframe);
        return true;
    };

    get is_playing(): boolean { return this.#s_is_playing; }

    get is_paused(): boolean { return this.#s_is_paused; }

    get is_muted(): boolean { return this.#s_is_muted; }

    get volume(): number { return this.#s_volume; }

    get repeat(): number { return this.#s_repeat; }

    get current(): CurrentTrack { return this.#s_current; }

    get prev_entry(): Optional<Model.PlaylistEntry> { return this.#s_prev_entry; }

    get next_entry(): Optional<Model.PlaylistEntry> { return this.#s_next_entry; }

    get playlist(): Optional<Model.Playlist> { return this.#s_playlist; }

    get tracks(): Model.PlaylistEntry[] { return this.#s_entries; }
}


const player_ctx = create_context<PlayerState>('player');

export function use_player_ctx(): PlayerState;
export function use_player_ctx(...args: ConstructorParameters<typeof PlayerState>): PlayerState;
export function use_player_ctx(...args: ConstructorParameters<typeof PlayerState> | []): PlayerState {
    if (args.length) {
        return player_ctx.set(new PlayerState(...args));
    }
    return player_ctx.get();
}
