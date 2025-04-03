<script lang="ts">
  import HumanTime from "$lib/components/HumanTime.svelte";
  import * as Icon from "$lib/components/icons.js";
  import type { Snippet } from "svelte";
  import type { PageData } from "./$types.js";

  type Props = {
    data: PageData;
    children: Snippet;
  };

  let { data, children }: Props = $props();
  let playlist = $derived(data.playlist);
  let playlist_entries = $derived(data.entries);
</script>

<div class="grid h-screen">
  <div class="border-b border-border flex gap-4 py-4 flex-none px-4">
    <div>
      <img
        src={playlist.img?.url}
        width={playlist.img?.width}
        height={playlist.img?.height}
        alt="{playlist.title} profile avatar"
        class="rounded-md shadow size-16"
      />
    </div>
    <div>
      <h1 class="text-4xl font-bold">{playlist.title}</h1>
      <div class="text-sm font-semibold text-muted">
        Created <HumanTime utc={playlist.published_at} />
        - Refreshed <HumanTime utc={playlist.updated_at} as_relative />
      </div>
    </div>
  </div>

  <div class="flex flex-col flex-1 overflow-x-clip overflow-y-auto">
    <div class="flex-none px-4 pt-4 pb-2 sticky top-0 z-10 bg-background/95">
      <h2 class="text-xl font-bold">Tracks {playlist_entries.length}</h2>
    </div>
    <ul class="grid grid-cols-1 gap-x-8 gap-y-6">
      {#each playlist_entries as { item, video } (item.id)}
        <li>
          <button class="group text-left cursor-pointer">
            <div class="flex px-4 py-2">
              <div class="relative">
                <img
                  src={video.img?.url}
                  width={video.img?.width}
                  height={video.img?.height}
                  alt="{video.title} playlist thumbnail"
                  class="rounded-md w-full aspect-video object-fill"
                />
                <div
                  class="absolute grid opacity-0 [&:is(:where(.group):hover:not(:has(a:hover))_*)]:opacity-100 transition-opacity place-items-center inset-0 bg-background/75"
                >
                  <div class="flex items-center gap-2 text-2xl font-bold">
                    <Icon.Play class="size-8 stroke-3" /> Play
                  </div>
                </div>
                <div class="absolute bottom-2 right-2">
                  <span class="bg-accent px-1.5 py-1 rounded-md text-xs font-semibold tracking-wider">
                    ≈ {playlist.item_count} tracks
                  </span>
                </div>
              </div>
              <div>
                <h3 class="text-xl fotn-bold mt-2">{video.title}</h3>
                <p>
                  <a href="/playlist/{video.id}" class="text-base font-bold text-muted hover:text-foreground"
                    >View all playlist tracks</a
                  >
                </p>
              </div>
            </div>
          </button>
        </li>
      {/each}
    </ul>
  </div>
</div>
