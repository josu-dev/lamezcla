<script lang="ts">
  import type { Playlist, StringId } from "$lib/player/types.js";
  import { Library, Play } from "./icons.js";

  type Props = {
    playlists: Playlist[];
    current_playlist?: StringId;
    on_select: (id: StringId) => void;
  };

  let { playlists, current_playlist = undefined, on_select }: Props = $props();
</script>

<aside class="min-w-64 border-r border-border flex max-h-screen flex-col">
  <div class="px-2 pt-3">
    <h2 class="font-bold text-xl">Playlists</h2>
  </div>

  <ul class="px-2 py-1 flex flex-col gap-y-1 mt-4 overflow-x-clip overflow-y-auto flex-1">
    {#each playlists as p (p.id)}
      {@const is_current = p.id === current_playlist}
      <li>
        <a
          href="/p/{p.id}"
          aria-current={is_current ? "page" : undefined}
          data-selected={is_current ? "" : undefined}
          class="block hover:bg-accent data-selected:bg-accent rounded-md group"
          onclick={(ev) => {
            ev.preventDefault();
            on_select(p.id);
          }}
        >
          <div class="flex py-1.5 px-2 gap-2 items-center">
            <div class="rounded-md p-1.5 {is_current ? 'bg-primary' : 'bg-accent group-hover:bg-background'}">
              {#if is_current}
                <Play />
              {:else}
                <Library />
              {/if}
            </div>
            <div class="flex flex-col">
              <div class="font-semibold">
                {p.title}
              </div>
              <div class="text-sm text-muted-foreground">{p.item_count ?? 0} tracks</div>
            </div>
          </div>
        </a>
      </li>
    {/each}
  </ul>
</aside>
