<script lang="ts">
  import { dev } from "$app/environment";
  import { page } from "$app/state";
  import type { PlayerControlsGlobalProps } from "./internal.js";
  import { use_player_ctx } from "./player.svelte.js";
  import PlayerControlsStatic from "./player_controls_static.svelte";

  let { hide = false, hide_on_routes = [] }: PlayerControlsGlobalProps = $props();

  const player = use_player_ctx();
  const current = $derived(player.current);
  const excluded_routes = $derived(new Set(hide_on_routes));
  const curr_video = $derived(player.current.video);
  const is_hidden = $derived(hide || excluded_routes.has(page.url.pathname) || curr_video === undefined);
  const player_link = $derived.by(() => {
    const pl = player.playlist;
    if (curr_video === undefined) {
      return `/${undefined}`;
    }
    if (pl === undefined) {
      return `/play?v=${curr_video.id}`;
    }
    return `/play?v=${curr_video.id}&l=${pl.id}`;
  });
</script>

{#if is_hidden && dev}
  <div class="fixed bottom-0 right-0 bg-red-500 py-2 px-1">HIDDEN</div>
{/if}

<div
  class="h-site-player-controls border-border border-t px-4 z-10 hidden grid-cols-[auto_1fr] gap-x-4 bg-background data-player-controls-global:grid"
  data-player-controls-global={is_hidden ? undefined : ""}
>
  <div class="self-center">
    {#if curr_video}
      <div class="flex justify-center gap-x-2 items-center">
        <a href={player_link} class="block rounded-md aspect-video h-14 overflow-clip">
          <span class="sr-only">
            {curr_video.title}
          </span>
          <img
            src={curr_video.img?.url}
            height={curr_video.img?.height}
            width={curr_video.img?.width}
            alt="{curr_video.title} video thumbnail"
            class="object-cover bg-transparent"
          />
        </a>
        <div class="flex-col w-80 hidden items-start lg:flex">
          <a href={player_link} class="text-sm text-pretty leading-tight select-text line-clamp-2">
            {curr_video.title}
          </a>
          <a href="/{curr_video.channel_id}" class="text-xs text-muted-foreground mt-0.5">
            {curr_video.channel_title}
          </a>
        </div>
      </div>
    {/if}
  </div>
  <div class="self-end">
    <PlayerControlsStatic />
  </div>
</div>
