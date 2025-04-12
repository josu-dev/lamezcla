<script lang="ts">
  import type { Snippet } from "svelte";
  import type { PlayerStateProps } from "./player.svelte.js";
  import { use_player_ctx } from "./player.svelte.js";

  type Props = {
    children: Snippet;
    options?: Partial<PlayerStateProps>;
  };

  let { children, options = {} }: Props = $props();

  const id = $props.id();
  const safe_options: Partial<PlayerStateProps> = { target_id: id, height: 64, width: 64, ...options };

  use_player_ctx(safe_options);
</script>

<div class="sr-only invisible"><div id={safe_options.target_id}></div></div>
{@render children()}
