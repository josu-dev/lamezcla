<script lang="ts">
  import { use_followed_ctx } from "$lib/client/state/followed.svelte.js";
  import { use_pinned_ctx } from "$lib/client/state/pinned.svelte.js";
  import * as Icon from "$lib/components/icons.js";
  import SiteSidebar from "$lib/components/SiteSidebar/SiteSidebar.svelte";
  import * as Player from "$lib/player/index.js";
  import type { Snippet } from "svelte";
  import type { LayoutData } from "./$types.js";

  type Props = {
    data: LayoutData;
    children: Snippet;
  };

  let { data, children }: Props = $props();

  use_followed_ctx(data.followed);
  use_pinned_ctx(data.pinned);
</script>

<Player.Provider>
  <div class="flex flex-col h-full">
    <header class="flex h-14 flex-none px-4 border-b border-border">
      <div class="flex items-center">
        <a href="/" class="flex items-center text-3xl font-bold">
          <Icon.Shuffle class="block size-8 mb-0.5 mr-2" />
          <span>lamezcla</span>
        </a>
      </div>
      <div></div>
      <div></div>
    </header>

    <div class="flex">
      <SiteSidebar />

      <div class="flex-1">
        {@render children()}
      </div>
    </div>
  </div>
</Player.Provider>
