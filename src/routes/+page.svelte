<script lang="ts">
  import Sidebar from "$lib/components/Sidebar.svelte";
  import Player from "$lib/player/Player.svelte";

  let { data } = $props();
  let channel = $derived(data.preview.channel);
  let playlists = $derived(data.preview.playlists);
  let only_playlists = $derived(data.preview.playlists.map((p) => p.playlist));
  let current_playlist: undefined | string = $state();
  let playlist = $derived.by(() => {
    if (current_playlist === undefined) {
      return undefined;
    }
    let vals;
    for (const v of playlists) {
      if (v.playlist.id === current_playlist) {
        vals = v;
        break;
      }
    }
    if (vals === undefined) {
      return undefined;
    }

    let packed = [];
    for (let i = 0; i < vals.items.length; i++) {
      packed.push({
        item: vals.items[i],
        video: vals.videos[i],
      });
    }
    return {
      ...vals.playlist,
      tracks: packed,
    };
  });
</script>

<div class="grid grid-cols-[auto_1fr] bg-background text-foreground h-full">
  <Sidebar
    playlists={only_playlists}
    {current_playlist}
    on_select={(id) => {
      current_playlist = id;
    }}
  ></Sidebar>

  <main class="flex flex-col">
    {#if playlist}
      <Player {playlist} />
    {/if}
  </main>
</div>
