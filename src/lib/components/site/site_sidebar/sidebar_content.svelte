<script lang="ts">
  import { page } from "$app/state";
  import { Icon } from "$lib/components/icons/index.js";
  import type * as Model from "$lib/models/index.js";
  import type { Component } from "svelte";
  import type { SidebarContentProps } from "./internal.js";
  import { use_site_sidebar_ctx } from "./sidebar.svelte.js";
  import Section from "./sidebar_section.svelte";
  import SectionItem from "./sidebar_section_item.svelte";

  let {}: SidebarContentProps = $props();

  const state = use_site_sidebar_ctx();

  const pinned_item_icon: Record<Model.PinnedItemType, Component> = {
    channel: Icon.User,
    playlist: Icon.ListVideo,
    playlist_custom: Icon.ListVideo,
    video: Icon.Play,
  };

  function pinned_item_pathname<T extends Model.PinnedEntry>(entry: T): string {
    switch (entry.type) {
      case "channel": {
        return `/${entry.value.handle ?? entry.value.id}`;
      }
      case "playlist": {
        return `/playlist/${entry.value.id}`;
      }
      case "playlist_custom": {
        return `/playlist/${entry.value.id}`;
      }
      case "video": {
        return `/video/${entry.value.id}`;
      }
      default: {
        console.error("Unreacheable path", entry);
        return "";
      }
    }
  }
</script>

<div class="overflow-x-clip overflow-y-auto">
  <Section title="Pinned">
    {#snippet children()}
      {#each state.pinned_displayed as p (p.item.id)}
        {@const ItemIcon = pinned_item_icon[p.type]}
        {@const pathname = pinned_item_pathname(p)}
        <SectionItem title={p.value.title} href={pathname} is_selected={page.url.pathname === pathname}>
          {#snippet left_icon()}
            <ItemIcon class="m-1" />
          {/snippet}
          {#snippet subtitle()}
            {#if p.type === "playlist" || p.type === "playlist_custom"}
              <div class="text-xs text-muted-foreground">{p.value.item_count ?? 0} tracks</div>
            {/if}
          {/snippet}
          {#snippet right_icon()}
            <button
              onclick={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                state.pinned.unpin_by_id(p.item.pinned_id);
              }}
              class="block invisible group-hover:visible rounded-md p-1 hover:bg-muted"
            >
              <Icon.PinOff class="size-4" />
            </button>
          {/snippet}
        </SectionItem>
      {:else}
        <SectionItem title="Nothing pinned" class="cursor-default" />
      {/each}
    {/snippet}
  </Section>

  <Section title="Followed">
    {#snippet children()}
      {#each state.followed_displayed as c (c.id)}
        {@const pathname = "/" + (c.value.handle ?? c.value.id)}
        <SectionItem title={c.value.title} href={pathname} is_selected={page.url.pathname === pathname}>
          {#snippet left_icon()}
            <img
              src={c.value.img?.url}
              height={c.value.img?.height}
              width={c.value.img?.width}
              alt="{c.value.title} channel avatar"
              class="rounded-md overflow-clip size-7 p-0.5 m-0.5"
            />
          {/snippet}
          {#snippet right_icon()}
            <button
              onclick={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                state.followed.unfollow(c.value);
              }}
              class="block invisible group-hover:visible rounded-md p-1 hover:bg-muted"
            >
              <Icon.X class="size-4" />
            </button>
          {/snippet}
        </SectionItem>
      {:else}
        <SectionItem title="No channels followed" class="cursor-default" />
      {/each}
    {/snippet}
  </Section>
</div>
