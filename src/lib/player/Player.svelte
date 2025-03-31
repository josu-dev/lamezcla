<script lang="ts">
  import Controls from "$lib/player/Controls.svelte";
  import IFramePlayer from "$lib/player/IFramePlayer/IFramePlayer.svelte";
  import type * as IFP from "$lib/player/IFramePlayer/types.js";
  import Tracklist from "$lib/player/Tracklist.svelte";
  import type { PlaylistItem, TrackId, Video } from "$lib/player/types.js";
  import { channel_url } from "$lib/player/utils.js";

  const YT_AUTOPLAY = 1;
  const YT_SHOW_CONTROLS = 0;
  type Props = {
    playlist: {
      tracks: {
        item: PlaylistItem;
        video: Video | undefined;
      }[];
      id: string;
      channel_id: string;
      title: string;
      description: string;
      published_at: string;
      privacy_status: string;
      item_count: number;
    };
  };

  let player: undefined | IFP.YouTubePlayerInstance;

  let { playlist }: Props = $props();
  let tracks = $derived.by(() => {
    const out = [];
    for (const t of playlist.tracks) {
      if (t.video == null || !t.video.embeddable) {
        continue;
      }
      out.push(t);
    }
    return out;
  });
  let idx = $state(0);
  let curr = $derived.by(() => {
    return tracks[idx];
  });
  let prev = $derived.by(() => {
    if (idx > 0) {
      return tracks[idx - 1];
    }
    return undefined;
  });
  let next = $derived.by(() => {
    if (idx >= tracks.length) {
      return undefined;
    }
    return tracks[idx + 1];
  });
  let progress = $state(0);
  let repeat = $state(0);
  let is_playing = $state(false);
  let is_paused = $state(false);
  let is_unavailable = $derived(curr.video?.embeddable !== true);
  let is_volume_menu_open = $state(false);
  let is_muted = $state(false);
  let volume = $state(50);

  function set_idx_by_id(id: TrackId) {
    for (let i = 0; i < tracks.length; i++) {
      if (tracks[i].item.id === id) {
        idx = i;
        break;
      }
    }
  }
  // $effect.pre(() => {
  //   const _ = curr;
  //   is_unavailable =
  // })

  function shuffle_tracks() {
    tracks.sort(() => Math.random() - 0.5);
    tracks = tracks;
  }
  function next_track() {
    idx = (idx + 1) % tracks.length;
  }

  function prev_track() {
    idx = (idx - 1) % tracks.length;
  }

  function play_resume_track() {
    if (is_playing) {
      player?.pauseVideo();
    } else {
      player?.playVideo();
    }
  }

  function toggle_mute() {
    if (is_muted) {
      player?.unMute();
      is_muted = false;
    } else {
      player?.mute();
      is_muted = true;
    }
  }
  function set_volume(value: number) {
    player?.setVolume(value);
    volume = value;
  }

  function set_repeat(value: number) {
    repeat = value;
  }

  function player_on_ready(ev: IFP.YouTubeReadyEvent) {
    player = ev.target;
    console.log("on ready", player?.getPlayerState());
  }

  function player_on_play(ev: IFP.YouTubeStateChangeEvent) {
    is_paused = false;
    is_playing = true;
    is_unavailable = false;
    console.log("play", player?.getPlayerState());
  }

  function player_on_pause(ev: IFP.YouTubeStateChangeEvent) {
    is_paused = true;
    is_playing = false;
  }

  function player_on_end(ev: IFP.YouTubeStateChangeEvent) {
    is_playing = false;
    if (repeat === 0) {
      next_track();
    } else if (repeat === 1) {
      player?.playVideo();
    } else {
      repeat = 0;
      player?.playVideo();
    }
  }

  function player_on_state_change(ev: IFP.YouTubeStateChangeEvent) {
    console.log(ev);
  }

  function player_on_error(ev: IFP.YouTubeErrorEvent) {
    if (ev.data === 101 || ev.data === 150) {
      is_unavailable = true;
    }
    console.log("error", ev);
  }

  $effect(() => {
    const _ = playlist;
    idx = 0;
  });
  $effect(() => {
    const id = setInterval(() => {
      progress = Math.floor(((player?.getCurrentTime() ?? 0) * 100) / (player?.getDuration() || 100));
    }, 16);
    return () => {
      clearInterval(id);
    };
  });
