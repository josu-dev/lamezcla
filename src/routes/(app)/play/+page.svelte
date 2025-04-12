<script lang="ts">
  import { PlayerStatic } from "$lib/player/index.js";

  let { data } = $props();
</script>

<main class="grid h-site-content">
  <PlayerStatic
    channel={data.channel}
    video={data.video}
    entries={data.entries}
    playlist={data.playlist}
    start_index={data.start_index}
  />
</main>
