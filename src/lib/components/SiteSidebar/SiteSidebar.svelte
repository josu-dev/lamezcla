<script lang="ts">
  import { page } from "$app/state";
  import { use_channel_ctx } from "$lib/client/state/channels.svelte.js";
  import { use_pinned_ctx } from "$lib/client/state/pinned.svelte.js";
  import * as Icon from "$lib/components/icons.js";
  import Section from "$lib/components/SiteSidebar/Section.svelte";
  import SectionItem from "$lib/components/SiteSidebar/SectionItem.svelte";
  import type * as Model from "$lib/models/index.js";
  import type { Component } from "svelte";

  type Props = {
    on_channel_select?: (value: Model.Channel) => void;
    on_pinned?: (value: Model.PinnedEntry) => void;
    on_pinned_select?: (value: Model.PinnedEntry) => void;
    on_pinned_removed?: (value: Model.PinnedEntry) => void;
  };

  let { on_channel_select, on_pinned, on_pinned_select, on_pinned_removed }: Props = $props();

  let open = $state(false);

  const channel_state = use_channel_ctx();
  const pinned_state = use_pinned_ctx();

  let displayed_channel = $derived.by(() => {
    return [...channel_state.channels];
  });

  let displayed_pinned = $derived.by(() => {
    return pinned_state.pinned.toSorted((a, b) => a.item.position - b.item.position);
  });

  const pinned_item_icon: Record<Model.PinnedItemType, Component> = {
    channel: Icon.User,
    playlist: Icon.ListVideo,
    playlist_custom: Icon.ListVideo,
    video: Icon.Play,
  };

  function pinned_item_pathname<T extends Model.PinnedEntry>(entry: T): string {
    switch (entry.type) {
      case "channel": {
        return `/${entry.value.handle}`;
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

<aside class="w-64 border-r border-border flex min-h-site-content max-h-site-content flex-col flex-none">
  <h2 class="sr-only">Menu sections</h2>

  <div class="overflow-x-clip overflow-y-auto">
    <Section title="Pinned">
      {#snippet children()}
        {#each displayed_pinned as p (p.item.id)}
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
                  pinned_state.unpin_by_id(p.item.pinned_id);
                }}
                class="block invisible group-hover:visible rounded-md p-1 hover:bg-muted"
              >
                <Icon.PinOff class="size-4" />
              </button>
            {/snippet}
          </SectionItem>
        {:else}
          <SectionItem title="No pins added" class="cursor-default" />
        {/each}
      {/snippet}
    </Section>

    <Section title="Channels">
      {#snippet children()}
        {#each displayed_channel as c (c.id)}
          {@const pathname = "/" + c.handle}
          <SectionItem title={c.title} href={pathname} is_selected={page.url.pathname === pathname}>
            {#snippet left_icon()}
              <img
                src={c.img?.url}
                height={c.img?.height}
                width={c.img?.width}
                alt="{c.title} channel avatar"
                class="rounded-md overflow-clip size-7 p-0.5 m-0.5"
              />
            {/snippet}
          </SectionItem>
        {:else}
          <SectionItem title="No channels added" class="cursor-default" />
        {/each}
      {/snippet}
    </Section>
  </div>
</aside>
