<script lang="ts">
  import { goto } from "$app/navigation";
  import HumanTime from "$lib/components/HumanTime.svelte";
  import * as Icon from "$lib/components/icons.js";
  import type { PageData } from "./$types.js";

  type Props = {
    data: PageData;
  };

  let { data }: Props = $props();

  let channel = $derived(data.channel);
  let playlists = $derived(data.playlists);

  function on_play_playlist(id: string) {
    goto(`/play?l=${id}`);
  }
</script>

<div class="grid h-site-content">
  <div class="border-b border-border flex gap-4 py-4 flex-none px-4">
    <div>
      <img
        src={channel.img?.url}
        width={channel.img?.width}
        height={channel.img?.height}
        alt="{channel.title} profile avatar"
        class="rounded-md shadow size-16"
      />
    </div>
    <div>
      <h1 class="text-4xl font-bold">{channel.title}</h1>
      <div class="text-sm font-semibold text-muted mt-1">
        Created <HumanTime utc={channel.published_at} />
        - Refreshed <HumanTime utc={channel.updated_at} as_relative />
      </div>
    </div>
  </div>

  <div class="flex flex-col flex-1 overflow-x-clip overflow-y-auto">
    <div class="flex-none px-4 pt-4 pb-2 sticky top-0 z-10 bg-background/95">
      <h2 class="text-xl font-bold">Playlists {playlists.length}</h2>
    </div>
    <ul class="grid grid-cols-3 gap-x-8 gap-y-6">
      {#each playlists as playlist (playlist.id)}
        <li>
          <button class="group text-left cursor-pointer" onclick={() => on_play_playlist(playlist.id)}>
            <div class="flex flex-col px-4 py-2">
              <div class="relative">
                <img
                  src={playlist.img?.url}
                  width={playlist.img?.width}
                  height={playlist.img?.height}
                  alt="{playlist.title} playlist thumbnail"
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
                <h3 class="text-xl fotn-bold mt-2">{playlist.title}</h3>
                <p>
                  <a href="/playlist/{playlist.id}" class="text-base font-bold text-muted hover:text-foreground"
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
