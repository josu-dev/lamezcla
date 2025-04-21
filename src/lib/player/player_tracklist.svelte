<script lang="ts">
  import SourceLink from "$lib/components/sources/SourceLink.svelte";
  import type { PlayerTracklistProps } from "$lib/player/internal.js";
  import { seconds_to_hhmmss, seconds_to_human } from "$lib/utils/index.js";

  let { channel, playlist, entries, current_entry: curr_entry, on_select = () => {} }: PlayerTracklistProps = $props();

  let total_entries = $derived(entries.length);
  let total_time = $derived.by(() => {
    let total_s = 0;
    for (const t of entries) {
      if (t.video === undefined) {
        continue;
      }

      total_s += t.video.total_seconds;
    }

    return total_s;
  });
</script>

<aside class="max-w-sm border-l border-border h-full max-h-site-content overflow-hidden flex flex-col 2xl:max-w-md">
  <div class="border-b px-2 py-2 border-border">
    <h2 class="text-xl font-bold">
      Current playlist
      <SourceLink type="playlist" id={playlist.id} title={playlist.title} size="size-5" />
    </h2>
    <div class="flex flex-col text-sm text-muted-foreground font-semibold mt-0.5">
      {#if channel !== undefined}
        <div class="font-bold text-ellipsis overflow-hidden text-nowrap">
          <a href="/{channel.id}">{channel.title}</a>
        </div>
      {/if}
      <div>{total_entries} tracks, {seconds_to_human(total_time)}</div>
    </div>
  </div>

  <ul class="flex flex-col gap-y-1 px-1 py-1 overflow-x-clip overflow-y-auto flex-1 2xl:px-2">
    {#each entries as e, i (e.item.id)}
      {@const is_current = e.item.id === curr_entry}
      {@const index = i + 1}
      <li>
        <button
          onclick={() => {
            on_select(e, index);
          }}
          class="text-left rounded-md block w-full"
        >
          <div
            data-selected={is_current ? "" : undefined}
            class="grid grid-cols-[2rem_1fr_auto] min-h-16 gap-x-2 py-1.5 px-2 gap-2 items-center rounded-md data-selected:bg-accent hover:bg-accent"
          >
            <div
              class="grid place-items-center rounded-md leading-0 text-sm font-semibold"
              class:text-primary={is_current}
            >
              {is_current ? "▶" : index}
            </div>
            <div class="flex flex-col">
              <div class="font-bold line-clamp-2 text-sm leading-tight">
                {e.video.title}
              </div>
              <div class="text-sm mt-0.5 text-muted-foreground">
                {e.video.channel_title}
              </div>
            </div>
            <div class="justify-self-end text-xs tracking-wide">
              {seconds_to_hhmmss(e.video.total_seconds)}
            </div>
          </div>
        </button>
      </li>
    {/each}
  </ul>
</aside>
