<script lang="ts">
  import ButtonIcon from "$lib/components/el/ButtonIcon.svelte";
  import * as Icon from "$lib/components/icons.js";
  import { Slider } from "bits-ui";
  import { use_player_ctx } from "./player.svelte.js";

  type Props = {};

  let {}: Props = $props();

  const player = use_player_ctx();
  const current = $derived(player.current);

  function on_repeat() {
    const next = ((player.repeat + 1) % 3) as 0 | 1 | 2;
    player.set_repeat(next);
  }

  let is_dragging = $state(false);
  let detached_progress = $derived(is_dragging ? undefined : current.time_current);

  let unset_drag_timeout: undefined | number;

  function set_is_dragging() {
    is_dragging = true;
  }

  function unset_is_dragging() {
    clearTimeout(unset_drag_timeout);
    unset_drag_timeout = setTimeout(() => {
      is_dragging = false;
    }, 500);
  }

  function format_time(value: number): string {
    const h = Math.floor((value % 86_400) / 3_600);
    const m = Math.floor((value % 3_600) / 60);
    const s = value % 60;

    if (h) {
      return h + (m < 10 ? ":0" : ":") + m + (s < 10 ? ":0" : ":") + s;
    }
    return (m || "0") + (s < 10 ? ":0" : ":") + s;
  }
</script>

<div class="px-4 py-1 flex flex-col bg-background border border-border rounded-md flex-none max-w-5xl mx-auto">
  <div class="py-0.5 group">
    <Slider.Root
      type="single"
      value={detached_progress}
      onpointerdown={set_is_dragging}
      onValueCommit={(v) => {
        player.seek_to(v);
        unset_is_dragging();
      }}
      min={0}
      max={current.time_duration}
      class="relative flex w-full touch-none items-center h-2"
    >
      {#snippet children()}
        <span class="bg-dark-10 relative h-[3px] group-hover:h-[5px] w-full grow cursor-pointer bg-white">
          <Slider.Range class="bg-primary absolute h-full" />
        </span>
        <Slider.Thumb
          index={0}
          class="hidden group-focus-within:block group-hover:block border-border-input bg-foreground focus-visible:outline-hidden size-4 cursor-pointer rounded-full"
        />
      {/snippet}
    </Slider.Root>
  </div>

  <div class="grid grid-cols-1 grid-rows-1 *:col-[1/1] *:row-[1/1] py-1">
    <div class="flex justify-self-start gap-x-1">
      <div class="text-xs">
        {format_time(current.time_current)}
        /
        {format_time(current.time_duration)}
      </div>
    </div>

    <div class="flex items-center justify-center gap-x-2">
      <ButtonIcon onclick={player.shuffle} title="Shuffle" size="sm">
        <Icon.Shuffle />
      </ButtonIcon>
      <ButtonIcon onclick={player.prev_track} title="Skip back" size="md">
        <Icon.SkipBack />
      </ButtonIcon>
      <ButtonIcon onclick={player.toggle_play} title="Play" size="md">
        {#if player.is_playing}
          <Icon.Pause />
        {:else}
          <Icon.Play />
        {/if}
      </ButtonIcon>
      <ButtonIcon onclick={player.next_track} title="Skip ahead" size="md">
        <Icon.SkipForward />
      </ButtonIcon>
      <ButtonIcon
        onclick={on_repeat}
        title="Repeat"
        size="sm"
        class="text-muted-foreground hover:text-foreground data-repeat:text-primary"
        data-repeat={player.repeat > 0 ? "" : undefined}
      >
        {#if player.repeat === 2}
          <Icon.Repeat1 />
        {:else}
          <Icon.Repeat />
        {/if}
      </ButtonIcon>
    </div>
    <div class="flex justify-self-end gap-x-1">
      <ButtonIcon onclick={player.toggle_mute} title={player.is_muted ? "Unmute" : "Mute"} size="md">
        {#if player.is_muted}
          <Icon.VolumeX />
        {:else if player.volume > 70}
          <Icon.Volume2 />
        {:else if player.volume > 20}
          <Icon.Volume1 />
        {:else}
          <Icon.Volume />
        {/if}
      </ButtonIcon>
      <label for="input-volume-desktop" class="sr-only">Volume</label>
      <input
        type="range"
        id="input-volume-desktop"
        title="Volume"
        min="0"
        max="100"
        defaultValue={player.volume}
        oninput={(ev) => {
          player.set_volume(ev.currentTarget.valueAsNumber);
        }}
        class="rounded-md accent-primary h-1 my-auto w-24 [::-webkit-slider-thumb]:appareance-none"
      />
    </div>
  </div>
</div>
