<script lang="ts">
  import type { PlayerProviderProps, PlayerStateOptionsInit } from "$lib/player/internal.js";
  import { use_player_ctx } from "./player.svelte.js";

  let { children, audio_only = false, options }: PlayerProviderProps = $props();

  const default_target_id = "global-iframe-player-target";

  const render_iframe = options?.target_id === undefined;
  const player_opts: PlayerStateOptionsInit = {
    target_id: default_target_id,
    height: 64,
    width: 64,
    ...options,
  };

  use_player_ctx(player_opts);
</script>

{#if render_iframe}
  <div class={audio_only ? "sr-only invisible" : ""}><div id={player_opts.target_id}></div></div>
{/if}
{@render children()}
