<script lang="ts">
  import { Metadata } from "$lib/components/site/index.js";
  import { PlayerStatic } from "$lib/player/index.js";

  let { data } = $props();
</script>

<Metadata description="Something like a music player (in development)." />

<main class="grid h-site-content">
  <PlayerStatic
    channel={data.channel}
    video={data.video}
    playlist={data.playlist}
    playlist_entries={data.entries}
    start_index={data.start_index}
  />
</main>
