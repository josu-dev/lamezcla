<script lang="ts">
  import { db } from "$data/local/db/index.js";
  import { PageLoadingBar, SiteHeader, SiteSidebar } from "$lib/components/site/index.js";
  import { use_site_sidebar_ctx } from "$lib/components/site/site_sidebar/sidebar.svelte.js";
  import { use_followed_ctx, use_pinned_ctx } from "$lib/context/index.js";
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

  const player_provider_options: Player.PlayerProviderProps["options"] = {
    on_play: ({ type, value }) => {
      if (type === "playlist") {
        if (value.tag === "l") {
          db.inc_lplaylist_play_count(value.id);
        } else {
          db.inc_yplaylist_play_count(value.id);
        }
        return;
      }
      if (type === "playlist_item") {
        db.inc_playlist_item_play_count(value.id);
        db.inc_video_play_count(value.item.video_id);
        db.add_play_record(value.item.video_id);
        return;
      }
      if (type === "video") {
        db.inc_video_play_count(value.id);
        db.add_play_record(value.id);
        return;
      }
    },
  };
</script>

<PageLoadingBar />

<Player.Provider audio_only options={player_provider_options}>
  <div class="flex flex-col h-full">
    <SiteHeader.Root />

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
