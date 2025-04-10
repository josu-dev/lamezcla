<script lang="ts">
  import ButtonIcon from "$lib/components/el/ButtonIcon.svelte";
  import * as Icon from "$lib/components/icons.js";
  import { use_player_ctx } from "./player.svelte.js";

  type Props = {};

  let {}: Props = $props();

  let player = use_player_ctx();
  let repeat = $derived(player.repeat);

  function handle_on_repeat() {
    const new_value = (repeat + 1) % 3;
    player.set_repeat(new_value);
  }
</script>

<div class="px-4 py-1 flex flex-col bg-background border border-border rounded-md flex-none max-w-5xl mx-auto">
  <div class="py-1">
    <div class="h-0.5 bg-white rounded-full overflow-hidden">
      <div class="h-full bg-red-500" style="width: {player.progress}%;"></div>
    </div>
  </div>

  <div class="grid grid-cols-1 grid-rows-1 *:col-[1/1] *:row-[1/1] py-1">
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
