<script lang="ts" module>
  /**
   * Base implementation https://github.com/PandaWhisperer/svelte-youtube/blob/master/src/index.svelte
   * All credits to PandaWhisperer
   */

  /**
   * Expose PlayerState constants for convenience. These constants can also be
   * accessed through the global YT object after the YouTube IFrame API is instantiated.
   *
   * @see https://developers.google.com/youtube/iframe_api_reference#onStateChange
   */
  export const PlayerState = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
  };
</script>

<script lang="ts">
  import { untrack } from "svelte";
  // @ts-expect-error
  import YoutubePlayer from "youtube-player";
  import type * as IFP from "./types.js";

  type Options = {
    width?: number;
    height?: number;
    playerVars?: IFP.YouTubePlayerOptions;
  };

  type Props = {
    video_id: string;
    options?: Options;
    on_ready?: (ev: IFP.YouTubeReadyEvent) => void;
    on_error?: (ev: IFP.YouTubeErrorEvent) => void;
    on_state_change?: (ev: IFP.YouTubeStateChangeEvent) => void;
    on_play?: (ev: IFP.YouTubeStateChangeEvent) => void;
    on_pause?: (ev: IFP.YouTubeStateChangeEvent) => void;
    on_end?: (ev: IFP.YouTubeStateChangeEvent) => void;
    on_playback_rate_change?: (ev: IFP.YouTubePlaybackRateChangeEvent) => void;
    on_playback_quality_change?: (ev: IFP.YouTubePlaybackQualityChangeEvent) => void;
    class?: string;
  };

  let {
    video_id,
    options = {},
    on_error,
    on_playback_quality_change,
    on_playback_rate_change,
    on_ready,
    on_state_change,
    on_end,
    on_pause,
    on_play,
    class: classes = "",
  }: Props = $props();

  let iframe_player_id = $props.id();
  let player: any;
  /**
   * @see https://developers.google.com/youtube/iframe_api_reference#onReady
   */
  function player_on_ready(ev: IFP.YouTubeReadyEvent) {
    on_ready?.(ev);
    play(video_id);
  }

  /**
   * @see https://developers.google.com/youtube/iframe_api_reference#onError
   */
  function player_on_error(ev: IFP.YouTubeErrorEvent) {
    on_error?.(ev);
  }

  /**
   * @see https://developers.google.com/youtube/iframe_api_reference#onStateChange
   */
  function player_on_state_change(ev: IFP.YouTubeStateChangeEvent) {
    on_state_change?.(ev);

    switch (ev.data) {
      case PlayerState.ENDED: {
        on_end?.(ev);
        break;
      }
      case PlayerState.PLAYING: {
        on_play?.(ev);
        break;
      }
      case PlayerState.PAUSED: {
        on_pause?.(ev);
        break;
      }
      default:
    }
  }

  /**
   * @see https://developers.google.com/youtube/iframe_api_reference#onPlaybackRateChange
   */
  function player_on_playback_rate_change(ev: IFP.YouTubePlaybackRateChangeEvent) {
    on_playback_rate_change?.(ev);
  }

  /**
   * @see https://developers.google.com/youtube/iframe_api_reference#onPlaybackQualityChange
   */
  function player_on_playback_quality_change(ev: IFP.YouTubePlaybackQualityChangeEvent) {
    on_playback_quality_change?.(ev);
  }

  function play(video_id: string) {
    if (player === undefined || !video_id) {
      return;
    }

    // this is needed because the loadVideoById function always starts playing,
    // even if you have set autoplay to 1 whereas the cueVideoById function
    // never starts autoplaying
    const autoplay = untrack(() => options).playerVars?.autoplay ?? 0;
    if (autoplay === 1) {
      player.loadVideoById(video_id);
    } else {
      player.cueVideoById(video_id);
    }
  }

  $effect(() => {
    player = YoutubePlayer(iframe_player_id, options);

    player.on("ready", player_on_ready);
    player.on("error", player_on_error);
    player.on("stateChange", player_on_state_change);
    player.on("playbackRateChange", player_on_playback_rate_change);
    player.on("playbackQualityChange", player_on_playback_quality_change);

    return () => {
      player.destroy();
      player = undefined;
    };
  });

  $effect(() => {
    play(video_id);
  });
</script>

<div class={classes}>
  <div id={iframe_player_id}></div>
</div>
