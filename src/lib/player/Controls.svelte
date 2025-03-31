<script lang="ts">
  import Button from "$lib/components/el/Button.svelte";
  import * as Icon from "$lib/components/icons.js";
  import { noop } from "$lib/utils.js";

  type Props = {
    is_paused: boolean;
    is_playing: boolean;
    is_muted: boolean;
    progress: number;
    volume: number;
    repeat: number;
    on_shuffle_tracks: () => void;
    on_next_track: () => void;
    on_prev_track: () => void;
    on_toggle_play: () => void;
    on_toggle_mute: () => void;
    on_volume_change: (value: number) => void;
    on_repeat_track: (value: number) => void;
  };

  let {
    is_paused = false,
    is_playing = false,
    is_muted = false,
    progress = 0,
    volume = 0,
    repeat = 0,
    on_shuffle_tracks = noop,
    on_next_track = noop,
    on_prev_track = noop,
    on_toggle_mute = noop,
    on_toggle_play = noop,
    on_volume_change = noop,
    on_repeat_track = noop,
  }: Props = $props();

  function handle_on_repeat() {
    const new_value = (repeat + 1) % 3;
    on_repeat_track(new_value);
  }
</script>

<div class="px-4 py-1 flex flex-col bg-background border border-border rounded-md flex-none max-w-5xl mx-auto">
  <div class="py-1">
    <div class="h-0.5 bg-white rounded-full overflow-hidden">
      <div class="h-full bg-red-500" style="width: {progress}%;"></div>
    </div>
  </div>

  <div class="grid grid-cols-1 grid-rows-1 *:col-[1/1] *:row-[1/1] py-1">
    <div class="flex items-center justify-center gap-x-2">
      <Button onclick={on_shuffle_tracks} title="Shuffle" size="sm">
        <Icon.Shuffle />
      </Button>
      <Button onclick={on_prev_track} title="Skip back" size="md">
        <Icon.SkipBack />
      </Button>
      <Button onclick={on_toggle_play} title="Play" size="md">
        {#if is_playing}
          <Icon.Pause />
        {:else}
          <Icon.Play />
        {/if}
      </Button>
      <Button onclick={on_next_track} title="Skip ahead" size="md">
        <Icon.SkipForward />
      </Button>
      <Button
        onclick={handle_on_repeat}
        title="Repeat"
        size="sm"
        class="text-muted-foreground hover:text-foreground data-repeat:text-primary"
        data-repeat={repeat > 0 ? "" : undefined}
      >
        {#if repeat === 2}
          <Icon.Repeat1 />
        {:else}
          <Icon.Repeat />
        {/if}
      </Button>
    </div>
    <div class="flex justify-self-end gap-x-1">
      <Button onclick={on_toggle_mute} title={is_muted ? "Unmute" : "Mute"} size="md">
        {#if is_muted}
          <Icon.VolumeX />
        {:else if volume > 70}
          <Icon.Volume2 />
        {:else if volume > 20}
          <Icon.Volume1 />
        {:else}
          <Icon.Volume />
        {/if}
      </Button>
      <label for="input-volume-desktop" class="sr-only">Volume</label>
      <input
        type="range"
        id="input-volume-desktop"
        title="Volume"
        min="0"
        max="100"
        oninput={(ev) => {
          on_volume_change(ev.currentTarget.valueAsNumber);
        }}
        class="rounded-md accent-primary h-1 my-auto w-24 [::-webkit-slider-thumb]:appareance-none"
      />
    </div>
    <!-- <div id="volume-container" class="relative">
      <Button onclick={() => (is_volume_menu_open = !is_volume_menu_open)} title="Volume">
        {#if is_muted}
          <Icon.VolumeOff />
        {:else}
          <Icon.Volume2 />
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
              <Icon.VolumeOff />
            {:else}
              <Icon.Volume2 />
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
    </div> -->
    <!-- <input
      type="range"
      min="0"
      max="100"
      oninput={(ev) => {
        set_volume(ev.currentTarget.valueAsNumber);
      }}
      class="rounded-md accent-primary"
    /> -->
  </div>
</div>
