<script lang="ts">
  import { Icon } from "$lib/components/icons/index.js";
  import { effect_once } from "$lib/utils/index.js";
  import { Dialog } from "bits-ui";
  import type { PlayerStaticProps } from "./internal.js";
  import { use_player_ctx } from "./player.svelte.js";
  import ControlsStatic from "./player_controls_static.svelte";
  import Tracklist from "./player_tracklist.svelte";

  let { channel, playlist, playlist_entries, video, start_index }: PlayerStaticProps = $props();

  const player = use_player_ctx();

  const player_source = $derived.by(() => {
    if (playlist !== undefined) {
      return {
        invalid: false,
        single: false,
        playlist: playlist,
        playlist_entries: playlist_entries ?? [],
        start_index: start_index || 1,
      } as const;
    }

    if (video !== undefined) {
      return {
        invalid: false,
        single: true,
        video: video,
      } as const;
    }

    return {
      invalid: true,
    } as const;
  });

  const title = $derived(player_source.single ? "" : player_source.playlist!.title);
  const current_video = $derived(player_source.single ? player_source.video : player.current.video);

  effect_once(() => {
    if (player_source.invalid) {
      return;
    }

    if (player_source.single) {
      if (player.current.video?.id !== player_source.video.id) {
        player.play_video(player_source.video);
      }
      return;
    }

    const is_different_playlist =
      player.playlist === undefined ||
      player.playlist.id !== player_source.playlist.id ||
      player.playlist.created_at !== player_source.playlist.created_at;
    if (is_different_playlist) {
      player.play_playlist(player_source.playlist, player_source.playlist_entries, player_source.start_index);
    }
  });
</script>

<div class="flex w-full h-full relative">
  <div class="flex flex-col flex-1">
    <div class="flex-none flex justify-center pt-6">
      <h2 class="text-2xl font-bold {player_source.invalid ? 'text-primary' : ''}">
        {#if player_source.invalid}
          Internal Player Error
        {:else if player_source.single}
          {title}
        {:else}
          <a href="/playlist/{player_source.playlist.id}">
            {player_source.playlist.title}
          </a>
        {/if}
      </h2>
    </div>

    <div class="flex-1 grid place-items-center">
      {#if current_video === undefined}
        <div class="text-red-500 font-bold">Not available</div>
      {:else}
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
              src={current_video.img?.url}
              height={current_video.img?.height}
              width={current_video.img?.width}
              alt="{current_video.title} video thumbnail"
              class="object-cover h-full bg-transparent"
            />
          </div>
          <div class="flex flex-col items-center mt-6 lg:mt-8 text-center">
            <h3 class="text-xl font-bold text-pretty leading-tight select-text">{current_video.title}</h3>
            <a
              href="/{current_video.channel_id}"
              rel="noopener noreferrer"
              class="block font-bold text-muted-foreground mt-1.5 mx-auto"
            >
              {current_video.channel_title}
            </a>
          </div>
        </div>
      {/if}
    </div>

    <div
      class="px-2 flex flex-col bg-background border-t border-border w-full h-site-player-controls pt-[9px] 2xl:px-4"
    >
      <ControlsStatic />
    </div>
  </div>

  {#if !(player_source.invalid || player_source.single)}
    <div class="xl:hidden">
      <Dialog.Root>
        <Dialog.Trigger class="absolute right-2 top-2 rounded-md active:scale-[0.98]" title="Open tracklist">
          <div>
            <span class="sr-only">Open tracklist</span>
            <Icon.PanelRightOpen class="text-foreground size-6" />
          </div>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Content
            class="bg-background fixed z-50 top-site-header bottom-0 right-0 h-site-content !duration-200 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full"
          >
            <div class="relative h-full">
              <Tracklist
                {channel}
                playlist={player_source.playlist}
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
        playlist={player_source.playlist}
        entries={player.tracks}
        current_entry={player.current.entry?.item.id}
        on_select={(_, i) => {
          player.play_by_index(i);
        }}
      />
    </div>
  {/if}
</div>
