<script lang="ts">
  import type * as Models from "$lib/models/youtube.js";
  import type { Optional } from "$lib/utils/index.js";
  import type { Snippet } from "svelte";
  import type { LayoutData } from "../[handle=handle]/$types.js";

  type Props = {
    data: LayoutData;
    children: Snippet;
  };

  let { data, children }: Props = $props();
  let channels = $derived(data.channels);
  let current_channel: Optional<Models.Channel> = $state();
</script>

<div class="grid grid-cols-[auto_1fr] bg-background text-foreground h-full">
  <aside class="min-w-64 border-r border-border flex max-h-screen flex-col">
    <div class="px-2 pt-3">
      <h2 class="font-bold text-xl">Channels</h2>
    </div>

    <ul class="px-2 py-1 flex flex-col gap-y-1 mt-4 overflow-x-clip overflow-y-auto flex-1">
      {#each channels as c (c.id)}
        {@const is_current = c.id === current_channel?.id}
        <li>
          <a
            href="/{c.handle}"
            aria-current={is_current ? "page" : undefined}
            data-selected={is_current ? "" : undefined}
            class="block hover:bg-accent data-selected:bg-accent rounded-md group"
            onclick={(ev) => {
              // ev.preventDefault();
            }}
          >
            <div class="flex py-1.5 px-2 gap-2 items-center">
              <div class="rounded-md p-1.5 {is_current ? 'bg-primary' : 'bg-accent group-hover:bg-background'}">
                <img
                  src={c.img?.url}
                  height={c.img?.height}
                  width={c.img?.width}
                  alt="{c.title} channel avatar"
                  class="rounded-md overflow-clip size-8 shadow"
                />
              </div>
              <div class="flex flex-col">
                <div class="font-semibold">
                  {c.title}
                </div>
                <!-- <div class="text-sm text-muted-foreground">{c.item_count ?? 0} tracks</div> -->
              </div>
            </div>
          </a>
        </li>
      {/each}
    </ul>
  </aside>

  <div class="flex flex-col">
    {@render children()}
  </div>
</div>
