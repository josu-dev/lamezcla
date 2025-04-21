<script lang="ts">
  import ButtonIcon from "$lib/components/el/ButtonIcon.svelte";
  import { Icon } from "$lib/components/icons/index.js";
  import { Slider } from "bits-ui";
  import { untrack } from "svelte";
  import type { PlayerControlsStaticProps } from "./internal.js";
  import { use_player_ctx } from "./player.svelte.js";

  let {}: PlayerControlsStaticProps = $props();

  const player = use_player_ctx();
  const current = $derived(player.current);

  function on_repeat() {
    const next = ((player.repeat + 1) % 3) as 0 | 1 | 2;
    player.set_repeat(next);
  }

  let is_dragging = $state(false);
  let detached_progress = $derived(is_dragging ? undefined : current.time_current);

  let unset_is_dragging_id: undefined | number;

  function set_is_dragging() {
    is_dragging = true;
  }

  function unset_is_dragging() {
    clearTimeout(unset_is_dragging_id);
    unset_is_dragging_id = setTimeout(() => {
      is_dragging = false;
    }, 500);
  }

  function format_time(value: number): string {
    const h = Math.floor(value / 3_600);
    const m = Math.floor((value % 3_600) / 60);
    const s = value % 60;

    if (h) {
      return h + (m < 10 ? ":0" : ":") + m + (s < 10 ? ":0" : ":") + s;
    }
    return (m || "0") + (s < 10 ? ":0" : ":") + s;
  }
</script>

<div>
  <div class="h-0.5 mb-[10px] flex items-center">
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
      class="relative flex w-full touch-none items-center h-5 group cursor-pointer"
    >
      {#snippet children()}
        <span class="bg-dark-10 relative h-[2px] group-hover:h-[4px] w-full grow bg-white">
          <Slider.Range class="bg-primary absolute h-full" />
        </span>
        <Slider.Thumb
          index={0}
          class="hidden group-focus-within:block group-hover:block border-border-input bg-foreground focus-visible:outline-hidden size-3 cursor-pointer rounded-full"
        />
      {/snippet}
    </Slider.Root>
  </div>

  <div class="grid grid-cols-1 grid-rows-1 *:col-[1/1] *:row-[1/1] mb-1">
    <div class="flex justify-self-start gap-x-1">
      <div class="text-xs">
        {format_time(current.time_current)} / {format_time(current.time_duration)}
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

    <div class="flex justify-self-end">
      <div class="lg:hidden flex items-center">
        <!-- TODO: implement dropup menu -->
        <ButtonIcon onclick={() => {}} title={"Open actions"} size="sm">
          <Icon.EllipsisVertical />
        </ButtonIcon>
      </div>
      <div class="hidden lg:block">
        <div class="flex h-full gap-x-1 group/volume items-center">
          <ButtonIcon onclick={player.toggle_mute} title={player.is_muted ? "Unmute" : "Mute"} size="sm">
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
          <Slider.Root
            type="single"
            value={untrack(() => player.volume)}
            onValueChange={(v) => {
              player.set_volume(v);
            }}
            min={0}
            max={100}
            aria-label="Volume"
            title="Volume"
            class="relative flex w-24 touch-none items-center h-4 cursor-pointer"
          >
            {#snippet children()}
              <span class="relative h-[3px] w-full cursor-pointer bg-white">
                <Slider.Range class="bg-primary absolute h-full" />
              </span>
              <Slider.Thumb
                index={0}
                class="opacity-0 group-hover/volume:opacity-100 focus-visible:opacity-100 bg-foreground size-3 rounded-full"
              />
            {/snippet}
          </Slider.Root>
        </div>
      </div>
    </div>
  </div>
</div>
