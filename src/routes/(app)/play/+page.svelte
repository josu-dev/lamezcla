<script lang="ts">
  import Player from "$lib/player/Player.svelte";

  let { data } = $props();
  let playlist = $derived.by(() => {
    return {
      ...data.playlist,
      tracks: data.entries,
    };
  });
</script>

<div class="grid bg-background text-foreground">
  <main class="flex flex-col">
    {#if playlist}
      <Player {playlist} />
    {/if}
  </main>
</div>
