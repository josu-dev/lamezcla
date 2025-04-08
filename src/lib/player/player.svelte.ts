import { create_context, type UseContextArgs } from '$lib/client/state/shared.js';
import type * as Model from "$lib/models/index.js";
import { assert, type Optional } from '$lib/utils/index.js';
import { untrack } from 'svelte';
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
};

const DEFAULT_PROPS = {
    target_id: undefined,
    height: 0,
    width: 0,
    autoplay: true,
    controls: false,
    loop: false,
    muted: false,
    start: 0,
    skip_on_unavailable: true,
} satisfies PlayerStateProps;

type IDontKnow = {
    entry: Optional<Model.PlaylistEntry>;
    video_id: Optional<string>;
};

class PlayerState {
    // @ts-expect-error its initilized inside effect
    #player: IFrameAPI.PlayerInstance;
    // @ts-expect-error its initilized inside effect
    #iframe: HTMLIFrameElement;

    #not_ready: boolean;
    #poll_iframe_id: Optional<number>;

    #props: Required<PlayerStateProps>;
    #state: {
        index: number;
        is_mode_single: boolean;
        is_mode_list: boolean;
        is_muted: boolean;
        is_playing: boolean;
    } & ({
        is_unplayable: true;
        video_id: undefined;
    } | {
        is_unplayable: false;
        video_id: string;
    });
    #entries: Model.PlaylistEntry[];

    #s_playlist: undefined | Model.Playlist = $state();
    #s_entries: Model.PlaylistEntry[] = $state([]);
    #s_curr_index: number = $state(-1);
    #s_curr_entry = $derived.by(() => {
        if (this.#s_curr_index < 0 || this.#s_curr_index > (this.#s_entries.length - 1)) {
            return undefined;
        }
        return this.#s_entries[this.#s_curr_index];
    });
    #s_prev_entry = $derived.by(() => {
        if (this.#s_curr_index < 1 || this.#s_curr_index > this.#s_entries.length) {
            return undefined;
        }
        return this.#s_entries[this.#s_curr_index - 1];
    });
    #s_next_entry = $derived.by(() => {
        if (this.#s_curr_index < 0 || this.#s_curr_index > (this.#entries.length - 2)) {
            return undefined;
        }
        return this.#s_entries[this.#s_curr_index + 1];
    });

    #s_is_playing = $state(false);
    #s_is_paused = $state(false);
    #s_is_unavailable = $derived(this.#s_curr_entry?.video?.is_embeddable !== true);
    #s_is_muted = $state(false);
    #s_progress = $state(0);
    #s_repeat = $state(0);
    #s_volume = $state(25);

    constructor(props: Partial<PlayerStateProps>) {
        this.#props = { ...DEFAULT_PROPS, ...props };

        this.#not_ready = true;
        this.#state = {
            index: -1,
            is_mode_single: false,
            is_mode_list: false,
            is_muted: this.#props.muted,
            is_playing: false,
            is_unplayable: true,
            video_id: undefined,
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

    #player_on_ready = (ev: IFrameAPI.ReadyEvent) => {
        this.#player = ev.target;
        this.#not_ready = false;
        this.#iframe = this.#player.getIframe();

        // sync state
        this.#player.setVolume(this.#s_volume);
        if (this.#s_is_muted) {
            this.#player.mute();
        }
        this.#poll_iframe_id = setInterval(() => {
            if (this.#not_ready) {
                this.#s_progress = Math.floor((this.#player.getCurrentTime() * 100) / (this.#player.getDuration() || 100));
            }
        }, 1000);

        // autoplay
        this.#play();
    };

    #player_on_error = (ev: IFrameAPI.ErrorEvent) => {
        if (ev.data !== 101 && ev.data !== 150) {
            return;
        }

        if (this.#state.is_mode_list && this.#props.skip_on_unavailable) {
            this.next_track();
            return;
        }

        this.#state.is_playing = false;
        this.#s_is_unavailable = true;
        this.#s_is_playing = false;
    };

    #player_on_state_change = (ev: IFrameAPI.StateChangeEvent) => {
        switch (ev.data) {
            case PLAYER_STATE.ENDED: {
                this.#state.is_playing = false;
                this.#s_is_playing = false;
                switch (this.#s_repeat) {
                    case 0: {
                        this.next_track();
                        break;
                    }
                    case 1: {
                        this.#player.playVideo();
                        break;
                    }
                    case 2: {
                        this.#s_repeat = 0;
                        break;
                    }
                }
                break;
            }
            case PLAYER_STATE.PLAYING: {
                this.#state.is_playing = true;
                this.#s_is_paused = false;
                this.#s_is_playing = true;
                this.#s_is_unavailable = false;
                break;
            }
            case PLAYER_STATE.PAUSED: {
                this.#state.is_playing = false;
                this.#s_is_paused = true;
                this.#s_is_playing = false;
                break;
            }
            default:
        }
    };

    #player_on_playback_rate_change = (ev: IFrameAPI.PlaybackRateChangeEvent) => {
        // parent cb
    };

    #player_on_playback_quality_change = (ev: IFrameAPI.PlaybackQualityChangeEvent) => {
        // parent cb
    };

    #play = () => {
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

    play = (video_id: string) => {
        // if (video_id === undefined && this.#tracks.length) {
        //     this.#video_id = this.#tracks[0].video.id;
        //     video_id = this.#video_id;
        // }
        this.#state.video_id = video_id;
        this.#state.is_mode_list = false;
        this.#state.is_mode_single = true;
        this.#state.is_unplayable = false;
        this.#play();
    };

    play_by_index = (index: number) => {
        assert(index > 0 && index <= this.#entries.length, `Invalid playlist index '${index}'`);

        const t = this.#entries[index - 1];
        this.#state.video_id = t.video.id;
        this.#state.is_mode_list = true;
        this.#state.is_mode_single = false;
        this.#s_curr_index = index - 1;
        this.#play();
    };

    set_playlist = (value: Model.Playlist) => {
        this.#s_playlist = value;
    };

    set_entries = (value: Model.PlaylistEntry[]) => {
        const valid = [];
        for (const e of value) {
            if (e.video.is_available && e.video.is_embeddable) {
                valid.push(e);
            }
        }
        this.#entries = value;
        this.#state.is_mode_list = true;
        this.#state.is_mode_single = false;
        this.#state.is_unplayable = false;
        this.#s_entries = [...valid];
        this.#s_curr_index = 0;
    };

    shuffle = () => {
        this.#entries.sort(() => Math.random() - 0.5);
        this.#s_entries = [...this.#entries];
        this.play_by_index(1);
    };

    prev_track = () => {
        const prev_i = (untrack(() => this.#s_curr_index) - 1) % this.#entries.length;
        this.play_by_index(prev_i + 1);
    };

    next_track = () => {
        const prev_i = (untrack(() => this.#s_curr_index) + 1) % this.#entries.length;
        this.play_by_index(prev_i + 1);
    };

    toggle_play = () => {
        if (this.#state.is_playing) {
            this.#player.pauseVideo();
        }
        else {
            this.#player.playVideo();
        }
    };

    toggle_mute = () => {
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

    set_volume = (value: number) => {
        this.#player.setVolume(value);
        this.#s_volume = value;
    };

    set_repeat = (value: number) => {
        this.#s_repeat = value;
    };

    move_to = (id: string) => {
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

    get is_playing() { return this.#s_is_playing; }

    get is_paused() { return this.#s_is_paused; }

    get is_muted() { return this.#s_is_muted; }

    get progress() { return this.#s_progress; }

    get volume() { return this.#s_volume; }

    get repeat() { return this.#s_repeat; }

    get curr_entry() { return this.#s_curr_entry; }

    get prev_entry() { return this.#s_prev_entry; }

    get next_entry() { return this.#s_next_entry; }

    get playlist() { return this.#s_playlist; }

    get tracks() { return this.#s_entries; }

    get curr_entry_is_unavailable() { return this.#s_is_unavailable; }
}


const player_ctx = create_context<PlayerState>('player');

export function use_player_ctx(): PlayerState;
export function use_player_ctx(...args: UseContextArgs<typeof PlayerState>): PlayerState;
export function use_player_ctx(...args: UseContextArgs<typeof PlayerState> | []): PlayerState {
    if (args.length) {
        return player_ctx.set(new PlayerState(...args));
    }
    return player_ctx.get();
}
