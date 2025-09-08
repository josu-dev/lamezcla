<script lang="ts">
  import type { PlayerTracklistProps } from "$lib/player/internal.js";
  import { seconds_to_hhmmss, seconds_to_human } from "$lib/utils/index.js";
  import { createVirtualizer } from "@tanstack/svelte-virtual";

  let { channel, playlist, entries, current_entry: curr_entry, on_select = () => {} }: PlayerTracklistProps = $props();

  let total_entries = $derived(entries.length);
  let total_time = $derived.by(() => {
    let total_s = 0;
    for (const t of entries) {
      if (!t.video.is_available) {
        continue;
      }

      total_s += t.video.duration_s;
    }

    return total_s;
  });

  let vl_scroll_container = $state<HTMLElement | null>(null);
  let vl_elements: HTMLLIElement[] = $state([]);
  let virtualizer = $derived(
    createVirtualizer<HTMLElement, HTMLLIElement>({
      count: total_entries,
      getScrollElement: vl_scroll_container ? () => vl_scroll_container : () => null,
      estimateSize: () => 69,
      overscan: 5,
    }),
  );
  let vl_items = $derived($virtualizer.getVirtualItems());
  // Ref: https://github.com/TanStack/virtual/issues/640#issuecomment-1885029911
  // Ref: https://github.com/TanStack/virtual/discussions/476#discussioncomment-4724139
  let [vl_items_before, vl_items_after] = $derived(
    vl_items.length > 0
      ? [
          vl_items[0].start - $virtualizer.options.scrollMargin,
          $virtualizer.getTotalSize() - vl_items[vl_items.length - 1].end,
        ]
      : [0, 0],
  );

  $effect(() => {
    if (vl_elements.length) {
      vl_elements.forEach((el) => $virtualizer.measureElement(el));
    }
  });
</script>

<aside
  class="flex-1 max-w-[min(28rem,100vw)] border-l border-border h-full max-h-page-content overflow-hidden flex flex-col w-md xl:max-w-sm 2xl:max-w-md"
>
  <div class="border-b px-2 py-2 border-border">
    <h2 class="text-xl font-bold">Tracks</h2>
    <div class="flex flex-col text-sm text-muted-foreground font-semibold mt-0.5">
      {#if channel !== undefined}
        <a href="/{channel.id}" class="font-bold focus-outline flex w-max max-w-full rounded-xs hover:text-foreground">
          <span class="overflow-hidden text-ellipsis text-nowrap">
            {channel.title}
          </span>
        </a>
      {/if}
      <div>{total_entries} tracks, {seconds_to_human(total_time)}</div>
    </div>
  </div>

  <div bind:this={vl_scroll_container} class="w-full flex-1 overflow-x-clip overflow-y-auto">
    <div style="position: relative; height: {$virtualizer.getTotalSize()}px; width: 100%;">
      <ul
        style="position: absolute; top: 0; left: 0; transform: translateY({vl_items.length ? vl_items[0].start : 0}px);"
        class="flex flex-col py-1 px-1 w-full"
      >
        {#each vl_items as row, vl_row_index (row.index)}
          {@const entry = entries[row.index]}
          {@const is_current = entry.item.id === curr_entry}
          <li bind:this={vl_elements[vl_row_index]} data-index={row.index}>
            <button
              onclick={() => {
                on_select(entry, row.index + 1);
              }}
              class="text-left rounded-md block w-full focus-outline"
            >
              <div
                data-selected={is_current ? "" : undefined}
                class="grid grid-cols-[2rem_1fr_auto] min-h-16 gap-x-2 py-1.5 px-2 gap-2 items-center rounded-md data-selected:bg-accent hover:bg-accent"
              >
                <div
                  class="grid place-items-center rounded-md leading-0 text-sm font-semibold"
                  class:text-primary={is_current}
                >
                  {is_current ? "▶" : row.index + 1}
                </div>
                <div class="flex flex-col">
                  <div class="font-bold line-clamp-2 text-sm leading-tight">
                    {entry.video.title}
                  </div>
                  <div class="text-sm mt-0.5 text-muted-foreground">
                    {entry.video.channel_title}
                  </div>
                </div>
                <div class="justify-self-end text-xs tracking-wide">
                  {seconds_to_hhmmss(entry.video.duration_s)}
                </div>
              </div>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</aside>