</script>

<div class="flex w-full h-full">
  <div class="flex flex-col w-full bg-none">
    <div class="flex-none flex justify-center py-2">
      <h2 class="text-base font-bold">
        {playlist.title}
      </h2>
    </div>
    <div class="flex-1 grid place-items-center">
      {#if curr.video === undefined || is_unavailable}
        <div class="text-red-500 font-bold">Not available</div>
      {:else}
        <div class="flex flex-col items-center max-w-[min(80%,36rem)]">
          <div tabindex="-1">
            <IFramePlayer
              options={{
                height: 252,
                width: 448,
                playerVars: {
                  autoplay: YT_AUTOPLAY,
                  controls: YT_SHOW_CONTROLS,
                  enablejsapi: 1,
                },
              }}
              video_id={curr.video.id}
              on_ready={player_on_ready}
              on_play={player_on_play}
              on_pause={player_on_pause}
              on_end={player_on_end}
              on_state_change={player_on_state_change}
              on_error={player_on_error}
            />
          </div>
          <div class="text-center my-4">
            <h3 class="text-xl font-bold text-pretty leading-tight">{curr.video?.title}</h3>
            <a
              href={channel_url(curr.video.channel_id)}
              rel="noopener noreferrer"
              class="block font-bold text-muted-foreground mt-1.5"
            >
              {curr.video?.channel_title}
            </a>
          </div>
        </div>
      {/if}
    </div>

    <div class="py-4 px-8">
      <!-- <div class="px-4 py-2 flex flex-col gap-y-1 bg-background rounded-md border-dev flex-none max-w-5xl mx-auto">
        <div class="h-0.5 bg-none rounded-full overflow-hidden">
          <div class="h-full bg-red-500" style="width: {progress}%;"></div>
        </div>
        <div class="flex items-center justify-center gap-x-2">
          <Button onclick={shuffle_tracks} title="Shuffle">
            <Shuffle />
          </Button>
          <Button onclick={prev_track} title="Skip back">
            <SkipBack />
          </Button>
          <Button onclick={play_resume_track} title="Play">
            {#if is_playing}
              <Pause />
            {:else}
              <Play />
            {/if}
          </Button>
          <Button onclick={next_track} title="Skip ahead">
            <SkipForward />
          </Button>
          <div id="volume-container" class="relative">
            <Button onclick={() => (is_volume_menu_open = !is_volume_menu_open)} title="Volume">
              {#if is_muted}
                <VolumeOff />
              {:else}
                <Volume2 />
              {/if}
            </Button>

            {#if is_volume_menu_open}
              <div
                class="absolute bottom-full mb-2 bg-background border border-gray-200 rounded-md p-3 shadow-lg flex items-center gap-x-2 min-w-32"
              >
                <button
                  class="flex-none focus:outline-none"
                  onclick={() => {
                    is_muted = !is_muted;
                  }}
                  title={is_muted ? "Unmute" : "Mute"}
                >
                  {#if is_muted}
                    <VolumeOff />
                  {:else}
                    <Volume2 />
                  {/if}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  oninput={(ev) => {
                    set_volume(ev.currentTarget.valueAsNumber);
                  }}
                  class="w-full rounded-md accent-primary"
                />
              </div>
            {/if}
          </div>
        </div>
      </div> -->
      <Controls
        {is_paused}
        {is_playing}
        {is_muted}
        {progress}
        {volume}
        {repeat}
        on_shuffle_tracks={shuffle_tracks}
        on_next_track={next_track}
        on_prev_track={prev_track}
        on_toggle_mute={toggle_mute}
        on_toggle_play={play_resume_track}
        on_volume_change={set_volume}
        on_repeat_track={set_repeat}
      />
    </div>
  </div>

  <Tracklist {playlist} {tracks} current_track={curr?.item.id} on_select={set_idx_by_id} />
</div>
