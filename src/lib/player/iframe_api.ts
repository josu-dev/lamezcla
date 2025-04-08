export type PlayerVars = {
    /**
     * This parameter specifies whether the initial video will automatically start to play when the player loads.
     * Supported values are 0 or 1. The default value is 0.
     */
    autoplay?: 0 | 1;
    /**
     * This parameter specifies the default language that the player will use to display captions.
     * Set the parameter's value to an ISO 639-1 two-letter language code.
     */
    cc_lang_pref?: string;
    /**
     * Setting the parameter's value to 1 causes closed captions to be shown by default, even if the user has turned captions off.
     * The default behavior is based on user preference.
     */
    cc_load_policy?: 1;
    /**
     * This parameter specifies the color that will be used in the player's video progress bar to highlight the amount of the video that the viewer has already seen.
     * Valid parameter values are red and white, and, by default, the player uses the color red in the video progress bar.
     */
    color?: "red" | "white";
    /**
     * This parameter indicates whether the video player controls are displayed.
     */
    controls?: 0 | 1;
    /**
     * Setting the parameter's value to 1 causes the player to not respond to keyboard controls.
     * The default value is 0, which means that keyboard controls are enabled.
     */
    disablekb?: 1;
    /**
     * Setting the parameter's value to 1 enables the player to be controlled via IFrame Player API calls.
     * The default value is 0, which means that the player cannot be controlled using that API.
     */
    enablejsapi?: 1;
    /**
     * This parameter specifies the time, measured in seconds from the start of the video, when the player should stop playing the video.
     * The parameter value is a positive integer.
     */
    end?: number;
    /**
     * Setting this parameter to 0 prevents the fullscreen button from displaying in the player.
     * The default value is 1, which causes the fullscreen button to display.
     */
    fs?: 0 | 1;
    /**
     * Sets the player's interface language. The parameter value is an ISO 639-1 two-letter language code or a fully specified locale.
     */
    hl?: string;
    /**
     * Setting the parameter's value to 1 causes video annotations to be shown by default, whereas setting to 3 causes video annotations to not be shown by default.
     * The default value is 1.
     */
    iv_load_policy?: 1 | 3;
    /**
     * The list parameter, in conjunction with the listType parameter, identifies the content that will load in the player.
     */
    list?: string;
    /**
     * The listType parameter, in conjunction with the list parameter, identifies the content that will load in the player.
     * Valid parameter values are playlist and user_uploads.
     */
    listType?: "playlist" | "user_uploads";
    /**
     * In the case of a single video player, a setting of 1 causes the player to play the initial video again and again.
     * In the case of a playlist player (or custom player), the player plays the entire playlist and then starts again at the first video.
     * Supported values are 0 and 1, and the default value is 0.
     */
    loop?: 0 | 1;
    /**
     * @deprecated This parameter is deprecated and has no effect.
     */
    modestbranding?: 0 | 1;
    /**
     * This parameter provides an extra security measure for the IFrame API and is only supported for IFrame embeds.
     * If you are using the IFrame API, which means you are setting the enablejsapi parameter value to 1, you should always specify your domain as the origin parameter value.
     */
    origin?: string;
    /**
     * This parameter specifies a comma-separated list of video IDs to play.
     * If you specify a value, the first video that plays will be the VIDEO_ID specified in the URL path, and the videos specified in the playlist parameter will play thereafter.
     */
    playlist?: string;
    /**
     * This parameter controls whether videos play inline or fullscreen on iOS.
     */
    playsinline?: 0 | 1;
    /**
     * This parameter indicates whether the player should show related videos when playback of the initial video ends.
     */
    rel?: 0 | 1;
    /**
     * This parameter causes the player to begin playing the video at the given number of seconds from the start of the video.
     * The parameter value is a positive integer.
     */
    start?: number;
    /**
     * This parameter identifies the URL where the player is embedded.
     * This value is used in YouTube Analytics reporting when the YouTube player is embedded in a widget, and that widget is then embedded in a web page or application.
     */
    widget_referrer?: string;
};

