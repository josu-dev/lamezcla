<script lang="ts">
  import { use_followed_ctx, use_pinned_ctx } from "$client/context/index.js";
  import { Icon } from "$lib/components/icons/index.js";
  import { SiteSidebar } from "$lib/components/site/index.js";
  import { use_site_sidebar_ctx } from "$lib/components/site/site_sidebar/sidebar.svelte.js";
  import * as Player from "$lib/player/index.js";
  import type { Snippet } from "svelte";
  import type { LayoutData } from "./$types.js";

  type Props = {
    data: LayoutData;
    children: Snippet;
  };

  let { data, children }: Props = $props();

  const followed = use_followed_ctx(data.followed);
  const pinned = use_pinned_ctx(data.pinned);
  use_site_sidebar_ctx({ followed, pinned });
</script>

<Player.Provider audio_only>
  <div class="flex flex-col h-full">
    <header class="flex h-site-header flex-none px-2 border-b border-border">
      <div class="flex items-center mr-2 lg:hidden">
        <SiteSidebar.Mobile />
      </div>
      <div class="flex items-center lg:ml-2">
        <a href="/" class="flex items-center text-3xl font-medium">
          <Icon.Shuffle class="block size-6 mb-0.5 mr-2" />
          <span>lamezcla</span>
        </a>
      </div>
    </header>

    <div class="flex content-container">
      <div class="hidden lg:block">
        <SiteSidebar.Static />
      </div>

      <div class="flex-1">
        {@render children()}
      </div>
    </div>

    <Player.ControlsGlobal hide_on_routes={["/play"]} />
  </div>
</Player.Provider>

<style lang="postcss">
  @reference "tailwindcss";

  .content-container :global {
    height: var(--spacing-page-content);

    &:has(+ [data-player-controls-global]) {
      --spacing-page-content: var(--spacing-site-content-min);
    }
  }
</style>
