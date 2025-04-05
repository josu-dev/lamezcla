<script lang="ts">
  import { goto } from "$app/navigation";
  import { use_pinned_ctx } from "$lib/client/state/pinned.svelte.js";
  import ActionsMenu from "$lib/components/ActionsMenu/ActionsMenu.svelte";
  import HumanTime from "$lib/components/HumanTime.svelte";
  import * as Icon from "$lib/components/icons.js";
  import { uuid } from "$lib/utils/index.js";
  import type { PageData } from "./$types.js";

  type Props = {
    data: PageData;
  };

  let { data }: Props = $props();

  let channel = $derived(data.channel);
  let playlists = $derived(data.playlists);

  const pinned_state = use_pinned_ctx();

  function on_play_playlist(id: string) {
    goto(`/play?l=${id}`);
  }
</script>

<div class="flex flex-col h-site-content">
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
        Refreshed <HumanTime utc={channel.updated_at} as_relative />
      </div>
    </div>
  </div>

  <div class="flex flex-col flex-1 overflow-x-clip overflow-y-auto">
    <div class="flex-none px-4 pt-4 pb-2 sticky top-0 z-10 bg-background/95">
      <h2 class="text-xl font-bold">Playlists {playlists.length}</h2>
    </div>
    <ul class="grid grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-2">
      {#each playlists as playlist (playlist.id)}
        {@const is_pinned = pinned_state.is_pinned(playlist.id)}
        <li class="flex flex-col flex-1">
          <button class="group text-left flex flex-1" onclick={() => on_play_playlist(playlist.id)}>
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
                  class="absolute grid opacity-0 [&:is(:where(.group):hover:not(:has([data-no-play]:hover))_*)]:opacity-100 transition-opacity place-items-center inset-0 bg-background/75"
                >
                  <div class="flex items-center gap-2 text-2xl font-semibold">
                    <Icon.Play class="size-8 stroke-2" /> Play
                  </div>
                </div>
                <div class="absolute bottom-2 right-2">
                  <span class="bg-accent px-1.5 py-1 rounded-md text-xs font-semibold tracking-wider">
                    ≈ {playlist.item_count} tracks
                  </span>
                </div>
              </div>
              <div>
                <div class="flex">
                  <h3 class="text-lg font-semibold mt-2">{playlist.title}</h3>
                  <div class="mt-2 ml-auto relative" data-no-play>
                    <ActionsMenu
                      actions={[
                        {
                          id: uuid(),
                          label: "Pin",
                          action: () => {
                            if (is_pinned) {
                              pinned_state.unpin_by_id(playlist.id);
                            } else {
                              pinned_state.pin("playlist", playlist);
                            }
                          },
                          icon: is_pinned ? Icon.PinOff : Icon.Pin,
                        },
                      ]}
                    />
                  </div>
                </div>
                <p class="mt-1 text-sm font-semibold text-muted">
                  <a href="/playlist/{playlist.id}" data-no-play class="hover:text-foreground"> View all tracks </a>
                </p>
              </div>
            </div>
          </button>
        </li>
      {/each}
    </ul>
  </div>
</div>