export type PlayerOptions = {
    videoId?: string;
    height?: number;
    width?: number;
    playerVars?: PlayerVars;
};

export type PlayerInstance = {
    addEventListener: (event: string, listener: (...args: any) => any) => void;
    destroy: () => void;
    getAvailablePlaybackRates: () => number;
    getAvailableQualityLevels: () => string;
    getCurrentTime: () => number;
    getDuration: () => number;
    getIframe: () => HTMLIFrameElement;
    getOption: (module: string, option: string) => any;
    getOptions: (module?: string) => any;
    setOption: (module: string, option: string, value: any) => void;
    setOptions: (options: Record<string, any>) => void;
    cuePlaylist: (playlist: string | string, index?: number, startSeconds?: number, suggestedQuality?: string) => void;
    loadPlaylist: (playlist: string | string, index?: number, startSeconds?: number, suggestedQuality?: string) => void;
    getPlaylist: () => string;
    getPlaylistIndex: () => number;
    getPlaybackQuality: () => string;
    getPlaybackRate: () => number;
    getPlayerState: () => number;
    getVideoEmbedCode: () => string;
    getVideoLoadedFraction: () => number;
    getVideoUrl: () => string;
    getVolume: () => number;
    cueVideoById: (videoId: string, startSeconds?: number, endSeconds?: number, suggestedQuality?: string) => void;
    cueVideoByUrl: (mediaContentUrl: string, startSeconds?: number, endSeconds?: number, suggestedQuality?: string) => void;
    loadVideoByUrl: (mediaContentUrl: string, startSeconds?: number, endSeconds?: number, suggestedQuality?: string) => void;
    loadVideoById: (videoId: string, startSeconds?: number, endSeconds?: number, suggestedQuality?: string) => void;
    isMuted: () => boolean;
    mute: () => void;
    nextVideo: () => void;
    pauseVideo: () => void;
    playVideo: () => void;
    playVideoAt: (index: number) => void;
    previousVideo: () => void;
    removeEventListener: (event: string, listener: (...args: any) => any) => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    setLoop: (loopPlaylists: boolean) => void;
    setPlaybackQuality: (suggestedQuality: string) => void;
    setPlaybackRate: (suggestedRate: number) => void;
    setShuffle: (shufflePlaylist: boolean) => void;
    setSize: (width: number, height: number) => object;
    setVolume: (volume: number) => void;
    stopVideo: () => void;
    unMute: () => void;
    getSphericalProperties: () => {
        fov: number;
        yaw: number;
        pitch: number;
        roll: number;
        enableOrientationSensor: boolean;
    };
    setSphericalProperties: (properties: {
        fov?: number;
        yaw?: number;
        pitch?: number;
        roll?: number;
        enableOrientationSensor?: boolean;
    }) => void;
};

type PlayerEventBase = {
    target: PlayerInstance;
};

export type ReadyEvent = PlayerEventBase;

export type PlayerStates = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
};

export type PlayerState = PlayerStates[keyof PlayerStates];

export type StateChangeEvent = PlayerEventBase & {
    data: PlayerState;
};

export type PlaybackQuality = 'small' | 'medium' | 'large' | 'hd720' | 'hd1080' | 'highres';

export type PlaybackQualityChangeEvent = PlayerEventBase & {
    data: PlaybackQuality;
};

export type PlaybackRateChangeEvent = PlayerEventBase & {
    data: number;
};

export type PlayerErrors = {
    INVALID_PARAMETER: 2,
    HTML5_ERROR: 5,
    VIDEO_NOT_FOUND: 100,
    EMBEDDED_PLAYER_NOT_ALLOWED: 101,
    EMBEDDED_PLAYER_NOT_ALLOWED_ALT: 150,
};

export type PlayerError = PlayerErrors[keyof PlayerErrors];

export type ErrorEvent = PlayerEventBase & {
    data: PlayerError;
};

export type ApiChangeEvent = PlayerEventBase;

export type AutoplayBlockedEvent = PlayerEventBase;
