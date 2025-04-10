<script lang="ts">
  import { ExternalLink } from "$lib/components/icons.js";
  import type { Playlist, Track, TrackId } from "$lib/player/types.js";
  import { duration_to_mmss, duration_to_seconds, playlist_url } from "$lib/player/utils.js";
  type Props = {
    playlist: Playlist;
    tracks: Track[];
    current_track?: TrackId;
    on_select?: (id: TrackId) => void;
  };

  let { playlist, tracks, current_track, on_select = () => {} }: Props = $props();
  let total_tracks = $derived(tracks.length);
  let total_time = $derived.by(() => {
    let total_s = 0;
    for (const t of tracks) {
      if (t.video === undefined) {
        continue;
      }

      total_s += duration_to_seconds(t.video?.duration);
    }

    const days = Math.floor(total_s / 86400);
    const hours = Math.floor((total_s % 86400) / 3600);
    const minutes = Math.floor((total_s % 3600) / 60);
    const seconds = total_s % 60;

    const humanReadable =
      (days ? days + " d " : "") +
      (hours ? hours + " hs " : "") +
      (minutes ? minutes + " min " : "") +
      (seconds ? seconds + " s " : "");

    return {
      d: days,
      h: hours,
      m: minutes,
      s: seconds,
      human: humanReadable.trim(),
    };
  });
</script>

<aside class="max-w-96 w-full py-1 border-l border-border max-h-screen overflow-hidden flex flex-col">
  <div class="border-b px-2 py-2 border-border">
    <h2 class="text-xl font-bold">
      Current Playlist
      <a href={playlist_url(playlist.id)} rel="noopener noreferrer" title="Open {playlist.title}" class="ml-1">
        <span class="sr-only">Open {playlist.title}</span>
        <ExternalLink class="inline-block size-5 align-top" />
      </a>
    </h2>
    <div class="flex text-sm gap-x-2 text-muted-foreground font-semibold">
      <div>{total_tracks} tracks</div>
      -
      <div>{total_time.human}</div>
    </div>
  </div>

  <ul class="flex flex-col gap-y-1 px-2 py-1 overflow-x-clip overflow-y-auto flex-1">
    {#each tracks as { item, video }, i (item.id)}
      {@const is_current = item.id === current_track}
      <li>
        <button
          onclick={() => {
            on_select(item.id);
          }}
          class="text-left rounded-md block w-full"
        >
          <div
            data-selected={is_current ? "" : undefined}
            class="grid grid-cols-[2.5rem_1fr_auto] gap-x-2 py-1.5 px-2 gap-2 items-center rounded-md data-selected:bg-accent hover:bg-accent"
          >
            <div
              class="grid place-items-center rounded-md leading-0 text-sm font-semibold size-10"
              class:bg-primary={is_current}
            >
              {i + 1}
            </div>
            <div class="flex flex-col">
              <div class="font-semibold line-clamp-2 text-sm leading-tight">
                {video?.title}
              </div>
              <div class="text-sm mt-0.5 text-muted-foreground">
                {video?.channel_title}
              </div>
            </div>
            <div class="justify-self-end text-xs tracking-wide">
              {#if video}
                {duration_to_mmss(video?.duration)}
              {/if}
            </div>
          </div>
        </button>
      </li>
    {/each}
  </ul>
</aside>
