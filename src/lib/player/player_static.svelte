<script lang="ts">
  import type * as Model from "$lib/models/index.js";
  import { use_player_ctx } from "./player.svelte.js";
  import ControlsStatic from "./player_controls_static.svelte";
  import Tracklist from "./player_tracklist.svelte";

  type Props = {
    playlist?: Model.Playlist;
    entries?: Model.PlaylistEntry[];
    video?: Model.Video;
    start_index?: number;
  };

  let { playlist, entries, video, start_index = 1 }: Props = $props();

  let player_state = use_player_ctx();

  let state = $derived.by(() => {
    if (video !== undefined) {
      return {
        single: true as const,
        video: video,
      };
    }

    return {
      single: false as const,
      playlist: playlist!,
      entries: entries!,
      start_index: start_index,
    };
  });

  let title = $derived(state.single ? "" : state.playlist!.title);
  let curr_video = $derived(state.single ? state.video : player_state.curr_entry?.video);

  $effect(() => {
    if (state.single) {
      player_state.play(state.video.id);
    } else {
      player_state.set_playlist(state.playlist!);
      player_state.set_entries(state.entries!);
      player_state.play_by_index(state.start_index);
    }
  });
</script>

<div class="flex w-full h-full">
  <div class="flex flex-col w-full bg-none">
    <div class="flex-none flex justify-center py-2">
      <h2 class="text-2xl mt-2 font-bold">
        {title}
      </h2>
    </div>
    <div class="flex-1 grid place-items-center">
      {#if player_state.curr_entry_is_unavailable}
        <div class="text-red-500 font-bold">Not available</div>
      {:else if curr_video}
        <div class="flex flex-col items-center max-w-[min(80%,36rem)]">
          <div class="aspect-video rounded-md overflow-hidden">
            <img
              src={curr_video.img?.url}
              height={curr_video.img?.height}
              width={curr_video.img?.width}
              alt="{curr_video.title} video thumbnail"
              class="object-cover size-full bg-transparent"
            />
          </div>
          <div class="text-center my-6">
            <h3 class="text-xl font-bold text-pretty leading-tight">{curr_video.title}</h3>
            <a
              href="/{curr_video.channel_id}"
              rel="noopener noreferrer"
              class="block font-bold text-muted-foreground mt-1.5"
            >
              {curr_video.channel_title}
            </a>
          </div>
        </div>
      {/if}
    </div>

    <div class="py-4 px-8">
      <ControlsStatic />
    </div>
  </div>

  {#if !state.single}
    <Tracklist
      playlist={state.playlist}
      entries={player_state.tracks}
      current_entry={player_state.curr_entry?.item.id}
      on_select={(_, i) => {
        player_state.play_by_index(i);
      }}
    />
  {/if}
</div>
