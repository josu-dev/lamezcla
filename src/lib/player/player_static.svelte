<script lang="ts">
  import { Icon } from "$lib/components/icons/index.js";
  import { effect_once } from "$lib/utils/index.js";
  import { Dialog } from "bits-ui";
  import type { PlayerStaticProps } from "./internal.js";
  import { use_player_ctx } from "./player.svelte.js";
  import ControlsStatic from "./player_controls_static.svelte";
  import Tracklist from "./player_tracklist.svelte";

  let { channel, playlist, entries, video, start_index = 1 }: PlayerStaticProps = $props();

  const player = use_player_ctx();

  let state = $derived.by(() => {
    if (video !== undefined) {
      return {
        single: true as const,
        video: video,
      };
    }

    return {
      single: false as const,
      playlist: playlist!,
      entries: entries!,
      start_index: start_index,
    };
  });

  let title = $derived(state.single ? "" : state.playlist!.title);
  let curr_video = $derived(state.single ? state.video : player.current.video);

  effect_once(() => {
    if (state.single) {
      if (player.current.video?.id !== state.video.id) {
        player.play(state.video.id);
      }
    } else {
      if (player.playlist?.id !== state.playlist.id) {
        player.set_playlist(state.playlist);
        player.set_entries(state.entries);
        player.play_by_index(state.start_index);
      }
    }
  });
</script>

<div class="flex w-full h-full relative">
  <div class="flex flex-col flex-1">
    <div class="flex-none flex justify-center py-2">
      <h2 class="text-2xl mt-2 font-bold">
        {#if state.single}
          {title}
        {:else}
          <a href="/playlist/{state.playlist.id}">
            {state.playlist.title}
          </a>
        {/if}
      </h2>
    </div>
    <div class="flex-1 grid place-items-center">
      {#if player.current.unavailable}
        <div class="text-red-500 font-bold">Not available</div>
      {:else if curr_video}
        <div class="flex flex-col items-center max-w-[min(80%,36rem)]">
          <svg width="0" height="0">
            <filter id="blur-and-scale" y="-50%" x="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blurred"></feGaussianBlur>
              <feColorMatrix type="saturate" in="blurred" values="0.8" result="saturated_blur"></feColorMatrix>
              <feComposite in="SourceGraphic" in2="saturated_blur" operator="over"></feComposite>
            </filter>
          </svg>
          <div class="aspect-video rounded-md overflow-clip" style="filter: url(#blur-and-scale);">
            <img
              src={curr_video.img?.url}
              height={curr_video.img?.height}
              width={curr_video.img?.width}
              alt="{curr_video.title} video thumbnail"
              class="object-cover h-full bg-transparent"
            />
          </div>
          <div class="flex flex-col items-center mt-8 text-center">
            <h3 class="text-xl font-bold text-pretty leading-tight select-text">{curr_video.title}</h3>
            <a
              href="/{curr_video.channel_id}"
              rel="noopener noreferrer"
              class="block font-bold text-muted-foreground mt-1.5 mx-auto"
            >
              {curr_video.channel_title}
            </a>
          </div>
        </div>
      {/if}
    </div>

    <div class="py-4 px-4">
      <ControlsStatic />
    </div>
  </div>

  {#if !state.single}
    <div class="xl:hidden">
      <Dialog.Root>
        <Dialog.Trigger class="absolute right-2 top-2 rounded-md active:scale-[0.98]" title="Open tracklist">
          <div>
            <span class="sr-only">Open tracklist</span>
            <Icon.PanelRightOpen class="text-foreground size-6" />
          </div>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Content class="bg-background fixed z-50 top-site-header bottom-0 right-0 h-site-content">
            <div class="relative h-full">
              <Tracklist
                {channel}
                playlist={state.playlist}
                entries={player.tracks}
                current_entry={player.current.entry?.item.id}
                on_select={(_, i) => {
                  player.play_by_index(i);
                }}
              />
              <Dialog.Close class="absolute right-2 top-2 rounded-md active:scale-[0.98]" title="Close tracklist">
                <div>
                  <span class="sr-only">Close tracklist</span>
                  <Icon.PanelRightClose class="text-foreground size-6" />
                </div>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
    <div class="hidden xl:block flex-none">
      <Tracklist
        {channel}
        playlist={state.playlist}
        entries={player.tracks}
        current_entry={player.current.entry?.item.id}
        on_select={(_, i) => {
          player.play_by_index(i);
        }}
      />
    </div>
  {/if}
</div>
