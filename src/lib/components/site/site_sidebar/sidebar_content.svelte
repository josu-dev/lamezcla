<script lang="ts">
  import { page } from "$app/state";
  import { Icon } from "$lib/components/icons/index.js";
  import ReorderableList from "$lib/components/ReorderableList.svelte";
  import { GITHUB_REPOSITORY, GITHUB_USERNAME } from "$lib/constants.js";
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

  let pinned_reorderable = $derived(state.pinned_displayed.map((e) => ({ ...e, id: e.item.id })));
</script>

<div class="overflow-x-clip overflow-y-auto flex-1 flex flex-col">
  <Section title="Pinned">
    {#snippet children()}
      <ReorderableList
        dnd_zone="pinned_items"
        items={pinned_reorderable}
        on_reorder={(items) => {
          pinned_reorderable = items;
          state.update_pinned(items);
        }}
        class="mt-2"
      >
        {#snippet item(p, i)}
          {@const ItemIcon = pinned_item_icon[p.type]}
          {@const pathname = pinned_item_pathname(p)}
          <SectionItem
            title={p.value.title}
            href={pathname}
            is_selected={page.url.pathname === pathname}
            class="cursor-pointer in-[[data-is-dragging=true]]:cursor-grabbing in-[[data-is-dragging=true]]:focus-themed"
          >
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
                class="block rounded-md p-1 focus-outline hover:bg-muted"
              >
                <Icon.PinOff class="size-4" />
              </button>
            {/snippet}
          </SectionItem>
        {/snippet}
        {#snippet item_empty()}
          <SectionItem title="Nothing pinned" class="cursor-default" />
        {/snippet}
      </ReorderableList>
    {/snippet}
  </Section>

  <Section title="Followed">
    {#snippet children()}
      <ul class="mt-2">
        {#each state.followed_displayed as c (c.id)}
          {@const pathname = "/" + (c.value.handle ?? c.value.id)}
          <li>
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
                  class="block rounded-md p-1 focus-outline hover:bg-muted"
                >
                  <Icon.X class="size-4" />
                </button>
              {/snippet}
            </SectionItem>
          </li>
        {:else}
          <li>
            <SectionItem title="No channels followed" class="cursor-default" />
          </li>
        {/each}
      </ul>
    {/snippet}
  </Section>

  <Section class="mt-auto">
    {#snippet children()}
      <div>
        <div class="flex text-sm">
          <a
            href={GITHUB_REPOSITORY}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex gap-2 px-1 text-muted rounded-xs focus-outline hover:text-foreground"
          >
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="block w-4 mb-px fill-current">
              <title>Github</title>
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
            <span>{GITHUB_USERNAME}</span>
          </a>
        </div>
      </div>
    {/snippet}
  </Section>
</div>
